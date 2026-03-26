"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { clientConfig as defaultConfig } from "../../../../config/client.config";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const [officeName, setOfficeName] = useState(defaultConfig.officeName);
  const [lawyerName, setLawyerName] = useState(defaultConfig.lawyerName);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("settings")
      .select("config_data")
      .single()
      .then(({ data }) => {
        if (data?.config_data) {
          if (data.config_data.officeName) setOfficeName(data.config_data.officeName);
          if (data.config_data.lawyerName) setLawyerName(data.config_data.lawyerName);
        }
      });
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="admin-layout">
      {/* Mobile Top Header */}
      <div className="admin-mobile-header">
        <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>لوحة التحكم</div>
        <button onClick={toggleSidebar} style={{ color: "#fff", fontSize: "1.5rem" }}>
          ☰
        </button>
      </div>

      {/* Overlay for mobile sidebar */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`} 
        onClick={closeSidebar} 
      />

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="admin-logo">
          👨‍⚖️ لوحة التحكم
          <span>{officeName}</span>
        </div>
        <nav className="admin-nav">
          <Link href="/admin" onClick={closeSidebar} className={`admin-nav-item ${pathname === '/admin' ? 'active' : ''}`}>🏠 نظرة عامة</Link>
          <Link href="/admin/appointments" onClick={closeSidebar} className={`admin-nav-item ${pathname?.includes('/appointments') ? 'active' : ''}`}>📅 المواعيد والحجوزات</Link>
          <Link href="/admin/services" onClick={closeSidebar} className={`admin-nav-item ${pathname?.includes('/services') ? 'active' : ''}`}>⚖️ الخدمات</Link>
          <Link href="/admin/blog" onClick={closeSidebar} className={`admin-nav-item ${pathname?.includes('/blog') ? 'active' : ''}`}>📰 المقالات</Link>
          <Link href="/admin/settings" onClick={closeSidebar} className={`admin-nav-item ${pathname?.includes('/settings') ? 'active' : ''}`}>⚙️ الإعدادات</Link>
        </nav>
        <div style={{ marginTop: "auto", padding: "1.5rem" }}>
          <button className="btn btn-outline btn-full" style={{ borderColor: "rgba(255,255,255,.2)", color: "#fff" }}>
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-topbar">
          <h2 className="admin-page-title">مرحباً، {lawyerName.split(" ")[1] || "أستاذ"}</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
              <div style={{ width: 10, height: 10, background: "#48bb78", borderRadius: "50%" }} />
              <span style={{ fontSize: ".85rem", fontWeight: 700, color: "var(--text-secondary)" }}>النظام يعمل</span>
            </div>
            <Link href="/" target="_blank" className="btn btn-primary btn-sm">🌍 عرض الموقع</Link>
          </div>
        </header>

        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
}
