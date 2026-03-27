"use client";
import React from "react";
import { ClientConfig } from "../../../../config/client.config";

export function ServicesTab({ config, updateConfig }: { config: ClientConfig, updateConfig: (path: string, val: any) => void }) {
  return (
    <div className="card">
      <div className="section-title">⚖️ الخدمات والتخصصات</div>
      <div className="dynamic-list">
        {config.specialties.map((sp, i) => (
          <div className="dynamic-item" key={i}>
            <button className="remove-btn" onClick={() => {
              const arr = [...config.specialties]; arr.splice(i, 1); updateConfig("specialties", arr);
            }}>✕</button>
            <div className="field-row">
              <div className="form-group">
                <label className="form-label">المعرف (ID)</label>
                <input className="form-control" dir="ltr" value={sp.id} onChange={e => {
                  const arr = [...config.specialties]; arr[i] = { ...arr[i], id: e.target.value }; updateConfig("specialties", arr);
                }} />
              </div>
              <div className="form-group">
                <label className="form-label">العنوان</label>
                <input className="form-control" value={sp.title} onChange={e => {
                  const arr = [...config.specialties]; arr[i] = { ...arr[i], title: e.target.value }; updateConfig("specialties", arr);
                }} />
              </div>
            </div>
            <div className="field-row">
              <div className="form-group">
                <label className="form-label">الأيقونة (Emoji)</label>
                <input className="form-control" value={sp.icon} onChange={e => {
                  const arr = [...config.specialties]; arr[i] = { ...arr[i], icon: e.target.value }; updateConfig("specialties", arr);
                }} />
              </div>
              <div className="form-group">
                <label className="form-label">السعر يبدأ من (دج)</label>
                <input className="form-control" dir="ltr" type="number" value={sp.priceFrom} onChange={e => {
                  const arr = [...config.specialties]; arr[i] = { ...arr[i], priceFrom: parseInt(e.target.value) || 0 }; updateConfig("specialties", arr);
                }} />
              </div>
            </div>
            <div className="field-full">
              <div className="form-group">
                <label className="form-label">الوصف</label>
                <textarea className="form-control" style={{ minHeight: 60 }} value={sp.description} onChange={e => {
                  const arr = [...config.specialties]; arr[i] = { ...arr[i], description: e.target.value }; updateConfig("specialties", arr);
                }} />
              </div>
            </div>
          </div>
        ))}
        <button className="add-btn" onClick={() => updateConfig("specialties", [...config.specialties, { id: `service-${Date.now()}`, title: "", description: "", icon: "📋", priceFrom: 3000 }])}>
          + إضافة خدمة جديدة
        </button>
      </div>
    </div>
  );
}

