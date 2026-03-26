import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSettings();
  return {
    title: "من نحن",
    description: `تعرّف على ${config.lawyerName} وفريق ${config.officeName} — خبرة قانونية وشغف حقيقي بالعدالة.`,
  };
}

const credentials = [
  { icon: "🎓", title: "دكتوراه في القانون الخاص", sub: "جامعة الجزائر 1، 2008" },
  { icon: "📜", title: "عضو نقابة المحامين الجزائريين", sub: "رقم التسجيل: 00000/DZ" },
  { icon: "⚖️", title: "محامٍ لدى محكمة الاستئناف", sub: "معتمد لدى المحاكم الجزائرية كافة" },
  { icon: "🏆", title: "جائزة التميز القانوني", sub: "الجمعية الجزائرية للمحامين، 2019" },
];

const values = [
  { icon: "🔒", title: "السرية", desc: "نلتزم بالسرية التامة لجميع معلومات موكلينا." },
  { icon: "⚡", title: "السرعة", desc: "نسعى لإنهاء قضاياكم في أقصر وقت ممكن." },
  { icon: "🤝", title: "الشفافية", desc: "نبلغكم بكل مستجدات قضيتكم دون إخفاء." },
  { icon: "🎯", title: "النتائج", desc: "نركز على تحقيق أفضل نتيجة ممكنة لكل موكل." },
];

export default async function AboutPage() {
  const config = await getSettings();
  return (
    <>
      <div style={{ paddingTop: "80px" }} />
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">الرئيسية</Link> / <span>من نحن</span>
          </div>
          <h1>من نحن</h1>
          <p>فريق من المحامين المتخصصين في خدمتكم</p>
        </div>
      </section>

      {/* ── Profile ──────────────────────────────────────────── */}
      <section className="section" style={{ background: "var(--surface)" }}>
        <div className="container">
          <div className="grid-2" style={{ alignItems: "center", gap: "4rem" }}>
            <div style={{
              borderRadius: "20px",
              background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
              aspectRatio: "1",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              color: "#fff",
            }}>
              <div style={{ fontSize: "5rem" }}>👤</div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem", fontWeight: 700, marginTop: "1rem" }}>{config.lawyerName}</div>
              <div style={{ fontSize: ".9rem", color: "rgba(255,255,255,.7)", marginTop: ".4rem" }}>محامٍ معتمد | الجزائر</div>
              <div style={{ marginTop: "1.5rem", display: "flex", gap: ".75rem" }}>
                {["15+ سنة خبرة", "500+ قضية", "300+ عميل"].map((b, i) => (
                  <span key={i} style={{
                    background: "rgba(255,255,255,.15)", padding: ".3rem .75rem",
                    borderRadius: 50, fontSize: ".78rem", fontWeight: 600,
                  }}>{b}</span>
                ))}
              </div>
            </div>
            <div>
              <span className="badge">🏛️ السيرة المهنية</span>
              <h2 style={{ marginTop: "1rem" }}>{config.lawyerName}</h2>
              <p style={{ marginTop: "1rem", marginBottom: "1.25rem" }}>
                محامٍ جزائري معتمد بخبرة تتجاوز 15 عاماً في مجالات القانون التجاري، الأسرة، العقارات، والقانون الجنائي.
                أسّست المكتب عام 2010 بهدف تقديم خدمة قانونية راقية وشفافة لجميع المواطنين الجزائريين.
              </p>
              <p style={{ marginBottom: "1.5rem" }}>
                حصلت على الدكتوراه في القانون الخاص من جامعة الجزائر 1، وعملت في كبرى مكاتب المحاماة قبل تأسيس مكتبي المستقل.
                أؤمن بأن كل مواطن يستحق دفاعاً قانونياً قوياً وعادلاً، بغض النظر عن تعقيد قضيته.
              </p>
              <div className="grid-2" style={{ gap: "1rem", marginBottom: "2rem" }}>
                {credentials.map((c, i) => (
                  <div key={i} className="card" style={{ padding: "1.25rem" }}>
                    <div style={{ fontSize: "1.5rem", marginBottom: ".5rem" }}>{c.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: ".95rem", color: "var(--text-primary)" }}>{c.title}</div>
                    <div style={{ fontSize: ".82rem", color: "var(--text-secondary)", marginTop: ".25rem" }}>{c.sub}</div>
                  </div>
                ))}
              </div>
              <Link href="/booking" className="btn btn-primary btn-lg">📅 احجز استشارة معي</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ───────────────────────────────────────────── */}
      <section className="section" style={{ background: "var(--bg)" }}>
        <div className="container">
          <div className="section-header">
            <span className="badge">💡 قيمنا</span>
            <h2>ما يميزنا</h2>
            <div className="divider" />
          </div>
          <div className="grid-4">
            {values.map((v, i) => (
              <div key={i} className="card" style={{ textAlign: "center" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{v.icon}</div>
                <h3 style={{ fontSize: "1.15rem", marginBottom: ".5rem" }}>{v.title}</h3>
                <p style={{ fontSize: ".9rem" }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-banner">
        <div className="container">
          <h2>جاهز للتحدث معنا؟</h2>
          <p>احجز استشارتك القانونية الأولى الآن ودعنا نساعدك.</p>
          <Link href="/booking" className="btn btn-secondary btn-lg">📅 احجز موعد</Link>
        </div>
      </section>
    </>
  );
}
