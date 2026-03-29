"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import "./showcase.css";

const WHATSAPP_URL =
  "https://wa.me/213557585066?text=" +
  encodeURIComponent(
    "مرحباً، أريد الحصول على النسخة التجريبية المجانية من المنصة القانونية واكتشاف مميزاتها."
  );

// ───── What You Get: 6 modules ─────────────────────────────────────────────
const modules = [
  {
    icon: "📊",
    title: "لوحة تحكم مركزية",
    desc: "نظرة شاملة على المكتب في صفحة واحدة: مذكرات، مواعيد، مقالات، ونسبة الإنجاز.",
    color: "#1a3c5e",
    demo: "/admin",
  },
  {
    icon: "📅",
    title: "نظام الحجز الذكي",
    desc: "حجز حضوري + حجز أونلاين. تقويم تفاعلي، تأكيد تلقائي، وأوقات عمل قابلة للضبط.",
    color: "#c9a84c",
    demo: "/booking",
  },
  {
    icon: "📨",
    title: "إدارة المذكرات والرسائل",
    desc: "نظام تذاكر احترافي مع محادثات حية، أرشفة، بحث فوري، ومرفقات قانونية.",
    color: "#5a67d8",
    demo: "/admin/messages",
  },
  {
    icon: "🔒",
    title: "بوابة الموكل الرقمية",
    desc: "كل موكل يتابع قضيته عبر كود سري خاص. راحة بال له، وتنظيم لك.",
    color: "#2f855a",
    demo: "/track",
  },
  {
    icon: "📝",
    title: "محرك المدونة القانونية",
    desc: "أنشئ مقالات قانونية تجذب الموكلين من Google. SEO متكامل وصور احترافية.",
    color: "#e53e3e",
    demo: "/blog",
  },
  {
    icon: "⚙️",
    title: "إعدادات تحكم كاملة",
    desc: "11 تبويب للتحكم في كل شيء: الألوان، الهوية، الخدمات، الحجز، SEO والمحتوى.",
    color: "#702459",
    demo: "/admin/settings",
  },
];

