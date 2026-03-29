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

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    // Clear admin bypass cookie if it exists
    document.cookie = "admin_bypass=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/admin/login";
  };

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
      <aside className={`admin-sidebar glass ${sidebarOpen ? "open" : ""}`} style={{ 
        borderLeft: "1px solid var(--border)",
        background: "rgba(13, 35, 64, 0.95)",
        backdropFilter: "blur(20px)"
      }}>
        <div className="admin-logo" style={{ padding: "2rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "1.4rem" }}>⚖️</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: 800, color: "#fff", letterSpacing: "0.5px" }}>{officeName}</span>
            <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>لوحة التحكم الذكية</span>
          </div>
        </div>
        <nav className="admin-nav" style={{ padding: "1.5rem 1rem" }}>
          {[
            { href: "/admin", label: "نظرة عامة", icon: "🏠" },
            { href: "/admin/appointments", label: "المواعيد والحجوزات", icon: "📅" },
            { href: "/admin/messages", label: "رسائل المكتب", icon: "📨" },
            { href: "/admin/articles", label: "المقالات والتدوينات", icon: "📰" },
            { href: "/admin/settings", label: "إعدادات المنصة", icon: "⚙️" },
          ].map((item) => {
            const isActive = item.href === "/admin" ? pathname === "/admin" : pathname?.includes(item.href);
            return (
              <Link 
                key={item.href}
                href={item.href} 
                onClick={closeSidebar} 
                className={`admin-nav-item ${isActive ? 'active' : ''}`}
                style={{
                  display: "flex", alignItems: "center", gap: "0.75rem",
                  padding: "0.85rem 1.25rem", borderRadius: "12px",
                  marginBottom: "0.5rem", transition: "var(--transition)",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.6)",
                  background: isActive ? "var(--secondary)" : "transparent",
                  fontWeight: isActive ? 700 : 500,
                  boxShadow: isActive ? "0 4px 12px rgba(201,168,76, 0.3)" : "none"
                }}
              >
                <span style={{ fontSize: "1.2rem" }}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div style={{ marginTop: "auto", padding: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <button onClick={handleLogout} className="btn btn-outline btn-full hover-lift" style={{ 
            borderColor: "rgba(255,255,255,.15)", color: "#fff",
            background: "rgba(255,255,255,0.05)", borderRadius: "10px"
          }}>
            🚪 تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main" style={{ background: "#f8fafc" }}>
        <header className="admin-topbar glass" style={{ 
          background: "rgba(255,255,255,0.8)", 
          borderBottom: "1px solid var(--border)",
          padding: "1rem 2.5rem"
        }}>
          <div>
            <h2 className="admin-page-title" style={{ margin: 0, fontSize: "1.25rem", color: "var(--primary)" }}>
              مرحباً، <span style={{ fontWeight: 800 }}>{lawyerName.split(" ").slice(1).join(" ") || lawyerName}</span> 👋
            </h2>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
              {new Date().toLocaleDateString("ar-DZ", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <div className="animate-pulse" style={{ display: "flex", alignItems: "center", gap: ".5rem", background: "rgba(72,187,120,0.1)", padding: "0.4rem 0.8rem", borderRadius: "20px" }}>
              <div style={{ width: 8, height: 8, background: "#48bb78", borderRadius: "50%" }} />
              <span style={{ fontSize: ".75rem", fontWeight: 700, color: "#2f855a" }}>النظام متصل</span>
            </div>
            <Link href="/" target="_blank" className="btn btn-primary btn-sm hover-lift" style={{ borderRadius: "8px" }}>
              🌍 عرض الموقع
            </Link>
          </div>
        </header>

        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
}
