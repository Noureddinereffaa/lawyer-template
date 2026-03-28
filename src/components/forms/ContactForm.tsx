"use client";

import { useState } from "react";
import { ClientConfig } from "../../../config/client.config";

export default function ContactForm({ config }: { config: ClientConfig }) {
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const [ticketCode, setTicketCode] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const data = await res.json();
        setTicketCode(data.ticketCode);
        setStatus("success");
        setFormData({ name: "", phone: "", email: "", subject: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="card" style={{ padding: "2.5rem" }}>
      <h2 style={{ marginBottom: "1.5rem", fontSize: "1.5rem" }}>أرسل لنا رسالة</h2>
      
      {status === "success" && ticketCode && (
        <div className="alert alert-success" style={{ padding: "2rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <div style={{ fontSize: "2.5rem" }}>📨</div>
          <h3 style={{ margin: 0, color: "#2f855a", fontSize: "1.3rem" }}>تم إرسال رسالتك بنجاح!</h3>
          <p style={{ margin: 0 }}>لقد قمنا بفتح مذكرة تواصل خاصة بك لاستكمال المحادثة مع المكتب بكل احترافية وخصوصية.</p>
          <div style={{ background: "#fff", border: "2px dashed #9ae6b4", padding: "1rem", borderRadius: "12px", width: "100%", maxWidth: "300px" }}>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>كود المتابعة الخاص بك:</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--primary)", letterSpacing: "2px", direction: "ltr" }}>{ticketCode}</div>
          </div>
          <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", maxWidth: "80%" }}>
            تم إرسال نسخة من هذا الكود إلى بريدك الإلكتروني. ستحتاج هذا الكود لقراءة ردود المحامي وإضافة مرفقات لاحقاً.
          </p>
          <a href={`/track?code=${ticketCode}`} className="btn btn-primary" style={{ marginTop: "0.5rem" }}>
            🔍 تابع مذكرتك الآن
          </a>
        </div>
      )}
      {status === "error" && (
        <div className="alert alert-error">
          حدث خطأ أثناء الاتصال بالخادم. يرجى التأكد من اتصالك بالإنترنت والمحاولة لاحقاً.
        </div>
      )}

      {status !== "success" && (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div className="grid-2" style={{ gap: "1.25rem" }}>
          <div className="form-group">
            <label className="form-label">الاسم الكامل <span>*</span></label>
            <input type="text" className="form-control" required 
                   value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}/>
          </div>
          <div className="form-group">
            <label className="form-label">الهاتف <span>*</span></label>
            <input type="tel" className="form-control" required dir="ltr" placeholder="0550 00 00 00"
                   value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}/>
          </div>
        </div>
        
        <div className="grid-2" style={{ gap: "1.25rem" }}>
          <div className="form-group">
            <label className="form-label">البريد الإلكتروني</label>
            <input type="email" className="form-control" dir="ltr"
                   value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}/>
          </div>
          <div className="form-group">
            <label className="form-label">الموضوع</label>
            <input type="text" className="form-control"
                   value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}/>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">الرسالة <span>*</span></label>
          <textarea className="form-control" required
                    value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}></textarea>
        </div>

        <button type="submit" className="btn btn-primary btn-full" disabled={status === "loading"} style={{ marginTop: ".5rem" }}>
          {status === "loading" ? "جاري الإرسال..." : "إرسال الرسالة وإصدار التذكرة"}
        </button>
      </form>
      )}
    </div>
  );
}
