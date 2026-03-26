import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSettings();
  return {
    title: config.seo.defaultTitle,
    description: config.seo.description,
  };
}

// ── Static Testimonials ─────────────────────────────────────────
const testimonials = [
  { name: "أحمد بلقاسم", role: "عميل، قانون الأسرة", text: "خدمة احترافية جداً، المحامي شرح لي كل خطوة بوضوح وكسبنا القضية. أنصح به بكل ثقة.", stars: 5 },
  { name: "فاطمة مهداوي", role: "عميلة، قانون العقارات", text: "تعاملت معه في قضية تسجيل عقار معقدة وحُلّت بسرعة مذهلة. شكراً جزيلاً.", stars: 5 },
  { name: "كريم بوزيد", role: "صاحب شركة، قانون تجاري", text: "مكّنني من حل نزاع تجاري كان يهدد شركتي. اتفاق عادل وسرعة في الإنجاز.", stars: 5 },
];

const articles = [
  { slug: "divorce-law-algeria", title: "حقوق المرأة في الطلاق وفق القانون الجزائري", date: "15 مارس 2026", category: "قانون الأسرة", excerpt: "استعراض شامل لحقوق المرأة في طلب الطلاق، الحضانة، والنفقة وفق أحكام قانون الأسرة الجزائري المعدّل." },
  { slug: "company-registration", title: "كيف تؤسس شركتك في الجزائر؟ دليل خطوة بخطوة", date: "8 مارس 2026", category: "قانون تجاري", excerpt: "دليل قانوني عملي يشرح إجراءات تسجيل الشركات ذات المسؤولية المحدودة (SARL) من الفكرة حتى الرخصة." },
  { slug: "real-estate-disputes", title: "النزاعات العقارية الأكثر شيوعاً وكيفية تجنبها", date: "1 مارس 2026", category: "قانون العقارات", excerpt: "تعرّف على أبرز مشكلات العقارات في الجزائر وكيف يحميك المحامي من الوقوع فيها مسبقاً." },
];

