import { getSettings } from "@/lib/settings";
import type { Metadata } from "next";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSettings();
  return {
    title: `الإشعارات القانونية | ${config.officeName}`,
    description: "البيانات القانونية والاعتمادات المهنية للمكتب.",
  };
}

export default async function LegalPage() {
  const config = await getSettings();

  return (
    <div style={{ padding: "4rem 0", background: "var(--bg)", minHeight: "80vh" }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <div style={{ background: "var(--surface)", padding: "3rem", borderRadius: "12px", boxShadow: "var(--shadow-sm)" }}>
          <h1 style={{ fontSize: "2rem", color: "var(--primary)", marginBottom: "1.5rem", borderBottom: "2px solid var(--border)", paddingBottom: "1rem" }}>
            الإشعارات القانونية (Mentions Légales)
          </h1>
          
          <div className="prose" style={{ lineHeight: 1.8, color: "var(--text-secondary)" }}>
            <p>
              وفقاً للنصوص التشريعية والتنظيمية في الجزائر، خاصة القوانين المتعلقة بتنظيم مهنة المحاماة والخدمات الرقمية، نورد أدناه البيانات القانونية الخاصة بهذا الموقع:
            </p>

            <ul style={{ listStyle: "none", padding: 0, marginTop: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <li style={{ background: "rgba(26,60,94,.03)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border)" }}>
                <strong style={{ color: "var(--primary)", display: "block" }}>الناشر (المسؤول عن الموقع):</strong>
                {config.officeName} - بإشراف الأستاذ(ة) {config.lawyerName}
              </li>
              
              <li style={{ background: "rgba(26,60,94,.03)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border)" }}>
                <strong style={{ color: "var(--primary)", display: "block" }}>الاعتماد والتسجيل:</strong>
                محامي معتمد لدى المجالس القضائية والمحكمة العليا - منظمة المحامين.
              </li>

              <li style={{ background: "rgba(26,60,94,.03)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border)" }}>
                <strong style={{ color: "var(--primary)", display: "block" }}>المقر الرئيسي والعنوان:</strong>
                {config.contact.address}، {config.contact.wilaya}، الجزائر.
              </li>

              <li style={{ background: "rgba(26,60,94,.03)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border)" }}>
                <strong style={{ color: "var(--primary)", display: "block" }}>الوضع الضريبي (Régime Fiscal):</strong>
                خاضع للأحكام القانونية الجاري بها العمل، الرسوم على القيمة المضافة غير مطبقة (TVA non applicable - Art 293B CGI / أو وفق قانون المقاول الذاتي).
              </li>

              <li style={{ background: "rgba(26,60,94,.03)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border)" }}>
                <strong style={{ color: "var(--primary)", display: "block" }}>الاستضافة (Hébergement):</strong>
                Vercel Inc. (توفير البنية التحتية التكنولوجية الآمنة وفق معايير التشفير العالمية HTTPS).
              </li>
            </ul>

            <h3 style={{ color: "var(--primary)", marginTop: "2.5rem", marginBottom: "1rem" }}>بيان الامتثال المهني</h3>
            <p>
              يلتزم هذا الموقع والقائمين عليه التزاماً تاماً بلائحة وآداب مهنة المحاماة المعمول بها في الجزائر، مع الحفاظ على السر المهني وعدم تضارب المصالح وتقديم خدمات حقيقية وشفافة للعملاء.
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}
