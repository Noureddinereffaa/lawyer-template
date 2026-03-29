"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { createClient } from "@/lib/supabase/client";

// ─── Consultation types (matches booking API) ─────────────────────────
const CONSULTATION_TYPES = [
  { id: "consultation", label: "استشارة قانونية عامة" },
  { id: "family", label: "قانون الأسرة" },
  { id: "commercial", label: "قانون تجاري" },
  { id: "real_estate", label: "عقارات وعقود" },
  { id: "labor", label: "قانون العمل" },
  { id: "criminal", label: "قضايا الجنائية" },
];

const EMPTY_FORM = {
  clientName: "", clientPhone: "", clientEmail: "",
  wilaya: "", type: "consultation",
  date: "", timeSlot: "", meetingMode: "in_person",
  notes: "",
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filterArchive, setFilterArchive] = useState("active");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMode, setFilterMode] = useState("");
  const [search, setSearch] = useState("");

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Detail Modal State
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [savingNotes, setSavingNotes] = useState(false);

  // ── Add Appointment Modal ──────────────────────────────────────────────
  const [showAddModal, setShowAddModal]   = useState(false);
  const [addForm, setAddForm]             = useState({ ...EMPTY_FORM });
  const [adding, setAdding]               = useState(false);
  const [addResult, setAddResult]         = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // ── Memo (Ticket) button ─────────────────────────────────────────
  const [memoLoading, setMemoLoading] = useState<string | null>(null); // appointmentId loading state

  const router = useRouter();

  const supabase = createClient();

  useEffect(() => { fetchAppointments(); }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .order("date", { ascending: false });
    if (!error && data) setAppointments(data);
    setLoading(false);
  };

  const updateEntity = async (id: string, updates: any) => {
     const { error } = await supabase.from("appointments").update(updates).eq("id", id);
     if (!error) {
       setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
       if (selectedAppointment && selectedAppointment.id === id) {
         setSelectedAppointment({ ...selectedAppointment, ...updates });
       }
       return true;
     } else {
       alert("حدث خطأ أثناء التحديث");
       return false;
     }
  };

  const deleteAppointment = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الموعد نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.")) return;
    const { error } = await supabase.from("appointments").delete().eq("id", id);
    if (!error) {
      setAppointments(prev => prev.filter(a => a.id !== id));
      setSelectedAppointment(null);
    } else {
      alert("حدث خطأ أثناء الحذف");
    }
  };

  const updateMeetingStatus = async (id: string, meetingStatus: string, appointmentStatus?: string, action?: string) => {
    const res = await fetch("/api/meeting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId: id, action: action || "update", meetingStatus, appointmentStatus })
    });
    if (res.ok) fetchAppointments();
    else alert("حدث خطأ أثناء إجراء التحديث");
  };

  const bulkUpdateEntity = async (updates: any) => {
    if (selectedIds.length === 0) return;
    const { error } = await supabase.from("appointments").update(updates).in("id", selectedIds);
    if (!error) {
      setAppointments(prev => prev.map(a => selectedIds.includes(a.id) ? { ...a, ...updates } : a));
      setSelectedIds([]);
    } else {
      alert("حدث خطأ أثناء التحديث السريع المتعدد");
    }
  };

  const bulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`هل أنت متأكد من حذف ${selectedIds.length} موعد(ين) نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.`)) return;
    const { error } = await supabase.from("appointments").delete().in("id", selectedIds);
    if (!error) {
      setAppointments(prev => prev.filter(a => !selectedIds.includes(a.id)));
      setSelectedIds([]);
    } else {
      alert("حدث خطأ أثناء الحذف المتعدد");
    }
  };

  useEffect(() => {
    setSelectedIds([]);
  }, [filterArchive, filterStatus, filterMode, search]);

  const startMeeting = async (id: string, code: string) => {
    await updateMeetingStatus(id, "live", "confirmed", "start");
    window.open(`https://meet.jit.si/lawyer-meet-${code}`, "_blank");
  };

  const endMeeting = async (id: string) => {
    await updateMeetingStatus(id, "ended", "completed", "end");
  };

  const handleSaveNotes = async () => {
    if (!selectedAppointment) return;
    setSavingNotes(true);
    await updateEntity(selectedAppointment.id, { admin_notes: selectedAppointment.admin_notes });
    setSavingNotes(false);
  };

  const filteredAppointments = appointments.filter(a => {
    if (filterArchive === "active" && a.is_archived) return false;
    if (filterArchive === "archived" && !a.is_archived) return false;
    if (filterStatus && a.status !== filterStatus) return false;
    if (filterMode && a.meeting_mode !== filterMode) return false;
    if (search && !a.client_name?.includes(search) && !a.client_phone?.includes(search)) return false;
    return true;
  });

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredAppointments.map(a => a.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setAddResult(null);
    try {
      const res = await fetch("/api/admin/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: addForm.type,
          date: addForm.date,
          timeSlot: addForm.timeSlot,
          clientName: addForm.clientName,
          clientPhone: addForm.clientPhone,
          clientEmail: addForm.clientEmail || undefined,
          wilaya: addForm.wilaya || undefined,
          notes: addForm.notes || undefined,
          meetingMode: addForm.meetingMode,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        const emailNote = addForm.clientEmail
          ? " تم إرسال إشعار للعميل عبر البريد الإلكتروني. ✉️"
          : " (لم يُدخل بريد العميل، لم يُرسل إشعار)";
        setAddResult({ type: "success", msg: `✅ تمت إضافة الموعد بنجاح!${emailNote}` });
        setAddForm({ ...EMPTY_FORM });
        fetchAppointments();
      } else {
        setAddResult({ type: "error", msg: data.error || "حدث خطأ غير متوقع." });
      }
    } catch {
      setAddResult({ type: "error", msg: "تعذر الاتصال بالسيرفر." });
    }
    setAdding(false);
  };

  // ── Open or Create a Memo (Ticket) for an appointment client ─────────────
  const openMemo = async (a: any) => {
    setMemoLoading(a.id);
    try {
      const res = await fetch("/api/admin/tickets/from-appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: a.id,
          clientName: a.client_name,
          clientPhone: a.client_phone,
          clientEmail: a.client_email,
          appointmentType: a.type,
          appointmentDate: a.date,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ticketId) {
        router.push(`/admin/messages?ticket=${data.ticketId}`);
      } else {
        alert(data.error || "حدث خطأ غير متوقع.");
      }
    } catch {
      alert("تعذر الاتصال بالسيرفر.");
    }
    setMemoLoading(null);
  };

  // ── Open Add Modal pre-filled for a Follow-up Appointment ────────────────
  const openFollowUp = (a: any) => {
    setAddForm({
      ...EMPTY_FORM,
      clientName: a.client_name || "",
      clientPhone: a.client_phone || "",
      clientEmail: a.client_email || "",
      wilaya: a.wilaya || "",
      type: a.type || "consultation",
      meetingMode: "online", // Default follow-up to online
    });
    setAddResult(null);
    setShowAddModal(true);
  };

  return (
    <>
      <style>{`
        .meeting-badge { display: inline-flex; align-items: center; gap: .4rem; padding: .4rem .75rem; border-radius: 50px; font-size: .8rem; font-weight: 700; boxShadow: 0 2px 8px rgba(0,0,0,0.05); }
        .meeting-badge.online { background: rgba(13, 35, 64, 0.05); color: var(--primary); border: 1px solid rgba(13, 35, 64, 0.1); }
        .meeting-badge.in_person { background: rgba(201, 168, 76, 0.1); color: var(--secondary); border: 1px solid rgba(201, 168, 76, 0.2); }
        .meeting-status-badge { display: inline-flex; align-items: center; gap: .4rem; padding: .3rem .6rem; border-radius: 8px; font-size: .75rem; font-weight: 700; }
        .meeting-status-badge.waiting { background: #fffaf0; color: #b7791f; border: 1px solid #fbd38d; }
        .meeting-status-badge.live { background: #fff5f5; color: #c53030; border: 1px solid #feb2b2; animation: blink 1.5s infinite; }
        .meeting-status-badge.ended { background: #f0fff4; color: #2f855a; border: 1px solid #9ae6b4; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.6} }
        .action-btns { display: flex; gap: .5rem; flex-wrap: wrap; align-items: center; }
        .code-display { font-family: monospace; font-weight: 800; font-size: .9rem; color: var(--primary); background: rgba(13,35,64,0.05); padding: .3rem .6rem; border-radius: 8px; direction: ltr; letter-spacing: 2px; }
        
        .status-select {
          padding: 0.5rem 2rem 0.5rem 0.75rem;
          border-radius: 10px;
          border: 1px solid var(--border);
          font-weight: 800;
          font-size: 0.85rem;
          cursor: pointer;
          background-color: #fff;
          outline: none;
          appearance: none;
          background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23c9a84c%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
          background-repeat: no-repeat;
          background-position: left 0.75rem center;
          background-size: 12px auto;
          transition: var(--transition);
        }
        .status-select:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .status-select.pending { color: #b7791f; border-color: #fbd38d; background-color: #fffaf0; }
        .status-select.confirmed { color: #2c7a7b; border-color: #81e6d9; background-color: #e6fffa; }
        .status-select.completed { color: #2f855a; border-color: #9ae6b4; background-color: #f0fff4; }
        .status-select.cancelled { color: #c53030; border-color: #feb2b2; background-color: #fff5f5; }

        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000; padding: 1rem;
        }
        .modal-content {
          background: var(--surface); width: 100%; max-width: 600px;
          border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
          overflow: hidden; display: flex; flex-direction: column;
          max-height: 90vh;
        }
        .modal-header {
          padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border);
          display: flex; justify-content: space-between; align-items: center;
          flex-shrink: 0;
        }
        .modal-body { padding: 1.5rem; overflow-y: auto; flex: 1; }
        .modal-footer {
          padding: 1rem 1.5rem; border-top: 1px solid var(--border);
          display: flex; justify-content: space-between; align-items: center;
          background: rgba(0,0,0,0.02); flex-wrap: wrap; gap: 0.75rem; flex-shrink: 0;
        }
        .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
        .info-box { background: rgba(0,0,0,0.02); padding: 1rem; border-radius: 8px; border: 1px solid var(--border); }
        .info-label { font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.3rem; }
        .info-val { font-weight: 700; font-size: 0.95rem; }
        
        .bulk-actions-bar {
          display: flex; gap: 0.75rem; padding: 1.25rem 1.5rem; background: rgba(13, 35, 64, 0.03); 
          border: 1px solid rgba(13, 35, 64, 0.1); border-radius: 15px; align-items: center; 
          margin-bottom: 2rem; flex-wrap: wrap; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
          animation: slide-down 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .data-table-wrap {
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
          border: 1px solid var(--border);
          overflow: hidden;
        }
        @keyframes slide-down { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1rem; }
        .form-label { font-size: 0.85rem; font-weight: 700; color: var(--text-secondary); }
        .mode-toggle { display: flex; gap: 0.75rem; }
        .mode-btn { flex: 1; padding: 0.7rem; border-radius: 10px; border: 2px solid var(--border); background: var(--surface); cursor: pointer; font-size: 0.9rem; font-weight: 700; transition: all 0.2s; text-align: center; }
        .mode-btn.active { border-color: var(--primary); background: rgba(26,60,94,0.06); color: var(--primary); }
        .result-banner { padding: 0.9rem 1.25rem; border-radius: 10px; font-size: 0.9rem; font-weight: 700; margin-top: 1rem; }
        .result-banner.success { background: #f0fff4; color: #2f855a; border: 1px solid #9ae6b4; }
        .result-banner.error { background: #fff5f5; color: #c53030; border: 1px solid #feb2b2; }
        @media (max-width: 640px) { .form-row { grid-template-columns: 1fr; } }
      `}</style>

      {/* ─── ADD APPOINTMENT MODAL ────────────────────────────────────────── */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => { setShowAddModal(false); setAddResult(null); }}>
          <div className="modal-content" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: "1.2rem", color: "var(--primary)" }}>📅 إضافة موعد جديد</h3>
              <button onClick={() => { setShowAddModal(false); setAddResult(null); }}
                style={{ background: "transparent", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "var(--text-secondary)" }}>×</button>
            </div>
            <form onSubmit={handleAddAppointment} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
              <div className="modal-body">

                {/* Client Info */}
                <div style={{ marginBottom: "1.25rem", padding: "1rem", background: "rgba(26,60,94,0.03)", borderRadius: "10px", border: "1px solid rgba(26,60,94,0.08)" }}>
                  <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "var(--primary)", marginBottom: "1rem" }}>👤 معلومات العميل</div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">الاسم الكامل *</label>
                      <input className="form-control" required placeholder="أحمد بن يوسف" value={addForm.clientName} onChange={e => setAddForm(f => ({ ...f, clientName: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">رقم الهاتف *</label>
                      <input className="form-control" required placeholder="0550000000" dir="ltr" value={addForm.clientPhone} onChange={e => setAddForm(f => ({ ...f, clientPhone: e.target.value }))} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">البريد الإلكتروني (للإشعار)</label>
                      <input className="form-control" type="email" placeholder="client@email.com" dir="ltr" value={addForm.clientEmail} onChange={e => setAddForm(f => ({ ...f, clientEmail: e.target.value }))} />
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>إذا أُدخل، سيُرسل إشعار تلقائي للعميل</span>
                    </div>
                    <div className="form-group">
                      <label className="form-label">الولاية</label>
                      <input className="form-control" placeholder="الجزائر العاصمة" value={addForm.wilaya} onChange={e => setAddForm(f => ({ ...f, wilaya: e.target.value }))} />
                    </div>
                  </div>
                </div>

                {/* Appointment Details */}
                <div style={{ marginBottom: "1.25rem", padding: "1rem", background: "rgba(201,168,76,0.04)", borderRadius: "10px", border: "1px solid rgba(201,168,76,0.12)" }}>
                  <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "var(--secondary)", marginBottom: "1rem" }}>📋 تفاصيل الموعد</div>
                  <div className="form-group">
                    <label className="form-label">نوع الاستشارة *</label>
                    <select className="form-control" required value={addForm.type} onChange={e => setAddForm(f => ({ ...f, type: e.target.value }))}>
                      {CONSULTATION_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">التاريخ *</label>
                      <input className="form-control" type="date" required value={addForm.date} onChange={e => setAddForm(f => ({ ...f, date: e.target.value }))} min={new Date().toISOString().split("T")[0]} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">الوقت *</label>
                      <input className="form-control" type="time" required value={addForm.timeSlot} onChange={e => setAddForm(f => ({ ...f, timeSlot: e.target.value }))} />
                    </div>
                  </div>
                </div>

                {/* Meeting Mode */}
                <div style={{ marginBottom: "1.25rem" }}>
                  <div className="form-label" style={{ marginBottom: "0.75rem" }}>نوع الجلسة *</div>
                  <div className="mode-toggle">
                    <button type="button" className={`mode-btn ${addForm.meetingMode === "in_person" ? "active" : ""}`}
                      onClick={() => setAddForm(f => ({ ...f, meetingMode: "in_person" }))}>
                      🏛️ حضوري
                    </button>
                    <button type="button" className={`mode-btn ${addForm.meetingMode === "online" ? "active" : ""}`}
                      onClick={() => setAddForm(f => ({ ...f, meetingMode: "online" }))}>
                      💻 أونلاين
                    </button>
                  </div>
                  {addForm.meetingMode === "online" && (
                    <div style={{ marginTop: "0.75rem", padding: "0.75rem", background: "rgba(49,130,206,0.06)", borderRadius: "8px", fontSize: "0.85rem", color: "#2b6cb0", fontWeight: 600 }}>
                      💡 سيُولَّد رمز اجتماع Jitsi تلقائياً ويُرسَل للعميل مع الإشعار إذا أُدخل بريده الإلكتروني.
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="form-group">
                  <label className="form-label">ملاحظات إضافية (اختياري)</label>
                  <textarea className="form-control" rows={3} placeholder="معلومات إضافية عن القضية أو طلب العميل..." value={addForm.notes} onChange={e => setAddForm(f => ({ ...f, notes: e.target.value }))} style={{ resize: "vertical" }} />
                </div>

                {addResult && (
                  <div className={`result-banner ${addResult.type}`}>
                    {addResult.msg}
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => { setShowAddModal(false); setAddResult(null); }}>
                  إلغاء
                </button>
                <button type="submit" className="btn btn-primary" disabled={adding} style={{ minWidth: "160px" }}>
                  {adding ? "جاري الإضافة..." : "✅ إضافة الموعد"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL (Details) ─────────────────────────────────────────────── */}
      {selectedAppointment && (
        <div className="modal-overlay" onClick={() => setSelectedAppointment(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: "1.25rem", color: "var(--primary)" }}>تفاصيل الموعد</h3>
              <button onClick={() => setSelectedAppointment(null)} style={{ background: "transparent", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "var(--text-secondary)" }}>&times;</button>
            </div>
            
            <div className="modal-body">
              <div className="info-grid">
                <div className="info-box">
                  <div className="info-label">المتصل (العميل)</div>
                  <div className="info-val">{selectedAppointment.client_name}</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.2rem" }} dir="ltr">{selectedAppointment.client_phone}</div>
                  {selectedAppointment.client_email && <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }} dir="ltr">{selectedAppointment.client_email}</div>}
                </div>
                <div className="info-box">
                  <div className="info-label">معلومات الحجز</div>
                  <div className="info-val">{selectedAppointment.date ? format(new Date(selectedAppointment.date), "dd MMMM yyyy", { locale: ar }) : "-"}</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>{selectedAppointment.time_slot}</div>
                  <div style={{ marginTop: "0.4rem" }}>
                    <span className="tag" style={{ border: "1px solid var(--border)", background: "var(--bg)" }}>{selectedAppointment.type}</span>
                  </div>
                </div>
              </div>

              {selectedAppointment.case_notes && (
                <div style={{ marginBottom: "1.5rem" }}>
                  <div className="info-label" style={{ fontWeight: 700, color: "var(--text)" }}>رسالة العميل (الاستفسار):</div>
                  <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.95rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                    {selectedAppointment.case_notes}
                  </div>
                </div>
              )}

              <div>
                <div className="info-label" style={{ fontWeight: 700, color: "var(--text)", display: "flex", justifyContent: "space-between" }}>
                  <span>ملاحظات المحامي (سريّة):</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 400 }}>تظهر لك فقط</span>
                </div>
                <textarea 
                  className="form-control" 
                  rows={4} 
                  placeholder="اكتب ملاحظاتك، تفاصيل المكالمة، أو خلاصة الاستشارة هنا..."
                  value={selectedAppointment.admin_notes || ""}
                  onChange={(e) => setSelectedAppointment({ ...selectedAppointment, admin_notes: e.target.value })}
                  style={{ resize: "vertical" }}
                ></textarea>
                <div style={{ textAlign: "left", marginTop: "0.75rem" }}>
                  <button className="btn btn-primary btn-sm" onClick={handleSaveNotes} disabled={savingNotes}>
                    {savingNotes ? "جاري الحفظ..." : "💾 حفظ الملاحظات"}
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button 
                  className="btn btn-outline btn-sm" 
                  style={{ color: "#e53e3e", borderColor: "#fecaca" }}
                  onClick={() => deleteAppointment(selectedAppointment.id)}
                >
                  🗑️ حذف الموعد
                </button>
              </div>
              <div>
                {selectedAppointment.is_archived ? (
                  <button className="btn btn-outline btn-sm" onClick={() => updateEntity(selectedAppointment.id, { is_archived: false })}>
                    📂 استعادة من الأرشيف
                  </button>
                ) : (
                  <button className="btn btn-outline btn-sm" onClick={() => updateEntity(selectedAppointment.id, { is_archived: true })}>
                    📦 تحويل للأرشيف
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── PAGE HEADER ─────────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.4rem", marginBottom: "0.2rem" }}>📅 إدارة المواعيد</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>لوحة تحكم متقدمة لتتبع، فلترة، وإدارة المواعيد وجلسات الاستشارة.</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <button className="btn btn-outline btn-sm" onClick={fetchAppointments} disabled={loading}>
            {loading ? "جاري التحديث..." : "تحديث 🔄"}
          </button>
          <button className="btn btn-primary" onClick={() => { setAddResult(null); setShowAddModal(true); }}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            ➕ موعد جديد
          </button>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="bulk-actions-bar">
          <span style={{ fontWeight: 700, color: "var(--primary)", marginLeft: "1rem" }}>
            تم تحديد ({selectedIds.length}):
          </span>
          <button className="btn btn-outline btn-sm" onClick={() => bulkUpdateEntity({ is_archived: true })}>
            📦 تحويل للأرشيف
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => bulkUpdateEntity({ is_archived: false })}>
            📂 استعادة من الأرشيف
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => bulkUpdateEntity({ status: 'completed' })}>
            ✅ تعيين كمكتمل
          </button>
          <div style={{ flex: 1 }}></div>
          <button className="btn btn-primary btn-sm" style={{ background: "#e53e3e", borderColor: "#e53e3e" }} onClick={bulkDelete}>
            🗑️ حذف نهائي
          </button>
        </div>
      )}

      <div className="data-table-wrap">
        <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border)", display: "flex", gap: ".75rem", background: "var(--surface)", flexWrap: "wrap", alignItems: "center" }}>
          
          <div style={{ display: "flex", background: "rgba(0,0,0,0.04)", borderRadius: "8px", padding: "0.2rem" }}>
             <button 
                onClick={() => setFilterArchive("active")} 
                style={{ padding: "0.4rem 1rem", border: "none", borderRadius: "6px", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", background: filterArchive === "active" ? "#fff" : "transparent", color: filterArchive === "active" ? "var(--primary)" : "var(--text-secondary)", boxShadow: filterArchive === "active" ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}
             >النشطة</button>
             <button 
                onClick={() => setFilterArchive("archived")}
                style={{ padding: "0.4rem 1rem", border: "none", borderRadius: "6px", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", background: filterArchive === "archived" ? "#fff" : "transparent", color: filterArchive === "archived" ? "var(--primary)" : "var(--text-secondary)", boxShadow: filterArchive === "archived" ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}
             >الأرشيف</button>
          </div>

          <div style={{ height: "24px", width: "1px", background: "var(--border)", margin: "0 0.2rem" }}></div>

          <select className="form-control" style={{ width: "auto" }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">جميع الحالات</option>
            <option value="pending">قيد الانتظار</option>
            <option value="confirmed">مؤكد</option>
            <option value="completed">مكتمل</option>
            <option value="cancelled">ملغى</option>
          </select>

          <select className="form-control" style={{ width: "auto" }} value={filterMode} onChange={e => setFilterMode(e.target.value)}>
            <option value="">نوع الجلسة</option>
            <option value="in_person">🏛️ حضوري</option>
            <option value="online">💻 أونلاين</option>
          </select>

          <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
            <span style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }}>🔍</span>
            <input type="text" className="form-control" placeholder="بحث بالاسم، أو رقم الهاتف..." style={{ width: "100%", paddingRight: "30px" }} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div style={{ overflowX: "auto", minHeight: "50vh" }}>
          <table className="data-table">
            <thead style={{ background: "rgba(26,60,94,0.03)" }}>
              <tr>
                <th style={{ width: "60px", textAlign: "center", padding: "1.5rem" }}>
                  <input type="checkbox" 
                    checked={filteredAppointments.length > 0 && selectedIds.length === filteredAppointments.length} 
                    onChange={toggleSelectAll} 
                  />
                </th>
                <th>👤 العميل</th>
                <th>📅 التاريخ والوقت</th>
                <th>📍 المقابلة</th>
                <th>⚖️ الحالة</th>
                <th>⚡ إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "6rem" }}>
                  <div className="animate-pulse" style={{ fontSize: "1.2rem", color: "var(--primary)", fontWeight: 700 }}>جاري مزامنة المواعيد مع السيرفر...</div>
                </td></tr>
              ) : filteredAppointments.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "6rem", color: "var(--text-secondary)" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1.5rem", opacity: 0.3 }}>📅</div>
                  <div style={{ fontWeight: 600 }}>لا توجد مواعيد حالياً في هذا القسم.</div>
                </td></tr>
              ) : (
                filteredAppointments.map(a => (
                  <tr key={a.id} className="hover-lift" style={{ 
                    opacity: a.is_archived ? 0.6 : 1, 
                    background: selectedIds.includes(a.id) ? "rgba(201,168,76,0.04)" : undefined,
                    transition: "var(--transition)"
                  }}>
                    <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                      <input type="checkbox" checked={selectedIds.includes(a.id)} onChange={() => toggleSelectRow(a.id)} />
                    </td>
                    {/* Client */}
                    <td style={{ padding: "1.5rem 1rem" }}>
                      <div style={{ fontWeight: 800, color: "var(--primary)", fontSize: "1.05rem" }}>{a.client_name}</div>
                      <div style={{ fontSize: ".85rem", color: "var(--text-secondary)", marginTop: "0.3rem", fontWeight: 600 }} dir="ltr">{a.client_phone}</div>
                      {a.admin_notes && (
                        <div style={{ fontSize: "0.7rem", background: "rgba(201,168,76,0.1)", display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.2rem 0.6rem", borderRadius: "50px", color: "var(--secondary)", marginTop: "0.6rem", fontWeight: 800 }}>
                          📝 ملاحظات داخلية
                        </div>
                      )}
                    </td>
                    
                    {/* Date */}
                    <td>
                      <div style={{ fontWeight: 800, color: "var(--text)" }}>{a.date ? format(new Date(a.date), "dd MMM yyyy", { locale: ar }) : "-"}</div>
                      <div style={{ fontSize: ".85rem", color: "var(--text-secondary)", marginTop: "0.2rem", fontWeight: 600 }}>{a.time_slot}</div>
                    </td>
                    
                    {/* Meeting Mode & Type */}
                    <td>
                      <div style={{ marginBottom: "0.4rem" }}>
                        <span className={`meeting-badge ${a.meeting_mode || "in_person"}`}>
                          {a.meeting_mode === "online" ? "💻 أونلاين" : "🏛️ حضوري"}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{a.type}</div>
                      
                      {a.meeting_mode === "online" && a.meeting_code && (
                        <div style={{ marginTop: ".4rem" }}>
                          <span className="code-display">{a.meeting_code}</span>
                        </div>
                      )}
                      
                      {a.meeting_mode === "online" && a.meeting_status && a.meeting_status !== "idle" && (
                        <div style={{ marginTop: ".4rem" }}>
                          <span className={`meeting-status-badge ${a.meeting_status}`}>
                            {a.meeting_status === "waiting" && "⏳ عميل ينتظر"}
                            {a.meeting_status === "live" && "🔴 مباشر"}
                            {a.meeting_status === "ended" && "✅ انتهت"}
                          </span>
                        </div>
                      )}
                    </td>
                    
                    {/* Status Dropdown */}
                    <td>
                      <select 
                         className={`status-select ${a.status || 'pending'}`}
                         value={a.status || 'pending'}
                         onChange={(e) => updateEntity(a.id, { status: e.target.value })}
                      >
                         <option value="pending">قيد الانتظار</option>
                         <option value="confirmed">مؤكد</option>
                         <option value="completed">مكتمل</option>
                         <option value="cancelled">ملغى</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="action-btns">
                        <button className="btn btn-outline btn-sm" onClick={() => setSelectedAppointment(a)} style={{ fontSize: "0.8rem", padding: "0.3rem 0.6rem" }}>
                          👁️ تفاصيل
                        </button>
                        <button 
                          className="btn btn-outline btn-sm" 
                          onClick={() => openMemo(a)} 
                          disabled={memoLoading === a.id}
                          style={{ fontSize: "0.8rem", padding: "0.3rem 0.6rem", borderColor: "var(--secondary)", color: "var(--secondary)" }}
                        >
                          {memoLoading === a.id ? "⏱️ جاري..." : "📨 متصل"}
                        </button>
                        
                        {/* Session Actions for Online Meetings */}
                        {a.meeting_mode === "online" && a.meeting_status === "waiting" && (
                          <button className="btn btn-primary" onClick={() => startMeeting(a.id, a.meeting_code)}
                            style={{ padding: ".3rem .7rem", fontSize: ".8rem", background: "#3182ce", borderColor: "#3182ce" }}>
                            🎥 بدء
                          </button>
                        )}
                        {a.meeting_mode === "online" && a.meeting_status === "live" && (
                          <>
                            <button className="btn btn-outline" onClick={() => window.open(`https://meet.jit.si/lawyer-meet-${a.meeting_code}`, "_blank")}
                              style={{ padding: ".3rem .5rem", fontSize: ".8rem" }}>
                              🔗 الغرفة
                            </button>
                            <button className="btn btn-outline" onClick={() => endMeeting(a.id)}
                              style={{ padding: ".3rem .5rem", fontSize: ".8rem", color: "#e53e3e", borderColor: "#e53e3e" }}>
                              إنهاء
                            </button>
                          </>
                        )}
                        {a.meeting_mode === "online" && a.meeting_status === "ended" && (
                          <button className="btn btn-primary" onClick={() => openFollowUp(a)}
                            style={{ padding: ".3rem .6rem", fontSize: ".8rem", background: "var(--primary)", borderColor: "var(--primary)" }}>
                            📅 موعد إلحاقي
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
