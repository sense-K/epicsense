"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { label: "홈", href: "/" },
  { label: "실레나 서포터", href: "/rta" },
  { label: "영웅 도감", href: "/heroes" },
  { label: "장비 추천", href: "/gear-recommend" },
  { label: "장비 강화", href: "/gear-enhance" },
  { label: "문의하기", href: "/contact" },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{ background: "var(--bg-header)", borderColor: "var(--color-border)" }}
    >
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg tracking-tight" style={{ color: "var(--color-primary)" }}>
          Epic Sense
        </Link>

        {/* 데스크탑 네비 */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-1.5 rounded-md text-sm transition-colors"
              style={{
                color: pathname === item.href ? "var(--color-primary)" : "var(--text-sub)",
                background: pathname === item.href ? "rgba(59,130,246,0.1)" : "transparent",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* 모바일 햄버거 */}
        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="메뉴 열기"
        >
          <div className="w-5 h-0.5 mb-1" style={{ background: "var(--text-base)" }} />
          <div className="w-5 h-0.5 mb-1" style={{ background: "var(--text-base)" }} />
          <div className="w-5 h-0.5" style={{ background: "var(--text-base)" }} />
        </button>
      </div>

      {/* 모바일 메뉴 */}
      {menuOpen && (
        <nav
          className="md:hidden border-t px-4 py-2"
          style={{ background: "var(--bg-card)", borderColor: "var(--color-border)" }}
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="block py-2.5 text-sm border-b last:border-0"
              style={{
                color: pathname === item.href ? "var(--color-primary)" : "var(--text-base)",
                borderColor: "var(--color-border)",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
