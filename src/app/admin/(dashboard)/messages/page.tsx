"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function MessagesPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    // Note: since this is an admin dashboard, we could fetch all. 
    // We are using anon key on client, so user must be authenticated, OR RLS is disabled.
    // If RLS blocks it, we should use an API route instead. Let's use an API route for safety.
    try {
      const res = await fetch("/api/tickets/admin");
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const openTicket = async (t: any) => {
    setSelectedTicket(t);
    setMessages([]);
    try {
      const res = await fetch(`/api/tickets/admin?ticketId=${t.id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;
    setReplyLoading(true);
    try {
      const res = await fetch(`/api/tickets/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: selectedTicket.id, message: replyText })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages([...messages, data.message]);
        setReplyText("");
        // Update ticket status in list to "replied"
        setTickets(tickets.map(t => t.id === selectedTicket.id ? { ...t, status: "replied" } : t));
        setSelectedTicket({ ...selectedTicket, status: "replied" });
      }
    } catch (err) {
      console.error(err);
    }
    setReplyLoading(false);
  };

  const handleCloseTicket = async () => {
    if (!selectedTicket || !confirm("هل أنت متأكد من إغلاق هذه المذكرة نهائياً؟")) return;
    try {
      const res = await fetch(`/api/tickets/admin`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: selectedTicket.id, status: "closed" })
      });
      if (res.ok) {
        setTickets(tickets.map(t => t.id === selectedTicket.id ? { ...t, status: "closed" } : t));
        setSelectedTicket({ ...selectedTicket, status: "closed" });
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="admin-page animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 className="admin-title">📨 رسائل المكتب ومذكرات الدعم</h1>
        <button className="btn btn-outline" onClick={fetchTickets}>تحديث 🔄</button>
      </div>

      <div className="admin-card">
        <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: "1.1rem", margin: 0 }}>صندوق الوارد (المذكرات المفتوحة)</h2>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>الكود</th>
                <th>اسم العميل</th>
                <th>الموضوع</th>
                <th>التاريخ</th>
                <th>الحالة</th>
                <th>إجراء</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>جاري التحميل...</td></tr>
              ) : tickets.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>لا توجد رسائل حالياً</td></tr>
              ) : (
                tickets.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontFamily: "monospace", fontWeight: 700 }}>{t.ticket_code}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{t.client_name}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{t.client_email}</div>
                    </td>
                    <td>{t.subject}</td>
                    <td>{format(new Date(t.created_at), "dd MMM yyyy", { locale: ar })}</td>
                    <td>
                      <span className={`status-badge status-${t.status === "open" ? "pending" : t.status === "replied" ? "confirmed" : "cancelled"}`}>
                        {t.status === "open" ? "مفتوحة (جديد)" : t.status === "replied" ? "تم الرد" : "مغلقة"}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => openTicket(t)}>
                        👁️ قراءة والرد
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Chat Modal */}
      {selectedTicket && (
        <div className="modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: "700px", padding: 0, overflow: "hidden" }}>
            
            {/* Modal Header */}
            <div style={{ background: "var(--primary)", color: "#fff", padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "1.2rem" }}>مذكرة الدعم: {selectedTicket.ticket_code}</h2>
                <div style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.2rem" }}>العنوان: {selectedTicket.subject} | العميل: {selectedTicket.client_name}</div>
              </div>
              <button onClick={() => setSelectedTicket(null)} style={{ background: "none", border: "none", color: "#fff", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
            </div>

            {/* Modal Chat Body */}
            <div style={{ background: "#f8fafc", padding: "1.5rem", height: "400px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: "center", color: "var(--text-secondary)" }}>جاري جلب الرسائل...</div>
              ) : (
                messages.map((msg) => {
                  const isLawyer = msg.sender === "lawyer";
                  return (
                    <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: isLawyer ? "flex-start" : "flex-end" }}>
                      <div style={{ 
                        maxWidth: "80%", padding: "1rem", borderRadius: "12px",
                        background: isLawyer ? "var(--secondary)" : "#fff",
                        color: isLawyer ? "#fff" : "#333",
                        border: isLawyer ? "none" : "1px solid #e2e8f0",
                        boxShadow: "0 2px 10px rgba(0,0,0,.03)"
                      }}>
                        <div style={{ fontSize: "0.95rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{msg.message}</div>
                        <div style={{ fontSize: "0.75rem", opacity: 0.7, marginTop: "0.5rem", textAlign: isLawyer ? "left" : "right" }}>
                          {format(new Date(msg.created_at), "dd MMMM - HH:mm", { locale: ar })}
                        </div>
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.3rem", padding: "0 0.5rem" }}>
                        {isLawyer ? "أنت (المحامي)" : selectedTicket.client_name}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Reply Footer */}
            <div style={{ padding: "1.5rem", borderTop: "1px solid var(--border)", background: "#fff" }}>
              {selectedTicket.status === "closed" ? (
                <div style={{ textAlign: "center", color: "#e53e3e", fontWeight: 600 }}>هذه المذكرة مغلقة نهائياً.</div>
              ) : (
                <form onSubmit={handleReply}>
                  <textarea className="form-control" rows={3} required placeholder="اكتب ردك للعميل هنا..."
                            style={{ marginBottom: "1rem" }}
                            value={replyText} onChange={e => setReplyText(e.target.value)}></textarea>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <button type="button" className="btn btn-outline" style={{ color: "#e53e3e", borderColor: "#fc8181" }} onClick={handleCloseTicket}>
                      إغلاق المذكرة 🚫
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={replyLoading}>
                      {replyLoading ? "جاري الإرسال..." : "إرسال الرد 📤"}
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
