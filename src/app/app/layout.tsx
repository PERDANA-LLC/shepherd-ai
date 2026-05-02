"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();

  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* App Header */}
      <header className="border-b border-[#30363d] bg-[#161b22] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/app" className="text-lg font-bold text-[#c9d1d9] hover:text-white transition-colors">
              🐑 Shepherd AI
            </Link>
            <nav className="hidden sm:flex items-center gap-1">
              <Link href="/app" className="text-sm px-3 py-1.5 rounded-md text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d] transition-all">
                Study
              </Link>
              <Link href="/app/journal" className="text-sm px-3 py-1.5 rounded-md text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d] transition-all">
                Journal
              </Link>
              <Link href="/app/assess" className="text-sm px-3 py-1.5 rounded-md text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d] transition-all">
                Assess
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {isLoaded && user && (
              <span className="text-sm text-[#8b949e] hidden sm:inline">{user.firstName || user.emailAddresses?.[0]?.emailAddress}</span>
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
      </header>

      {/* Page Content */}
      {children}

      {/* App Footer */}
      <footer className="border-t border-[#30363d] text-center py-6 text-[#484f58] text-xs">
        <p>Shepherd AI · Built for deeper KJV study · All scripture is public domain</p>
      </footer>
    </div>
  );
}
