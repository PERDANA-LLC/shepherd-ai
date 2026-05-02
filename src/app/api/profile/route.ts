import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getUserId(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const token = authHeader.slice(7);
      const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
      return payload.sub || null;
    } catch {
      return null;
    }
  }
  return null;
}

// ── GET /api/profile — get or create user profile ─────────────────

export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check if profile exists
    const checkRes = await fetch(
      `${SUPABASE_URL}/rest/v1/shepherd_profiles?id=eq.${encodeURIComponent(userId)}&select=*`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    if (!checkRes.ok) {
      return NextResponse.json({ error: "Failed to check profile" }, { status: 502 });
    }

    const existing = await checkRes.json();

    if (existing && existing.length > 0) {
      return NextResponse.json({ profile: existing[0], created: false });
    }

    // Auto-create profile
    const createRes = await fetch(`${SUPABASE_URL}/rest/v1/shepherd_profiles`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        id: userId,
        display_name: "New User",
        study_level: 1,
        teacher_level: 1,
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.text();
      console.error("Profile create error:", err);
      return NextResponse.json({ error: "Failed to create profile" }, { status: 502 });
    }

    const profile = await createRes.json();
    return NextResponse.json({ profile: profile[0], created: true });
  } catch (error) {
    console.error("Profile error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
