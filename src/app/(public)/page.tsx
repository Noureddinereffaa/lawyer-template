import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// Always fetch fresh — no static caching for CMS-driven content
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSettings();
  return {
    title: config.seo.defaultTitle,
    description: config.seo.description,
  };
}

export default async function HomePage() {
  const config = await getSettings();
  const supabase = await createServerSupabaseClient();
  
  // Fetch latest 3 published articles
  const { data: latestArticles } = await supabase
    .from("articles")
    .select("title, slug, excerpt, category, cover_image, published_at, created_at")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(3);
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="hero animate-fade-in" style={{ padding: "clamp(6rem, 15vh, 10rem) 0 clamp(4rem, 10vh, 8rem)" }}>
        <div className="container">
          <div className="hero-badge animate-slide-up" style={{ animationDelay: "0.2s" }}>⚖️ مكتب محاماة معتمد في الجزائر</div>
          <h1 className="animate-slide-up" style={{ animationDelay: "0.4s", fontSize: "clamp(2rem, 8vw, 4rem)" }}>
            {config.hero.title || config.tagline}
          </h1>
          <p className="animate-slide-up" style={{ animationDelay: "0.6s", fontSize: "1.25rem", opacity: 0.9 }}>
            {config.hero.description}
          </p>
          <div className="hero-actions animate-slide-up" style={{ animationDelay: "0.8s" }}>
            <Link href="/booking" className="btn btn-secondary btn-lg">📅 احجز استشارة الآن</Link>
            <Link href="/services" className="btn btn-outline btn-lg" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.3)", backdropFilter: "blur(5px)" }}>
              اكتشف خدماتنا
            </Link>
          </div>
          <div className="hero-stats animate-slide-up" style={{ animationDelay: "1s" }}>
            {config.stats.map((s, i) => (
              <div key={i} className="hover-lift">
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
            {config.trustBar.map((t, i) => (
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
          <div className="grid-3 animate-slide-up" style={{ animationDelay: "0.5s" }}>
            {config.specialties.map((s) => (
              <div key={s.id} className="card service-card glass">
                <div className="service-icon">{s.icon}</div>
                <h3 style={{ fontSize: "1.3rem", fontWeight: 700 }}>{s.title}</h3>
                <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)" }}>{s.description}</p>
                <div className="service-price" style={{ fontSize: "1.1rem", color: "var(--primary)", marginTop: "1.5rem" }}>
                  يبدأ من <span style={{ color: "var(--secondary)", fontWeight: 800 }}>{s.priceFrom.toLocaleString("ar-DZ")} دج</span>
                </div>
                <Link href="/booking" className="btn btn-primary btn-sm btn-full" style={{ marginTop: "1.5rem" }}>
                  احجز استشارة الآن
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
                {config.about.description}
              </p>
              <ul style={{ display: "flex", flexDirection: "column", gap: ".7rem", marginBottom: "2rem" }}>
                {config.about.features.map((f, i) => (
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
            {config.testimonials.map((t, i) => (
              <div key={i} className="card testimonial-card glass animate-slide-up" style={{ animationDelay: `${0.2 * i}s` }}>
                <div className="quote-mark">"</div>
                <div className="testimonial-stars">{"★".repeat(t.stars)}</div>
                <p className="testimonial-text" style={{ fontSize: "1.05rem", minHeight: "80px" }}>{t.text}</p>
                <div className="testimonial-author" style={{ borderTop: "1px solid rgba(0,0,0,0.05)", paddingTop: "1.25rem", marginTop: "1rem" }}>
                  <div className="testimonial-avatar" style={{ boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>{t.name[0]}</div>
                  <div>
                    <div className="testimonial-name" style={{ color: "var(--primary)" }}>{t.name}</div>
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
          
          {!latestArticles || latestArticles.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
              لا توجد مقالات منشورة حالياً.
            </div>
          ) : (
            <div className="grid-3">
              {latestArticles.map((a, i) => {
                const date = new Date(a.published_at || a.created_at).toLocaleDateString("ar-DZ");
                return (
                  <div key={a.slug} className="card blog-card glass animate-slide-up" style={{ animationDelay: `${0.2 * i}s` }}>
                    <div className="blog-card-image" style={{ borderRadius: "12px 12px 0 0" }}>
                      {a.cover_image ? (
                        <img src={a.cover_image} alt={a.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "3rem", background: "rgba(26,60,94,0.05)" }}>📄</div>
                      )}
                    </div>
                    <div className="blog-card-body">
                      <div className="blog-card-meta">
                        <span className="tag" style={{ background: "var(--primary)", color: "#fff" }}>{a.category || "عام"}</span>
                        <span>{date}</span>
                      </div>
                      <h3 style={{ fontSize: "1.25rem" }}><Link href={`/blog/${a.slug}`}>{a.title}</Link></h3>
                      <p className="blog-card-excerpt" style={{ opacity: 0.8 }}>{a.excerpt}</p>
                      <Link href={`/blog/${a.slug}`} className="read-more" style={{ fontWeight: 800 }}>اقرأ المزيد ←</Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
            <Link href="/blog" className="btn btn-outline">عرض جميع المقالات</Link>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────── */}
      <section className="cta-banner" style={{ padding: "7rem 0" }}>
        <div className="container">
          <h2 style={{ fontSize: "2.5rem", marginBottom: "1.5rem" }}>هل تحتاج إلى استشارة قانونية؟</h2>
          <p style={{ fontSize: "1.2rem", opacity: 0.9, marginBottom: "3rem" }}>لا تتردد — احجز موعدك الآن وسنتواصل معك خلال 24 ساعة للتأكيد.</p>
          <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/booking" className="btn btn-secondary btn-lg" style={{ padding: "1.2rem 3rem" }}>📅 احجز الآن — مجاناً</Link>
            <a href={`tel:${config.contact.phone}`} className="btn btn-outline btn-lg" style={{ color: "#fff", borderColor: "rgba(255,255,255,.3)", backdropFilter: "blur(5px)" }}>
              📞 {config.contact.phoneDisplay}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
