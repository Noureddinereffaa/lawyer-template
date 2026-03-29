"use client";

import { useEffect, useState, useCallback } from "react";
import { clientConfig as defaultConfig, ClientConfig } from "../../../../../config/client.config";

import { IdentityTab, ThemeTab, SecurityTab } from "@/components/admin/settings/BrandTabs";
import { ContactTab, SocialTab, SEOTab, HoursTab } from "@/components/admin/settings/BusinessTabs";
import { ServicesTab, BookingTab, StatsTab } from "@/components/admin/settings/ServiceTabs";
import { ContentTab, TestimonialsTab } from "@/components/admin/settings/ContentTabs";

// ─── Tab definitions ────────────────────────────────────────────────────────
const TABS = [
  { id: "identity",     label: "الهوية",         icon: "🏛️" },
  { id: "theme",        label: "التصميم",         icon: "🎨" },
  { id: "content",      label: "النصوص",          icon: "📝" },
  { id: "reviews",      label: "آراء العملاء",    icon: "💬" },
  { id: "stats",        label: "الإحصائيات",      icon: "📊" },
  { id: "services",     label: "الخدمات",         icon: "⚖️" },
  { id: "contact",      label: "التواصل",         icon: "📞" },
  { id: "hours",        label: "ساعات العمل",      icon: "🕐" },
  { id: "social",       label: "الشبكات",         icon: "🌐" },
  { id: "seo",          label: "SEO",             icon: "🔍" },
  { id: "booking",      label: "نظام الحجز",      icon: "📅" },
  { id: "security",     label: "الأمان والديمو",   icon: "🔐" },
];

function deepMergeConfig(db: any): ClientConfig {
  return {
    ...defaultConfig,
    ...db,
    theme:    { ...defaultConfig.theme,    ...(db.theme    || {}) },
    contact:  { ...defaultConfig.contact,  ...(db.contact  || {}) },
    seo:      { ...defaultConfig.seo,      ...(db.seo      || {}) },
    social:   { ...defaultConfig.social,   ...(db.social   || {}) },
    hero:     { ...defaultConfig.hero,     ...(db.hero     || {}) },
    about:    {
      description: db.about?.description ?? defaultConfig.about.description,
      features:    db.about?.features    ?? defaultConfig.about.features,
    },
    booking: {
      ...defaultConfig.booking,
      ...(db.booking || {}),
      inPerson: { ...defaultConfig.booking.inPerson, ...(db.booking?.inPerson || {}) },
      online: { ...defaultConfig.booking.online, ...(db.booking?.online || {}) },
    },
    trustBar:     (db.trustBar     && db.trustBar.length     > 0) ? db.trustBar     : defaultConfig.trustBar,
    testimonials: (db.testimonials && db.testimonials.length > 0) ? db.testimonials : defaultConfig.testimonials,
    stats:        (db.stats        && db.stats.length        > 0) ? db.stats        : defaultConfig.stats,
    specialties:  (db.specialties  && db.specialties.length  > 0) ? db.specialties  : defaultConfig.specialties,
    workingHours: (db.workingHours && db.workingHours.length > 0) ? db.workingHours : defaultConfig.workingHours,
  } as ClientConfig;
}

