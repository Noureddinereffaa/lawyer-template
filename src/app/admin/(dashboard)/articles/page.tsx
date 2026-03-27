"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: string | null;
  cover_image: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
};

// Create a single client instance outside the component
const supabase = createClient();

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Article> | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ type: string; text: string } | null>(null);
  const hasLoaded = useRef(false);


  const loadArticles = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("articles").select("*").order("created_at", { ascending: false });
    if (data) setArticles(data as Article[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      loadArticles();
    }
  }, [loadArticles]);

  const slugify = (text: string) => {
    return text.toString().toLowerCase().trim()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-');        // Replace multiple - with single -
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing?.title || !editing?.content) return;
    setSaving(true);
    setMsg(null);

    const isNew = !editing.id;
    const payload = {
      title: editing.title,
      slug: editing.slug || slugify(editing.title || ""),
      excerpt: editing.excerpt,
      content: editing.content,
      category: editing.category,
      cover_image: editing.cover_image,
      published: editing.published || false,
      published_at: editing.published ? (editing.published_at || new Date().toISOString()) : null,
      updated_at: new Date().toISOString()
    };

    let res;
    if (isNew) {
      res = await supabase.from("articles").insert([payload]).select();
    } else {
      res = await supabase.from("articles").update(payload).eq("id", editing.id).select();
    }

    setSaving(false);
    if (res.error) {
      setMsg({ type: "error", text: res.error.message });
    } else {
      setMsg({ type: "success", text: isNew ? "تم نشر المقال بنجاح!" : "تم تحديث المقال بنجاح!" });
      setEditing(null);
      loadArticles();
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("هل أنت متأكد أنك تريد حذف هذا المقال نهائياً؟")) return;
    await supabase.from("articles").delete().eq("id", id);
    loadArticles();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    
    // Upload to 'articles' bucket
    const { data: uploadData, error } = await supabase.storage
      .from('articles')
      .upload(fileName, file, { cacheControl: "3600", upsert: true });

    setUploading(false);

    if (error) {
      setMsg({ type: "error", text: "فشل رفع الصورة: " + error.message });
    } else if (uploadData) {
      const { data: { publicUrl } } = supabase.storage.from('articles').getPublicUrl(uploadData.path);
      setEditing({ ...editing, cover_image: publicUrl });
    }
  };

  // ─── Render Form View ───
  if (editing) {
    return (
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.25rem", color: "var(--primary)" }}>
            {editing.id ? "✏️ تعديل المقال" : "📝 كتابة مقال جديد"}
          </h2>
          <button className="btn btn-outline" onClick={() => setEditing(null)}>← إلغاء والعودة</button>
        </div>

        {msg && <div className={`alert alert-${msg.type}`} style={{ marginBottom: "1.5rem" }}>{msg.text}</div>}

        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">عنوان المقال *</label>
              <input required className="form-control" value={editing.title || ""} 
                onChange={e => setEditing({ ...editing, title: e.target.value, slug: editing.id ? editing.slug : slugify(e.target.value) })} />
            </div>
            <div className="form-group">
              <label className="form-label">الرابط المخصص (Slug) *</label>
              <input required className="form-control" dir="ltr" value={editing.slug || ""} 
                onChange={e => setEditing({ ...editing, slug: e.target.value })} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">التصنيف</label>
              <input className="form-control" placeholder="مثال: قانون تجاري" value={editing.category || ""} 
                onChange={e => setEditing({ ...editing, category: e.target.value })} />
            </div>
            
            <div className="form-group">
              <label className="form-label">صورة الغلاف (مستطيلة)</label>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                {editing.cover_image && (
                  <img src={editing.cover_image} alt="Cover" style={{ width: 60, height: 40, objectFit: "cover", borderRadius: 4 }} />
                )}
                <label className="btn btn-outline" style={{ cursor: "pointer", padding: ".4rem .8rem", fontSize: ".85rem" }}>
                  {uploading ? "⏳ جاري الرفع..." : "📁 رفع صورة"}
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
                </label>
                <input type="text" className="form-control" dir="ltr" placeholder="أو ضع رابط مباشر للصورة" 
                  value={editing.cover_image || ""} onChange={e => setEditing({...editing, cover_image: e.target.value})} 
                  style={{ flex: 1, fontSize: ".85rem" }} />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">ملخص قصير (Excerpt)</label>
            <textarea className="form-control" rows={2} value={editing.excerpt || ""} 
              onChange={e => setEditing({ ...editing, excerpt: e.target.value })} />
          </div>

          <div className="form-group">
            <label className="form-label">المحتوى الكامل للمقال * (يدعم Markdown)</label>
            <textarea required className="form-control" rows={12} style={{ fontFamily: "monospace" }}
              value={editing.content || ""} 
              onChange={e => setEditing({ ...editing, content: e.target.value })} 
              placeholder="# عنوان فرعي&#10;اكتب فقرتك هنا..." />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: ".5rem", padding: "1rem", background: "var(--bg)", borderRadius: 8 }}>
            <input type="checkbox" id="published" checked={editing.published || false} 
              onChange={e => setEditing({...editing, published: e.target.checked})} 
              style={{ width: 20, height: 20 }} />
            <label htmlFor="published" style={{ fontWeight: 600, cursor: "pointer" }}>نشر المقال (متاح للعامة)</label>
          </div>

          <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: "1rem", fontSize: "1.1rem", marginTop: "1rem" }}>
            {saving ? "⏳ جاري الحفظ..." : "💾 حفظ المقال"}
          </button>
        </form>
      </div>
    );
  }

  // ─── Render List View ───
  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.25rem", color: "var(--primary)" }}>📰 إدارة المقالات والمدونة</h2>
        <button className="btn btn-primary" onClick={() => setEditing({ published: true })}>+ كتابة مقال جديد</button>
      </div>

      {msg && <div className={`alert alert-${msg.type}`} style={{ marginBottom: "1rem" }}>{msg.text}</div>}

      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>جاري تحميل المقالات...</div>
      ) : articles.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", background: "var(--bg)", borderRadius: 12 }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✍️</div>
          <h3>لا توجد مقالات حتى الآن!</h3>
          <p style={{ color: "var(--text-secondary)", marginTop: ".5rem" }}>انقر على زر "كتابة مقال جديد" للبدء في النشر.</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr style={{ background: "rgba(26,60,94,.05)", borderBottom: "2px solid var(--border)", textAlign: "right" }}>
                <th style={{ padding: "1rem" }}>المقال</th>
                <th style={{ padding: "1rem" }}>التصنيف</th>
                <th style={{ padding: "1rem" }}>الحالة</th>
                <th style={{ padding: "1rem" }}>التاريخ</th>
                <th style={{ padding: "1rem" }}>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {articles.map(article => (
                <tr key={article.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "1rem" }}>
                    <div style={{ fontWeight: 600, color: "var(--primary)" }}>{article.title}</div>
                    <div style={{ fontSize: ".8rem", color: "var(--text-secondary)", marginTop: ".25rem", direction: "ltr", textAlign: "right" }}>/{article.slug}</div>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span className="badge">{article.category || "عام"}</span>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    {article.published ? (
                      <span style={{ color: "#38a169", fontWeight: 600, fontSize: ".85rem" }}>✅ منشور</span>
                    ) : (
                      <span style={{ color: "#718096", fontWeight: 600, fontSize: ".85rem" }}>👀 مسودة</span>
                    )}
                  </td>
                  <td style={{ padding: "1rem", fontSize: ".85rem" }}>
                    {new Date(article.created_at).toLocaleDateString("ar-DZ")}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <div style={{ display: "flex", gap: ".5rem" }}>
                      <button className="btn btn-outline" style={{ padding: ".3rem .6rem", fontSize: ".8rem" }}
                        onClick={() => setEditing(article)}>
                        ✏️ تعديل
                      </button>
                      <button className="btn btn-outline" style={{ padding: ".3rem .6rem", fontSize: ".8rem", color: "#e53e3e", borderColor: "#fec1c1" }}
                        onClick={() => handleDelete(article.id)}>
                        🗑️ حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
