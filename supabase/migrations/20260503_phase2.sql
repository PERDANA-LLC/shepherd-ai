-- ═══════════════════════════════════════════════════════════
-- Shepherd AI — Phase 2 Database Migration
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/fyflkeorqujrlgtxfbtr/sql/new
-- ═══════════════════════════════════════════════════════════

-- 1. Add journal columns for fruit tracking + privacy fields
ALTER TABLE shepherd_journals 
ADD COLUMN IF NOT EXISTS fruit_scores JSONB,
ADD COLUMN IF NOT EXISTS struggle TEXT,
ADD COLUMN IF NOT EXISTS gratitude TEXT,
ADD COLUMN IF NOT EXISTS prayer_request TEXT;

-- 2. Create fruit scores table (tracks scores over time per framework)
CREATE TABLE IF NOT EXISTS shepherd_fruit_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  journal_id UUID REFERENCES shepherd_journals(id) ON DELETE CASCADE,
  framework TEXT NOT NULL CHECK (framework IN ('galatians', 'james')),
  
  -- Galatians 5:22-23 (all 9 fruits)
  love INTEGER CHECK (love BETWEEN 1 AND 5),
  joy INTEGER CHECK (joy BETWEEN 1 AND 5),
  peace INTEGER CHECK (peace BETWEEN 1 AND 5),
  longsuffering INTEGER CHECK (longsuffering BETWEEN 1 AND 5),
  gentleness INTEGER CHECK (gentleness BETWEEN 1 AND 5),
  goodness INTEGER CHECK (goodness BETWEEN 1 AND 5),
  faith INTEGER CHECK (faith BETWEEN 1 AND 5),
  meekness INTEGER CHECK (meekness BETWEEN 1 AND 5),
  temperance INTEGER CHECK (temperance BETWEEN 1 AND 5),
  
  -- James 3:17-18 (additional attributes beyond Galatians overlap)
  pure INTEGER CHECK (pure BETWEEN 1 AND 5),
  easy_to_be_intreated INTEGER CHECK (easy_to_be_intreated BETWEEN 1 AND 5),
  full_of_mercy INTEGER CHECK (full_of_mercy BETWEEN 1 AND 5),
  without_partiality INTEGER CHECK (without_partiality BETWEEN 1 AND 5),
  without_hypocrisy INTEGER CHECK (without_hypocrisy BETWEEN 1 AND 5),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, entry_date, framework)
);

-- 3. Enable RLS
ALTER TABLE shepherd_fruit_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fruit_scores_select" ON shepherd_fruit_scores FOR SELECT USING (true);
CREATE POLICY "fruit_scores_insert" ON shepherd_fruit_scores FOR INSERT WITH CHECK (true);
CREATE POLICY "fruit_scores_update" ON shepherd_fruit_scores FOR UPDATE USING (true);
CREATE POLICY "fruit_scores_delete" ON shepherd_fruit_scores FOR DELETE USING (true);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_fruit_scores_user_date 
  ON shepherd_fruit_scores(user_id, entry_date DESC);

CREATE INDEX IF NOT EXISTS idx_fruit_scores_journal
  ON shepherd_fruit_scores(journal_id);
