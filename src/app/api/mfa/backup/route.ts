import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyTOTP } from "@/lib/totp";
import crypto from "crypto";

function generateBackupCodes(count = 10): string[] {
  return Array.from({ length: count }, () =>
    crypto.randomBytes(4).toString("hex").toUpperCase()
  );
}

// ── GET: View backup codes (requires TOTP or backup code verification first) ─
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: mfa, error } = await supabaseAdmin
    .from("shepherd_mfa")
    .select("backup_codes")
    .eq("user_id", userId)
    .single();

  if (error || !mfa) {
    return NextResponse.json({ error: "MFA not set up" }, { status: 400 });
  }

  return NextResponse.json({
    count: mfa.backup_codes?.length || 0,
    codes: mfa.backup_codes || [],
  });
}

// ── POST: Regenerate backup codes (requires TOTP) ────────────────────
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code } = await req.json();

  // Require TOTP verification to regenerate
  if (!code) {
    return NextResponse.json(
      { error: "TOTP code required to regenerate backup codes." },
      { status: 400 }
    );
  }

  const { data: mfa, error } = await supabaseAdmin
    .from("shepherd_mfa")
    .select("totp_secret")
    .eq("user_id", userId)
    .single();

  if (error || !mfa?.totp_secret) {
    return NextResponse.json(
      { error: "MFA not configured" },
      { status: 400 }
    );
  }

  if (!verifyTOTP(code, mfa.totp_secret)) {
    return NextResponse.json(
      { error: "Invalid TOTP code." },
      { status: 401 }
    );
  }

  // Generate new backup codes
  const backupCodes = generateBackupCodes(10);

  const { error: updateErr } = await supabaseAdmin
    .from("shepherd_mfa")
    .update({ backup_codes: backupCodes })
    .eq("user_id", userId);

  if (updateErr) {
    return NextResponse.json(
      { error: "Failed to regenerate backup codes" },
      { status: 500 }
    );
  }

  return NextResponse.json({ backupCodes });
}
