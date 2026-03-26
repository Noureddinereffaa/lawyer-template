import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSettings();
  return {
    title: "المدونة القانونية",
    description: config.seo.description,
  };
}

const dummyArticles = [
  { slug: "divorce-law-algeria", title: "حقوق المرأة في الطلاق وفق القانون الجزائري", date: "15 مارس 2026", category: "قانون الأسرة", excerpt: "استعراض شامل لحقوق المرأة في طلب الطلاق، الحضانة، والنفقة وفق أحكام قانون الأسرة الجزائري المعدّل." },
  { slug: "company-registration", title: "كيف تؤسس شركتك في الجزائر؟ دليل خطوة بخطوة", date: "8 مارس 2026", category: "قانون تجاري", excerpt: "دليل قانوني عملي يشرح إجراءات تسجيل الشركات ذات المسؤولية المحدودة (SARL) من الفكرة حتى الرخصة." },
  { slug: "real-estate-disputes", title: "النزاعات العقارية الأكثر شيوعاً وكيفية تجنبها", date: "1 مارس 2026", category: "قانون العقارات", excerpt: "تعرّف على أبرز مشكلات العقارات في الجزائر وكيف يحميك المحامي من الوقوع فيها مسبقاً." },
  { slug: "labor-law-rights", title: "حقوق العامل عند الفصل التعسفي", date: "20 فيفري 2026", category: "قانون العمل", excerpt: "ماذا تفعل إذا تعرضت لتسريح تعسفي من عملك؟ الإجراءات القانونية لحماية حقوقك ومستحقاتك." },
  { slug: "criminal-record-algeria", title: "كيفية استخراج صحيفة السوابق العدلية (رقم 3)", date: "10 فيفري 2026", category: "إجراءات قانونية", excerpt: "خطوات استخراج الكاسزي جوديسيار عن طريق الإنترنت أو عبر التقرب من المحكمة ومراكز البريد." },
  { slug: "electronic-signature", title: "حجية التوقيع الإلكتروني في التشريع الجزائري", date: "2 جانفي 2026", category: "قانون تجاري", excerpt: "مدى الاعتراف القانوني بالتوقيع الإلكتروني في العقود والتعاملات التجارية الإلكترونية." }
];

export default async function BlogPage() {
  const config = await getSettings();
  return (
    <>
      <div style={{ paddingTop: "80px" }} />
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">الرئيسية</Link> / <span>المدونة</span>
          </div>
          <h1>المدونة القانونية</h1>
          <p>أحدث المقالات، التحليلات، والإرشادات لفهم حقوقك وواجباتك القانونية</p>
        </div>
      </section>

      <section className="section" style={{ background: "var(--bg)" }}>
        <div className="container">
          <div className="grid-3">
            {dummyArticles.map((a) => (
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
        </div>
      </section>
    </>
  );
}
