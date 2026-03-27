"use client";
import React from "react";
import { ClientConfig } from "../../../../config/client.config";

export function IdentityTab({ config, updateConfig }: { config: ClientConfig, updateConfig: (path: string, val: any) => void }) {
  return (
    <div className="card">
      <div className="section-title">🏛️ الهوية والعلامة التجارية</div>
      <div className="field-row">
        <div className="form-group">
          <label className="form-label">اسم المحامي</label>
          <input className="form-control" value={config.lawyerName} onChange={e => updateConfig("lawyerName", e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">اسم المكتب</label>
          <input className="form-control" value={config.officeName} onChange={e => updateConfig("officeName", e.target.value)} />
        </div>
      </div>
      <div className="field-full">
        <div className="form-group">
          <label className="form-label">الشعار النصي (Tagline)</label>
          <input className="form-control" value={config.tagline} onChange={e => updateConfig("tagline", e.target.value)} />
          <small style={{ color: "var(--text-secondary)", fontSize: ".8rem" }}>يظهر في مكان العنوان القديم</small>
        </div>
      </div>
      <div className="field-row">
        <div className="form-group">
          <label className="form-label">مسار الشعار (Logo)</label>
          <input className="form-control" dir="ltr" value={config.logo} onChange={e => updateConfig("logo", e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">صورة المشاركة (OG Image)</label>
          <input className="form-control" dir="ltr" value={config.ogImage} onChange={e => updateConfig("ogImage", e.target.value)} />
        </div>
      </div>
    </div>
  );
}

export function ThemeTab({ config, updateConfig }: { config: ClientConfig, updateConfig: (path: string, val: any) => void }) {
  return (
    <>
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="section-title">🎨 الألوان</div>
        <div className="field-row">
          {([["primaryColor", "اللون الأساسي"], ["primaryLight", "الأساسي الفاتح"], ["secondaryColor", "اللون الثانوي"], ["secondaryLight", "الثانوي الفاتح"]] as const).map(([key, label]) => (
            <div className="form-group" key={key}>
              <label className="form-label">{label}</label>
              <div className="color-field">
                <input type="color" value={(config.theme as any)[key]} onChange={e => updateConfig(`theme.${key}`, e.target.value)} />
                <span>{(config.theme as any)[key]}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="field-row">
          {([["bgColor", "لون الخلفية"], ["surfaceColor", "لون السطح"], ["textPrimary", "لون النص الرئيسي"], ["textSecondary", "لون النص الثانوي"]] as const).map(([key, label]) => (
            <div className="form-group" key={key}>
              <label className="form-label">{label}</label>
              <div className="color-field">
                <input type="color" value={(config.theme as any)[key]} onChange={e => updateConfig(`theme.${key}`, e.target.value)} />
                <span>{(config.theme as any)[key]}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="field-row">
          <div className="form-group">
            <label className="form-label">لون الحدود</label>
            <div className="color-field">
              <input type="color" value={config.theme.borderColor} onChange={e => updateConfig("theme.borderColor", e.target.value)} />
              <span>{config.theme.borderColor}</span>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">انحناء الزوايا</label>
            <input className="form-control" dir="ltr" value={config.theme.borderRadius} onChange={e => updateConfig("theme.borderRadius", e.target.value)} />
          </div>
        </div>
      </div>
      <div className="card">
        <div className="section-title">✏️ الخطوط</div>
        <div className="field-row">
          <div className="form-group">
            <label className="form-label">خط العناوين</label>
            <select className="form-control" value={config.theme.fontHeading} onChange={e => updateConfig("theme.fontHeading", e.target.value)}>
              <option value="Amiri">Amiri</option>
              <option value="Cairo">Cairo</option>
              <option value="Tajawal">Tajawal</option>
              <option value="El Messiri">El Messiri</option>
              <option value="Noto Kufi Arabic">Noto Kufi Arabic</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">خط النصوص</label>
            <select className="form-control" value={config.theme.fontBody} onChange={e => updateConfig("theme.fontBody", e.target.value)}>
              <option value="Tajawal">Tajawal</option>
              <option value="Cairo">Cairo</option>
              <option value="Changa">Changa</option>
              <option value="IBM Plex Sans Arabic">IBM Plex Sans Arabic</option>
              <option value="Noto Sans Arabic">Noto Sans Arabic</option>
            </select>
          </div>
        </div>
      </div>
    </>
  );
}
