import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <span className="text-6xl block mb-4">🐑</span>
        <h1 className="text-4xl font-bold text-[#c9d1d9] mb-3">404</h1>
        <h2 className="text-xl text-[#8b949e] mb-2">Page not found</h2>
        <p className="text-[#484f58] text-sm mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
          Perhaps it was caught up with the Lord? (1 Thessalonians 4:17)
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/app" className="px-6 py-3 bg-[#1f6feb] hover:bg-[#388bfd] text-white font-semibold rounded-lg transition-all text-sm">
            ← Back to Study
          </Link>
          <Link href="/" className="px-6 py-3 bg-[#21262d] border border-[#30363d] hover:border-[#58a6ff] text-[#c9d1d9] font-semibold rounded-lg transition-all text-sm">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
