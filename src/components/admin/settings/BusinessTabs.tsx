"use client";
import React from "react";
import { ClientConfig } from "../../../../config/client.config";

export function ContactTab({ config, updateConfig }: { config: ClientConfig, updateConfig: (path: string, val: any) => void }) {
  return (
    <div className="card">
      <div className="section-title">📞 معلومات التواصل</div>
      <div className="field-row">
        <div className="form-group">
          <label className="form-label">رقم الهاتف (دولي)</label>
          <input className="form-control" dir="ltr" value={config.contact.phone} onChange={e => updateConfig("contact.phone", e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">رقم العرض (محلي)</label>
          <input className="form-control" dir="ltr" value={config.contact.phoneDisplay} onChange={e => updateConfig("contact.phoneDisplay", e.target.value)} />
        </div>
      </div>
      <div className="field-row">
        <div className="form-group">
          <label className="form-label">البريد الإلكتروني</label>
          <input className="form-control" dir="ltr" type="email" value={config.contact.email} onChange={e => updateConfig("contact.email", e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">الولاية</label>
          <input className="form-control" value={config.contact.wilaya} onChange={e => updateConfig("contact.wilaya", e.target.value)} />
        </div>
      </div>
      <div className="field-row">
        <div className="form-group">
          <label className="form-label">العنوان الكامل</label>
          <input className="form-control" value={config.contact.address} onChange={e => updateConfig("contact.address", e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">الرمز البريدي</label>
          <input className="form-control" dir="ltr" value={config.contact.postalCode} onChange={e => updateConfig("contact.postalCode", e.target.value)} />
        </div>
      </div>
      <div className="field-full">
        <div className="form-group">
          <label className="form-label">رابط خرائط Google</label>
          <textarea className="form-control" dir="ltr" style={{ minHeight: 80 }} value={config.contact.googleMapsEmbed} onChange={e => updateConfig("contact.googleMapsEmbed", e.target.value)} />
        </div>
      </div>
    </div>
  );
}

export function SocialTab({ config, updateConfig }: { config: ClientConfig, updateConfig: (path: string, val: any) => void }) {
  return (
    <div className="card">
      <div className="section-title">🌐 وسائل التواصل الاجتماعي</div>
      <div className="field-row">
        <div className="form-group">
          <label className="form-label">🔵 Facebook</label>
          <input className="form-control" dir="ltr" value={config.social.facebook} onChange={e => updateConfig("social.facebook", e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">🔗 LinkedIn</label>
          <input className="form-control" dir="ltr" value={config.social.linkedin} onChange={e => updateConfig("social.linkedin", e.target.value)} />
        </div>
      </div>
      <div className="field-row">
        <div className="form-group">
          <label className="form-label">💬 WhatsApp</label>
          <input className="form-control" dir="ltr" value={config.social.whatsapp} onChange={e => updateConfig("social.whatsapp", e.target.value)} />
        </div>
      </div>
    </div>
  );
}

export function SEOTab({ config, updateConfig }: { config: ClientConfig, updateConfig: (path: string, val: any) => void }) {
  return (
    <div className="card">
      <div className="section-title">🔍 تحسين محركات البحث (SEO)</div>
      <div className="field-full">
        <div className="form-group" style={{ background: "rgba(201,168,76,0.05)", padding: "1rem", borderRadius: "10px", borderLeft: "4px solid var(--secondary)", marginBottom: "1.5rem" }}>
          <label className="form-label" style={{ color: "var(--primary)" }}>رابط نطاق المنصة (Domain URL) المربوط 🌐</label>
          <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>هذا الرابط سيتم استخدامه في رسائل الإيميل (مثل رابط غرف الاجتماعات ومتابعة التذاكر). تأكد من إدخاله مع https:// (مثال: https://mohamy.dz)</div>
          <input className="form-control" dir="ltr" placeholder="https://yourdomain.com" value={config.seo.siteUrl} onChange={e => updateConfig("seo.siteUrl", e.target.value)} />
        </div>
      </div>
      <div className="field-full">
        <div className="form-group">
          <label className="form-label">عنوان الموقع الرئيسي</label>
          <input className="form-control" value={config.seo.defaultTitle} onChange={e => updateConfig("seo.defaultTitle", e.target.value)} />
        </div>
      </div>
      <div className="field-full">
        <div className="form-group">
          <label className="form-label">وصف الموقع</label>
          <textarea className="form-control" style={{ minHeight: 80 }} value={config.seo.description} onChange={e => updateConfig("seo.description", e.target.value)} />
        </div>
      </div>
      <div className="field-full">
        <div className="form-group">
          <label className="form-label">الكلمات المفتاحية (فاصلة)</label>
          <textarea className="form-control" style={{ minHeight: 60 }} value={config.seo.keywords.join("، ")} onChange={e => updateConfig("seo.keywords", e.target.value.split("، ").map(k => k.trim()).filter(Boolean))} />
        </div>
      </div>
    </div>
  );
}

export function HoursTab({ config, updateConfig }: { config: ClientConfig, updateConfig: (path: string, val: any) => void }) {
  return (
    <div className="card">
      <div className="section-title">🕐 ساعات العمل</div>
      <div className="dynamic-list">
        {config.workingHours.map((wh, i) => (
          <div className="dynamic-item" key={i}>
            <button className="remove-btn" onClick={() => {
              const arr = [...config.workingHours]; arr.splice(i, 1); updateConfig("workingHours", arr);
            }}>✕</button>
            <div className="field-row">
              <div className="form-group">
                <label className="form-label">اليوم / الأيام</label>
                <input className="form-control" value={wh.day} onChange={e => {
                  const arr = [...config.workingHours]; arr[i] = { ...arr[i], day: e.target.value }; updateConfig("workingHours", arr);
                }} />
              </div>
              <div className="form-group">
                <label className="form-label">الساعات</label>
                <input className="form-control" value={wh.hours} onChange={e => {
                  const arr = [...config.workingHours]; arr[i] = { ...arr[i], hours: e.target.value }; updateConfig("workingHours", arr);
                }} />
              </div>
            </div>
          </div>
        ))}
        <button className="add-btn" onClick={() => updateConfig("workingHours", [...config.workingHours, { day: "", hours: "" }])}>
          + إضافة فترة عمل
        </button>
      </div>
    </div>
  );
}
