import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d1117]">
      <SignUp
        appearance={{
          elements: {
            card: "bg-[#161b22] border border-[#30363d] shadow-xl",
            headerTitle: "text-[#c9d1d9]",
            headerSubtitle: "text-[#8b949e]",
            socialButtonsBlockButton: "bg-[#21262d] border border-[#30363d] text-[#c9d1d9] hover:bg-[#30363d]",
            formFieldLabel: "text-[#c9d1d9]",
            formFieldInput: "bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] focus:border-[#58a6ff]",
            formButtonPrimary: "bg-[#1f6feb] hover:bg-[#388bfd]",
            footerActionLink: "text-[#58a6ff] hover:text-[#79c0ff]",
            dividerLine: "bg-[#30363d]",
            dividerText: "text-[#484f58]",
          },
        }}
      />
    </div>
  );
}
