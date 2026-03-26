import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/settings";
import ContactForm from "@/components/forms/ContactForm";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSettings();
  return {
    title: "اتصل بنا",
    description: `تواصل مع مكتب ${config.officeName} — ${config.lawyerName} في خدمتكم.`,
  };
}

export default async function ContactPage() {
  const config = await getSettings();

  return (
    <>
      <div style={{ paddingTop: "80px" }} />
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">الرئيسية</Link> / <span>اتصل بنا</span>
          </div>
          <h1>تواصل مع المكتب</h1>
          <p>نحن هنا للرد على استفساراتك القانونية وتقديم الدعم اللازم</p>
        </div>
      </section>

      <section className="section" style={{ background: "var(--bg)" }}>
        <div className="container">
          <div className="grid-2" style={{ gap: "3rem" }}>
            
            {/* Contact Form Component */}
            <ContactForm config={config} />

            {/* Contact Info & Map */}
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              <div className="card" style={{ padding: "2rem" }}>
                <h3 style={{ marginBottom: "1.5rem", fontSize: "1.25rem" }}>معلومات المكتب</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                    <div style={{ fontSize: "1.5rem", width: 40, height: 40, background: "rgba(26,60,94,.1)", color: "var(--primary)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>📍</div>
                    <div>
                      <div style={{ fontWeight: 700 }}>العنوان</div>
                      <div style={{ color: "var(--text-secondary)", fontSize: ".95rem", marginTop: ".2rem" }}>{config.contact.address}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                    <div style={{ fontSize: "1.5rem", width: 40, height: 40, background: "rgba(26,60,94,.1)", color: "var(--primary)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>📞</div>
                    <div>
                      <div style={{ fontWeight: 700 }}>الهاتف</div>
                      <a href={`tel:${config.contact.phone}`} dir="ltr" style={{ color: "var(--text-secondary)", fontSize: ".95rem", marginTop: ".2rem", display: "inline-block" }}>{config.contact.phoneDisplay}</a>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                    <div style={{ fontSize: "1.5rem", width: 40, height: 40, background: "rgba(26,60,94,.1)", color: "var(--primary)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>✉️</div>
                    <div>
                      <div style={{ fontWeight: 700 }}>البريد الإلكتروني</div>
                      <a href={`mailto:${config.contact.email}`} style={{ color: "var(--text-secondary)", fontSize: ".95rem", marginTop: ".2rem", display: "inline-block" }}>{config.contact.email}</a>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                    <div style={{ fontSize: "1.5rem", width: 40, height: 40, background: "rgba(26,60,94,.1)", color: "var(--primary)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>🕐</div>
                    <div>
                      <div style={{ fontWeight: 700 }}>ساعات العمل</div>
                      <div style={{ color: "var(--text-secondary)", fontSize: ".95rem", marginTop: ".2rem" }}>
                        {config.workingHours.map((w, i) => (
                          <div key={i}>{w.day}: {w.hours}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={{ borderRadius: "calc(var(--radius) * 1.5)", overflow: "hidden", height: 300, border: "1px solid var(--border)" }}>
                <iframe 
                  src={config.contact.googleMapsEmbed} 
                  width="100%" height="100%" style={{ border: 0 }} 
                  allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                  title="موقع المكتب على الخريطة"
                ></iframe>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