// ───── Detailed features per module ────────────────────────────────────────
const features = [
  {
    tag: "القيادة والتحكم",
    title: "لوحة القيادة المركزية",
    subtitle: "مكتبك بأكمله في نظرة واحدة",
    desc: "نظام إداري ذكي يُجمع كل بياناتك في مكان واحد. احصل على إحصائيات حية للمذكرات والمواعيد والمحتوى، مع خلاصة آخر التحركات ومعدلات الأداء اليومية.",
    bullets: [
      "4 بطاقات KPI: مذكرات، مواعيد، مقالات، إنجاز",
      "خلاصة نشاط حي تتحدث تلقائياً",
      "رسوم بيانية لنسب الإشغال والاستجابة",
      "وصول سريع للوحدات الحرجة بنقرة واحدة",
    ],
    image: "/showcase/mock_dashboard.png",
    demo: "/admin",
    demoLabel: "تجرب لوحة الإحصائيات 📊",
    flip: false,
  },
  {
    tag: "أقل احتكاك أكثر موكلين",
    title: "نظام الحجز الذكي",
    subtitle: "حضوري + أونلاين، كل شيء مؤتمت",
    desc: "اجعل الحجز أسهل من أي شيء. يختار الموكل نوع الاستشارة، يحدد التاريخ والوقت من تقويم حي يعكس توفرك الفعلي، ويستلم تأكيداً فورياً. لا مكالمات، لا فوضى.",
    bullets: [
      "تقويم تفاعلي بأوقات متاحة فعلية",
      "6 أنواع استشارات قانونية قابلة للتعديل",
      "تأكيد آلي بالسعر والتفاصيل",
      "ضبط أيام وساعات العمل من الإعدادات",
    ],
    image: "/showcase/mock_booking.png",
    demo: "/booking",
    demoLabel: "جرب نظام الحجز 📅",
    flip: true,
  },
  {
    tag: "تنظيم بلا حدود",
    title: "إدارة المذكرات والتواصل",
    subtitle: "نهاية فوضى الواتساب والرسائل المتناثرة",
    desc: "كل رسالة من موكل تتحول إلى 'تذكرة' منظمة ومؤرخة. ردّ، أرشف، أو أغلق بنقرة. بحث فوري، فلترة متقدمة، وكل شيء محفوظ للرجوع إليه قانونياً.",
    bullets: [
      "نظام تبويبات: نشطة / مؤرشفة / مغلقة",
      "محادثة حية مع دعم المرفقات (PDF، صور)",
      "بحث فوري في كامل سجل المراسلات",
      "حذف، أرشفة، أو رد جماعي بضغطة واحدة",
    ],
    image: "/showcase/mock_inbox.png",
    demo: "/admin/messages",
    demoLabel: "استكشف المذكرات 📨",
    flip: false,
  },
  {
    tag: "تجربة موكل متميزة",
    title: "بوابة الموكل الرقمية",
    subtitle: "موكلك يتابع قضيته، أنت تركّز على العمل",
    desc: "بعد إرسال طلبه، يستلم كل موكل كود متابعة فريد. يتسجل في البوابة ويتابع حالة القضية والردود لحظة بلحظة، بدون مكالمات لا داعي لها.",
    bullets: [
      "بوابة متابعة آمنة بكود + إيميل",
      "واجهة محادثة (Chat UI) احترافية",
      "حالة الطلب محدثة تلقائياً",
      "مرفقات وردود من الطرفين",
    ],
    image: "/showcase/mock_portal.png",
    demo: "/track",
    demoLabel: "جرب البوابة 🔒",
    flip: true,
  },
  {
    tag: "تسويق ذكي",
    title: "إعدادات التحكم الكامل",
    subtitle: "11 تبويب للإدارة الشاملة دون لمس كود",
    desc: "غيّر ألوان الموقع، شعاره، نصوصه، خدماته، أسعاره، وساعات العمل — كل ذلك من لوحة تحكم بسيطة. لا حاجة لمطور ولا برمجة.",
    bullets: [
      "الهوية: الاسم، الشعار، التاغلاين",
      "التصميم: ألوان، خطوط، cornerRadius",
      "الحجز: أيام، ساعات، أسعار الاستشارة",
      "SEO: العنوان، الوصف، الـ Keywords",
    ],
    image: "/showcase/mock_settings.png",
    demo: "/admin/settings",
    demoLabel: "استكشف الإعدادات ⚙️",
    flip: false,
  },
];

// ───── FAQ ──────────────────────────────────────────────────────────────────
const faqs = [
  {
    q: "من يمكنه استخدام هذه المنصة؟",
    a: "أي محامٍ معتمد أو مكتب محاماة في الجزائر. المنصة مصممة خصيصاً للسوق الجزائري مع دعم كامل للغة العربية والولايات.",
  },
  {
    q: "هل يحتاج تشغيل المنصة خبرة تقنية؟",
    a: "لا على الإطلاق. كل شيء يُدار من لوحة تحكم بسيطة. نقوم نحن بعملية الإعداد الأولية وتسليمك النظام جاهزاً.",
  },
  {
    q: "كيف يعمل نظام الحجز الأونلاين؟",
    a: "الموكل يختار نوع الاستشارة والوقت المناسب من تقويم حي. يستلم تأكيداً أوتوماتيكياً. أنت تتحكم في الأيام والساعات المتاحة.",
  },
  {
    q: "هل البيانات محمية وآمنة؟",
    a: "نعم. المنصة مبنية على Supabase (قاعدة بيانات عالمية مشفرة) مع HTTPS وصلاحيات متدرجة. بياناتك لن تصل لأي طرف ثالث.",
  },
  {
    q: "ماذا يحدث لو أردت تعديل الموقع لاحقاً؟",
    a: "كل شيء قابل للتعديل من لوحة التحكم. إذا احتجت تطوير إضافي، فريقنا متاح بأسعار تنافسية.",
  },
];

