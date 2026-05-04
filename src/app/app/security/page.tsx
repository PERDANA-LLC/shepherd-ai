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
          {backupCodes.length > 0 && (
            <div className="p-4 bg-[#0d1117] border border-[#f0883e] rounded-lg">
              <p className="text-sm text-[#f0883e] mb-2 font-semibold">⚠️ Save these backup codes before enabling! You won&apos;t see them again.</p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {backupCodes.map((c, i) => <code key={i} className="px-2 py-1 bg-[#21262d] rounded text-[#c9d1d9] text-xs font-mono select-all">{c}</code>)}
              </div>
              <BackupCodeActions codes={backupCodes} />
            </div>
          )}
        </div>
      )}

      {/* ENABLED */}
      {status === "enabled" && (
        <EnabledPanel
          code={code}
          setCode={setCode}
          error={error}
          setError={setError}
          message={message}
          setMessage={setMessage}
          disabling={disabling}
          setDisabling={setDisabling}
          handleDisable={handleDisable}
        />
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

// ── Enabled Panel (shown when MFA is active) ─────────────────────────

function BackupCodeActions({ codes }: { codes: string[] }) {
  const [copied, setCopied] = useState(false);

  const text = codes.join("\n");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob(
      [`Shepherd AI — Backup Codes\n${"=" .repeat(32)}\nGenerated: ${new Date().toLocaleString()}\n\n${text}\n\nKeep these safe. Each code works once.`],
      { type: "text/plain" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shepherd-ai-backup-codes-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] border border-[#30363d] rounded transition-colors"
      >
        {copied ? (
          <>✅ Copied</>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy
          </>
        )}
      </button>
      <button
        onClick={handleDownload}
        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] border border-[#30363d] rounded transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Download
      </button>
    </div>
  );
}


function EnabledPanel({
  code, setCode, error, setError, message, setMessage,
  disabling, setDisabling, handleDisable,
}: {
  code: string; setCode: (v: string) => void;
  error: string; setError: (v: string) => void;
  message: string; setMessage: (v: string) => void;
  disabling: boolean; setDisabling: (v: boolean) => void;
  handleDisable: () => Promise<void>;
}) {
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [codeCount, setCodeCount] = useState<number | null>(null);
  const [showBackup, setShowBackup] = useState(false);
  const [regenCode, setRegenCode] = useState("");
  const [regenBusy, setRegenBusy] = useState(false);

  // Fetch backup code count on mount
  useEffect(() => {
    fetch("/api/mfa/backup")
      .then((r) => r.json())
      .then((d) => {
        if (d.count !== undefined) setCodeCount(d.count);
        if (d.codes) setBackupCodes(d.codes);
      })
      .catch(() => {});
  }, []);

  const handleViewCodes = async () => {
    setError("");
    if (!regenCode) { setError("Enter your authenticator code to view backup codes."); return; }
    setRegenBusy(true);
    try {
      // Verify first, then fetch codes
      const v = await fetch("/api/mfa/verify", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: regenCode, mode: "totp" }),
      });
      const vd = await v.json();
      if (vd.error) { setError(vd.error); return; }
      // Now fetch
      const r = await fetch("/api/mfa/backup");
      const d = await r.json();
      setBackupCodes(d.codes || []);
      setCodeCount(d.count || 0);
      setShowBackup(true);
      setRegenCode("");
    } catch { setError("Failed to load backup codes."); }
    finally { setRegenBusy(false); }
  };

  const handleRegenerate = async () => {
    setError("");
    if (!regenCode) { setError("Enter your authenticator code to regenerate."); return; }
    setRegenBusy(true);
    try {
      const r = await fetch("/api/mfa/backup", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: regenCode }),
      });
      const d = await r.json();
      if (d.error) { setError(d.error); return; }
      setBackupCodes(d.backupCodes);
      setCodeCount(d.backupCodes.length);
      setShowBackup(true);
      setRegenCode("");
      setMessage("✅ New backup codes generated! Save them now.");
    } catch { setError("Failed to regenerate."); }
    finally { setRegenBusy(false); }
  };

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 space-y-6">
      <div className="flex items-start gap-4">
        <span className="text-3xl">🔒</span>
        <div>
          <h2 className="text-lg font-semibold text-[#7ee787] mb-1">
            Two-factor authentication is active
          </h2>
          <p className="text-sm text-[#8b949e]">Your account is protected.</p>
        </div>
      </div>

      {/* ── Backup Codes ── */}
      <div className="border-t border-[#30363d] pt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[#c9d1d9]">Backup Codes</h3>
          {codeCount !== null && (
            <span className="text-xs text-[#8b949e] bg-[#21262d] px-2 py-0.5 rounded">
              {codeCount} remaining
            </span>
          )}
        </div>
        <p className="text-xs text-[#8b949e] mb-3">
          Use backup codes if you lose access to your authenticator app. Each code works once.
        </p>

        {showBackup && backupCodes.length > 0 && (
          <div className="mb-4 p-4 bg-[#0d1117] border border-[#f0883e] rounded-lg">
            <p className="text-xs text-[#f0883e] mb-2 font-semibold">
              ⚠️ Save these somewhere safe! They won&apos;t be shown again.
            </p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {backupCodes.map((c, i) => (
                <code key={i} className="px-2 py-1 bg-[#21262d] rounded text-[#c9d1d9] text-xs font-mono select-all">
                  {c}
                </code>
              ))}
            </div>
            <BackupCodeActions codes={backupCodes} />
          </div>
        )}

        <div className="flex flex-wrap gap-3 mb-2">
          <div className="flex gap-2 items-center">
            <input
              type="text" inputMode="numeric" maxLength={6}
              value={regenCode}
              onChange={(e) => setRegenCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="TOTP code"
              className="w-28 px-2 py-1.5 bg-[#0d1117] border border-[#30363d] rounded text-[#c9d1d9] text-sm text-center font-mono focus:border-[#58a6ff] focus:outline-none"
            />
            <button
              onClick={handleViewCodes}
              disabled={regenBusy || regenCode.length !== 6}
              className="px-3 py-1.5 text-xs bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] rounded transition-colors disabled:opacity-40"
            >
              View codes
            </button>
            <button
              onClick={handleRegenerate}
              disabled={regenBusy || regenCode.length !== 6}
              className="px-3 py-1.5 text-xs bg-[#1a2332] border border-[#58a6ff] text-[#58a6ff] hover:bg-[#58a6ff]/10 rounded transition-colors disabled:opacity-40"
            >
              Regenerate
            </button>
          </div>
        </div>
      </div>

      {/* ── Disable ── */}
      <div className="border-t border-[#30363d] pt-6">
        <h3 className="text-sm font-semibold text-[#c9d1d9] mb-3">Disable</h3>
        {!disabling ? (
          <button onClick={() => setDisabling(true)} className="px-3 py-1.5 text-xs text-[#f85149] border border-[#da3633] rounded hover:bg-[#da3633]/10 transition-colors">
            Disable MFA
          </button>
        ) : (
          <div className="flex gap-3">
            <input type="text" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="6-digit code" className="w-32 px-3 py-1.5 bg-[#0d1117] border border-[#30363d] rounded text-[#c9d1d9] text-sm text-center font-mono focus:border-[#58a6ff] focus:outline-none" />
            <button onClick={handleDisable} className="px-3 py-1.5 bg-[#da3633] hover:bg-[#f85149] text-white text-xs font-medium rounded transition-colors">Confirm</button>
            <button onClick={() => { setDisabling(false); setCode(""); setError(""); }} className="px-3 py-1.5 text-xs text-[#8b949e] hover:text-[#c9d1d9]">Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}
