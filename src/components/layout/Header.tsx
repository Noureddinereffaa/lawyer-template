"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ClientConfig } from "../../../config/client.config"; // Import the type

interface HeaderProps {
  config: ClientConfig;
}

const navLinks = [
  { href: "/",          label: "الرئيسية" },
  { href: "/about",     label: "من نحن" },
  { href: "/services",  label: "الخدمات" },
  { href: "/blog",      label: "المدونة" },
  { href: "/meeting",   label: "قاعة الاجتماعات" },
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
          transition: all 0.3s ease;
        }
        .site-header.scrolled {
          background: rgba(26,60,94,.97);
          backdrop-filter: blur(12px);
          box-shadow: 0 2px 20px rgba(0,0,0,.2);
          padding: 0;
        }
        .site-header:not(.scrolled) { background: transparent; }
        .header-inner {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1rem 0;
          transition: padding 0.3s ease;
        }
        .site-header.scrolled .header-inner { padding: .6rem 0; }
        .header-logo {
          display: flex; align-items: center; gap: .75rem;
          color: #fff; font-family: var(--font-heading); font-size: 1.2rem; font-weight: 700;
        }
        .logo-icon {
          width: 44px; height: 44px; border-radius: 10px;
          background: linear-gradient(135deg, var(--secondary), var(--secondary-light));
          display: flex; align-items: center; justify-content: center;
          font-size: 1.3rem;
        }
        .header-nav { display: flex; align-items: center; gap: .25rem; }
        .nav-link {
          padding: .5rem .875rem; border-radius: 6px;
          color: rgba(255,255,255,.85); font-size: .95rem; font-weight: 500;
          transition: all .2s ease; position: relative;
        }
        .nav-link:hover { color: #fff; background: rgba(255,255,255,.1); }
        .nav-link.booking {
          background: var(--secondary); color: #fff; font-weight: 700;
          margin-right: .5rem; padding: .5rem 1.2rem;
        }
        .nav-link.booking:hover { background: var(--secondary-light); transform: translateY(-1px); }
        .menu-toggle {
          display: none; flex-direction: column; gap: 5px;
          padding: .4rem; cursor: pointer;
        }
        .menu-toggle span {
          display: block; width: 24px; height: 2px;
          background: #fff; border-radius: 2px;
          transition: all .3s ease;
        }
        .menu-toggle.open span:nth-child(1){ transform: rotate(45deg) translate(5px, 5px); }
        .menu-toggle.open span:nth-child(2){ opacity: 0; }
        .menu-toggle.open span:nth-child(3){ transform: rotate(-45deg) translate(5px, -5px); }

        .mobile-menu {
          display: none; flex-direction: column;
          background: rgb(26,60,94);
          padding: 1rem 1.5rem 1.5rem;
        }
        .mobile-menu.open { display: flex; }
        .mobile-nav-link {
          padding: .85rem 0; color: rgba(255,255,255,.85);
          font-size: 1rem; border-bottom: 1px solid rgba(255,255,255,.08);
          transition: color .2s;
        }
        .mobile-nav-link:hover { color: var(--secondary); }

        @media (max-width: 900px) {
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
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`nav-link${l.label === "احجز موعد" ? " booking" : ""}`}
                >
                  {l.label}
                </Link>
              ))}
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

        <div className={`mobile-menu${isMenuOpen ? " open" : ""}`}>
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="mobile-nav-link"
              onClick={() => setIsMenuOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </header>
    </>
  );
}
