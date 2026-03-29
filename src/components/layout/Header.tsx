"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ClientConfig } from "../../../config/client.config"; // Import the type

interface HeaderProps {
  config: ClientConfig;
}

type NavItem = {
  label: string;
  href?: string;
  subLinks?: { label: string; href: string }[];
};

const navLinks: NavItem[] = [
  { href: "/",          label: "الرئيسية" },
  { href: "/about",     label: "من نحن" },
  { href: "/services",  label: "الخدمات" },
  { href: "/blog",      label: "المدونة" },
  { 
    label: "منطقة العملاء", 
    subLinks: [
      { href: "/track",   label: "متابعة التذكرة" },
      { href: "/meeting", label: "قاعة الاجتماعات" },
    ] 
  },
  { href: "/contact",   label: "اتصل بنا" },
  { href: "/booking",   label: "احجز موعد" },
];

export default function Header({ config }: HeaderProps) {
  const [isScrolled, setIsScrolled]   = useState(false);
  const [isMenuOpen, setIsMenuOpen]   = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <style>{`
        .site-header {
          position: fixed; top: 0; right: 0; left: 0; z-index: var(--z-nav);
          transition: var(--transition);
          padding: 1rem 0;
          /* Default semi-transparent background to ensure visibility on light pages */
          background: rgba(13, 35, 64, 0.75);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .site-header.scrolled {
          background: rgba(13, 35, 64, 0.95);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.4);
          padding: 0.5rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .header-inner {
          display: flex; align-items: center; justify-content: space-between;
          position: relative; z-index: 1002;
        }
        .header-logo {
          display: flex; align-items: center; gap: 1rem;
          color: #fff; font-family: var(--font-heading); font-size: 1.3rem; font-weight: 700;
          transition: transform 0.3s ease;
        }
        .header-logo:hover { transform: scale(1.02); }
        .logo-icon {
          width: 48px; height: 48px; border-radius: 12px;
          background: linear-gradient(135deg, var(--secondary), var(--secondary-light));
          display: flex; align-items: center; justify-content: center;
          font-size: 1.5rem;
          box-shadow: 0 8px 16px rgba(201,168,76, 0.3);
        }
        .header-nav { display: flex; align-items: center; gap: 0.5rem; }
        .nav-link {
          padding: 0.6rem 1rem; border-radius: 8px;
          color: rgba(255,255,255, 0.8); font-size: 0.95rem; font-weight: 600;
          transition: var(--transition);
          display: inline-flex; align-items: center; gap: 0.2rem;
        }
        .nav-link:hover { color: #fff; background: rgba(255,255,255, 0.1); }
        .nav-link.active { color: var(--secondary-light); }
        
        .nav-dropdown { position: relative; display: inline-block; cursor: pointer; }
        .dropdown-menu {
          position: absolute; top: 100%; right: 0; 
          background: rgba(13, 35, 64, 0.95);
          backdrop-filter: blur(12px);
          min-width: 180px;
          border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);
          padding: 0.5rem 0;
          opacity: 0; visibility: hidden; transform: translateY(10px);
          transition: all 0.3s ease;
        }
        .nav-dropdown:hover .dropdown-menu { opacity: 1; visibility: visible; transform: translateY(0); }
        .dropdown-item {
          display: block; padding: 0.6rem 1.25rem; color: rgba(255,255,255,0.8);
          font-size: 0.9rem; font-weight: 600; transition: var(--transition);
        }
        .dropdown-item:hover { color: #fff; background: rgba(255,255,255,0.1); }
        
        .nav-link.booking {
          background: var(--secondary); color: #fff; 
          margin-right: 1rem; padding: 0.7rem 1.5rem;
          box-shadow: 0 4px 15px rgba(201,168,76, 0.4);
          animation: pulse-glow 3s infinite;
        }
        @keyframes pulse-glow {
          0% { box-shadow: 0 0 0 0 rgba(201,168,76, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(201,168,76, 0); }
          100% { box-shadow: 0 0 0 0 rgba(201,168,76, 0); }
        }
        .nav-link.booking:hover { 
          background: var(--secondary-light); 
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(201,168,76, 0.5);
        }

        .menu-toggle {
          display: none; flex-direction: column; gap: 6px;
          padding: 0.5rem; cursor: pointer; z-index: 1001;
        }
        .menu-toggle span {
          display: block; width: 28px; height: 2px;
          background: #fff; border-radius: 2px;
          transition: var(--transition);
        }
        .menu-toggle.open span:nth-child(1){ transform: rotate(45deg) translate(6px, 6px); }
        .menu-toggle.open span:nth-child(2){ opacity: 0; transform: translateX(-10px); }
        .menu-toggle.open span:nth-child(3){ transform: rotate(-45deg) translate(6px, -6px); }

        .mobile-overlay {
          position: fixed; inset: 0; background: rgba(13, 35, 64, 0.98);
          backdrop-filter: blur(10px);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 2rem; z-index: 1000; overflow-y: auto; overflow-x: hidden;
          opacity: 0; visibility: hidden; transition: var(--transition); padding: 5rem 1rem 2rem;
        }
        .mobile-overlay.open { opacity: 1; visibility: visible; }
        .mobile-nav-link {
          font-size: 1.5rem; font-weight: 700; color: #fff;
          font-family: var(--font-heading);
          transition: var(--transition);
          transform: translateY(20px); opacity: 0;
        }
        .mobile-overlay.open .mobile-nav-link { 
          transform: translateY(0); opacity: 1;
        }
        .mobile-nav-link:hover { color: var(--secondary); transform: scale(1.1); }

        @media (max-width: 1024px) {
          .header-nav { display: none; }
          .menu-toggle { display: flex; }
        }
      `}</style>

      <header className={`site-header${isScrolled ? " scrolled" : ""}`}>
        <div className="container">
          <div className="header-inner">
            <Link href="/" className="header-logo">
              <div className="logo-icon">⚖️</div>
              <div>
                <div>{config.officeName}</div>
                <div style={{ fontSize: ".72rem", fontWeight: 400, color: "rgba(255,255,255,.65)", fontFamily: "var(--font-body)" }}>
                  {config.lawyerName}
                </div>
              </div>
            </Link>

            <nav className="header-nav">
              {navLinks.map((l, idx) => {
                if (l.subLinks) {
                  return (
                    <div key={idx} className="nav-dropdown">
                      <span className="nav-link">
                        {l.label} <span style={{ fontSize: "0.7rem", opacity: 0.6 }}>▼</span>
                      </span>
                      <div className="dropdown-menu">
                        {l.subLinks.map((sub) => (
                          <Link key={sub.href} href={sub.href} className="dropdown-item">
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                }
                return (
                  <Link
                    key={l.href}
                    href={l.href as string}
                    className={`nav-link${l.label === "احجز موعد" ? " booking" : ""}`}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </nav>

            <button
              className={`menu-toggle${isMenuOpen ? " open" : ""}`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="القائمة"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>

        <div className={`mobile-overlay${isMenuOpen ? " open" : ""}`}>
          {navLinks.map((l, i) => {
            if (l.subLinks) {
              return (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                  <div className="mobile-nav-link" style={{ transitionDelay: `${i * 0.05}s`, opacity: 0.5 }}>{l.label}</div>
                  {l.subLinks.map((sub, subIdx) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className="mobile-nav-link"
                      onClick={() => setIsMenuOpen(false)}
                      style={{ transitionDelay: `${(i + subIdx + 1) * 0.05}s`, fontSize: "1.2rem", fontWeight: 500 }}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              );
            }
            return (
              <Link
                key={l.href}
                href={l.href as string}
                className="mobile-nav-link"
                onClick={() => setIsMenuOpen(false)}
                style={{ transitionDelay: `${i * 0.05}s` }}
              >
                {l.label}
              </Link>
            );
          })}
          <div style={{ marginTop: "2rem", color: "rgba(255,255,255,0.4)", fontSize: "0.9rem" }}>
            ⚖️ حقوق الطبع محفوظة {new Date().getFullYear()}
          </div>
        </div>
      </header>
    </>
  );
}