export function BookingTab({ config, updateConfig }: { config: ClientConfig, updateConfig: (path: string, val: any) => void }) {
  return (
    <>
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="section-title">📅 إعدادات الحجز</div>
        <div className="field-row">
          <div className="form-group">
            <label className="form-label">بداية الدوام</label>
            <input className="form-control" dir="ltr" type="time" value={config.booking.workHours.start} onChange={e => updateConfig("booking.workHours", { ...config.booking.workHours, start: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">نهاية الدوام</label>
            <input className="form-control" dir="ltr" type="time" value={config.booking.workHours.end} onChange={e => updateConfig("booking.workHours", { ...config.booking.workHours, end: e.target.value })} />
          </div>
        </div>
        <div className="field-row">
          <div className="form-group">
            <label className="form-label">مدة الموعد (دقيقة)</label>
            <input className="form-control" dir="ltr" type="number" value={config.booking.slotDurationMin} onChange={e => updateConfig("booking.slotDurationMin", parseInt(e.target.value) || 60)} />
          </div>
          <div className="form-group">
            <label className="form-label">أقصى مدة حجز مسبق (يوم)</label>
            <input className="form-control" dir="ltr" type="number" value={config.booking.maxAdvanceDays} onChange={e => updateConfig("booking.maxAdvanceDays", parseInt(e.target.value) || 30)} />
          </div>
        </div>
        <div className="field-full" style={{ marginTop: ".5rem" }}>
          <label className="form-label">أيام العمل</label>
          <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginTop: ".5rem" }}>
            {[{ num: 0, name: "الأحد" }, { num: 1, name: "الاثنين" }, { num: 2, name: "الثلاثاء" }, { num: 3, name: "الأربعاء" }, { num: 4, name: "الخميس" }, { num: 5, name: "الجمعة" }, { num: 6, name: "السبت" }].map(d => (
              <label key={d.num} style={{ display: "flex", alignItems: "center", gap: ".4rem", padding: ".4rem .8rem", borderRadius: 8, border: `2px solid ${config.booking.workDays.includes(d.num) ? "var(--primary)" : "var(--border)"}`, background: config.booking.workDays.includes(d.num) ? "rgba(26,60,94,.08)" : "transparent", cursor: "pointer", fontSize: ".88rem", fontWeight: 600 }}>
                <input type="checkbox" checked={config.booking.workDays.includes(d.num)} onChange={e => {
                  const days = e.target.checked ? [...config.booking.workDays, d.num].sort() : config.booking.workDays.filter(x => x !== d.num);
                  updateConfig("booking.workDays", days);
                }} style={{ display: "none" }} />
                {config.booking.workDays.includes(d.num) ? "✅" : "⬜"} {d.name}
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className="card">
        <div className="section-title">💰 أنواع الاستشارات والأسعار</div>
        <div className="dynamic-list">
          {config.booking.consultationTypes.map((ct, i) => (
            <div className="dynamic-item" key={i}>
              <button className="remove-btn" onClick={() => {
                const arr = [...config.booking.consultationTypes]; arr.splice(i, 1); updateConfig("booking.consultationTypes", arr);
              }}>✕</button>
              <div className="field-row" style={{ gridTemplateColumns: "1fr 1.5fr 1fr" }}>
                <div className="form-group">
                  <label className="form-label">المعرف</label>
                  <input className="form-control" dir="ltr" value={ct.id} onChange={e => {
                    const arr = [...config.booking.consultationTypes]; arr[i] = { ...arr[i], id: e.target.value }; updateConfig("booking.consultationTypes", arr);
                  }} />
                </div>
                <div className="form-group">
                  <label className="form-label">الاسم</label>
                  <input className="form-control" value={ct.label} onChange={e => {
                    const arr = [...config.booking.consultationTypes]; arr[i] = { ...arr[i], label: e.target.value }; updateConfig("booking.consultationTypes", arr);
                  }} />
                </div>
                <div className="form-group">
                  <label className="form-label">السعر (دج)</label>
                  <input className="form-control" dir="ltr" type="number" value={ct.price} onChange={e => {
                    const arr = [...config.booking.consultationTypes]; arr[i] = { ...arr[i], price: parseInt(e.target.value) || 0 }; updateConfig("booking.consultationTypes", arr);
                  }} />
                </div>
              </div>
            </div>
          ))}
          <button className="add-btn" onClick={() => updateConfig("booking.consultationTypes", [...config.booking.consultationTypes, { id: `type-${Date.now()}`, label: "", price: 3000 }])}>
            + إضافة نوع استشارة
          </button>
        </div>
      </div>
    </>
  );
}

export function StatsTab({ config, updateConfig }: { config: ClientConfig, updateConfig: (path: string, val: any) => void }) {
  return (
    <div className="card">
      <div className="section-title">📊 إحصائيات القسم الرئيسي (Hero)</div>
      <div className="dynamic-list">
        {config.stats.map((s, i) => (
          <div className="dynamic-item" key={i}>
            <button className="remove-btn" onClick={() => {
              const arr = [...config.stats]; arr.splice(i, 1); updateConfig("stats", arr);
            }}>✕</button>
            <div className="field-row">
              <div className="form-group">
                <label className="form-label">القيمة (مثال: 500+)</label>
                <input className="form-control" value={s.value} onChange={e => {
                  const arr = [...config.stats]; arr[i] = { ...arr[i], value: e.target.value }; updateConfig("stats", arr);
                }} />
              </div>
              <div className="form-group">
                <label className="form-label">الوصف</label>
                <input className="form-control" value={s.label} onChange={e => {
                  const arr = [...config.stats]; arr[i] = { ...arr[i], label: e.target.value }; updateConfig("stats", arr);
                }} />
              </div>
            </div>
          </div>
        ))}
        <button className="add-btn" onClick={() => updateConfig("stats", [...config.stats, { value: "", label: "" }])}>
          + إضافة إحصائية
        </button>
      </div>
    </div>
  );
}
