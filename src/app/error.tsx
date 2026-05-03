"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <span className="text-6xl block mb-4">🛠️</span>
        <h1 className="text-2xl font-bold text-[#c9d1d9] mb-2">Something went wrong</h1>
        <p className="text-[#8b949e] text-sm mb-6 leading-relaxed">
          Don't worry — nothing is broken permanently. Try again or head back to your studies.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-[#1f6feb] hover:bg-[#388bfd] text-white font-semibold rounded-lg transition-all text-sm"
          >
            Try Again
          </button>
          <Link href="/app" className="px-6 py-3 bg-[#21262d] border border-[#30363d] hover:border-[#58a6ff] text-[#c9d1d9] font-semibold rounded-lg transition-all text-sm">
            Back to Study
          </Link>
        </div>
      </div>
    </div>
  );
}
