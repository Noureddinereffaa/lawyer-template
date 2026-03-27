import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/settings";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSettings();
  return {
    title: "الخدمات والتصنيفات",
    description: "تعرف على مجالات خبرتنا والخدمات القانونية التي نقدمها.",
  };
}

export default async function ServicesPage() {
  const config = await getSettings();
  return (
    <>
      <div style={{ paddingTop: "80px" }} />
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">الرئيسية</Link> / <span>الخدمات</span>
          </div>
          <h1>الخدمات والتصنيفات</h1>
          <p>خبرة واسعة في مختلف فروع القانون لضمان حقوقك</p>
        </div>
      </section>

      <section className="section" style={{ background: "var(--bg)" }}>
        <div className="container">
          <div className="grid-3">
            {config.specialties.map((s) => (
              <div key={s.id} className="card service-card">
                <div className="service-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.description}</p>
                <div className="service-price">يبدأ من {s.priceFrom.toLocaleString("ar-DZ")} دج</div>
                <Link href={`/booking?type=${s.id}`} className="btn btn-outline btn-sm" style={{ marginTop: "1.25rem", display: "inline-flex" }}>
                  احجز استشارة ({s.title})
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-banner">
        <div className="container">
          <h2>لم تجد الخدمة المطلوبة؟</h2>
          <p>اتصل بنا لمناقشة التفاصيل الخاصة بقضيتك.</p>
          <Link href="/contact" className="btn btn-secondary btn-lg">📞 اتصل بنا</Link>
        </div>
      </section>
    </>
  );
}
