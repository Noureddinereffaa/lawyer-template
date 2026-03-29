"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const statsData = await res.json();
        setData(statsData);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  if (loading) return <div className="animate-pulse" style={{ padding: "4rem", textAlign: "center" }}>جاري مزامنة بيانات المكتب...</div>;
  if (!data) return <div style={{ padding: "4rem", textAlign: "center" }}>عذراً، تعذر جلب البيانات.</div>;

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="admin-title">📊 النظرة العامة للمكتب</h1>
        <p style={{ color: "var(--text-secondary)" }}>مرحباً بك مجدداً. إليك ملخص لأداء المنصة اليوم.</p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid-4" style={{ marginBottom: "2.5rem" }}>
        <div className="card glass hover-lift" style={{ borderRight: "4px solid var(--secondary)", padding: "1.5rem" }}>
          <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem", fontWeight: 700 }}>إدارة الموكلين (مذكرات)</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem" }}>
            <span style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--primary)", lineHeight: 1 }}>{data.tickets.totalActive}</span>
            <span style={{ fontSize: "0.9rem", color: "var(--secondary)", fontWeight: 700, marginBottom: "0.5rem" }}>({data.tickets.open} جديد)</span>
          </div>
        </div>
        
        <div className="card glass hover-lift" style={{ borderRight: "4px solid var(--primary)", padding: "1.5rem" }}>
          <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem", fontWeight: 700 }}>المواعيد القادمة</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem" }}>
            <span style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--primary)", lineHeight: 1 }}>{data.appointments.upcoming}</span>
            <span style={{ fontSize: "0.9rem", color: "#48bb78", fontWeight: 700, marginBottom: "0.5rem" }}>({data.appointments.today} اليوم)</span>
          </div>
        </div>

        <div className="card glass hover-lift" style={{ borderRight: "4px solid #5a67d8", padding: "1.5rem" }}>
          <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem", fontWeight: 700 }}>المحتوى القانوني</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem" }}>
            <span style={{ fontSize: "2.5rem", fontWeight: 900, color: "#5a67d8", lineHeight: 1 }}>{data.content.published}</span>
            <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "0.5rem" }}>مقال مفعل</span>
          </div>
        </div>

        <div className="card glass hover-lift" style={{ borderRight: "4px solid #48bb78", padding: "1.5rem" }}>
          <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem", fontWeight: 700 }}>نسبة الإنجاز</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem" }}>
            <span style={{ fontSize: "2.5rem", fontWeight: 900, color: "#2f855a", lineHeight: 1 }}>{data.appointments.completed}</span>
            <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "0.5rem" }}>استشارة تمت</span>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Recent Activity Feed */}
        <div className="card glass" style={{ minHeight: "350px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
            <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800 }}>⚡ آخر التحركات</h3>
            <span style={{ fontSize: "0.8rem", color: "var(--primary)", background: "rgba(26,60,94,0.05)", padding: "0.3rem 0.8rem", borderRadius: "50px", fontWeight: 700 }}>مباشر</span>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {data.activity.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>لا يوجد نشاط مؤخرأ.</div>
            ) : (
              data.activity.map((act: any, idx: number) => (
                <div key={idx} style={{ display: "flex", gap: "1rem", paddingBottom: "1.25rem", borderBottom: "1px solid rgba(0,0,0,0.03)" }}>
                  <div style={{ 
                    width: "48px", height: "48px", borderRadius: "12px", 
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: act.type === "ticket" ? "rgba(26,60,94,0.05)" : "rgba(201,168,76,0.1)",
                    fontSize: "1.2rem"
                  }}>
                    {act.type === "ticket" ? "📨" : "📅"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>{act.title}</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
                      بواسطة <span style={{ fontWeight: 700, color: "var(--primary)" }}>{act.user}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                    {format(new Date(act.date), "HH:mm")}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Insights / Performance */}
        <div className="card glass" style={{ minHeight: "350px" }}>
          <h3 style={{ marginBottom: "2rem", fontSize: "1.2rem", fontWeight: 800 }}>📊 حالة المنصة</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem", fontSize: "0.9rem" }}>
                <span style={{ fontWeight: 700 }}>معدل الاستجابة للمذكرات</span>
                <span style={{ color: "var(--primary)", fontWeight: 800 }}>{data.tickets.responseRate}%</span>
              </div>
              <div style={{ height: "8px", background: "rgba(0,0,0,0.05)", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: `${data.tickets.responseRate}%`, height: "100%", background: "var(--primary)" }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem", fontSize: "0.9rem" }}>
                <span style={{ fontWeight: 700 }}>نسبة إشغال المواعيد اليوم</span>
                <span style={{ color: "var(--secondary)", fontWeight: 800 }}>
                  {Math.round((data.appointments.today / 10) * 100)}%
                </span>
              </div>
              <div style={{ height: "8px", background: "rgba(0,0,0,0.05)", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: `${(data.appointments.today / 10) * 100}%`, height: "100%", background: "var(--secondary)" }}></div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div style={{ marginTop: "2rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <button className="btn btn-outline btn-sm" style={{ borderRadius: "10px", height: "50px" }}>📥 أرشيف الرسائل</button>
              <button className="btn btn-outline btn-sm" style={{ borderRadius: "10px", height: "50px" }}>📑 تقرير شهري</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

