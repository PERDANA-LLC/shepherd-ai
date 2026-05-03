import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";

// ── Generate a 6-character invite code ──────────────────────────

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ── Create a group ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, description, study_path, is_private } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Group name required" }, { status: 400 });
    }

    // Generate unique invite code
    let code = generateCode();
    let attempts = 0;
    while (attempts < 5) {
      const { data: existing } = await supabaseAdmin
        .from("shepherd_groups")
        .select("id")
        .eq("invite_code", code)
        .single();
      if (!existing) break;
      code = generateCode();
      attempts++;
    }

    // Create group
    const { data: group, error } = await supabaseAdmin
      .from("shepherd_groups")
      .insert({
        name: name.trim(),
        description: description || null,
        leader_id: userId,
        invite_code: code,
        study_path: study_path || null,
        is_private: is_private || false,
      })
      .select()
      .single();

    if (error) {
      console.error("Group create error:", error);
      return NextResponse.json({ error: "Failed to create group" }, { status: 500 });
    }

    // Add leader as first member
    await supabaseAdmin.from("shepherd_group_members").insert({
      group_id: group.id,
      user_id: userId,
      role: "leader",
    });

    return NextResponse.json({ success: true, group });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ── List my groups ─────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const inviteCode = searchParams.get("code");

    // Join by invite code
    if (action === "join" && inviteCode) {
      const { data: group, error: gErr } = await supabaseAdmin
        .from("shepherd_groups")
        .select("*")
        .eq("invite_code", inviteCode.toUpperCase())
        .single();

      if (gErr || !group) {
        return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
      }

      // Check if already a member
      const { data: existing } = await supabaseAdmin
        .from("shepherd_group_members")
        .select("id")
        .eq("group_id", group.id)
        .eq("user_id", userId)
        .single();

      if (existing) {
        return NextResponse.json({ error: "Already a member", group });
      }

      // Join
      const { error: joinErr } = await supabaseAdmin
        .from("shepherd_group_members")
        .insert({ group_id: group.id, user_id: userId, role: "member" });

      if (joinErr) return NextResponse.json({ error: "Failed to join" }, { status: 500 });

      // Update member count
      await supabaseAdmin
        .from("shepherd_groups")
        .update({ member_count: (group.member_count || 1) + 1 })
        .eq("id", group.id);

      return NextResponse.json({ success: true, group });
    }

    // List my groups (groups I belong to)
    const { data: memberships, error: memErr } = await supabaseAdmin
      .from("shepherd_group_members")
      .select("group_id")
      .eq("user_id", userId);

    if (memErr || !memberships?.length) {
      return NextResponse.json({ groups: [] });
    }

    const groupIds = memberships.map((m) => m.group_id);

    const { data: groups, error } = await supabaseAdmin
      .from("shepherd_groups")
      .select("*")
      .in("id", groupIds)
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: "Failed to load groups" }, { status: 500 });

    return NextResponse.json({ groups: groups || [] });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ── Delete/Leave group ─────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("id");
    if (!groupId) return NextResponse.json({ error: "id required" }, { status: 400 });

    // Check if user is leader
    const { data: group } = await supabaseAdmin
      .from("shepherd_groups")
      .select("leader_id")
      .eq("id", groupId)
      .single();

    if (group?.leader_id === userId) {
      // Leader deletes entire group
      await supabaseAdmin.from("shepherd_group_members").delete().eq("group_id", groupId);
      await supabaseAdmin.from("shepherd_groups").delete().eq("id", groupId);
    } else {
      // Member leaves
      await supabaseAdmin.from("shepherd_group_members")
        .delete()
        .eq("group_id", groupId)
        .eq("user_id", userId);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
