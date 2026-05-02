import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col">
      {/* Hero */}
      <header className="text-center px-4 pt-24 pb-16 relative flex-1 flex flex-col items-center justify-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(88,166,255,0.06) 0%, transparent 70%)" }} />
        <div className="relative max-w-2xl">
          <span className="inline-block bg-[rgba(88,166,255,0.12)] border border-[rgba(88,166,255,0.25)] text-[#58a6ff] px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wide mb-6">
            AI-Powered KJV Bible Study
          </span>
          <h1 className="text-6xl font-extrabold mb-4 tracking-tight">
            <span className="bg-gradient-to-br from-white via-[#58a6ff] to-[#a371f7] bg-clip-text text-transparent">
              Shepherd AI
            </span>
          </h1>
          <p className="text-[#8b949e] text-xl max-w-lg mx-auto mb-3 leading-relaxed">
            Deep, level-appropriate KJV Bible studies — from 5th grade to PhD.
          </p>
          <p className="text-[#484f58] text-sm mb-10">
            Enter any passage. Choose your level. Get a complete study tailored to your audience.
          </p>

          <div className="flex gap-4 justify-center">
            <Link href="/sign-up"
              className="px-8 py-3.5 bg-[#1f6feb] hover:bg-[#388bfd] text-white font-semibold rounded-lg transition-all text-lg shadow-lg shadow-[rgba(31,111,235,0.25)]">
              Start Free →
            </Link>
            <Link href="/sign-in"
              className="px-8 py-3.5 bg-[#21262d] border border-[#30363d] hover:border-[#58a6ff] text-[#c9d1d9] font-semibold rounded-lg transition-all text-lg">
              Sign In
            </Link>
          </div>

          <p className="text-[#484f58] text-xs mt-6">No credit card required · Free forever for personal study</p>
        </div>
      </header>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { emoji: "📖", title: "4 Study Levels", desc: "5th grade, high school, college, or PhD — every study matches your audience." },
            { emoji: "🔤", title: "Strong's Concordance", desc: "Original Greek and Hebrew word studies with interactive popovers." },
            { emoji: "📄", title: "PDF Export", desc: "Download any study as a print-ready PDF for your group or class." },
            { emoji: "✝️", title: "Christ-Centered", desc: "Every study begins with what Jesus said or did on the topic." },
          ].map((f, i) => (
            <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 hover:border-[#58a6ff]/30 transition-all">
              <div className="text-2xl mb-3">{f.emoji}</div>
              <h3 className="text-[#c9d1d9] font-semibold text-sm mb-1.5">{f.title}</h3>
              <p className="text-[#8b949e] text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#30363d] text-center py-6 text-[#484f58] text-xs">
        <p>Shepherd AI · Built for deeper KJV study · All scripture is public domain</p>
      </footer>
    </div>
  );
}