export default function SettingsPage() {
  const [loading,   setLoading]   = useState(false);
  const [fetching,  setFetching]  = useState(true);
  const [config,    setConfig]    = useState<ClientConfig | null>(null);
  const [saved,     setSaved]     = useState<ClientConfig | null>(null); // last-saved snapshot
  const [activeTab, setActiveTab] = useState("identity");
  const [saveMsg,   setSaveMsg]   = useState<{ type: "success" | "error"; text: string } | null>(null);

  const hasUnsaved = config && saved && JSON.stringify(config) !== JSON.stringify(saved);

  // ─── Load via API (bypasses RLS and Vercel cache) ─────────────────────────
  const loadSettings = useCallback(async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/settings?t=" + Date.now(), { cache: "no-store" });
      const { config_data } = await res.json();
      const merged = config_data && Object.keys(config_data).length > 0
        ? deepMergeConfig(config_data)
        : { ...defaultConfig };
      
      setConfig(merged);
      setSaved(merged);
    } catch(e) {
      console.error("Failed to load settings:", e);
      setConfig({ ...defaultConfig });
      setSaved({ ...defaultConfig });
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  // ─── Save via API (triggers revalidatePath server-side) ────────────────────
  const handleSave = async () => {
    if (!config) return;
    setLoading(true);
    setSaveMsg(null);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "خطأ غير معروف");

      setSaved(config); // mark as saved
      setSaveMsg({ type: "success", text: "✅ تم الحفظ وتحديث الموقع تلقائياً!" });
    } catch (err: any) {
      setSaveMsg({ type: "error", text: "❌ خطأ في الحفظ: " + err.message });
    } finally {
      setLoading(false);
      setTimeout(() => setSaveMsg(null), 5000);
    }
  };

  // ─── Update helper ─────────────────────────────────────────────────────────
  const updateConfig = (path: string, value: any) => {
    if (!config) return;
    const keys = path.split(".");
    const next = { ...config } as any;
    let obj = next;
    for (let i = 0; i < keys.length - 1; i++) {
      obj[keys[i]] = { ...obj[keys[i]] };
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    setConfig(next);
  };

  // ─── Loading state ─────────────────────────────────────────────────────────
  if (fetching || !config) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400, gap: "1rem" }}>
        <div className="spinner" />
        <span style={{ color: "var(--text-secondary)" }}>جاري تحميل الإعدادات...</span>
      </div>
    );
  }

  return (
    <>
      <style>{`
        /* ── Tabs ──────────────────────────────────────────────────── */
        .settings-tabs {
          display: flex; gap: .4rem; overflow-x: auto; padding-bottom: .75rem;
          border-bottom: 2px solid var(--border); margin-bottom: 1.75rem;
          scrollbar-width: thin;
        }
        .settings-tab {
          display: flex; align-items: center; gap: .35rem;
          padding: .55rem .9rem; border-radius: 8px 8px 0 0;
          font-size: .85rem; font-weight: 600; white-space: nowrap;
          color: var(--text-secondary); cursor: pointer;
          border: 1px solid transparent; border-bottom: none;
          background: transparent; transition: all .2s;
        }
        .settings-tab:hover { color: var(--primary); background: rgba(26,60,94,.05); }
        .settings-tab.active {
          color: var(--primary); background: var(--surface);
          border-color: var(--border); position: relative;
        }
        .settings-tab.active::after {
          content: ""; position: absolute; bottom: -2px; left: 0; right: 0;
          height: 2px; background: var(--surface);
        }
        .tab-panel { display: none; animation: fadeIn .2s ease; }
        .tab-panel.active { display: block; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }

        /* ── Shared component styles (used by sub-tabs) ─────────────── */
        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
        .field-full { margin-bottom: 1rem; }
        .section-title {
          font-size: 1.05rem; font-weight: 700; color: var(--primary);
          margin-bottom: 1.25rem; padding-bottom: .75rem;
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center; gap: .5rem;
        }
        .dynamic-list { display: flex; flex-direction: column; gap: .85rem; }
        .dynamic-item {
          background: var(--bg); border: 1px solid var(--border);
          border-radius: 10px; padding: 1.1rem 1.25rem; position: relative;
        }
        .dynamic-item .remove-btn {
          position: absolute; top: .75rem; left: .75rem;
          background: #e53e3e; color: #fff; border: none; border-radius: 6px;
          width: 26px; height: 26px; cursor: pointer; font-size: .75rem;
          display: flex; align-items: center; justify-content: center;
          transition: background .15s;
        }
        .dynamic-item .remove-btn:hover { background: #c53030; }
        .add-btn {
          display: flex; align-items: center; justify-content: center; gap: .5rem;
          padding: .7rem; border: 2px dashed var(--border); border-radius: 10px;
          color: var(--primary); font-weight: 600; cursor: pointer; font-size: .88rem;
          transition: all .2s; background: transparent; width: 100%;
        }
        .add-btn:hover { border-color: var(--primary); background: rgba(26,60,94,.03); }
        .color-field { display: flex; align-items: center; gap: .75rem; }
        .color-field input[type="color"] {
          width: 42px; height: 34px; padding: 0; border: 2px solid var(--border);
          cursor: pointer; border-radius: 7px; flex-shrink: 0;
        }
        .color-field span { font-family: monospace; font-size: .82rem; direction: ltr; color: var(--text-secondary); }

        /* ── Save bar ────────────────────────────────────────────────── */
        .save-bar {
          position: sticky; bottom: 0; z-index: 20;
          background: var(--surface); border-top: 1px solid var(--border);
          padding: 1rem 1.5rem; margin-top: 2rem;
          display: flex; align-items: center; justify-content: space-between; gap: 1rem;
          box-shadow: 0 -4px 20px rgba(0,0,0,.06);
        }
        .unsaved-badge {
          display: inline-flex; align-items: center; gap: .4rem;
          background: #fff8e6; border: 1px solid #f6ad55; color: #b7791f;
          padding: .35rem .75rem; border-radius: 20px; font-size: .82rem; font-weight: 700;
        }

        @media (max-width: 768px) {
          .field-row { grid-template-columns: 1fr; }
          .settings-tabs { gap: .2rem; }
          .settings-tab { padding: .4rem .55rem; font-size: .78rem; }
          .save-bar { flex-direction: column; align-items: stretch; text-align: center; }
        }
      `}</style>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>⚙️ لوحة إعدادات الموقع</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: ".88rem", marginTop: ".2rem" }}>
            أي تغيير تحفظه يظهر فوراً على الموقع بعد الضغط على زر الحفظ.
          </p>
        </div>
        <a href="/" target="_blank" className="btn btn-outline btn-sm">
          🌍 عرض الموقع ←
        </a>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <div className="settings-tabs" role="tablist">
        {TABS.map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={activeTab === t.id}
            className={`settings-tab${activeTab === t.id ? " active" : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            <span aria-hidden>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab Panels ────────────────────────────────────────────────────── */}
      <div className={`tab-panel${activeTab === "identity"  ? " active" : ""}`}><IdentityTab     config={config} updateConfig={updateConfig} /></div>
      <div className={`tab-panel${activeTab === "theme"     ? " active" : ""}`}><ThemeTab        config={config} updateConfig={updateConfig} /></div>
      <div className={`tab-panel${activeTab === "content"   ? " active" : ""}`}><ContentTab      config={config} updateConfig={updateConfig} /></div>
      <div className={`tab-panel${activeTab === "reviews"   ? " active" : ""}`}><TestimonialsTab config={config} updateConfig={updateConfig} /></div>
      <div className={`tab-panel${activeTab === "stats"     ? " active" : ""}`}><StatsTab        config={config} updateConfig={updateConfig} /></div>
      <div className={`tab-panel${activeTab === "services"  ? " active" : ""}`}><ServicesTab     config={config} updateConfig={updateConfig} /></div>
      <div className={`tab-panel${activeTab === "contact"   ? " active" : ""}`}><ContactTab      config={config} updateConfig={updateConfig} /></div>
      <div className={`tab-panel${activeTab === "hours"     ? " active" : ""}`}><HoursTab        config={config} updateConfig={updateConfig} /></div>
      <div className={`tab-panel${activeTab === "social"    ? " active" : ""}`}><SocialTab       config={config} updateConfig={updateConfig} /></div>
      <div className={`tab-panel${activeTab === "seo"       ? " active" : ""}`}><SEOTab          config={config} updateConfig={updateConfig} /></div>
      <div className={`tab-panel${activeTab === "booking"   ? " active" : ""}`}><BookingTab      config={config} updateConfig={updateConfig} /></div>
      <div className={`tab-panel${activeTab === "security"  ? " active" : ""}`}><SecurityTab     config={config} updateConfig={updateConfig} /></div>

      {/* ── Save Bar ──────────────────────────────────────────────────────── */}
      <div className="save-bar">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1, flexWrap: "wrap" }}>
          {saveMsg ? (
            <div className={`alert alert-${saveMsg.type}`} style={{ margin: 0, padding: ".6rem 1rem", fontSize: ".9rem" }}>
              {saveMsg.text}
            </div>
          ) : hasUnsaved ? (
            <span className="unsaved-badge">⚠️ توجد تغييرات غير محفوظة</span>
          ) : (
            <span style={{ color: "var(--text-secondary)", fontSize: ".85rem" }}>✅ الإعدادات محفوظة ومزامنة مع الموقع</span>
          )}
        </div>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={loading}
          style={{ minWidth: 200, fontSize: ".95rem", padding: ".7rem 2rem", flexShrink: 0 }}
        >
          {loading ? "⏳ جاري الحفظ..." : "💾 حفظ وتطبيق على الموقع"}
        </button>
      </div>
    </>
  );
}
