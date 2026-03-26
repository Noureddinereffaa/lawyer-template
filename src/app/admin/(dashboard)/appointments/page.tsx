"use client";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { createClient } from "@/lib/supabase/client";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMode, setFilterMode] = useState("");
  const [search, setSearch] = useState("");
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

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from("appointments").update({ status: newStatus }).eq("id", id);
    if (!error) fetchAppointments();
    else alert("حدث خطأ أثناء تحديث الحالة");
  };

  const updateMeetingStatus = async (id: string, meetingStatus: string, appointmentStatus?: string) => {
    const updateData: any = { meeting_status: meetingStatus };
    if (appointmentStatus) updateData.status = appointmentStatus;
    const { error } = await supabase.from("appointments").update(updateData).eq("id", id);
    if (!error) fetchAppointments();
    else alert("حدث خطأ");
  };

  const startMeeting = (id: string, code: string) => {
    updateMeetingStatus(id, "live", "confirmed");
    // Open meeting in new tab
    window.open(`https://meet.jit.si/lawyer-meet-${code}`, "_blank");
  };

  const endMeeting = (id: string) => {
    updateMeetingStatus(id, "ended", "completed");
  };

  const filteredAppointments = appointments.filter(a => {
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
        .action-btns { display: flex; gap: .4rem; flex-wrap: wrap; }
        .code-display { font-family: monospace; font-weight: 800; font-size: .85rem; color: #1a3c5e; background: #f0f4f8; padding: .2rem .5rem; border-radius: 6px; direction: ltr; letter-spacing: 2px; }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <h2 style={{ fontSize: "1.25rem" }}>📅 إدارة المواعيد</h2>
        <button className="btn btn-outline btn-sm" onClick={fetchAppointments}>تحديث 🔄</button>
      </div>

      <div className="data-table-wrap">
        <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border)", display: "flex", gap: ".75rem", background: "var(--surface)", flexWrap: "wrap" }}>
          <select className="form-control" style={{ width: "auto" }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">جميع الحالات</option>
            <option value="pending">قيد الانتظار</option>
            <option value="confirmed">مؤكد</option>
            <option value="completed">مكتمل</option>
            <option value="cancelled">ملغى</option>
          </select>
          <select className="form-control" style={{ width: "auto" }} value={filterMode} onChange={e => setFilterMode(e.target.value)}>
            <option value="">الكل</option>
            <option value="in_person">🏛️ حضوري</option>
            <option value="online">💻 أونلاين</option>
          </select>
          <input type="text" className="form-control" placeholder="بحث بالاسم أو الهاتف..." style={{ flex: 1, minWidth: 150 }} value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>العميل</th>
                <th>التاريخ والوقت</th>
                <th>النوع</th>
                <th>المقابلة</th>
                <th>الحالة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>جاري التحميل...</td></tr>
              ) : filteredAppointments.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>لا توجد مواعيد</td></tr>
              ) : (
                filteredAppointments.map(a => (
                  <tr key={a.id}>
                    {/* Client */}
                    <td>
                      <div style={{ fontWeight: 700 }}>{a.client_name}</div>
                      <div style={{ fontSize: ".78rem", color: "var(--text-secondary)" }} dir="ltr">{a.client_phone}</div>
                      {a.client_email && <div style={{ fontSize: ".72rem", color: "var(--text-secondary)" }} dir="ltr">{a.client_email}</div>}
                    </td>
                    {/* Date */}
                    <td>
                      <div style={{ fontWeight: 700 }}>{a.date ? format(new Date(a.date), "dd MMM yyyy", { locale: ar }) : "-"}</div>
                      <div style={{ fontSize: ".8rem", color: "var(--text-secondary)" }}>{a.time_slot}</div>
                    </td>
                    {/* Type */}
                    <td><span className="tag">{a.type}</span></td>
                    {/* Meeting Mode */}
                    <td>
                      <span className={`meeting-badge ${a.meeting_mode || "in_person"}`}>
                        {a.meeting_mode === "online" ? "💻 أونلاين" : "🏛️ حضوري"}
                      </span>
                      {a.meeting_mode === "online" && a.meeting_code && (
                        <div style={{ marginTop: ".3rem" }}>
                          <span className="code-display">{a.meeting_code}</span>
                        </div>
                      )}
                      {a.meeting_mode === "online" && a.meeting_status && a.meeting_status !== "idle" && (
                        <div style={{ marginTop: ".3rem" }}>
                          <span className={`meeting-status-badge ${a.meeting_status}`}>
                            {a.meeting_status === "waiting" && "⏳ عميل ينتظر"}
                            {a.meeting_status === "live" && "🔴 مباشر"}
                            {a.meeting_status === "ended" && "✅ انتهت"}
                          </span>
                        </div>
                      )}
                    </td>
                    {/* Status */}
                    <td>
                      <div className={`status status-${a.status}`}>
                        {a.status === "pending" && "قيد الانتظار"}
                        {a.status === "confirmed" && "مؤكد"}
                        {a.status === "completed" && "مكتمل"}
                        {a.status === "cancelled" && "ملغى"}
                      </div>
                    </td>
                    {/* Actions */}
                    <td>
                      <div className="action-btns">
                        {/* Online meeting actions */}
                        {a.meeting_mode === "online" && a.meeting_status === "waiting" && (
                          <button className="btn btn-primary" onClick={() => startMeeting(a.id, a.meeting_code)}
                            style={{ padding: ".3rem .7rem", fontSize: ".8rem", background: "#3182ce", borderColor: "#3182ce" }}>
                            🎥 بدء الجلسة
                          </button>
                        )}
                        {a.meeting_mode === "online" && a.meeting_status === "live" && (
                          <>
                            <button className="btn btn-outline" onClick={() => window.open(`https://meet.jit.si/lawyer-meet-${a.meeting_code}`, "_blank")}
                              style={{ padding: ".3rem .7rem", fontSize: ".8rem" }}>
                              🔗 فتح الغرفة
                            </button>
                            <button className="btn btn-outline" onClick={() => endMeeting(a.id)}
                              style={{ padding: ".3rem .7rem", fontSize: ".8rem", color: "#e53e3e", borderColor: "#e53e3e" }}>
                              إنهاء
                            </button>
                          </>
                        )}
                        {/* Standard actions */}
                        {a.status === "pending" && a.meeting_mode !== "online" && (
                          <button className="btn btn-primary" onClick={() => updateStatus(a.id, "confirmed")}
                            style={{ padding: ".3rem .6rem", fontSize: ".8rem", background: "#48bb78", borderColor: "#48bb78" }}>تأكيد</button>
                        )}
                        {a.status === "confirmed" && a.meeting_mode !== "online" && (
                          <button className="btn btn-outline" onClick={() => updateStatus(a.id, "completed")}
                            style={{ padding: ".3rem .6rem", fontSize: ".8rem" }}>اكتمل</button>
                        )}
                        {a.status !== "cancelled" && a.status !== "completed" && a.meeting_status !== "live" && (
                          <button className="btn btn-outline" onClick={() => updateStatus(a.id, "cancelled")}
                            style={{ padding: ".3rem .6rem", fontSize: ".8rem", color: "#e53e3e", borderColor: "#e53e3e" }}>إلغاء</button>
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
