"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function TrackTicketPage() {
  const [ticketCode, setTicketCode] = useState("");
  const [email, setEmail] = useState("");
  
  const [ticket, setTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState("");
  
  const [lookupStatus, setLookupStatus] = useState<"idle" | "loading" | "error">("idle");
  const [replyStatus, setReplyStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  // Step 1: Lookup the ticket
  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupStatus("loading");
    setTicket(null);
    try {
      const res = await fetch(`/api/tickets/client?code=${ticketCode}&email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setTicket(data.ticket);
        setMessages(data.messages);
        setLookupStatus("idle");
      } else {
        setLookupStatus("error");
      }
    } catch {
      setLookupStatus("error");
    }
  };

  // Step 2: Send a reply
  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setReplyStatus("loading");
    try {
      const res = await fetch(`/api/tickets/client`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: ticket.id, message: replyText })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages([...messages, data.message]);
        setReplyText("");
        setReplyStatus("success");
        setTimeout(() => setReplyStatus("idle"), 3000);
      } else {
        setReplyStatus("error");
      }
    } catch {
      setReplyStatus("error");
    }
  };

  return (
    <>
      <div style={{ paddingTop: "80px" }} />
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">الرئيسية</Link> / <span>متابعة مذكرة</span>
          </div>
          <h1>متابعة تذكرة تواصل</h1>
          <p>أدخل البريد الإلكتروني وكود التذكرة الخاص بك لاستكمال المحادثة</p>
        </div>
      </section>

      <section className="section" style={{ background: "var(--bg)", minHeight: "60vh" }}>
        <div className="container" style={{ maxWidth: "800px" }}>
          
          {!ticket ? (
            <div className="card" style={{ padding: "2.5rem" }}>
              <h2 style={{ marginBottom: "1.5rem", fontSize: "1.4rem" }}>البحث عن مذكرتك</h2>
              <form onSubmit={handleLookup} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div className="form-group">
                  <label className="form-label">البريد الإلكتروني</label>
                  <input type="email" className="form-control" dir="ltr" required 
                         placeholder="البريد المستخدم عند إرسال الرسالة"
                         value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">كود المتابعة السري</label>
                  <input type="text" className="form-control" dir="ltr" required 
                         placeholder="TKT-XXXXXXX"
                         value={ticketCode} onChange={e => setTicketCode(e.target.value.toUpperCase())} />
                </div>
                {lookupStatus === "error" && (
                  <div className="alert alert-error">لم يتم العثور على مذكرة تطابق هذه البيانات. يرجى التأكد من الكود والإيميل.</div>
                )}
                <button type="submit" className="btn btn-primary" disabled={lookupStatus === "loading"}>
                  {lookupStatus === "loading" ? "جاري البحث..." : "فتح المحادثة 🔓"}
                </button>
              </form>
            </div>
          ) : (
            <div className="card" style={{ overflow: "hidden" }}>
              {/* Ticket Header */}
              <div style={{ background: "var(--primary)", color: "#fff", padding: "1.5rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "0.85rem", opacity: 0.8, marginBottom: "0.2rem" }}>مذكرة رقم: {ticket.ticket_code}</div>
                  <h2 style={{ margin: 0, fontSize: "1.3rem" }}>{ticket.subject}</h2>
                </div>
                <div style={{ background: ticket.status === "open" ? "#fff" : "rgba(255,255,255,.2)", color: ticket.status === "open" ? "var(--primary)" : "#fff", padding: "0.3rem 0.8rem", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 700 }}>
                  {ticket.status === "open" ? "مفتوحة" : ticket.status === "replied" ? "تم الرد" : "مغلقة"}
                </div>
              </div>

              {/* Chat Thread */}
              <div style={{ padding: "2rem", background: "#f8fafc", maxHeight: "500px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {messages.map((msg) => {
                  const isClient = msg.sender === "client";
                  return (
                    <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: isClient ? "flex-start" : "flex-end" }}>
                      <div style={{ 
                        maxWidth: "80%", padding: "1rem 1.25rem", borderRadius: "12px",
                        background: isClient ? "#fff" : "var(--secondary)",
                        color: isClient ? "#333" : "#fff",
                        border: isClient ? "1px solid #e2e8f0" : "none",
                        boxShadow: "0 2px 10px rgba(0,0,0,.03)"
                      }}>
                        <div style={{ fontSize: "0.95rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{msg.message}</div>
                        <div style={{ fontSize: "0.75rem", opacity: 0.7, marginTop: "0.5rem", textAlign: isClient ? "left" : "right" }}>
                          {format(new Date(msg.created_at), "dd MMMM - HH:mm", { locale: ar })}
                        </div>
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.3rem", padding: "0 0.5rem" }}>
                        {isClient ? ticket.client_name : "المحامي / مدير المكتب"}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Box */}
              {ticket.status !== "closed" && (
                <div style={{ padding: "1.5rem", borderTop: "1px solid var(--border)", background: "#fff" }}>
                  <form onSubmit={handleReply}>
                    <div className="form-group" style={{ marginBottom: "1rem" }}>
                      <textarea className="form-control" rows={3} required placeholder="اكتب ردك هنا..."
                                value={replyText} onChange={e => setReplyText(e.target.value)}></textarea>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      {replyStatus === "error" && <span style={{ color: "#e53e3e", fontSize: "0.9rem" }}>تعذر الإرسال</span>}
                      {replyStatus === "success" && <span style={{ color: "#38a169", fontSize: "0.9rem" }}>تم إرسال ردك بنجاح</span>}
                      <button type="submit" className="btn btn-secondary" disabled={replyStatus === "loading"} style={{ marginRight: "auto" }}>
                        {replyStatus === "loading" ? "جاري الإرسال..." : "إرسال الرد 📤"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

        </div>
      </section>
    </>
  );
}
