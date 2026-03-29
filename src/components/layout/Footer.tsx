import Link from "next/link";
import { ClientConfig } from "../../../config/client.config";

interface FooterProps {
  config: ClientConfig;
}

export default function Footer({ config }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="animate-fade-in" style={{
      background: "linear-gradient(180deg, #0d2340 0%, #071321 100%)",
      color: "rgba(255,255,255,.7)",
      padding: "5rem 0 0",
      borderTop: "1px solid rgba(255,255,255,0.05)"
    }}>
      <div className="container">
        <div className="footer-grid">
          <style>{`
            .footer-grid {
              display: grid;
              grid-template-columns: 1.5fr 0.8fr 0.8fr 1.2fr;
              gap: 4rem;
              padding-bottom: 4rem;
            }
            @media (max-width: 1024px) {
              .footer-grid { grid-template-columns: 1fr 1fr; gap: 3rem; }
            }
            @media (max-width: 640px) {
              .footer-grid { grid-template-columns: 1fr; gap: 2.5rem; }
            }
            .footer-heading {
              color: #fff;
              font-family: var(--font-heading);
              margin-bottom: 1.5rem;
              font-size: 1.2rem;
              font-weight: 700;
              position: relative;
              padding-bottom: 0.75rem;
            }
            .footer-heading::after {
              content: '';
              position: absolute;
              bottom: 0; right: 0;
              width: 30px; height: 2px;
              background: var(--secondary);
            }
          `}</style>

          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: ".75rem", marginBottom: "1.25rem" }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: "linear-gradient(135deg, var(--secondary), var(--secondary-light))",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem"
              }}>⚖️</div>
              <div>
                <div style={{ color: "#fff", fontFamily: "var(--font-heading)", fontSize: "1.1rem", fontWeight: 700 }}>
                  {config.officeName}
                </div>
                <div style={{ fontSize: ".78rem", color: "rgba(255,255,255,.5)" }}>{config.lawyerName}</div>
              </div>
            </div>
            <p style={{ fontSize: ".9rem", lineHeight: 1.8, marginBottom: "1.25rem" }}>
              {config.seo.description}
            </p>
            <div style={{ display: "flex", gap: ".75rem" }}>
              {config.social.facebook && (
                <a href={config.social.facebook} target="_blank" rel="noopener noreferrer"
                  style={socialBtn}>f</a>
              )}
              {config.social.linkedin && (
                <a href={config.social.linkedin} target="_blank" rel="noopener noreferrer"
                  style={socialBtn}>in</a>
              )}
              {config.social.whatsapp && (
                <a href={`https://wa.me/${config.social.whatsapp}`} target="_blank" rel="noopener noreferrer"
                  style={{ ...socialBtn, background: "#25d366" }}>WA</a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="footer-heading">روابط سريعة</h4>
            {[
              { href: "/",         label: "الرئيسية" },
              { href: "/about",    label: "من نحن" },
              { href: "/services", label: "خدماتنا" },
              { href: "/blog",     label: "المدونة" },
              { href: "/booking",  label: "حجز موعد" },
              { href: "/contact",  label: "اتصل بنا" },
              { href: "/showcase", label: "المشروع للمحامين 🚀" },
            ].map((l) => (
              <Link key={l.href} href={l.href} style={footerLink}>
                ← {l.label}
              </Link>
            ))}
          </div>

          {/* Services */}
          <div>
            <h4 className="footer-heading">تخصصاتنا</h4>
            {config.specialties.slice(0, 6).map((s) => (
              <Link key={s.id} href="/services" style={footerLink}>
                ← {s.title}
              </Link>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 className="footer-heading">معلومات التواصل</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: ".85rem" }}>
              <div style={contactItem}>
                <span style={contactIcon}>📍</span>
                <span>{config.contact.address}</span>
              </div>
              <div style={contactItem}>
                <span style={contactIcon}>📞</span>
                <a href={`tel:${config.contact.phone}`} style={{ color: "var(--secondary)", fontWeight: 700 }}>
                  {config.contact.phoneDisplay}
                </a>
              </div>
              <div style={contactItem}>
                <span style={contactIcon}>✉️</span>
                <a href={`mailto:${config.contact.email}`} style={{ color: "rgba(255,255,255,.7)" }}>
                  {config.contact.email}
                </a>
              </div>
              <div style={{ marginTop: ".5rem" }}>
                <div style={{ color: "#fff", fontWeight: 600, marginBottom: ".5rem", fontSize: ".9rem" }}>ساعات العمل</div>
                {config.workingHours.map((w, i) => (
                  <div key={i} style={{ fontSize: ".85rem", marginBottom: ".35rem" }}>
                    <span style={{ color: "rgba(255,255,255,.5)" }}>{w.day}:</span>
                    {" "}<span style={{ color: w.hours === "مغلق" ? "#fc8181" : "var(--secondary)" }}>{w.hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,.08)",
        padding: "1.25rem 0",
        textAlign: "center",
        fontSize: ".85rem",
        color: "rgba(255,255,255,.4)",
      }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: ".5rem" }}>
          <span>© {year} {config.officeName} — جميع الحقوق محفوظة</span>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <Link href="/privacy" style={{ color: "rgba(255,255,255,.4)", fontSize: ".82rem" }}>سياسة الخصوصية</Link>
            <Link href="/terms"   style={{ color: "rgba(255,255,255,.4)", fontSize: ".82rem" }}>شروط الاستخدام</Link>
            <Link href="/legal"   style={{ color: "rgba(255,255,255,.4)", fontSize: ".82rem" }}>الإشعارات القانونية</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

const socialBtn: React.CSSProperties = {
  width: 36, height: 36, borderRadius: 8,
  background: "rgba(255,255,255,.1)",
  display: "flex", alignItems: "center", justifyContent: "center",
  fontSize: ".85rem", fontWeight: 700, color: "#fff",
  transition: "background .2s",
};
const footerLink: React.CSSProperties = {
  display: "inline-block",
  color: "rgba(255,255,255,.65)",
  fontSize: ".9rem",
  marginBottom: ".25rem",
  padding: "0.4rem 0",
  transition: "color .2s",
};
const contactItem: React.CSSProperties = {
  display: "flex", alignItems: "flex-start", gap: ".6rem", fontSize: ".9rem",
};
const contactIcon: React.CSSProperties = {
  flexShrink: 0, fontSize: "1rem", marginTop: ".05rem",
};
