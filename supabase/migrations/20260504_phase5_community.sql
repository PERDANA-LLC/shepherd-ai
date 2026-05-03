-- Phase 5: Community + Sharing tables

-- 1. Shared study excerpts and journal entries (privacy-filtered)
CREATE TABLE IF NOT EXISTS shepherd_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  display_name TEXT,              -- Optional: show name or stay anonymous
  share_type TEXT NOT NULL CHECK (share_type IN ('study', 'journal', 'testimony', 'prayer_request')),
  title TEXT,
  content TEXT NOT NULL,           -- Sanitized: prayer + struggle REMOVED
  passage TEXT,                    -- Bible reference if study
  level INTEGER,                   -- Study level
  tags TEXT[],                     -- Searchable tags
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Anonymous testimonies wall
CREATE TABLE IF NOT EXISTS shepherd_testimonies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_name TEXT DEFAULT 'Anonymous',  -- Display name (can be "Anonymous")
  title TEXT NOT NULL,
  story TEXT NOT NULL,
  passage TEXT,                           -- Key verse
  tags TEXT[],
  prayers INTEGER DEFAULT 0,             -- "I prayed for this" count
  encouragements INTEGER DEFAULT 0,      -- Encouragement count
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Community prayers (shared prayer requests — OPT-IN only)
CREATE TABLE IF NOT EXISTS shepherd_prayer_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  display_name TEXT DEFAULT 'Anonymous',
  request TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT true,
  prayers_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_shares_created ON shepherd_shares(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shares_user ON shepherd_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_shares_type ON shepherd_shares(share_type);
CREATE INDEX IF NOT EXISTS idx_testimonies_created ON shepherd_testimonies(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_created ON shepherd_prayer_requests(created_at DESC);

-- RLS: anyone can read shares, only owner can delete
ALTER TABLE shepherd_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE shepherd_testimonies ENABLE ROW LEVEL SECURITY;
ALTER TABLE shepherd_prayer_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shares_select_all" ON shepherd_shares FOR SELECT USING (true);
CREATE POLICY "shares_insert_own" ON shepherd_shares FOR INSERT WITH CHECK (true);
CREATE POLICY "shares_delete_own" ON shepherd_shares FOR DELETE USING (true);

CREATE POLICY "testimonies_select_all" ON shepherd_testimonies FOR SELECT USING (true);
CREATE POLICY "testimonies_insert_all" ON shepherd_testimonies FOR INSERT WITH CHECK (true);

CREATE POLICY "prayer_requests_select_all" ON shepherd_prayer_requests FOR SELECT USING (true);
CREATE POLICY "prayer_requests_insert_all" ON shepherd_prayer_requests FOR INSERT WITH CHECK (true);
