"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ServicesAdminPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: "", title: "", description: "", icon: "⚖️" });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    const { data } = await supabase.from("services").select("*").order("order_idx", { ascending: true });
    if (data) setServices(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id) {
      await supabase.from("services").update(formData).eq("id", formData.id);
    } else {
      const { id, ...newRecord } = formData;
      await supabase.from("services").insert([{ ...newRecord, order_idx: services.length }]);
    }
    setIsEditing(false);
    fetchServices();
  };

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذه الخدمة؟")) {
      await supabase.from("services").delete().eq("id", id);
      fetchServices();
    }
  };

  if (isEditing) {
    return (
      <div className="card">
        <h3 style={{ marginBottom: "1.5rem" }}>{formData.id ? "تعديل الخدمة" : "إضافة خدمة جديدة"}</h3>
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="form-group">
             <label className="form-label">الأيقونة (إيموجي أو نص)</label>
             <input type="text" className="form-control" style={{ width: 100 }} required value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} />
          </div>
          <div className="form-group">
             <label className="form-label">اسم التخصص / الخدمة</label>
             <input type="text" className="form-control" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>
          <div className="form-group">
             <label className="form-label">وصف تفصيلي</label>
             <textarea className="form-control" rows={4} required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            <button type="submit" className="btn btn-primary">حفظ</button>
            <button type="button" className="btn btn-outline" onClick={() => setIsEditing(false)}>إلغاء</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem" }}>إدارة التخصصات والخدمات</h2>
        <button className="btn btn-primary" onClick={() => {
          setFormData({ id: "", title: "", description: "", icon: "⚖️" });
          setIsEditing(true);
        }}>+ التخصصات إيموجيات</button>
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>الأيقونة</th>
              <th>اسم الخدمة</th>
              <th>الوصف</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={4} style={{ textAlign: "center", padding: "2rem" }}>جاري التحميل...</td></tr> :
            services.length === 0 ? <tr><td colSpan={4} style={{ textAlign: "center", padding: "2rem" }}>لا توجد خدمات مضافة بعد</td></tr> :
            services.map(srv => (
              <tr key={srv.id}>
                <td style={{ fontSize: "1.5rem" }}>{srv.icon}</td>
                <td style={{ fontWeight: 700 }}>{srv.title}</td>
                <td style={{ maxWidth: 300, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{srv.description}</td>
                <td>
                  <div style={{ display: "flex", gap: ".5rem" }}>
                    <button className="btn btn-outline btn-sm" onClick={() => {
                      setFormData(srv);
                      setIsEditing(true);
                    }}>تعديل</button>
                    <button className="btn btn-outline btn-sm" style={{ color: "red", borderColor: "red" }} onClick={() => handleDelete(srv.id)}>حذف</button>
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
