import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyTOTP } from "@/lib/totp";

// ── POST: Verify TOTP code or backup code ────────────────────────────
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code, mode }: { code: string; mode?: "totp" | "backup" | "enable" } =
    await req.json();

  if (!code || code.length < 6) {
    return NextResponse.json(
      { error: "Invalid code. Must be 6-8 characters." },
      { status: 400 }
    );
  }

  // Fetch user's MFA record
  const { data: mfa, error } = await supabaseAdmin
    .from("shepherd_mfa")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !mfa) {
    return NextResponse.json(
      { error: "MFA not set up. Visit Security settings first." },
      { status: 400 }
    );
  }

  // ── Mode: ENABLE (first-time TOTP verification) ──────────────────
  if (mode === "enable" || !mfa.mfa_enabled) {
    if (!mfa.totp_secret) {
      return NextResponse.json(
        { error: "TOTP not configured. Run setup first." },
        { status: 400 }
      );
    }

    if (!verifyTOTP(code, mfa.totp_secret)) {
      return NextResponse.json(
        { error: "Invalid verification code. Try again." },
        { status: 401 }
      );
    }

    // Enable MFA
    const { error: updateErr } = await supabaseAdmin
      .from("shepherd_mfa")
      .update({
        mfa_enabled: true,
        mfa_verified_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (updateErr) {
      console.error("MFA enable error:", updateErr);
      return NextResponse.json(
        { error: "Failed to enable MFA" },
        { status: 500 }
      );
    }

    return setMfaCookie(
      NextResponse.json({ success: true, message: "MFA enabled successfully" })
    );
  }

  // ── Mode: TOTP (login verification) ───────────────────────────────
  if (mode === "totp" || !mode) {
    if (!mfa.totp_secret) {
      return NextResponse.json({ error: "TOTP not configured" }, { status: 400 });
    }

    if (!verifyTOTP(code, mfa.totp_secret)) {
      return NextResponse.json(
        { error: "Invalid authentication code." },
        { status: 401 }
      );
    }

    await supabaseAdmin
      .from("shepherd_mfa")
      .update({ mfa_verified_at: new Date().toISOString() })
      .eq("user_id", userId);

    return setMfaCookie(
      NextResponse.json({ success: true, verified: true })
    );
  }

  // ── Mode: BACKUP code ─────────────────────────────────────────────
  if (mode === "backup") {
    if (!mfa.backup_codes || mfa.backup_codes.length === 0) {
      return NextResponse.json(
        { error: "No backup codes available." },
        { status: 400 }
      );
    }

    const normalizedCode = code.toUpperCase().trim();
    const matchIndex = mfa.backup_codes.findIndex(
      (c: string) => c === normalizedCode
    );

    if (matchIndex === -1) {
      return NextResponse.json({ error: "Invalid backup code." }, { status: 401 });
    }

    const updatedCodes = [...mfa.backup_codes];
    updatedCodes.splice(matchIndex, 1);

    await supabaseAdmin
      .from("shepherd_mfa")
      .update({
        backup_codes: updatedCodes,
        mfa_verified_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    return setMfaCookie(
      NextResponse.json({
        success: true,
        verified: true,
        backup_codes_remaining: updatedCodes.length,
      })
    );
  }

  return NextResponse.json(
    { error: "Invalid verification mode." },
    { status: 400 }
  );
}

// ── DELETE: Disable MFA ──────────────────────────────────────────────
export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code }: { code?: string } = await req.json().catch(() => ({}));

  if (code) {
    const { data: mfa } = await supabaseAdmin
      .from("shepherd_mfa")
      .select("totp_secret, backup_codes")
      .eq("user_id", userId)
      .single();

    if (mfa?.totp_secret && !verifyTOTP(code, mfa.totp_secret)) {
      const isBackup = mfa.backup_codes?.includes(code.toUpperCase().trim());
      if (!isBackup) {
        return NextResponse.json(
          { error: "Invalid code. MFA not disabled." },
          { status: 401 }
        );
      }
    }
  }

  const { error } = await supabaseAdmin
    .from("shepherd_mfa")
    .delete()
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ error: "Failed to disable MFA" }, { status: 500 });
  }

  const res = NextResponse.json({ success: true, mfa_disabled: true });
  res.cookies.set("mfa_verified", "", { maxAge: 0, path: "/" });
  res.cookies.set("mfa_enabled", "", { maxAge: 0, path: "/" });
  return res;
}

// ── Helper ───────────────────────────────────────────────────────────
function setMfaCookie(response: NextResponse): NextResponse {
  response.cookies.set("mfa_verified", "true", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  response.cookies.set("mfa_enabled", "true", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}
