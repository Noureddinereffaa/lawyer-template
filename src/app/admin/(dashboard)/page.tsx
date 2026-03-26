"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ upcoming: 0, newMessages: 0, completed: 0, articles: 0 });
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const today = format(new Date(), "yyyy-MM-dd");

    // Fetch upcoming appointments
    const { count: upcomingCount } = await supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .gte("date", today)
      .neq("status", "cancelled")
      .neq("status", "completed");

    // Fetch completed
    const { count: completedCount } = await supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed");

    // Fetch today's appointments
    const { data: todayApps } = await supabase
      .from("appointments")
      .select("*")
      .eq("date", today)
      .neq("status", "cancelled")
      .order("time_slot", { ascending: true });

    // Fetch published articles count
    const { count: articlesCount } = await supabase
      .from("articles")
      .select("*", { count: "exact", head: true })
      .eq("published", true);

    setStats({
      upcoming: upcomingCount || 0,
      newMessages: 0, // Placeholder
      completed: completedCount || 0,
      articles: articlesCount || 0,
    });

    if (todayApps) setTodayAppointments(todayApps);
  };

  return (
    <>
      <div className="grid-4" style={{ marginBottom: "2.5rem" }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(201,168,76,.15)", color: "var(--secondary)" }}>📅</div>
          <div>
            <div className="stat-value">{stats.upcoming}</div>
            <div className="stat-label">المواعيد القادمة</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(26,60,94,.1)", color: "var(--primary)" }}>📬</div>
          <div>
            <div className="stat-value">{stats.newMessages}</div>
            <div className="stat-label">رسائل جديدة</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(72,187,120,.15)", color: "#38a169" }}>✓</div>
          <div>
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-label">مواعيد مكتملة</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(102,126,234,.1)", color: "#5a67d8" }}>📰</div>
          <div>
            <div className="stat-value">{stats.articles}</div>
            <div className="stat-label">مقالات منشورة</div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 style={{ marginBottom: "1.5rem", fontSize: "1.15rem" }}>مواعيد اليوم</h3>
          {todayAppointments.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--text-secondary)", padding: "2rem" }}>لا توجد مواعيد مبرمجة لليوم</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {todayAppointments.map(a => (
                <div key={a.id} style={{ display: "flex", gap: "1rem", padding: "1rem", background: "var(--bg)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                  <div style={{ background: "var(--primary)", color: "#fff", padding: ".75rem", borderRadius: "8px", fontWeight: 700, textAlign: "center", minWidth: 80 }}>
                    {a.time_slot.substring(0, 5)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>{a.client_name}</div>
                    <div style={{ fontSize: ".85rem", color: "var(--text-secondary)", marginTop: ".2rem" }}>{a.type} • <span dir="ltr">{a.client_phone}</span></div>
                  </div>
                  <div style={{ alignSelf: "center" }}>
                    {a.status === 'confirmed' ? (
                       <span style={{ color: "#48bb78", fontSize: ".8rem", fontWeight: 700 }}>✅ مؤكد</span>
                    ) : (
                       <span style={{ color: "var(--secondary)", fontSize: ".8rem", fontWeight: 700 }}>⏳ بالانتظار</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: "1.5rem", fontSize: "1.15rem" }}>الرسائل غير المقروءة</h3>
          <div style={{ textAlign: "center", color: "var(--text-secondary)", padding: "3rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: .5 }}>✉️</div>
            لا توجد رسائل جديدة 
          </div>
        </div>
      </div>
    </>
  );
}
