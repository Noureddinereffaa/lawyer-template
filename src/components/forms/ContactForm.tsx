"use client";

import { useState } from "react";
import { ClientConfig } from "../../../config/client.config";

export default function ContactForm({ config }: { config: ClientConfig }) {
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await new Promise(res => setTimeout(res, 1500));
      setStatus("success");
      setFormData({ name: "", phone: "", email: "", subject: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="card" style={{ padding: "2.5rem" }}>
      <h2 style={{ marginBottom: "1.5rem", fontSize: "1.5rem" }}>أرسل لنا رسالة</h2>
      
      {status === "success" && (
        <div className="alert alert-success">
          تم إرسال رسالتك بنجاح. سنتواصل معك في أقرب وقت.
        </div>
      )}
      {status === "error" && (
        <div className="alert alert-error">
          حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة لاحقاً.
        </div>
      )}

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
          {status === "loading" ? "جاري الإرسال..." : "إرسال الرسالة"}
        </button>
      </form>
    </div>
  );
}
