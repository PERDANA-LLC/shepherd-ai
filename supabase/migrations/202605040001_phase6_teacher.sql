-- Phase 6: Teacher Tools + TONA Group tables

-- 1. Study groups
CREATE TABLE IF NOT EXISTS shepherd_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  leader_id TEXT NOT NULL,           -- Clerk user ID of group leader
  invite_code TEXT UNIQUE NOT NULL,  -- 6-char code for joining
  study_path TEXT,                   -- Curriculum path the group is following
  current_module TEXT,               -- Current module ID
  is_private BOOLEAN DEFAULT false,
  member_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Group members
CREATE TABLE IF NOT EXISTS shepherd_group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES shepherd_groups(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  display_name TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('leader', 'teacher', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- 3. Leader guides
CREATE TABLE IF NOT EXISTS shepherd_leader_guides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  group_id UUID REFERENCES shepherd_groups(id) ON DELETE SET NULL,
  passage TEXT NOT NULL,
  title TEXT,
  level INTEGER,
  guide JSONB NOT NULL,             -- Full guide content
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_groups_leader ON shepherd_groups(leader_id);
CREATE INDEX IF NOT EXISTS idx_groups_code ON shepherd_groups(invite_code);
CREATE INDEX IF NOT EXISTS idx_group_members_group ON shepherd_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON shepherd_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_leader_guides_user ON shepherd_leader_guides(user_id);
CREATE INDEX IF NOT EXISTS idx_leader_guides_group ON shepherd_leader_guides(group_id);

-- RLS
ALTER TABLE shepherd_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE shepherd_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE shepherd_leader_guides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "groups_select_all" ON shepherd_groups FOR SELECT USING (true);
CREATE POLICY "groups_insert_own" ON shepherd_groups FOR INSERT WITH CHECK (true);
CREATE POLICY "groups_update_own" ON shepherd_groups FOR UPDATE USING (true);
CREATE POLICY "groups_delete_own" ON shepherd_groups FOR DELETE USING (true);

CREATE POLICY "members_select_all" ON shepherd_group_members FOR SELECT USING (true);
CREATE POLICY "members_insert_all" ON shepherd_group_members FOR INSERT WITH CHECK (true);
CREATE POLICY "members_delete_own" ON shepherd_group_members FOR DELETE USING (true);

CREATE POLICY "guides_select_own" ON shepherd_leader_guides FOR SELECT USING (true);
CREATE POLICY "guides_insert_own" ON shepherd_leader_guides FOR INSERT WITH CHECK (true);
CREATE POLICY "guides_delete_own" ON shepherd_leader_guides FOR DELETE USING (true);
