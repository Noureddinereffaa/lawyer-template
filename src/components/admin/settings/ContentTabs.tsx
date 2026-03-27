"use client";
import React from "react";
import { ClientConfig } from "../../../../config/client.config";

export function ContentTab({ config, updateConfig }: { config: ClientConfig, updateConfig: (path: string, val: any) => void }) {
  return (
    <>
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="section-title">📝 نصوص القسم الرئيسي (Hero)</div>
        <div className="field-full">
          <div className="form-group">
            <label className="form-label">العنوان الرئيسي</label>
            <input className="form-control" value={config.hero.title} onChange={e => updateConfig("hero.title", e.target.value)} />
          </div>
        </div>
        <div className="field-full">
          <div className="form-group">
            <label className="form-label">النبذة التفصيلية أسفل العنوان</label>
            <textarea className="form-control" style={{ minHeight: 80 }} value={config.hero.description} onChange={e => updateConfig("hero.description", e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="section-title">🎓 قسم "من نحن" (About)</div>
        <div className="field-full">
          <div className="form-group">
            <label className="form-label">فقرة الوصف الشاملة</label>
            <textarea className="form-control" style={{ minHeight: 100 }} value={config.about.description} onChange={e => updateConfig("about.description", e.target.value)} />
          </div>
        </div>
        <div className="field-full">
          <label className="form-label">النقاط أو الميزات (Features Bar)</label>
          <div className="dynamic-list" style={{ marginTop: ".5rem" }}>
            {config.about.features.map((f, i) => (
              <div className="dynamic-item" key={i} style={{ display: "flex", gap: "1rem", padding: ".75rem" }}>
                <input className="form-control" value={f} onChange={e => {
                  const arr = [...config.about.features]; arr[i] = e.target.value; updateConfig("about.features", arr);
                }} />
                <button className="btn btn-outline" style={{ color: "#e53e3e", borderColor: "#e53e3e", padding: "0 1rem" }} onClick={() => {
                  const arr = [...config.about.features]; arr.splice(i, 1); updateConfig("about.features", arr);
                }}>حذف</button>
              </div>
            ))}
            <button className="add-btn" onClick={() => updateConfig("about.features", [...config.about.features, "ميزة جديدة"])}>
              + إضافة نقطة
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="section-title">⚡ شريط الثقة (Trust Bar)</div>
        <p style={{ color: "var(--text-secondary)", fontSize: ".85rem", marginBottom: "1rem" }}>
          الشريط الأفقي الذي يظهر أسفل القسم الرئيسي ويبرز أهم أسباب اختيار مكتبك.
        </p>
        <div className="dynamic-list">
          {config.trustBar.map((tb, i) => (
            <div className="dynamic-item" key={i} style={{ display: "flex", gap: "1rem", padding: ".75rem" }}>
              <input className="form-control" value={tb} onChange={e => {
                const arr = [...config.trustBar]; arr[i] = e.target.value; updateConfig("trustBar", arr);
              }} />
              <button className="btn btn-outline" style={{ color: "#e53e3e", borderColor: "#e53e3e", padding: "0 1rem" }} onClick={() => {
                const arr = [...config.trustBar]; arr.splice(i, 1); updateConfig("trustBar", arr);
              }}>حذف</button>
            </div>
          ))}
          <button className="add-btn" onClick={() => updateConfig("trustBar", [...config.trustBar, "⚡ ميزة جديدة"])}>
            + إضافة عنصر لشريط الثقة
          </button>
        </div>
      </div>
    </>
  );
}

export function TestimonialsTab({ config, updateConfig }: { config: ClientConfig, updateConfig: (path: string, val: any) => void }) {
  return (
    <div className="card">
      <div className="section-title">💬 آراء العملاء (Testimonials)</div>
      <div className="dynamic-list">
        {config.testimonials.map((t, i) => (
          <div className="dynamic-item" key={i}>
            <button className="remove-btn" onClick={() => {
              const arr = [...config.testimonials]; arr.splice(i, 1); updateConfig("testimonials", arr);
            }}>✕</button>
            <div className="field-row">
              <div className="form-group">
                <label className="form-label">اسم العميل</label>
                <input className="form-control" value={t.name} onChange={e => {
                  const arr = [...config.testimonials]; arr[i] = { ...arr[i], name: e.target.value }; updateConfig("testimonials", arr);
                }} />
              </div>
              <div className="form-group">
                <label className="form-label">المسمى / دوره</label>
                <input className="form-control" placeholder="مثال: عميل، قانون الأسرة" value={t.role} onChange={e => {
                  const arr = [...config.testimonials]; arr[i] = { ...arr[i], role: e.target.value }; updateConfig("testimonials", arr);
                }} />
              </div>
            </div>
            <div className="field-row">
              <div className="form-group">
                <label className="form-label">عدد النجوم (1 إلى 5)</label>
                <input className="form-control" dir="ltr" type="number" min="1" max="5" value={t.stars} onChange={e => {
                  const arr = [...config.testimonials]; arr[i] = { ...arr[i], stars: parseInt(e.target.value) || 5 }; updateConfig("testimonials", arr);
                }} />
              </div>
            </div>
            <div className="field-full">
              <div className="form-group">
                <label className="form-label">نص التقييم</label>
                <textarea className="form-control" style={{ minHeight: 70 }} value={t.text} onChange={e => {
                  const arr = [...config.testimonials]; arr[i] = { ...arr[i], text: e.target.value }; updateConfig("testimonials", arr);
                }} />
              </div>
            </div>
          </div>
        ))}
        <button className="add-btn" onClick={() => updateConfig("testimonials", [...config.testimonials, { name: "عميل جديد", role: "جهة العمل", text: "تقييم جديد...", stars: 5 }])}>
          + إضافة رأي عميل
        </button>
      </div>
    </div>
  );
}
