"use client";

import { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { CURRICULUM } from "@/lib/curriculum";

// ── Spinner ────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ── Types ─────────────────────────────────────────────────────

interface Group {
  id: string;
  name: string;
  description: string | null;
  leader_id: string;
  invite_code: string;
  study_path: string | null;
  current_module: string | null;
  is_private: boolean;
  member_count: number;
  created_at: string;
}

interface GroupMember {
  id: string;
  user_id: string;
  display_name: string | null;
  role: string;
  joined_at: string;
}

// ── Main Page ─────────────────────────────────────────────────

export default function GroupsPage() {
  const { isSignedIn, isLoaded, userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const [groups, setGroups] = useState<Group[]>([]);
  const [members, setMembers] = useState<Record<string, GroupMember[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Create form
  const [gName, setGName] = useState("");
  const [gDesc, setGDesc] = useState("");
  const [gPath, setGPath] = useState("");
  const [creating, setCreating] = useState(false);

  // Join form
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");

  // Leader guide form
  const [guidePassage, setGuidePassage] = useState("");
  const [guideLevel, setGuideLevel] = useState(2);
  const [guideResult, setGuideResult] = useState<any>(null);
  const [guideLoading, setGuideLoading] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    if (isSignedIn) loadGroups();
  }, [isSignedIn]);

  const loadGroups = async () => {
    try {
      const res = await fetch("/api/groups");
      if (res.ok) {
        const data = await res.json();
        setGroups(data.groups || []);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  const loadMembers = async (groupId: string) => {
    try {
      const res = await fetch(`/api/groups/${groupId}/members`);
      if (res.ok) {
        const data = await res.json();
        setMembers(prev => ({ ...prev, [groupId]: data.members || [] }));
      }
    } catch {}
  };

  if (!isLoaded || !isSignedIn) {
    if (!isLoaded) return <div className="min-h-screen bg-[#0d1117] flex items-center justify-center"><Spinner /></div>;
    router.push("/sign-in");
    return null;
  }

  const handleCreate = async () => {
    if (!gName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: gName, description: gDesc, study_path: gPath || null }),
      });
      if (res.ok) {
        const data = await res.json();
        setGName(""); setGDesc(""); setGPath("");
        setShowCreate(false);
        loadGroups();
        setSelectedGroup(data.group);
      } else {
        setError("Failed to create group");
      }
    } catch { setError("Connection error"); }
    finally { setCreating(false); }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setJoining(true);
    setJoinError("");
    try {
      const res = await fetch(`/api/groups?action=join&code=${joinCode.toUpperCase()}`);
      const data = await res.json();
      if (res.ok) {
        setJoinCode("");
        setShowJoin(false);
        loadGroups();
        setSelectedGroup(data.group);
      } else {
        setJoinError(data.error || "Invalid code");
      }
    } catch { setJoinError("Connection error"); }
    finally { setJoining(false); }
  };

  const handleLeave = async (groupId: string) => {
    await fetch(`/api/groups?id=${groupId}`, { method: "DELETE" });
    setSelectedGroup(null);
    loadGroups();
  };

  // Load members when group is selected
  useEffect(() => {
    if (selectedGroup) loadMembers(selectedGroup.id);
  }, [selectedGroup?.id]);

  const handleGenerateGuide = async () => {
    if (!guidePassage.trim()) return;
    setGuideLoading(true);
    setGuideResult(null);
    try {
      const res = await fetch("/api/leader-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passage: guidePassage,
          level: guideLevel,
          group_name: selectedGroup?.name,
          group_size: selectedGroup?.member_count,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setGuideResult(data.guide);
      }
    } catch {} finally {
      setGuideLoading(false);
    }
  };

  // ── Group Detail View ────────────────────────────────────
  if (selectedGroup) {
    const isLeader = selectedGroup.leader_id === userId;
    const g = selectedGroup;

    return (
      <div className="min-h-screen bg-[#0d1117] pt-6 px-4 pb-20">
        <div className="max-w-3xl mx-auto">
          <button onClick={() => setSelectedGroup(null)} className="text-[#8b949e] hover:text-[#c9d1d9] text-sm mb-4">← All Groups</button>

          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 mb-6">
            <h1 className="text-xl font-bold text-[#c9d1d9] mb-1">{g.name}</h1>
            {g.description && <p className="text-[#8b949e] text-sm mb-4">{g.description}</p>}
            <div className="flex flex-wrap gap-2 mb-4 text-xs">
              <span className="px-2.5 py-1 bg-[#21262d] rounded-full text-[#58a6ff] font-mono">Code: {g.invite_code}</span>
              <span className="px-2.5 py-1 bg-[#21262d] rounded-full text-[#8b949e]">{g.member_count} members</span>
              {g.study_path && <span className="px-2.5 py-1 bg-[#21262d] rounded-full text-[#a371f7]">{g.study_path}</span>}
              {isLeader && <span className="px-2.5 py-1 bg-[rgba(210,153,29,0.12)] rounded-full text-[#d2991d]">👑 Leader</span>}
            </div>
            {!isLeader && (
              <button onClick={() => handleLeave(g.id)} className="text-xs text-[#f85149] hover:underline">Leave Group</button>
            )}
          </div>

          {/* Members */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 mb-6">
            <h2 className="text-sm font-semibold text-[#c9d1d9] mb-4">Members</h2>
            {(members[g.id] || []).length === 0 ? (
              <p className="text-[#8b949e] text-sm">Loading members...</p>
            ) : (
              <div className="space-y-2">
                {(members[g.id] || []).map(m => (
                  <div key={m.id} className="flex items-center gap-3 text-sm">
                    <span className="text-base">{m.role === "leader" ? "👑" : m.role === "teacher" ? "🎓" : "👤"}</span>
                    <span className="text-[#c9d1d9]">{m.display_name || m.user_id?.slice(0, 8)}</span>
                    <span className="text-xs text-[#484f58] capitalize">{m.role}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Leader Guide Generator (visible to all, but meant for leaders) */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#c9d1d9]">🎓 Leader's Guide</h2>
              <button onClick={() => setShowGuide(!showGuide)} className="text-xs text-[#58a6ff] hover:underline">
                {showGuide ? "Hide" : "Generate"}
              </button>
            </div>

            {showGuide && (
              <div className="space-y-3">
                <input value={guidePassage} onChange={e => setGuidePassage(e.target.value)} placeholder="Passage (e.g. Romans 8)" className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#c9d1d9] text-sm placeholder:text-[#484f58] focus:outline-none focus:border-[#58a6ff]" />
                <div className="flex gap-2">
                  {[1,2,3,4].map(l => (
                    <button key={l} onClick={() => setGuideLevel(l)} className={`flex-1 py-1.5 rounded-lg text-xs ${guideLevel === l ? "bg-[#1f6feb] text-white" : "bg-[#21262d] text-[#8b949e]"}`}>L{l}</button>
                  ))}
                </div>
                <button onClick={handleGenerateGuide} disabled={guideLoading} className="w-full py-2 bg-[#1f6feb] hover:bg-[#388bfd] disabled:bg-[#21262d] text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2">
                  {guideLoading ? <><Spinner /> Generating...</> : "Generate Leader's Guide"}
                </button>
              </div>
            )}

            {guideResult && (
              <div className="mt-4 space-y-3 border-t border-[#21262d] pt-4">
                <h3 className="text-sm font-bold text-[#c9d1d9]">{guideResult.title}</h3>
                <p className="text-[#8b949e] text-sm">{guideResult.overview}</p>
                <div className="text-xs text-[#8b949e]"><strong>Prep:</strong> {guideResult.prep_notes}</div>
                {guideResult.session_flow && (
                  <div className="space-y-2">
                    {Object.entries(guideResult.session_flow).map(([key, val]: [string, any]) => (
                      <div key={key} className="bg-[#0d1117] rounded-lg p-3 text-sm">
                        <span className="text-[#58a6ff] font-semibold capitalize">{key}</span>
                        {val.duration && <span className="text-[#484f58] text-xs ml-2">({val.duration})</span>}
                        {val.activity && <p className="text-[#8b949e] mt-1">{val.activity}</p>}
                        {Array.isArray(val) && val.map((q: any, i: number) => (
                          <div key={i} className="mt-2">
                            <p className="text-[#c9d1d9] text-sm">{q.question}</p>
                            <p className="text-[#484f58] text-xs mt-0.5">💡 {q.leader_note}</p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
                {guideResult.christological_focus && (
                  <div className="bg-[rgba(210,153,29,0.06)] border border-[rgba(210,153,29,0.12)] rounded-lg p-3">
                    <span className="text-xs text-[#d2991d] font-semibold">✝️ Christological Focus</span>
                    <p className="text-[#8b949e] text-xs mt-1">{guideResult.christological_focus}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Group List View ──────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0d1117] pt-6 px-4 pb-20">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#c9d1d9]">👥 Study Groups</h1>
            <p className="text-[#8b949e] text-sm">Create or join a group to study together.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setShowJoin(true); setShowCreate(false); }} className="px-4 py-2 bg-[#21262d] border border-[#30363d] hover:border-[#58a6ff] text-[#c9d1d9] rounded-lg text-sm">Join</button>
            <button onClick={() => { setShowCreate(true); setShowJoin(false); }} className="px-4 py-2 bg-[#1f6feb] hover:bg-[#388bfd] text-white rounded-lg text-sm">+ New Group</button>
          </div>
        </div>

        {/* Join form */}
        {showJoin && (
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 mb-6">
            <h2 className="text-sm font-semibold text-[#c9d1d9] mb-3">Join a Group</h2>
            <div className="flex gap-3">
              <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="Enter 6-char invite code" maxLength={6} className="flex-1 px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#c9d1d9] text-sm placeholder:text-[#484f58] focus:outline-none focus:border-[#58a6ff] font-mono tracking-widest" />
              <button onClick={handleJoin} disabled={joining || joinCode.length < 6} className="px-6 py-2 bg-[#1f6feb] hover:bg-[#388bfd] disabled:bg-[#21262d] text-white rounded-lg text-sm font-semibold">{joining ? "Joining..." : "Join"}</button>
            </div>
            {joinError && <p className="text-xs text-[#f85149] mt-2">{joinError}</p>}
          </div>
        )}

        {/* Create form */}
        {showCreate && (
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 mb-6 space-y-3">
            <h2 className="text-sm font-semibold text-[#c9d1d9] mb-1">Create a Group</h2>
            <input value={gName} onChange={e => setGName(e.target.value)} placeholder="Group name *" className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#c9d1d9] text-sm placeholder:text-[#484f58] focus:outline-none focus:border-[#58a6ff]" />
            <input value={gDesc} onChange={e => setGDesc(e.target.value)} placeholder="Description (optional)" className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#c9d1d9] text-sm placeholder:text-[#484f58] focus:outline-none focus:border-[#58a6ff]" />
            <select value={gPath} onChange={e => setGPath(e.target.value)} className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#c9d1d9] text-sm focus:outline-none focus:border-[#58a6ff]">
              <option value="">No curriculum path</option>
              {CURRICULUM.map(p => <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>)}
            </select>
            <button onClick={handleCreate} disabled={creating} className="w-full py-2 bg-[#1f6feb] hover:bg-[#388bfd] disabled:bg-[#21262d] text-white rounded-lg text-sm font-semibold">{creating ? "Creating..." : "Create Group"}</button>
          </div>
        )}

        {/* My Groups */}
        {loading ? (
          <div className="text-center py-8"><Spinner /></div>
        ) : groups.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-5xl block mb-4">👥</span>
            <p className="text-[#c9d1d9] font-semibold mb-2">No groups yet</p>
            <p className="text-[#8b949e] text-sm mb-4">Create a group for your Bible study or join one with an invite code.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map(g => (
              <button key={g.id} onClick={() => setSelectedGroup(g)} className="w-full text-left bg-[#161b22] border border-[#30363d] hover:border-[#58a6ff] rounded-xl p-5 transition-all group">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold text-[#c9d1d9] group-hover:text-white">{g.name}</h3>
                  {g.leader_id === userId && <span className="text-xs text-[#d2991d]">👑 Leader</span>}
                </div>
                {g.description && <p className="text-xs text-[#8b949e] mb-2">{g.description}</p>}
                <div className="flex gap-2 text-xs">
                  <span className="text-[#8b949e]">{g.member_count} members</span>
                  <span className="text-[#484f58]">·</span>
                  <span className="text-[#58a6ff] font-mono">{g.invite_code}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
