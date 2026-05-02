import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 10;

// ── Save accepted recommendation to Supabase ───────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { passage, level, tier, label, action, next_passage, reason, description } = body;

    if (!passage || !tier || !action) {
      return NextResponse.json({ error: "passage, tier, and action are required" }, { status: 400 });
    }

    // Get user ID from Clerk auth
    const authHeader = request.headers.get("authorization");
    let userId = "anonymous";

    try {
      // In production, Clerk injects session via middleware
      // For now, use a placeholder or extract from Clerk session
      const { auth } = await import("@clerk/nextjs/server");
      const session = await auth();
      if (session.userId) userId = session.userId;
    } catch {
      // Not authenticated or Clerk not available — use anonymous
    }

    // Save to Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const res = await fetch(`${supabaseUrl}/rest/v1/shepherd_recommendations`, {
      method: "POST",
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation",
      },
      body: JSON.stringify({
        user_id: userId,
        passage,
        level: level || 3,
        tier,
        label,
        description: description || "",
        action,
        next_passage: next_passage || null,
        reason: reason || "",
        status: "accepted",
        accepted_at: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Supabase insert error:", errText);
      return NextResponse.json({ error: "Failed to save recommendation" }, { status: 502 });
    }

    const saved = await res.json();

    return NextResponse.json({
      success: true,
      id: saved?.[0]?.id,
      message: "Recommendation accepted and journaled",
    });
  } catch (error) {
    console.error("Accept recommend error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
