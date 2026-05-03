import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabaseAdmin
      .from("shepherd_journals")
      .select("*")
      .eq("user_id", userId)
      .order("entry_date", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Journal list error:", error);
      return NextResponse.json({ error: "Failed to load journals" }, { status: 500 });
    }

    return NextResponse.json({ journals: data || [] });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const entry = {
      user_id: userId,
      passage: body.passage || null,
      content: body.content || "",
      struggle: body.struggle || null,
      gratitude: body.gratitude || null,
      prayer_request: body.prayer_request || null,
      fruit_scores: body.fruit_scores || null,
      mood: body.mood || null,
      entry_date: body.entry_date || new Date().toISOString().split("T")[0],
    };

    const { data, error } = await supabaseAdmin
      .from("shepherd_journals")
      .insert(entry)
      .select()
      .single();

    if (error) {
      console.error("Journal save error:", error);
      return NextResponse.json({ error: "Failed to save journal" }, { status: 500 });
    }

    // Also save fruit scores to dedicated table if present
    if (body.fruit_scores) {
      const date = entry.entry_date;
      for (const framework of ["galatians", "james"]) {
        const scores = body.fruit_scores[framework];
        if (scores) {
          await supabaseAdmin.from("shepherd_fruit_scores").upsert(
            {
              user_id: userId,
              entry_date: date,
              journal_id: data.id,
              framework,
              ...scores,
            },
            { onConflict: "user_id,entry_date,framework" }
          );
        }
      }
    }

    return NextResponse.json({ success: true, journal: data });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const { error } = await supabaseAdmin
      .from("shepherd_journals")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("Journal delete error:", error);
      return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
