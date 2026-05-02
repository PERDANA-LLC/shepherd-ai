// ═══════════════════════════════════════════════════════
// Shepherd AI — Supabase Client
// Re-exports from global client for easy imports.
// Usage: import { shepherd, supabase } from '@/lib/supabase'
// ═══════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey!)

// ── Shepherd schema helpers ──
export const db = {
  profiles: {
    get: (userId: string) =>
      supabase.from('shepherd_profiles').select('*').eq('id', userId).single(),
    create: (data: { display_name: string; email?: string; study_level?: number; teacher_level?: number }) =>
      supabase.from('shepherd_profiles').insert(data).select().single(),
    updateLevels: (userId: string, studyLevel?: number, teacherLevel?: number) =>
      supabase.from('shepherd_profiles').update({
        study_level: studyLevel,
        teacher_level: teacherLevel,
        updated_at: new Date().toISOString(),
      }).eq('id', userId),
  },
  studies: {
    list: (userId: string, limit = 20) =>
      supabase.from('shepherd_studies').select('*').eq('user_id', userId)
        .order('created_at', { ascending: false }).limit(limit),
    save: (data: { user_id: string; passage: string; level: number; content: any; title?: string; christological_root?: string }) =>
      supabase.from('shepherd_studies').insert(data).select().single(),
    get: (id: string) =>
      supabase.from('shepherd_studies').select('*').eq('id', id).single(),
  },
  workbooks: {
    list: (userId: string, limit = 20) =>
      supabase.from('shepherd_workbooks').select('*').eq('user_id', userId)
        .order('created_at', { ascending: false }).limit(limit),
    save: (data: { user_id: string; passage: string; level: number; sessions: any; title?: string; study_id?: string }) =>
      supabase.from('shepherd_workbooks').insert(data).select().single(),
  },
  journals: {
    list: (userId: string, limit = 30) =>
      supabase.from('shepherd_journals').select('*').eq('user_id', userId)
        .order('entry_date', { ascending: false }).limit(limit),
    save: (data: { user_id: string; content: string; passage?: string; prayer?: string; mood?: string }) =>
      supabase.from('shepherd_journals').insert(data).select().single(),
    update: (id: string, data: { content?: string; prayer?: string; mood?: string }) =>
      supabase.from('shepherd_journals').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id),
  },
  assessments: {
    list: (userId: string) =>
      supabase.from('shepherd_assessments').select('*').eq('user_id', userId),
    save: (data: { user_id: string; dimension: string; score: number; notes?: string }) =>
      supabase.from('shepherd_assessments').insert(data).select().single(),
  },
  progress: {
    list: (userId: string, limit = 50) =>
      supabase.from('shepherd_progress').select('*').eq('user_id', userId)
        .order('created_at', { ascending: false }).limit(limit),
    log: (data: { user_id: string; action: string; study_id?: string; workbook_id?: string; details?: any }) =>
      supabase.from('shepherd_progress').insert(data).select().single(),
  },
}
