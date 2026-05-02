import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getUserId(request: NextRequest): string | null {
  // Clerk injects session via middleware — extract user ID from headers or auth
  // In Clerk v7, the session token is available via auth()
  // For now, use a simple header-based approach compatible with Clerk
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    // JWT from Clerk contains the user ID in the 'sub' claim
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

// ── GET /api/history — list user's saved studies ──────────────────

export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const url = `${SUPABASE_URL}/rest/v1/shepherd_studies?select=*&user_id=eq.${encodeURIComponent(userId)}&order=created_at.desc&limit=50`;

    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch history" }, { status: 502 });
    }

    const studies = await res.json();
    return NextResponse.json({ studies });
  } catch (error) {
    console.error("History GET error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// ── POST /api/history — save a completed study ────────────────────

export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { passage, level, level_name, content, christological_root, title } = body;

    if (!passage || !content) {
      return NextResponse.json({ error: "passage and content are required" }, { status: 400 });
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/shepherd_studies`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        user_id: userId,
        passage,
        level: level || 3,
        title: title || null,
        content,
        christological_root: christological_root || null,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Supabase insert error:", err);
      return NextResponse.json({ error: "Failed to save study" }, { status: 502 });
    }

    const saved = await res.json();
    return NextResponse.json({ success: true, id: saved?.[0]?.id });
  } catch (error) {
    console.error("History POST error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// ── DELETE /api/history — clear all studies for user ──────────────

export async function DELETE(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/shepherd_studies?user_id=eq.${encodeURIComponent(userId)}`,
      {
        method: "DELETE",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to clear history" }, { status: 502 });
    }

    return NextResponse.json({ success: true, message: "History cleared" });
  } catch (error) {
    console.error("History DELETE error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