// ───── Component ─────────────────────────────────────────────────────────────
export default function ShowcasePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="showcase-container animate-fade-in" dir="rtl">

      {/* ══════════════════════════════════════════════════════
          HERO — المشكلة + الحل + خطوة أولى
      ══════════════════════════════════════════════════════ */}
      <section className="sc-hero">
        <div className="container" style={{ maxWidth: 1200 }}>
          <div className="sc-badge animate-showcase-slide-up">🇩🇿 حل جزائري 100% • مُصمَّم للمحامي الجزائري</div>

          <h1 className="sc-hero-title animate-showcase-slide-up" style={{ animationDelay: "0.1s" }}>
            مكتبك القانوني الرقمي<br />
            <span className="sc-gradient-text">جاهز لك اليوم.</span>
          </h1>

          <p className="sc-hero-subtitle animate-showcase-slide-up" style={{ animationDelay: "0.2s" }}>
            منصة SaaS متكاملة للمحامين الجزائريين — لوحة تحكم ذكية، حجز مواعيد أونلاين، إدارة موكلين احترافية، ومدونة قانونية تجلب الموكلين. كل ذلك بدون خبرة تقنية.
          </p>

          <div className="sc-hero-ctas animate-showcase-slide-up" style={{ animationDelay: "0.3s" }}>
            <a href={WHATSAPP_URL} className="btn btn-primary btn-lg sc-cta-primary hover-lift">
              📲 ابدأ تجربتك المجانية الآن
            </a>
            <a href="#features" className="btn btn-outline btn-lg hover-lift sc-cta-outline">
              استكشف المنصة ↓
            </a>
          </div>

          {/* Browser Mockup Hero */}
          <div className="sc-browser-mockup animate-showcase-slide-up" style={{ animationDelay: "0.5s" }}>
            <div className="sc-browser-bar">
              <div className="sc-browser-dots">
                <span style={{ background: "#ff5f57" }}></span>
                <span style={{ background: "#febc2e" }}></span>
                <span style={{ background: "#28c840" }}></span>
              </div>
              <div className="sc-browser-url">localhost:3000/admin</div>
            </div>
            <img
              src="/showcase/mock_dashboard.png"
              alt="منصة إدارة المكاتب القانونية"
              style={{ width: "100%", display: "block", borderRadius: "0 0 16px 16px" }}
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          STATS BAR — أرقام لا تكذب
      ══════════════════════════════════════════════════════ */}
      <section className="sc-stats-bar">
        <div className="container" style={{ maxWidth: 1100 }}>
          <div className="sc-stats-grid">
            {[
              { n: "6", label: "وحدات وظيفية متكاملة" },
              { n: "11", label: "تبويب إعدادات للتحكم" },
              { n: "100%", label: "متوافق مع الجوال" },
              { n: "∞", label: "موكل وحجز وتذكرة" },
            ].map((s, i) => (
              <div key={i} className="sc-stat-item">
                <div className="sc-stat-num">{s.n}</div>
                <div className="sc-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          WHAT YOU GET — 6 modules grid
      ══════════════════════════════════════════════════════ */}
      <section id="features" className="sc-section sc-light" style={{ paddingTop: "8rem", paddingBottom: "8rem" }}>
        <div className="container" style={{ maxWidth: 1200 }}>
          <div className="sc-section-header">
            <div className="sc-badge">🎁 ما ستحصل عليه</div>
            <h2 className="sc-section-title">منصة متكاملة بـ 6 وحدات رئيسية</h2>
            <p className="sc-section-sub">كل وحدة مصممة لتحل مشكلة حقيقية في حياة المحامي الجزائري</p>
          </div>

          <div className="sc-modules-grid">
            {modules.map((m, i) => (
              <div key={i} className="sc-module-card hover-lift">
                <div className="sc-module-icon" style={{ background: m.color + "15", color: m.color }}>
                  {m.icon}
                </div>
                <h3 className="sc-module-title">{m.title}</h3>
                <p className="sc-module-desc">{m.desc}</p>
                <Link href={m.demo} className="sc-module-link" style={{ color: m.color }}>
                  جرب الآن ←
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FEATURE DEEP DIVE — 5 detailed features with mockups
      ══════════════════════════════════════════════════════ */}
      <section className="sc-section" style={{ paddingTop: "6rem", paddingBottom: "2rem" }}>
        <div className="container" style={{ maxWidth: 1300 }}>
          <div className="sc-section-header" style={{ marginBottom: "6rem" }}>
            <div className="sc-badge">🖥️ عرض المنصة تفصيلاً</div>
            <h2 className="sc-section-title">كل وحدة بلقطاتها الحقيقية</h2>
            <p className="sc-section-sub">شاهد كيف تبدو المنصة من الداخل وجرّبها مباشرة</p>
          </div>

          {features.map((feat, i) => (
            <div
              key={i}
              className="sc-feature-row"
              style={{ flexDirection: feat.flip ? "row-reverse" : "row" }}
            >
              {/* Text Side */}
              <div className="sc-feature-text">
                <span className="sc-feature-tag">{feat.tag}</span>
                <h3 className="sc-feature-title">{feat.title}</h3>
                <p className="sc-feature-subtitle">{feat.subtitle}</p>
                <p className="sc-feature-desc">{feat.desc}</p>
                <ul className="sc-bullets">
                  {feat.bullets.map((b, bi) => (
                    <li key={bi}>
                      <span className="sc-bullet-icon">✓</span> {b}
                    </li>
                  ))}
                </ul>
                <Link href={feat.demo} className="btn btn-primary hover-lift sc-demo-btn">
                  {feat.demoLabel}
                </Link>
              </div>

              {/* Image Side */}
              <div className="sc-feature-image-wrap">
                <div className="sc-image-glow" />
                <div className="sc-mini-browser">
                  <div className="sc-mini-bar">
                    <div className="sc-browser-dots">
                      <span style={{ background: "#ff5f57" }}></span>
                      <span style={{ background: "#febc2e" }}></span>
                      <span style={{ background: "#28c840" }}></span>
                    </div>
                  </div>
                  <img
                    src={feat.image}
                    alt={feat.title}
                    className="hover-lift"
                    style={{ width: "100%", display: "block" }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          WORKFLOW — كيف يعمل؟
      ══════════════════════════════════════════════════════ */}
      <section className="sc-section sc-dark" style={{ padding: "10rem 1.5rem" }}>
        <div className="container" style={{ maxWidth: 1100, textAlign: "center" }}>
          <div className="sc-badge sc-badge-light">⚡ سير العمل</div>
          <h2 style={{ color: "#fff", fontSize: "2.8rem", fontWeight: 900, marginBottom: "1rem", marginTop: "1rem" }}>
            من طلب الموكل إلى حل القضية
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "1.15rem", marginBottom: "5rem" }}>
            4 خطوات بسيطة تضمن عمل مكتبك باحترافية تامة
          </p>

          <div className="sc-workflow-grid">
            {[
              { n: "01", t: "الموكل يتقدم", d: "يملأ نموذج الاستشارة أو يحجز موعداً مباشرةً من الموقع بثلاث نقرات." },
              { n: "02", t: "تنبيه فوري لك", d: "تصلك إشعار لحظي ويظهر الطلب في لوحة التحكم الخاصة بك فوراً." },
              { n: "03", t: "ردّ وإدارة الملف", d: "تردّ على الموكل، تؤكد الموعد، وترفق المستندات بضغطة واحدة." },
              { n: "04", t: "الموكل يتابع لحظياً", d: "عبر بوابته الخاصة يرى مستجدات القضية دون الحاجة للاتصال." },
            ].map((s, i) => (
              <div key={i} className="sc-workflow-step hover-lift">
                <div className="sc-step-num">{s.n}</div>
                <h4 style={{ color: "#fff", fontSize: "1.2rem", margin: "1.5rem 0 0.75rem" }}>{s.t}</h4>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.95rem", lineHeight: 1.7 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SOCIAL PROOF — شهادات محامين
      ══════════════════════════════════════════════════════ */}
      <section className="sc-section sc-light" style={{ padding: "10rem 1.5rem" }}>
        <div className="container" style={{ maxWidth: 1100 }}>
          <div className="sc-section-header">
            <div className="sc-badge">💬 آراء المحامين</div>
            <h2 className="sc-section-title">محامون يثقون في المنصة</h2>
          </div>
          <div className="sc-testimonials-grid">
            {[
              {
                name: "الأستاذة سهيلة بن عمر",
                role: "محامية — الجزائر العاصمة",
                text: "قبل المنصة كنت أضيع ساعتين يومياً في تنظيم المراسلات. الآن كل شيء مرتب ويُرد عليه في دقائق. الموكلون لاحظوا الفرق فوراً.",
                stars: 5,
              },
              {
                name: "الأستاذ رياض قاسمي",
                role: "محامي تجاري — وهران",
                text: "نظام الحجز الأونلاين وفّر عليّ 30% من وقتي. الموكلون يحجزون بأنفسهم وأنا أتلقى تأكيداً تلقائياً. مريح جداً.",
                stars: 5,
              },
              {
                name: "الأستاذ كمال سعيد",
                role: "محامي أسرة — قسنطينة",
                text: "أكثر ما أعجبني هو بوابة الموكل. أصبح موكليّ يتابعون أنفسهم بدلاً من الاتصال كل يوم. هذا وفّر عليّ وقتاً ثميناً جداً.",
                stars: 5,
              },
            ].map((t, i) => (
              <div key={i} className="sc-testimonial-card hover-lift">
                <div className="sc-stars">{"★".repeat(t.stars)}</div>
                <p className="sc-testimonial-text">"{t.text}"</p>
                <div className="sc-testimonial-author">
                  <div className="sc-author-avatar">{t.name[0]}</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>{t.name}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FAQ — الأسئلة الشائعة
      ══════════════════════════════════════════════════════ */}
      <section className="sc-section" style={{ padding: "8rem 1.5rem" }}>
        <div className="container" style={{ maxWidth: 860 }}>
          <div className="sc-section-header">
            <div className="sc-badge">❓ استفسارات شائعة</div>
            <h2 className="sc-section-title">أسئلة المحامين</h2>
          </div>

          <div className="sc-faq-list">
            {faqs.map((faq, i) => (
              <div key={i} className={`sc-faq-item ${openFaq === i ? "open" : ""}`}>
                <button
                  className="sc-faq-question"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span>{faq.q}</span>
                  <span className="sc-faq-icon">{openFaq === i ? "−" : "+"}</span>
                </button>
                {openFaq === i && (
                  <div className="sc-faq-answer">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════════════════ */}
      <section className="sc-section sc-cta-section">
        <div className="container" style={{ maxWidth: 900, textAlign: "center" }}>
          <div className="sc-cta-glow" />
          <h2 className="sc-cta-title">ابدأ تحويل مكتبك رقمياً اليوم</h2>
          <p className="sc-cta-sub">
            جرّب المنصة مجاناً. تواصل معنا عبر واتساب وسنُعدّ لك نسخة تجريبية كاملة خلال 24 ساعة.
          </p>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
            <a
              href={WHATSAPP_URL}
              className="btn btn-primary btn-lg hover-lift"
              style={{ minWidth: "340px", height: "70px", fontSize: "1.3rem", borderRadius: "50px" }}
            >
              📲 ابدأ تجربتك المجانية 🚀
            </a>
            <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.7)" }}>
              واتساب مباشر:{" "}
              <b dir="ltr" style={{ color: "#c9a84c" }}>+213 557 58 50 66</b>
            </p>
            <div className="sc-trust-row">
              {["✅ إعداد كامل", "🔒 بيانات آمنة", "📱 متوافق مع الجوال", "🇩🇿 حل جزائري"].map((t, i) => (
                <span key={i} className="sc-trust-badge">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="sc-footer">
        <div className="container">
          <div className="sc-footer-links">
            <Link href="/">الرئيسية</Link>
            <Link href="/booking">حجز موعد</Link>
            <Link href="/blog">المدونة</Link>
            <Link href="/admin">لوحة التحكم</Link>
            <Link href="/track">متابعة التذكرة</Link>
          </div>
          <p className="sc-footer-copy">
            © {new Date().getFullYear()} منصة المكاتب القانونية الجزائرية — مصممة للمحامي الجزائري الحديث.
          </p>
        </div>
      </footer>
    </div>
  );
}
