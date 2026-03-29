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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [lookupStatus, setLookupStatus] = useState<"idle" | "loading" | "error">("idle");
  const [replyStatus, setReplyStatus] = useState<"idle" | "loading" | "success" | "uploading" | "error">("idle");

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
    if (!replyText.trim() && !selectedFile) return;
    
    setReplyStatus("loading");
    let attachmentUrl = null;

    try {
      // 1. Upload file if selected
      if (selectedFile) {
        setReplyStatus("uploading");
        const formData = new FormData();
        formData.append("file", selectedFile);
        
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData
        });
        
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          attachmentUrl = uploadData.url;
        } else {
          throw new Error("Upload failed");
        }
      }

      // 2. Send message
      const res = await fetch(`/api/tickets/client`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ticketId: ticket.id, 
          message: replyText,
          attachmentUrl: attachmentUrl
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages([...messages, data.message]);
        setReplyText("");
        setSelectedFile(null);
        setReplyStatus("success");
        setTimeout(() => setReplyStatus("idle"), 3000);
      } else {
        setReplyStatus("error");
      }
    } catch (err) {
      console.error("Reply error:", err);
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
            <div className="card glass animate-slide-up" style={{ padding: "3rem" }}>
              <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
                <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🔍</div>
                <h2 style={{ fontSize: "1.8rem", color: "var(--primary)" }}>البحث عن مذكرتك</h2>
                <p style={{ color: "var(--text-secondary)" }}>أدخل البيانات أدناه للوصول إلى محادثاتك مع المكتب</p>
              </div>
              <form onSubmit={handleLookup} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div className="form-group">
                  <label className="form-label">البريد الإلكتروني <span>*</span></label>
                  <input type="email" className="form-control" dir="ltr" required 
                         placeholder="example@email.com"
                         value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">كود المتابعة السري <span>*</span></label>
                  <input type="text" className="form-control" dir="ltr" required 
                         placeholder="TKT-XXXXXXX"
                         value={ticketCode} onChange={e => setTicketCode(e.target.value.toUpperCase())} />
                </div>
                {lookupStatus === "error" && (
                  <div className="alert alert-error animate-fade-in">لم يتم العثور على مذكرة تطابق هذه البيانات. يرجى التأكد من الكود والإيميل.</div>
                )}
                <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={lookupStatus === "loading"} style={{ marginTop: "1rem" }}>
                  {lookupStatus === "loading" ? "جاري البحث..." : "فتح المحادثة 🔓"}
                </button>
              </form>
            </div>
          ) : (
            <div className="card glass animate-fade-in" style={{ padding: 0, border: "none" }}>
              {/* Ticket Header */}
              <div style={{ background: "linear-gradient(135deg, var(--primary) 0%, #0d2340 100%)", color: "#fff", padding: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div className="tag" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", marginBottom: "0.5rem", border: "1px solid rgba(255,255,255,0.2)" }}>
                    {ticket.ticket_code}
                  </div>
                  <h2 style={{ margin: 0, fontSize: "1.5rem", color: "#fff" }}>{ticket.subject}</h2>
                </div>
                <div style={{ 
                  background: ticket.status === "open" ? "var(--secondary)" : "rgba(255,255,255,0.1)", 
                  color: "#fff", padding: "0.5rem 1.25rem", borderRadius: "50px", fontSize: "0.85rem", fontWeight: 700,
                  boxShadow: ticket.status === "open" ? "0 4px 12px rgba(201,168,76, 0.3)" : "none"
                }}>
                  {ticket.status === "open" ? "مفتوحة (جديدة)" : ticket.status === "replied" ? "تم الرد" : "مغلقة"}
                </div>
              </div>

              {/* Chat Thread */}
              <div style={{ padding: "2.5rem", background: "rgba(248, 250, 252, 0.5)", maxHeight: "600px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "2rem" }}>
                {messages.map((msg, i) => {
                  const isClient = msg.sender === "client";
                  return (
                    <div key={msg.id} className="animate-slide-up" style={{ 
                      display: "flex", flexDirection: "column", 
                      alignItems: isClient ? "flex-start" : "flex-end",
                      animationDelay: `${i * 0.1}s`
                    }}>
                      <div style={{ 
                        maxWidth: "85%", padding: "1.25rem 1.5rem", borderRadius: isClient ? "20px 20px 20px 4px" : "20px 20px 4px 20px",
                        background: isClient ? "#fff" : "var(--primary)",
                        color: isClient ? "#333" : "#fff",
                        border: isClient ? "1px solid rgba(0,0,0,0.05)" : "none",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.04)",
                        position: "relative"
                      }}>
                        <div style={{ fontSize: "1rem", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{msg.message}</div>
                        
                        {msg.attachment_url && (
                          <div style={{ marginTop: "1rem", borderTop: `1px solid ${isClient ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.15)"}`, paddingTop: "1rem" }}>
                            {msg.attachment_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                              <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" className="hover-lift" style={{ display: "block" }}>
                                <img src={msg.attachment_url} alt="مرفق" style={{ maxWidth: "100%", borderRadius: "12px", cursor: "zoom-in", border: "1px solid rgba(0,0,0,0.1)" }} />
                              </a>
                            ) : (
                              <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" 
                                 className="btn btn-outline btn-sm"
                                 style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: isClient ? "var(--primary)" : "#fff", borderColor: isClient ? "var(--border)" : "rgba(255,255,255,0.3)" }}>
                                📎 تحميل الملف المرفق
                              </a>
                            )}
                          </div>
                        )}

                        <div style={{ fontSize: "0.75rem", opacity: 0.6, marginTop: "0.75rem", textAlign: isClient ? "left" : "right", fontWeight: 600 }}>
                          {format(new Date(msg.created_at), "dd MMMM - HH:mm", { locale: ar })}
                        </div>
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.5rem", padding: "0 0.75rem", fontWeight: 700 }}>
                        {isClient ? ticket.client_name : "⚖️ مكتب المحاماة (الرد الرسمي)"}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Box */}
              {ticket.status !== "closed" && (
                <div style={{ padding: "2rem", borderTop: "1px solid var(--border)", background: "rgba(255,255,255,0.8)", backdropFilter: "blur(10px)" }}>
                  <form onSubmit={handleReply}>
                    <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                      <textarea className="form-control" rows={4} placeholder="اكتب ردك هنا..."
                                style={{ borderRadius: "15px", border: "2px solid var(--border)", padding: "1rem" }}
                                value={replyText} onChange={e => setReplyText(e.target.value)}></textarea>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                      <div>
                        <label className="btn btn-outline btn-sm" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.5rem", borderRadius: "10px" }}>
                          📎 {selectedFile ? "تغيير الملف" : "إرفاق ملف"}
                          <input type="file" style={{ display: "none" }} onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
                        </label>
                        {selectedFile && (
                          <span style={{ fontSize: "0.85rem", color: "var(--primary)", marginInlineStart: "12px", fontWeight: 600 }}>
                            {selectedFile.name}
                            <button type="button" onClick={() => setSelectedFile(null)} style={{ border: "none", background: "none", color: "#e53e3e", cursor: "pointer", marginInlineStart: "8px", fontSize: "1.2rem" }}>&times;</button>
                          </span>
                        )}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        {replyStatus === "error" && <span style={{ color: "#e53e3e", fontSize: "0.9rem", fontWeight: 600 }}>❌ فشل الإرسال</span>}
                        {replyStatus === "success" && <span style={{ color: "#38a169", fontSize: "0.9rem", fontWeight: 600 }}>✅ تم الإرسال</span>}
                        {replyStatus === "uploading" && <span style={{ color: "var(--primary)", fontSize: "0.9rem", fontWeight: 600 }} className="animate-pulse">⏳ جاري الرفع...</span>}
                        <button type="submit" className="btn btn-secondary btn-lg" disabled={replyStatus === "loading" || replyStatus === "uploading"}>
                          {replyStatus === "loading" ? "جاري الإرسال..." : "إرسال الرد 📤"}
                        </button>
                      </div>
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
