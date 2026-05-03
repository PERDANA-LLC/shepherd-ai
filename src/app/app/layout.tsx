"use client";

import { useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/app", label: "Study" },
  { href: "/app/curriculum", label: "Curriculum" },
  { href: "/app/workbook", label: "Workbooks" },
  { href: "/app/journal", label: "Journal" },
  { href: "/app/groups", label: "Groups" },
  { href: "/app/community", label: "Community" },
  { href: "/app/flywheel", label: "Flywheel" },
  { href: "/app/assess", label: "Assess" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <header className="border-b border-[#30363d] bg-[#161b22] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="sm:hidden p-1.5 rounded-md text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d]"
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>

            <Link href="/app" className="text-lg font-bold text-[#c9d1d9] hover:text-white transition-colors whitespace-nowrap">
              🐑 Shepherd AI
            </Link>

            <nav className="hidden sm:flex items-center gap-1">
              {NAV_LINKS.map(link => (
                <Link key={link.href} href={link.href} className="text-sm px-2 lg:px-3 py-1.5 rounded-md text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d] transition-all">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {isLoaded && user && (
              <span className="text-sm text-[#8b949e] hidden lg:inline">
                {user.firstName || user.emailAddresses?.[0]?.emailAddress?.split("@")[0]}
              </span>
            )}
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8 rounded-full ring-2 ring-[#30363d] hover:ring-[#58a6ff] transition-all",
                },
              }}
            />
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="sm:hidden border-t border-[#30363d] bg-[#161b22] px-2 py-2">
            <div className="grid grid-cols-2 gap-1">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="px-3 py-2 rounded-md text-sm text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d] transition-all"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {children}

      <footer className="border-t border-[#30363d] text-center py-6 text-[#484f58] text-xs px-4">
        <p>Shepherd AI · Built for deeper KJV study · All scripture is public domain</p>
        <p className="mt-1"><Link href="/privacy.html" className="hover:text-[#8b949e] transition-colors">Privacy Policy</Link></p>
      </footer>
    </div>
  );
}
