"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";

export default function BlogAdminPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Basic Add/Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: "", title: "", slug: "", excerpt: "", content: "", category: "", published: true });

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    const { data } = await supabase.from("articles").select("*").order("created_at", { ascending: false });
    if (data) setArticles(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id) {
      // Update
      await supabase.from("articles").update(formData).eq("id", formData.id);
    } else {
      // Insert
      const { id, ...newArticle } = formData;
      await supabase.from("articles").insert([newArticle]);
    }
    setIsEditing(false);
    fetchArticles();
  };

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد من الحذف؟")) {
      await supabase.from("articles").delete().eq("id", id);
      fetchArticles();
    }
  };

  if (isEditing) {
    return (
      <div className="card">
        <h3 style={{ marginBottom: "1.5rem" }}>{formData.id ? "تعديل المقال" : "مقال جديد"}</h3>
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="form-group">
             <label className="form-label">عنوان المقال</label>
             <input type="text" className="form-control" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>
          <div className="form-group">
             <label className="form-label">الرابط اللطيف (Slug) - إنجليزي بدون فراغات</label>
             <input type="text" className="form-control" required dir="ltr" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
          </div>
          <div className="form-group">
             <label className="form-label">مقتطف قصير</label>
             <textarea className="form-control" rows={2} required value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} />
          </div>
          <div className="form-group">
             <label className="form-label">المحتوى</label>
             <textarea className="form-control" rows={6} required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} />
          </div>
          <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
             <input type="checkbox" id="published" checked={formData.published} onChange={e => setFormData({...formData, published: e.target.checked})} />
             <label htmlFor="published" style={{ margin: 0 }}>نشر المقال للعموم</label>
          </div>
          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            <button type="submit" className="btn btn-primary">حفظ المقال</button>
            <button type="button" className="btn btn-outline" onClick={() => setIsEditing(false)}>إلغاء</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem" }}>إدارة المقالات القانونية</h2>
        <button className="btn btn-primary" onClick={() => {
          setFormData({ id: "", title: "", slug: "", excerpt: "", content: "", category: "عام", published: true });
          setIsEditing(true);
        }}>+ إضافة مقال جديد</button>
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>العنوان</th>
              <th>التاريخ</th>
              <th>الحالة</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={4} style={{ textAlign: "center", padding: "2rem" }}>جاري التحميل...</td></tr> :
            articles.length === 0 ? <tr><td colSpan={4} style={{ textAlign: "center", padding: "2rem" }}>لا توجد مقالات</td></tr> :
            articles.map(article => (
              <tr key={article.id}>
                <td style={{ fontWeight: 700 }}>{article.title} <div style={{ fontSize: ".8rem", color: "var(--text-secondary)", fontWeight: 400 }} dir="ltr">{article.slug}</div></td>
                <td dir="ltr" style={{ textAlign: "right" }}>{format(new Date(article.created_at), "yyyy-MM-dd")}</td>
                <td>{article.published ? <span className="tag" style={{ background: "rgba(72,187,120,.1)", color: "#38a169" }}>منشور</span> : <span className="tag">مسودة</span>}</td>
                <td>
                  <div style={{ display: "flex", gap: ".5rem" }}>
                    <button className="btn btn-outline btn-sm" onClick={() => {
                      setFormData(article);
                      setIsEditing(true);
                    }}>تعديل</button>
                    <button className="btn btn-outline btn-sm" style={{ color: "red", borderColor: "red" }} onClick={() => handleDelete(article.id)}>حذف</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
