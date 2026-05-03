import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// ── Anonymous testimonies wall ─────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { author_name, title, story, passage, tags } = body;

    if (!title?.trim() || !story?.trim()) {
      return NextResponse.json({ error: "Title and story required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("shepherd_testimonies")
      .insert({
        author_name: author_name || "Anonymous",
        title: title.trim(),
        story: story.trim(),
        passage: passage || null,
        tags: tags || [],
      })
      .select()
      .single();

    if (error) {
      console.error("Testimony save error:", error);
      return NextResponse.json({ error: "Failed to save testimony" }, { status: 500 });
    }

    return NextResponse.json({ success: true, testimony: data });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "30");

    const { data, error } = await supabaseAdmin
      .from("shepherd_testimonies")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(Math.min(limit, 50));

    if (error) return NextResponse.json({ error: "Failed to load" }, { status: 500 });

    return NextResponse.json({ testimonies: data || [] });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ── Actions: pray, encourage ──────────────────────────────────

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, action } = body;

    if (!id || !action) return NextResponse.json({ error: "id and action required" }, { status: 400 });

    const column = action === "pray" ? "prayers" : "encouragements";

    // Just increment
    const { data: current } = await supabaseAdmin
      .from("shepherd_testimonies")
      .select(column)
      .eq("id", id)
      .single();

    const newVal = ((current as any)?.[column] || 0) + 1;

    const { error } = await supabaseAdmin
      .from("shepherd_testimonies")
      .update({ [column]: newVal })
      .eq("id", id);

    if (error) return NextResponse.json({ error: "Failed to update" }, { status: 500 });

    return NextResponse.json({ success: true, count: newVal });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
