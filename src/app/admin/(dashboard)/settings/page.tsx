"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { clientConfig as defaultConfig, ClientConfig } from "../../../../../config/client.config";

// ─── Tab definitions ────────────────────────────────────────
const tabs = [
  { id: "identity",  label: "الهوية",        icon: "🏛️" },
  { id: "theme",     label: "الألوان والخطوط", icon: "🎨" },
  { id: "contact",   label: "التواصل",       icon: "📞" },
  { id: "hours",     label: "ساعات العمل",   icon: "🕐" },
  { id: "stats",     label: "الإحصائيات",    icon: "📊" },
  { id: "services",  label: "الخدمات",       icon: "⚖️" },
  { id: "social",    label: "التواصل الاجتماعي", icon: "🌐" },
  { id: "seo",       label: "SEO",           icon: "🔍" },
  { id: "booking",   label: "نظام الحجز",    icon: "📅" },
];

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [config, setConfig] = useState<ClientConfig | null>(null);
  const [activeTab, setActiveTab] = useState("identity");
  const [saveMsg, setSaveMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase
        .from("settings")
        .select("config_data")
        .single();

      if (data?.config_data && Object.keys(data.config_data).length > 0) {
        // Merge with defaults to fill missing keys
        setConfig({
          ...defaultConfig,
          ...data.config_data,
          theme: { ...defaultConfig.theme, ...(data.config_data.theme || {}) },
          contact: { ...defaultConfig.contact, ...(data.config_data.contact || {}) },
          seo: { ...defaultConfig.seo, ...(data.config_data.seo || {}) },
          booking: { ...defaultConfig.booking, ...(data.config_data.booking || {}) },
          social: { ...defaultConfig.social, ...(data.config_data.social || {}) },
        });
      } else {
        setConfig({ ...defaultConfig });
      }
      setFetching(false);
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setLoading(true);
    setSaveMsg(null);

    const { error } = await supabase
      .from("settings")
      .update({ config_data: config, updated_at: new Date().toISOString() })
      .eq("id", "00000000-0000-0000-0000-000000000001");

    setLoading(false);
    if (error) {
      setSaveMsg({ type: "error", text: "خطأ في الحفظ: " + error.message });
    } else {
      setSaveMsg({ type: "success", text: "✅ تم حفظ جميع التغييرات بنجاح!" });
      setTimeout(() => setSaveMsg(null), 4000);
    }
  };

  // Helper to update nested objects
  const updateConfig = (path: string, value: any) => {
    if (!config) return;
    const keys = path.split(".");
    const newConfig = { ...config } as any;
    let obj = newConfig;
    for (let i = 0; i < keys.length - 1; i++) {
      obj[keys[i]] = { ...obj[keys[i]] };
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    setConfig(newConfig);
  };

  if (fetching || !config) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400, gap: "1rem" }}>
        <div className="spinner" /> <span>جاري تحميل الإعدادات...</span>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .settings-tabs {
          display: flex; gap: .5rem; overflow-x: auto; padding-bottom: .75rem;
          border-bottom: 2px solid var(--border); margin-bottom: 2rem;
          scrollbar-width: thin;
        }
        .settings-tab {
          display: flex; align-items: center; gap: .4rem;
          padding: .6rem 1rem; border-radius: 8px 8px 0 0;
          font-size: .88rem; font-weight: 600; white-space: nowrap;
          color: var(--text-secondary); cursor: pointer;
          border: 1px solid transparent; border-bottom: none;
          transition: all .2s;
        }
        .settings-tab:hover { background: rgba(26,60,94,.05); color: var(--primary); }
        .settings-tab.active {
          background: var(--surface); color: var(--primary);
          border-color: var(--border); position: relative;
        }
        .settings-tab.active::after {
          content: ""; position: absolute; bottom: -2px; left: 0; right: 0;
          height: 2px; background: var(--surface);
        }
        .tab-section { display: none; }
        .tab-section.active { display: block; }
        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
        .field-full { margin-bottom: 1rem; }
        .section-title {
          font-size: 1.1rem; font-weight: 700; color: var(--primary);
          margin-bottom: 1.25rem; padding-bottom: .75rem;
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center; gap: .5rem;
        }
        .dynamic-list { display: flex; flex-direction: column; gap: 1rem; }
        .dynamic-item {
          background: var(--bg); border: 1px solid var(--border);
          border-radius: 10px; padding: 1.25rem;
          position: relative;
        }
        .dynamic-item .remove-btn {
          position: absolute; top: .75rem; left: .75rem;
          background: #e53e3e; color: #fff; border: none; border-radius: 6px;
          width: 28px; height: 28px; cursor: pointer; font-size: .8rem;
          display: flex; align-items: center; justify-content: center;
        }
        .add-btn {
          display: flex; align-items: center; justify-content: center; gap: .5rem;
          padding: .75rem; border: 2px dashed var(--border); border-radius: 10px;
          color: var(--primary); font-weight: 600; cursor: pointer;
          transition: all .2s; background: transparent; width: 100%;
          font-size: .9rem;
        }
        .add-btn:hover { border-color: var(--primary); background: rgba(26,60,94,.03); }
        .save-bar {
          position: sticky; bottom: 0; background: var(--surface);
          border-top: 1px solid var(--border); padding: 1rem 0;
          display: flex; align-items: center; justify-content: space-between;
          gap: 1rem; z-index: 10; margin-top: 2rem;
        }
        .color-field { display: flex; align-items: center; gap: .75rem; }
        .color-field input[type="color"] {
          width: 44px; height: 36px; padding: 0; border: 2px solid var(--border);
          cursor: pointer; border-radius: 8px;
        }
        .color-field span { font-family: monospace; font-size: .85rem; direction: ltr; }
        @media (max-width: 768px) {
          .field-row { grid-template-columns: 1fr; }
          .settings-tabs { gap: .25rem; }
          .settings-tab { padding: .5rem .6rem; font-size: .78rem; }
        }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.25rem" }}>⚙️ الإعدادات الشاملة</h2>
      </div>

      {/* ─── Tabs Bar ─── */}
      <div className="settings-tabs">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`settings-tab${activeTab === t.id ? " active" : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════
           TAB 1: الهوية والعلامة
         ═══════════════════════════════════════════════════════════ */}
      <div className={`tab-section${activeTab === "identity" ? " active" : ""}`}>
        <div className="card">
          <div className="section-title">🏛️ الهوية والعلامة التجارية</div>
          <div className="field-row">
            <div className="form-group">
              <label className="form-label">اسم المحامي</label>
              <input className="form-control" value={config.lawyerName}
                onChange={e => updateConfig("lawyerName", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">اسم المكتب</label>
              <input className="form-control" value={config.officeName}
                onChange={e => updateConfig("officeName", e.target.value)} />
            </div>
          </div>
          <div className="field-full">
            <div className="form-group">
              <label className="form-label">الشعار النصي (Tagline)</label>
              <input className="form-control" value={config.tagline}
                onChange={e => updateConfig("tagline", e.target.value)} />
              <small style={{ color: "var(--text-secondary)", fontSize: ".8rem" }}>يظهر في القسم الرئيسي (Hero) للصفحة الرئيسية</small>
            </div>
          </div>
          <div className="field-row">
            <div className="form-group">
              <label className="form-label">مسار الشعار (Logo)</label>
              <input className="form-control" dir="ltr" value={config.logo}
                onChange={e => updateConfig("logo", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">صورة المشاركة (OG Image)</label>
              <input className="form-control" dir="ltr" value={config.ogImage}
                onChange={e => updateConfig("ogImage", e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
           TAB 2: الألوان والخطوط
         ═══════════════════════════════════════════════════════════ */}
      <div className={`tab-section${activeTab === "theme" ? " active" : ""}`}>
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <div className="section-title">🎨 الألوان</div>
          <div className="field-row">
            {([
              ["primaryColor", "اللون الأساسي"],
              ["primaryLight", "الأساسي الفاتح"],
              ["secondaryColor", "اللون الثانوي"],
              ["secondaryLight", "الثانوي الفاتح"],
            ] as const).map(([key, label]) => (
              <div className="form-group" key={key}>
                <label className="form-label">{label}</label>
                <div className="color-field">
                  <input type="color" value={(config.theme as any)[key]}
                    onChange={e => updateConfig(`theme.${key}`, e.target.value)} />
                  <span>{(config.theme as any)[key]}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="field-row">
            {([
              ["bgColor", "لون الخلفية"],
              ["surfaceColor", "لون السطح"],
              ["textPrimary", "لون النص الرئيسي"],
              ["textSecondary", "لون النص الثانوي"],
            ] as const).map(([key, label]) => (
              <div className="form-group" key={key}>
                <label className="form-label">{label}</label>
                <div className="color-field">
                  <input type="color" value={(config.theme as any)[key]}
                    onChange={e => updateConfig(`theme.${key}`, e.target.value)} />
                  <span>{(config.theme as any)[key]}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="field-row">
            <div className="form-group">
              <label className="form-label">لون الحدود</label>
              <div className="color-field">
                <input type="color" value={config.theme.borderColor}
                  onChange={e => updateConfig("theme.borderColor", e.target.value)} />
                <span>{config.theme.borderColor}</span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">انحناء الزوايا (Border Radius)</label>
              <input className="form-control" dir="ltr" value={config.theme.borderRadius}
                onChange={e => updateConfig("theme.borderRadius", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="section-title">✏️ الخطوط</div>
          <div className="field-row">
            <div className="form-group">
              <label className="form-label">خط العناوين</label>
              <select className="form-control" value={config.theme.fontHeading}
                onChange={e => updateConfig("theme.fontHeading", e.target.value)}>
                <option value="Amiri">Amiri (كلاسيكي)</option>
                <option value="Cairo">Cairo (عصري)</option>
                <option value="Tajawal">Tajawal</option>
                <option value="El Messiri">El Messiri</option>
                <option value="Noto Kufi Arabic">Noto Kufi Arabic</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">خط النصوص</label>
              <select className="form-control" value={config.theme.fontBody}
                onChange={e => updateConfig("theme.fontBody", e.target.value)}>
                <option value="Tajawal">Tajawal</option>
                <option value="Cairo">Cairo</option>
                <option value="Changa">Changa</option>
                <option value="IBM Plex Sans Arabic">IBM Plex Sans Arabic</option>
                <option value="Noto Sans Arabic">Noto Sans Arabic</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
           TAB 3: معلومات التواصل
         ═══════════════════════════════════════════════════════════ */}
      <div className={`tab-section${activeTab === "contact" ? " active" : ""}`}>
        <div className="card">
          <div className="section-title">📞 معلومات التواصل</div>
          <div className="field-row">
            <div className="form-group">
              <label className="form-label">رقم الهاتف (دولي)</label>
              <input className="form-control" dir="ltr" value={config.contact.phone}
                onChange={e => updateConfig("contact.phone", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">رقم العرض (محلي)</label>
              <input className="form-control" dir="ltr" value={config.contact.phoneDisplay}
                onChange={e => updateConfig("contact.phoneDisplay", e.target.value)} />
            </div>
          </div>
          <div className="field-row">
            <div className="form-group">
              <label className="form-label">البريد الإلكتروني</label>
              <input className="form-control" dir="ltr" type="email" value={config.contact.email}
                onChange={e => updateConfig("contact.email", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">الولاية</label>
              <input className="form-control" value={config.contact.wilaya}
                onChange={e => updateConfig("contact.wilaya", e.target.value)} />
            </div>
          </div>
          <div className="field-row">
            <div className="form-group">
              <label className="form-label">العنوان الكامل</label>
              <input className="form-control" value={config.contact.address}
                onChange={e => updateConfig("contact.address", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">الرمز البريدي</label>
              <input className="form-control" dir="ltr" value={config.contact.postalCode}
                onChange={e => updateConfig("contact.postalCode", e.target.value)} />
            </div>
          </div>
          <div className="field-full">
            <div className="form-group">
              <label className="form-label">رابط خرائط Google (Embed)</label>
              <textarea className="form-control" dir="ltr" style={{ minHeight: 80, fontSize: ".82rem" }}
                value={config.contact.googleMapsEmbed}
                onChange={e => updateConfig("contact.googleMapsEmbed", e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
           TAB 4: ساعات العمل
         ═══════════════════════════════════════════════════════════ */}
      <div className={`tab-section${activeTab === "hours" ? " active" : ""}`}>
        <div className="card">
          <div className="section-title">🕐 ساعات العمل</div>
          <div className="dynamic-list">
            {config.workingHours.map((wh, i) => (
              <div className="dynamic-item" key={i}>
                <button className="remove-btn" onClick={() => {
                  const arr = [...config.workingHours];
                  arr.splice(i, 1);
                  updateConfig("workingHours", arr);
                }}>✕</button>
                <div className="field-row">
                  <div className="form-group">
                    <label className="form-label">اليوم / الأيام</label>
                    <input className="form-control" value={wh.day}
                      onChange={e => {
                        const arr = [...config.workingHours];
                        arr[i] = { ...arr[i], day: e.target.value };
                        updateConfig("workingHours", arr);
                      }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">الساعات</label>
                    <input className="form-control" value={wh.hours}
                      onChange={e => {
                        const arr = [...config.workingHours];
                        arr[i] = { ...arr[i], hours: e.target.value };
                        updateConfig("workingHours", arr);
                      }} />
                  </div>
                </div>
              </div>
            ))}
            <button className="add-btn" onClick={() => {
              updateConfig("workingHours", [...config.workingHours, { day: "", hours: "" }]);
            }}>+ إضافة فترة عمل</button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
           TAB 5: إحصائيات Hero
         ═══════════════════════════════════════════════════════════ */}
      <div className={`tab-section${activeTab === "stats" ? " active" : ""}`}>
        <div className="card">
          <div className="section-title">📊 إحصائيات القسم الرئيسي (Hero)</div>
          <div className="dynamic-list">
            {config.stats.map((s, i) => (
              <div className="dynamic-item" key={i}>
                <button className="remove-btn" onClick={() => {
                  const arr = [...config.stats];
                  arr.splice(i, 1);
                  updateConfig("stats", arr);
                }}>✕</button>
                <div className="field-row">
                  <div className="form-group">
                    <label className="form-label">القيمة (مثال: 500+)</label>
                    <input className="form-control" value={s.value}
                      onChange={e => {
                        const arr = [...config.stats];
                        arr[i] = { ...arr[i], value: e.target.value };
                        updateConfig("stats", arr);
                      }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">الوصف (مثال: قضية ناجحة)</label>
                    <input className="form-control" value={s.label}
                      onChange={e => {
                        const arr = [...config.stats];
                        arr[i] = { ...arr[i], label: e.target.value };
                        updateConfig("stats", arr);
                      }} />
                  </div>
                </div>
              </div>
            ))}
            <button className="add-btn" onClick={() => {
              updateConfig("stats", [...config.stats, { value: "", label: "" }]);
            }}>+ إضافة إحصائية</button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
           TAB 6: الخدمات والتخصصات
         ═══════════════════════════════════════════════════════════ */}
      <div className={`tab-section${activeTab === "services" ? " active" : ""}`}>
        <div className="card">
          <div className="section-title">⚖️ الخدمات والتخصصات</div>
          <div className="dynamic-list">
            {config.specialties.map((sp, i) => (
              <div className="dynamic-item" key={i}>
                <button className="remove-btn" onClick={() => {
                  const arr = [...config.specialties];
                  arr.splice(i, 1);
                  updateConfig("specialties", arr);
                }}>✕</button>
                <div className="field-row">
                  <div className="form-group">
                    <label className="form-label">المعرف (ID)</label>
                    <input className="form-control" dir="ltr" value={sp.id}
                      onChange={e => {
                        const arr = [...config.specialties];
                        arr[i] = { ...arr[i], id: e.target.value };
                        updateConfig("specialties", arr);
                      }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">العنوان</label>
                    <input className="form-control" value={sp.title}
                      onChange={e => {
                        const arr = [...config.specialties];
                        arr[i] = { ...arr[i], title: e.target.value };
                        updateConfig("specialties", arr);
                      }} />
                  </div>
                </div>
                <div className="field-row">
                  <div className="form-group">
                    <label className="form-label">الأيقونة (Emoji)</label>
                    <input className="form-control" value={sp.icon}
                      onChange={e => {
                        const arr = [...config.specialties];
                        arr[i] = { ...arr[i], icon: e.target.value };
                        updateConfig("specialties", arr);
                      }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">السعر يبدأ من (دج)</label>
                    <input className="form-control" dir="ltr" type="number" value={sp.priceFrom}
                      onChange={e => {
                        const arr = [...config.specialties];
                        arr[i] = { ...arr[i], priceFrom: parseInt(e.target.value) || 0 };
                        updateConfig("specialties", arr);
                      }} />
                  </div>
                </div>
                <div className="field-full">
                  <div className="form-group">
                    <label className="form-label">الوصف</label>
                    <textarea className="form-control" style={{ minHeight: 60 }} value={sp.description}
                      onChange={e => {
                        const arr = [...config.specialties];
                        arr[i] = { ...arr[i], description: e.target.value };
                        updateConfig("specialties", arr);
                      }} />
                  </div>
                </div>
              </div>
            ))}
            <button className="add-btn" onClick={() => {
              updateConfig("specialties", [...config.specialties, {
                id: `service-${Date.now()}`, title: "", description: "", icon: "📋", priceFrom: 3000
              }]);
            }}>+ إضافة خدمة جديدة</button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
           TAB 7: وسائل التواصل الاجتماعي
         ═══════════════════════════════════════════════════════════ */}
      <div className={`tab-section${activeTab === "social" ? " active" : ""}`}>
        <div className="card">
          <div className="section-title">🌐 وسائل التواصل الاجتماعي</div>
          <div className="field-row">
            <div className="form-group">
              <label className="form-label">🔵 Facebook</label>
              <input className="form-control" dir="ltr" placeholder="https://facebook.com/..."
                value={config.social.facebook}
                onChange={e => updateConfig("social.facebook", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">🔗 LinkedIn</label>
              <input className="form-control" dir="ltr" placeholder="https://linkedin.com/in/..."
                value={config.social.linkedin}
                onChange={e => updateConfig("social.linkedin", e.target.value)} />
            </div>
          </div>
          <div className="field-row">
            <div className="form-group">
              <label className="form-label">💬 WhatsApp (رقم دولي)</label>
              <input className="form-control" dir="ltr" placeholder="+213XXXXXXXXX"
                value={config.social.whatsapp}
                onChange={e => updateConfig("social.whatsapp", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">📸 Instagram (اختياري)</label>
              <input className="form-control" dir="ltr" placeholder="https://instagram.com/..."
                value={(config.social as any).instagram || ""}
                onChange={e => updateConfig("social.instagram", e.target.value)} />
            </div>
          </div>
          <div className="field-row">
            <div className="form-group">
              <label className="form-label">🐦 Twitter / X (اختياري)</label>
              <input className="form-control" dir="ltr" placeholder="https://x.com/..."
                value={(config.social as any).twitter || ""}
                onChange={e => updateConfig("social.twitter", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">📺 YouTube (اختياري)</label>
              <input className="form-control" dir="ltr" placeholder="https://youtube.com/@..."
                value={(config.social as any).youtube || ""}
                onChange={e => updateConfig("social.youtube", e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
           TAB 8: SEO
         ═══════════════════════════════════════════════════════════ */}
      <div className={`tab-section${activeTab === "seo" ? " active" : ""}`}>
        <div className="card">
          <div className="section-title">🔍 تحسين محركات البحث (SEO)</div>
          <div className="field-full">
            <div className="form-group">
              <label className="form-label">عنوان الموقع الرئيسي (Title)</label>
              <input className="form-control" value={config.seo.defaultTitle}
                onChange={e => updateConfig("seo.defaultTitle", e.target.value)} />
            </div>
          </div>
          <div className="field-full">
            <div className="form-group">
              <label className="form-label">قالب العنوان (Title Template)</label>
              <input className="form-control" dir="ltr" value={config.seo.titleTemplate}
                onChange={e => updateConfig("seo.titleTemplate", e.target.value)} />
              <small style={{ color: "var(--text-secondary)", fontSize: ".8rem" }}>استخدم %s للعنوان الفرعي</small>
            </div>
          </div>
          <div className="field-full">
            <div className="form-group">
              <label className="form-label">وصف الموقع (Meta Description)</label>
              <textarea className="form-control" style={{ minHeight: 80 }} value={config.seo.description}
                onChange={e => updateConfig("seo.description", e.target.value)} />
            </div>
          </div>
          <div className="field-row">
            <div className="form-group">
              <label className="form-label">رابط الموقع (URL)</label>
              <input className="form-control" dir="ltr" value={config.seo.siteUrl}
                onChange={e => updateConfig("seo.siteUrl", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">اللغة والمنطقة (Locale)</label>
              <input className="form-control" dir="ltr" value={config.seo.locale}
                onChange={e => updateConfig("seo.locale", e.target.value)} />
            </div>
          </div>
          <div className="field-full">
            <div className="form-group">
              <label className="form-label">الكلمات المفتاحية (فاصل: فاصلة)</label>
              <textarea className="form-control" style={{ minHeight: 60 }}
                value={config.seo.keywords.join("، ")}
                onChange={e => updateConfig("seo.keywords", e.target.value.split("، ").map(k => k.trim()).filter(Boolean))} />
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
           TAB 9: نظام الحجز
         ═══════════════════════════════════════════════════════════ */}
      <div className={`tab-section${activeTab === "booking" ? " active" : ""}`}>
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <div className="section-title">📅 إعدادات الحجز</div>
          <div className="field-row">
            <div className="form-group">
              <label className="form-label">بداية الدوام</label>
              <input className="form-control" dir="ltr" type="time" value={config.booking.workHours.start}
                onChange={e => updateConfig("booking.workHours", { ...config.booking.workHours, start: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">نهاية الدوام</label>
              <input className="form-control" dir="ltr" type="time" value={config.booking.workHours.end}
                onChange={e => updateConfig("booking.workHours", { ...config.booking.workHours, end: e.target.value })} />
            </div>
          </div>
          <div className="field-row">
            <div className="form-group">
              <label className="form-label">مدة الموعد (دقيقة)</label>
              <input className="form-control" dir="ltr" type="number" value={config.booking.slotDurationMin}
                onChange={e => updateConfig("booking.slotDurationMin", parseInt(e.target.value) || 60)} />
            </div>
            <div className="form-group">
              <label className="form-label">أقصى مدة حجز مسبق (يوم)</label>
              <input className="form-control" dir="ltr" type="number" value={config.booking.maxAdvanceDays}
                onChange={e => updateConfig("booking.maxAdvanceDays", parseInt(e.target.value) || 30)} />
            </div>
          </div>
          <div className="field-full" style={{ marginTop: ".5rem" }}>
            <label className="form-label">أيام العمل</label>
            <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginTop: ".5rem" }}>
              {[
                { num: 0, name: "الأحد" },
                { num: 1, name: "الاثنين" },
                { num: 2, name: "الثلاثاء" },
                { num: 3, name: "الأربعاء" },
                { num: 4, name: "الخميس" },
                { num: 5, name: "الجمعة" },
                { num: 6, name: "السبت" },
              ].map(d => (
                <label key={d.num} style={{
                  display: "flex", alignItems: "center", gap: ".4rem",
                  padding: ".4rem .8rem", borderRadius: 8,
                  border: `2px solid ${config.booking.workDays.includes(d.num) ? "var(--primary)" : "var(--border)"}`,
                  background: config.booking.workDays.includes(d.num) ? "rgba(26,60,94,.08)" : "transparent",
                  cursor: "pointer", fontSize: ".88rem", fontWeight: 600,
                }}>
                  <input type="checkbox" checked={config.booking.workDays.includes(d.num)}
                    onChange={e => {
                      const days = e.target.checked
                        ? [...config.booking.workDays, d.num].sort()
                        : config.booking.workDays.filter(x => x !== d.num);
                      updateConfig("booking.workDays", days);
                    }}
                    style={{ display: "none" }} />
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
                  const arr = [...config.booking.consultationTypes];
                  arr.splice(i, 1);
                  updateConfig("booking.consultationTypes", arr);
                }}>✕</button>
                <div className="field-row" style={{ gridTemplateColumns: "1fr 1.5fr 1fr" }}>
                  <div className="form-group">
                    <label className="form-label">المعرف</label>
                    <input className="form-control" dir="ltr" value={ct.id}
                      onChange={e => {
                        const arr = [...config.booking.consultationTypes];
                        arr[i] = { ...arr[i], id: e.target.value };
                        updateConfig("booking.consultationTypes", arr);
                      }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">الاسم</label>
                    <input className="form-control" value={ct.label}
                      onChange={e => {
                        const arr = [...config.booking.consultationTypes];
                        arr[i] = { ...arr[i], label: e.target.value };
                        updateConfig("booking.consultationTypes", arr);
                      }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">السعر (دج)</label>
                    <input className="form-control" dir="ltr" type="number" value={ct.price}
                      onChange={e => {
                        const arr = [...config.booking.consultationTypes];
                        arr[i] = { ...arr[i], price: parseInt(e.target.value) || 0 };
                        updateConfig("booking.consultationTypes", arr);
                      }} />
                  </div>
                </div>
              </div>
            ))}
            <button className="add-btn" onClick={() => {
              updateConfig("booking.consultationTypes", [
                ...config.booking.consultationTypes,
                { id: `type-${Date.now()}`, label: "", price: 3000 }
              ]);
            }}>+ إضافة نوع استشارة</button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
           SAVE BAR
         ═══════════════════════════════════════════════════════════ */}
      <div className="save-bar">
        {saveMsg && (
          <div className={`alert ${saveMsg.type === "success" ? "alert-success" : "alert-error"}`}
            style={{ margin: 0, flex: 1 }}>
            {saveMsg.text}
          </div>
        )}
        {!saveMsg && <div />}
        <button className="btn btn-primary" onClick={handleSave} disabled={loading}
          style={{ minWidth: 180, fontSize: "1rem", padding: ".75rem 2rem" }}>
          {loading ? "⏳ جاري الحفظ..." : "💾 حفظ جميع التغييرات"}
        </button>
      </div>
    </>
  );
}
