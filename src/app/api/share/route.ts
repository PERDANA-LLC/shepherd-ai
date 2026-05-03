import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";

// ── Share a study excerpt or journal entry (privacy enforced) ──

const BLOCKED_FIELDS = ["prayer", "struggle", "prayer_request"];

function sanitizeForSharing(content: string): string {
  // Strip any lines containing blocked field indicators
  return content
    .split("\n")
    .filter((line) => {
      const lower = line.toLowerCase();
      return !BLOCKED_FIELDS.some((f) => lower.includes(f));
    })
    .join("\n")
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { share_type, title, content, passage, level, display_name, tags } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: "Content required" }, { status: 400 });
    }

    // 🔒 Hard privacy enforcement: strip blocked fields
    const sanitized = sanitizeForSharing(content);

    const { data, error } = await supabaseAdmin
      .from("shepherd_shares")
      .insert({
        user_id: userId,
        display_name: display_name || null,
        share_type: share_type || "study",
        title: title || null,
        content: sanitized,
        passage: passage || null,
        level: level || null,
        tags: tags || [],
      })
      .select()
      .single();

    if (error) {
      console.error("Share save error:", error);
      return NextResponse.json({ error: "Failed to share" }, { status: 500 });
    }

    return NextResponse.json({ success: true, share: data });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ── List community shares ──────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const limit = parseInt(searchParams.get("limit") || "30");

    let query = supabaseAdmin
      .from("shepherd_shares")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(Math.min(limit, 50));

    if (type) {
      query = query.eq("share_type", type);
    }

    const { data, error } = await query;

    if (error) return NextResponse.json({ error: "Failed to load" }, { status: 500 });

    return NextResponse.json({ shares: data || [] });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ── Delete own share ──────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const { error } = await supabaseAdmin
      .from("shepherd_shares")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) return NextResponse.json({ error: "Failed to delete" }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
