import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Metadata } from "next";

export const revalidate = 60; // Revalidate every minute

interface Params {
  params: { slug: string };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("articles")
    .select("title, excerpt, cover_image")
    .eq("slug", params.slug)
    .single();

  if (!data) return { title: "مقال غير موجود" };

  return {
    title: data.title,
    description: data.excerpt,
    openGraph: {
      title: data.title,
      description: data.excerpt || undefined,
      images: data.cover_image ? [{ url: data.cover_image }] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: Params) {
  const supabase = await createServerSupabaseClient();
  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", params.slug)
    .eq("published", true)
    .single();

  if (!article) {
    notFound();
  }

  const date = new Date(article.published_at || article.created_at).toLocaleDateString("ar-DZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <article className="container" style={{ paddingTop: "6rem", paddingBottom: "4rem", maxWidth: 800 }}>
        
        <div style={{ marginBottom: "2rem", textAlign: "center" }}>
          <Link href="/blog" style={{ display: "inline-flex", alignItems: "center", gap: ".5rem", color: "var(--text-secondary)", textDecoration: "none", marginBottom: "1.5rem", fontSize: ".9rem", fontWeight: 600 }}>
            <span>←</span> العودة للمدونة
          </Link>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
            <span className="badge">{article.category || "عام"}</span>
            <span style={{ color: "var(--text-secondary)", fontSize: ".9rem" }}>📅 {date}</span>
          </div>
          <h1 style={{ fontSize: "2.5rem", color: "var(--primary)", lineHeight: 1.4, marginBottom: "1.5rem" }}>
            {article.title}
          </h1>
          {article.excerpt && (
            <p style={{ fontSize: "1.2rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              {article.excerpt}
            </p>
          )}
        </div>

        {article.cover_image && (
          <div style={{ width: "100%", aspectRatio: "16/9", borderRadius: 16, overflow: "hidden", marginBottom: "3rem", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}>
            <img src={article.cover_image} alt={article.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}

        <div className="article-content" style={{ fontSize: "1.1rem", lineHeight: 1.8, color: "var(--text)" }}>
          {article.content.split('\n').map((paragraph: string, i: number) => {
            if (!paragraph.trim()) return <br key={i} />;
            if (paragraph.startsWith('## ')) return <h2 key={i} style={{ marginTop: "2rem", marginBottom: "1rem", color: "var(--primary)" }}>{paragraph.replace('## ', '')}</h2>;
            if (paragraph.startsWith('### ')) return <h3 key={i} style={{ marginTop: "1.5rem", marginBottom: ".5rem", color: "var(--primary)" }}>{paragraph.replace('### ', '')}</h3>;
            if (paragraph.startsWith('- ')) return <li key={i} style={{ marginLeft: "1.5rem", marginBottom: ".5rem" }}>{paragraph.replace('- ', '')}</li>;
            
            return <p key={i} style={{ marginBottom: "1.25rem" }} dangerouslySetInnerHTML={{ __html: paragraph }} />;
          })}
        </div>

        <div className="divider" style={{ margin: "4rem 0 2rem" }} />
        
        <div style={{ background: "var(--surface)", padding: "2rem", borderRadius: 16, textAlign: "center" }}>
          <h3 style={{ marginBottom: "1rem", fontSize: "1.5rem", color: "var(--primary)" }}>هل تبحث عن استشارة قانونية؟</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>نحن هنا لحماية حقوقك ومساعدتك في جميع خطواتك القانونية.</p>
          <Link href="/booking" className="btn btn-primary btn-lg">احجز استشارة مع المحامي</Link>
        </div>

      </article>
    </>
  );
}
