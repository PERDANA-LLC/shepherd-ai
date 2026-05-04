import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { generateSecret, buildOTPAuthURI } from "@/lib/totp";
import crypto from "crypto";

// ── Generate backup codes ────────────────────────────────────────────
function generateBackupCodes(count = 10): string[] {
  return Array.from({ length: count }, () =>
    crypto.randomBytes(4).toString("hex").toUpperCase()
  );
}

// ── POST: Set up MFA (generate secret + backup codes) ────────────────
export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if MFA already enabled
  const { data: existing } = await supabaseAdmin
    .from("shepherd_mfa")
    .select("mfa_enabled")
    .eq("user_id", userId)
    .single();

  if (existing?.mfa_enabled) {
    return NextResponse.json(
      { error: "MFA is already enabled. Disable it first to set up again." },
      { status: 400 }
    );
  }

  // Generate TOTP secret
  const secret = generateSecret();
  const otpauth = buildOTPAuthURI(secret, userId);

  // Generate backup codes
  const backupCodes = generateBackupCodes(10);

  // Upsert MFA record (setup state — not yet enabled)
  const { error } = await supabaseAdmin.from("shepherd_mfa").upsert(
    {
      user_id: userId,
      mfa_enabled: false,
      totp_secret: secret,
      backup_codes: backupCodes,
      mfa_verified_at: null,
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error("MFA setup error:", error);
    return NextResponse.json(
      { error: "Failed to save MFA configuration" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    secret,
    otpauth,
    backupCodes,
  });
}

// ── GET: Check MFA status ────────────────────────────────────────────
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("shepherd_mfa")
    .select("mfa_enabled, mfa_verified_at")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return NextResponse.json({ mfa_enabled: false });
  }

  return NextResponse.json({
    mfa_enabled: data.mfa_enabled,
    mfa_verified_at: data.mfa_verified_at,
  });
}
