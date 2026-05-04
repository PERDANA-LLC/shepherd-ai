"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";

type MfaStatus = "loading" | "disabled" | "setup" | "enabled" | "challenge";

export default function SecurityPage() {
  const { user } = useUser();
  const [status, setStatus] = useState<MfaStatus>("loading");
  const [secret, setSecret] = useState("");
  const [otpauth, setOtpauth] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [qrSvg, setQrSvg] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showCodes, setShowCodes] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mfa_required") === "true") setMfaRequired(true);
  }, []);

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/mfa/setup");
      const data = await res.json();
      if (data.mfa_enabled && mfaRequired) {
        setStatus("challenge");
      } else {
        setStatus(data.mfa_enabled ? "enabled" : "disabled");
      }
    } catch {
      setStatus("disabled");
    }
  }, [mfaRequired]);

  useEffect(() => { checkStatus(); }, [checkStatus]);

  const generateQR = async (uri: string) => {
    const QRCode = (await import("qrcode")).default;
    const svg = await QRCode.toString(uri, { type: "svg", width: 240, margin: 1, color: { dark: "#c9d1d9", light: "#0d1117" } });
    setQrSvg(svg);
  };

  const handleSetup = async () => {
    setError(""); setMessage("");
    try {
      const res = await fetch("/api/mfa/setup", { method: "POST" });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setSecret(data.secret); setOtpauth(data.otpauth); setBackupCodes(data.backupCodes);
      await generateQR(data.otpauth);
      setStatus("setup");
    } catch { setError("Failed to initialize MFA setup."); }
  };

  const handleVerify = async (mode: "enable" | "totp" | "backup" = "enable") => {
    setError("");
    if (code.length < 6) { setError("Enter a valid code."); return; }
    try {
      const res = await fetch("/api/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, mode }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      if (mode === "enable") {
        setStatus("enabled");
        setMessage("✅ Two-factor authentication is now active!");
      } else {
        window.location.href = "/app";
      }
      setCode("");
    } catch { setError("Verification failed."); }
  };

  const handleDisable = async () => {
    if (!code) { setError("Enter your authenticator code to disable."); return; }
    setError("");
    try {
      const res = await fetch("/api/mfa/verify", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setStatus("disabled"); setMessage("MFA has been disabled."); setCode("");
      setSecret(""); setOtpauth(""); setBackupCodes([]); setQrSvg("");
    } catch { setError("Failed to disable MFA."); }
  };

  if (status === "loading") return <div className="max-w-2xl mx-auto px-4 py-12"><div className="animate-pulse space-y-4"><div className="h-8 bg-[#21262d] rounded w-64" /><div className="h-48 bg-[#21262d] rounded" /></div></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-[#c9d1d9] mb-2">🔐 Security</h1>
      <p className="text-[#8b949e] mb-8">Two-factor authentication keeps your account secure.</p>

      {mfaRequired && <div className="mb-6 p-4 bg-[#2d1a1a] border border-[#f0883e] rounded-lg"><p className="text-[#f0883e] text-sm font-semibold mb-1">⚠️ MFA verification required</p><p className="text-[#8b949e] text-xs">Verify below to access your account.</p></div>}
      {message && <div className="mb-6 p-4 bg-[#1a2332] border border-[#238636] rounded-lg text-[#7ee787] text-sm">{message}</div>}
      {error && <div className="mb-6 p-4 bg-[#2d1a1a] border border-[#da3633] rounded-lg text-[#f85149] text-sm">{error}</div>}

      {/* CHALLENGE: MFA enabled, need to verify */}
      {status === "challenge" && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-[#c9d1d9] mb-3">Verify your identity</h2>
          <p className="text-sm text-[#8b949e] mb-4">Enter the 6-digit code from your authenticator app, or use a backup code.</p>
          <div className="flex gap-3">
            <input type="text" inputMode="numeric" maxLength={8} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))} onKeyDown={(e) => e.key === "Enter" && handleVerify("totp")} placeholder="000000" className="w-40 px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-[#c9d1d9] text-lg text-center tracking-widest font-mono focus:border-[#58a6ff] focus:outline-none" autoFocus />
            <button onClick={() => handleVerify(code.length > 6 ? "backup" : "totp")} className="px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white text-sm font-medium rounded-md transition-colors">Verify</button>
          </div>
        </div>
      )}

      {/* DISABLED */}
      {status === "disabled" && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
          <div className="flex items-start gap-4 mb-6"><span className="text-3xl">🔓</span><div><h2 className="text-lg font-semibold text-[#c9d1d9] mb-1">Two-factor authentication is off</h2><p className="text-sm text-[#8b949e]">Add an extra layer of security. You&apos;ll need your phone to sign in.</p></div></div>
          <button onClick={handleSetup} className="px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white text-sm font-medium rounded-md transition-colors">Set up two-factor authentication</button>
        </div>
      )}

      {/* SETUP */}
      {status === "setup" && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 space-y-6">
          <div><h2 className="text-lg font-semibold text-[#c9d1d9] mb-2">Step 1: Scan the QR code</h2><p className="text-sm text-[#8b949e] mb-4">Open your authenticator app and scan this QR code.</p>{qrSvg ? <div className="inline-block p-4 bg-white rounded-lg" dangerouslySetInnerHTML={{ __html: qrSvg }} /> : <div className="w-64 h-64 bg-[#21262d] rounded-lg animate-pulse flex items-center justify-center"><span className="text-[#8b949e] text-sm">Generating...</span></div>}</div>
          <div><p className="text-sm text-[#8b949e] mb-1">Or enter manually:</p><code className="block p-3 bg-[#0d1117] border border-[#30363d] rounded text-[#7ee787] text-sm font-mono break-all select-all">{secret}</code></div>
          <div><h2 className="text-lg font-semibold text-[#c9d1d9] mb-2">Step 2: Verify</h2><div className="flex gap-3"><input type="text" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} onKeyDown={(e) => e.key === "Enter" && handleVerify("enable")} placeholder="000000" className="w-32 px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-[#c9d1d9] text-lg text-center tracking-widest font-mono focus:border-[#58a6ff] focus:outline-none" autoFocus /><button onClick={() => handleVerify("enable")} disabled={code.length !== 6} className="px-4 py-2 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors">Verify & Enable</button></div></div>
          <div><button onClick={() => setShowCodes(!showCodes)} className="text-sm text-[#58a6ff] hover:underline">{showCodes ? "Hide" : "Show"} backup codes</button>{showCodes && <div className="mt-3 p-4 bg-[#0d1117] border border-[#f0883e] rounded-lg"><p className="text-sm text-[#f0883e] mb-2 font-semibold">⚠️ Save these somewhere safe!</p><div className="grid grid-cols-2 gap-2">{backupCodes.map((c, i) => <code key={i} className="px-2 py-1 bg-[#21262d] rounded text-[#c9d1d9] text-xs font-mono select-all">{c}</code>)}</div></div>}</div>
        </div>
      )}

      {/* ENABLED */}
      {status === "enabled" && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 space-y-6">
          <div className="flex items-start gap-4"><span className="text-3xl">🔒</span><div><h2 className="text-lg font-semibold text-[#7ee787] mb-1">Two-factor authentication is active</h2><p className="text-sm text-[#8b949e]">Your account is protected.</p></div></div>
          <div className="border-t border-[#30363d] pt-6"><h3 className="text-sm font-semibold text-[#c9d1d9] mb-3">Disable</h3>{!disabling ? <button onClick={() => setDisabling(true)} className="px-3 py-1.5 text-xs text-[#f85149] border border-[#da3633] rounded hover:bg-[#da3633]/10 transition-colors">Disable MFA</button> : <div className="flex gap-3"><input type="text" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="6-digit code" className="w-32 px-3 py-1.5 bg-[#0d1117] border border-[#30363d] rounded text-[#c9d1d9] text-sm text-center font-mono focus:border-[#58a6ff] focus:outline-none" /><button onClick={handleDisable} className="px-3 py-1.5 bg-[#da3633] hover:bg-[#f85149] text-white text-xs font-medium rounded transition-colors">Confirm</button><button onClick={() => { setDisabling(false); setCode(""); setError(""); }} className="px-3 py-1.5 text-xs text-[#8b949e] hover:text-[#c9d1d9]">Cancel</button></div>}</div>
        </div>
      )}

      {/* Info cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[["📱","Authenticator App","Google Authenticator, Authy, 1Password"],["🔑","Backup Codes","10 single-use codes. Save them somewhere safe."],["🛡️","24-Hour Sessions","MFA lasts 24h per device."]].map(([icon,title,desc]) => (
          <div key={title as string} className="p-4 bg-[#161b22] border border-[#30363d] rounded-lg"><span className="text-2xl">{icon}</span><h3 className="text-sm font-semibold text-[#c9d1d9] mt-2 mb-1">{title}</h3><p className="text-xs text-[#8b949e]">{desc}</p></div>
        ))}
      </div>
    </div>
  );
}
