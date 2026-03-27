import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const revalidate = 60; // Revalidate every minute

export default async function BlogIndexPage() {
  const supabase = await createServerSupabaseClient();
  const { data: articles } = await supabase
    .from("articles")
    .select("title, slug, excerpt, category, cover_image, published_at, created_at")
    .eq("published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="container" style={{ paddingTop: "6rem", paddingBottom: "4rem" }}>
      <div className="section-header" style={{ marginBottom: "3rem" }}>
        <span className="badge">📰 مقالات قانونية</span>
        <h1 style={{ fontSize: "2.5rem", color: "var(--primary)", marginTop: "1rem" }}>المدونة القانونية</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
          شروحات قانونية، نصائح، وأدلة مبسطة لمعرفة حقوقك وواجباتك.
        </p>
        <div className="divider" style={{ margin: "1.5rem auto 0" }} />
      </div>

      {!articles || articles.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", background: "var(--surface)", borderRadius: 16 }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
          <h3 style={{ color: "var(--text)" }}>لا توجد مقالات حالياً</h3>
          <p style={{ color: "var(--text-secondary)" }}>سنقوم بنشر مقالات مفيدة قريباً، يرجى العودة لاحقاً.</p>
        </div>
      ) : (
        <div className="grid-3">
          {articles.map((article) => {
            const date = new Date(article.published_at || article.created_at).toLocaleDateString("ar-DZ", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });

            return (
              <Link href={`/blog/${article.slug}`} key={article.slug} className="card" style={{ textDecoration: "none", display: "flex", flexDirection: "column", padding: 0, overflow: "hidden", transition: "all .3s" }}>
                {article.cover_image ? (
                  <div style={{ width: "100%", height: 200, backgroundImage: `url(${article.cover_image})`, backgroundSize: "cover", backgroundPosition: "center" }} />
                ) : (
                  <div style={{ width: "100%", height: 200, background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem" }}>
                    ⚖️
                  </div>
                )}
                <div style={{ padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <span className="badge" style={{ margin: 0, fontSize: ".75rem", padding: ".25rem .75rem" }}>
                      {article.category || "عام"}
                    </span>
                    <span style={{ fontSize: ".85rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: ".4rem" }}>
                      📅 {date}
                    </span>
                  </div>
                  <h3 style={{ fontSize: "1.25rem", color: "var(--primary)", marginBottom: ".75rem", lineHeight: 1.4 }}>
                    {article.title}
                  </h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: ".95rem", lineHeight: 1.6, marginBottom: "1.5rem", flex: 1 }}>
                    {article.excerpt || "انقر لقراءة المزيد حول هذا الموضوع الأساسي والمهم في القانون الجزائري..."}
                  </p>
                  <div style={{ color: "var(--secondary)", fontWeight: 700, fontSize: ".95rem", display: "flex", alignItems: "center", gap: ".5rem", marginTop: "auto" }}>
                    اقرأ المقال ←
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
