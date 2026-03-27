"use client";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { createClient } from "@/lib/supabase/client";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filterArchive, setFilterArchive] = useState("active");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMode, setFilterMode] = useState("");
  const [search, setSearch] = useState("");

  // Modal State
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [savingNotes, setSavingNotes] = useState(false);
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

  return (
    <>
      <style>{`
        .meeting-badge { display: inline-flex; align-items: center; gap: .3rem; padding: .25rem .6rem; border-radius: 20px; font-size: .75rem; font-weight: 700; }
        .meeting-badge.online { background: rgba(66,153,225,.1); color: #3182ce; }
        .meeting-badge.in_person { background: rgba(72,187,120,.1); color: #38a169; }
        .meeting-status-badge { display: inline-flex; align-items: center; gap: .3rem; padding: .2rem .5rem; border-radius: 6px; font-size: .72rem; font-weight: 600; }
        .meeting-status-badge.waiting { background: #fefcbf; color: #975a16; }
        .meeting-status-badge.live { background: #fed7d7; color: #c53030; animation: blink 1.5s infinite; }
        .meeting-status-badge.ended { background: #c6f6d5; color: #276749; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.5} }
        .action-btns { display: flex; gap: .4rem; flex-wrap: wrap; align-items: center; }
        .code-display { font-family: monospace; font-weight: 800; font-size: .85rem; color: #1a3c5e; background: #f0f4f8; padding: .2rem .5rem; border-radius: 6px; direction: ltr; letter-spacing: 2px; }
        
        .status-select {
          padding: 0.35rem 1.8rem 0.35rem 0.6rem;
          border-radius: 6px;
          border: 1px solid var(--border);
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          background-color: var(--surface);
          outline: none;
          appearance: none;
          background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%232b6cb0%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
          background-repeat: no-repeat;
          background-position: left 0.6rem center;
          background-size: 10px auto;
        }
        .status-select.pending { color: #dd6b20; border-color: #fbd38d; background-color: #fffff0; }
        .status-select.confirmed { color: #319795; border-color: #81e6d9; background-color: #e6fffa; }
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
          overflow: hidden; display: flex; flexDirection: column;
        }
        .modal-header {
          padding: 1.5rem; border-bottom: 1px solid var(--border);
          display: flex; justify-content: space-between; align-items: center;
        }
        .modal-body { padding: 1.5rem; max-height: 70vh; overflow-y: auto; }
        .modal-footer {
          padding: 1rem 1.5rem; border-top: 1px solid var(--border);
          display: flex; justify-content: space-between; align-items: center;
          background: rgba(0,0,0,0.02);
        }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; }
        .info-box { background: rgba(0,0,0,0.02); padding: 1rem; border-radius: 8px; border: 1px solid var(--border); }
        .info-label { font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.3rem; }
        .info-val { font-weight: 700; font-size: 0.95rem; }
      `}</style>

      {/* ─── MODAL ───────────────────────────────────────────────────────── */}
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
        <button className="btn btn-outline btn-sm" onClick={fetchAppointments} disabled={loading}>
          {loading ? "جاري التحديث..." : "تحديث 🔄"}
        </button>
      </div>

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
            <thead>
              <tr>
                <th>العميل</th>
                <th>التاريخ والوقت</th>
                <th>المقابلة</th>
                <th>الحالة</th>
                <th>إجراءات الإدارة</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: "4rem" }}>
                  <div style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>⏳</div>
                  <div style={{ color: "var(--text-secondary)" }}>جاري مزامنة المواعيد...</div>
                </td></tr>
              ) : filteredAppointments.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: "4rem", color: "var(--text-secondary)" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "1rem", opacity: 0.5 }}>📅</div>
                  <div>لا توجد مواعيد مطابقة لخيارات الفلترة الحالية</div>
                </td></tr>
              ) : (
                filteredAppointments.map(a => (
                  <tr key={a.id} style={{ opacity: a.is_archived ? 0.6 : 1 }}>
                    {/* Client */}
                    <td>
                      <div style={{ fontWeight: 700, color: "var(--primary)" }}>{a.client_name}</div>
                      <div style={{ fontSize: ".78rem", color: "var(--text-secondary)", marginTop: "0.2rem" }} dir="ltr">{a.client_phone}</div>
                      {a.admin_notes && (
                        <div style={{ fontSize: "0.75rem", background: "var(--bg)", display: "inline-block", padding: "0.15rem 0.4rem", borderRadius: "4px", color: "var(--secondary)", marginTop: "0.4rem", border: "1px solid rgba(0,0,0,0.05)" }}>
                          📝 يوجد ملاحظات
                        </div>
                      )}
                    </td>
                    
                    {/* Date */}
                    <td>
                      <div style={{ fontWeight: 700 }}>{a.date ? format(new Date(a.date), "dd MMM yyyy", { locale: ar }) : "-"}</div>
                      <div style={{ fontSize: ".8rem", color: "var(--text-secondary)" }}>{a.time_slot}</div>
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