export default async function HomePage() {
  const config = await getSettings();
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="hero">
        <div className="container">
          <div className="hero-badge">⚖️ مكتب محاماة معتمد في الجزائر</div>
          <h1>{config.tagline}</h1>
          <p>
            نقدم استشارات قانونية احترافية في مجالات الأسرة، التجارة، العقارات والقضايا الجنائية.
            فريقنا يضمن لك الحماية القانونية الكاملة بخبرة تمتد لأكثر من 15 سنة.
          </p>
          <div className="hero-actions">
            <Link href="/booking" className="btn btn-secondary btn-lg">📅 احجز استشارة الآن</Link>
            <Link href="/services" className="btn btn-outline btn-lg" style={{ color: "#fff", borderColor: "rgba(255,255,255,.5)" }}>
              اكتشف خدماتنا
            </Link>
          </div>
          <div className="hero-stats">
            {config.stats.map((s, i) => (
              <div key={i}>
                <div className="hero-stat-value">{s.value}</div>
                <div className="hero-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust Bar ────────────────────────────────────────── */}
      <div className="trust-bar">
        <div className="container">
          <div className="trust-bar-inner">
            {["✅ محامٍ معتمد لدى المجلس الأعلى للقضاء", "🔒 سرية تامة", "⚡ رد خلال 24 ساعة", "📍 الجزائر العاصمة"].map((t, i) => (
              <div key={i} className="trust-item">{t}</div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Services ─────────────────────────────────────────── */}
      <section className="section" style={{ background: "var(--bg)" }}>
        <div className="container">
          <div className="section-header">
            <span className="badge">⚖️ تخصصاتنا</span>
            <h2>مجالات الخبرة القانونية</h2>
            <p>نقدم خدمات قانونية متخصصة في أبرز مجالات القانون الجزائري.</p>
            <div className="divider" />
          </div>
          <div className="grid-3">
            {config.specialties.map((s) => (
              <div key={s.id} className="card service-card">
                <div className="service-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.description}</p>
                <div className="service-price">يبدأ من {s.priceFrom.toLocaleString("ar-DZ")} دج</div>
                <Link href="/booking" className="btn btn-outline btn-sm" style={{ marginTop: "1.25rem", display: "inline-flex" }}>
                  احجز استشارة
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About Snippet ────────────────────────────────────── */}
      <section className="section" style={{ background: "var(--surface)" }}>
        <div className="container">
          <div className="grid-2" style={{ gap: "4rem", alignItems: "center" }}>
            <div>
              <span className="badge">🎓 من نحن</span>
              <h2 style={{ marginTop: ".75rem" }}>{config.lawyerName}</h2>
              <p style={{ marginTop: "1rem", marginBottom: "1.5rem" }}>
                محامٍ معتمد لدى المحاكم الجزائرية بخبرة تمتد لـ 15 عاماً في مجالات القانون التجاري،
                الأسرة، والعقارات. نلتزم بالشفافية التامة والدفاع الكامل عن حقوق موكلينا.
              </p>
              <ul style={{ display: "flex", flexDirection: "column", gap: ".7rem", marginBottom: "2rem" }}>
                {["عضو نقابة المحامين الجزائريين", "دكتوراه في القانون الخاص – جامعة الجزائر 1", "أكثر من 500 قضية مُنجزة بنجاح", "لغات العمل: العربية، الفرنسية"].map((f, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: ".6rem", color: "var(--text-secondary)" }}>
                    <span style={{ color: "var(--secondary)", fontWeight: 700 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/about" className="btn btn-primary">اقرأ المزيد عنا</Link>
            </div>
            <div style={{
              borderRadius: "20px",
              background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)",
              aspectRatio: "4/5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "8rem",
              color: "rgba(255,255,255,.3)",
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", color: "#fff" }}>
                <div style={{ fontSize: "5rem" }}>⚖️</div>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.3rem", fontWeight: 700, marginTop: "1rem" }}>{config.lawyerName}</div>
                <div style={{ fontSize: ".9rem", color: "rgba(255,255,255,.7)", marginTop: ".3rem" }}>محامٍ معتمد</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────── */}
      <section className="section" style={{ background: "var(--bg)" }}>
        <div className="container">
          <div className="section-header">
            <span className="badge">💬 آراء العملاء</span>
            <h2>ماذا يقول موكلونا؟</h2>
            <div className="divider" />
          </div>
          <div className="grid-3">
            {testimonials.map((t, i) => (
              <div key={i} className="card testimonial-card">
                <div className="quote-mark">"</div>
                <div className="testimonial-stars">{"★".repeat(t.stars)}</div>
                <p className="testimonial-text">{t.text}</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.name[0]}</div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-label">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Latest Articles ──────────────────────────────────── */}
      <section className="section" style={{ background: "var(--surface)" }}>
        <div className="container">
          <div className="section-header">
            <span className="badge">📰 المدونة</span>
            <h2>آخر المقالات القانونية</h2>
            <div className="divider" />
          </div>
          <div className="grid-3">
            {articles.map((a) => (
              <div key={a.slug} className="card blog-card">
                <div className="blog-card-image">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "3rem" }}>📄</div>
                </div>
                <div className="blog-card-body">
                  <div className="blog-card-meta">
                    <span className="tag">{a.category}</span>
                    <span>{a.date}</span>
                  </div>
                  <h3><Link href={`/blog/${a.slug}`}>{a.title}</Link></h3>
                  <p className="blog-card-excerpt">{a.excerpt}</p>
                  <Link href={`/blog/${a.slug}`} className="read-more">اقرأ المزيد →</Link>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
            <Link href="/blog" className="btn btn-outline">عرض جميع المقالات</Link>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────── */}
      <section className="cta-banner">
        <div className="container">
          <h2>هل تحتاج إلى استشارة قانونية؟</h2>
          <p>لا تتردد — احجز موعدك الآن وسنتواصل معك خلال 24 ساعة للتأكيد.</p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/booking" className="btn btn-secondary btn-lg">📅 احجز الآن — مجاناً</Link>
            <a href={`tel:${config.contact.phone}`} className="btn btn-outline btn-lg" style={{ color: "#fff", borderColor: "rgba(255,255,255,.4)" }}>
              📞 {config.contact.phoneDisplay}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
