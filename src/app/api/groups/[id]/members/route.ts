import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data, error } = await supabaseAdmin
      .from("shepherd_group_members")
      .select("*")
      .eq("group_id", id)
      .order("joined_at", { ascending: true });

    if (error) return NextResponse.json({ error: "Failed to load" }, { status: 500 });

    return NextResponse.json({ members: data || [] });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
