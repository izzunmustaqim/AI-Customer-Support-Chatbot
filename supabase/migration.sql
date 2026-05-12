-- =============================================
-- MIGRATION: Remove detected_intents, Add assessment_results, Fix RLS
-- Run this in Supabase SQL Editor if tables already exist
-- =============================================

-- Step 1: Create assessment_results table
CREATE TABLE IF NOT EXISTS public.assessment_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_name TEXT,
    user_designation TEXT,
    total_score INTEGER CHECK (total_score >= 0 AND total_score <= 100),
    readiness_band TEXT CHECK (readiness_band IN ('High', 'Moderate', 'Low', 'Critical')),
    q1_score INTEGER DEFAULT 0,
    q2_score INTEGER DEFAULT 0,
    q3_score INTEGER DEFAULT 0,
    q4_score INTEGER DEFAULT 0,
    q5_score INTEGER DEFAULT 0,
    q6_score INTEGER DEFAULT 0,
    q7_score INTEGER DEFAULT 0,
    q8_score INTEGER DEFAULT 0,
    q9_score INTEGER DEFAULT 0,
    q10_score INTEGER DEFAULT 0,
    terminated_at_q2 BOOLEAN DEFAULT false,
    wants_detailed_report BOOLEAN,
    completed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_results_conversation ON public.assessment_results(conversation_id);
CREATE INDEX IF NOT EXISTS idx_results_band ON public.assessment_results(readiness_band);
CREATE INDEX IF NOT EXISTS idx_results_score ON public.assessment_results(total_score);

-- Step 3: Enable RLS on new table
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert_results" ON public.assessment_results FOR INSERT WITH CHECK (true);
CREATE POLICY "service_all_results" ON public.assessment_results FOR ALL USING (auth.role() = 'service_role');

-- Step 4: Fix existing RLS policies (restrict service-role-only access)
-- Drop old permissive policies
DROP POLICY IF EXISTS "service_all_conversations" ON public.conversations;
DROP POLICY IF EXISTS "service_all_messages" ON public.messages;
DROP POLICY IF EXISTS "service_all_contacts" ON public.contact_submissions;
DROP POLICY IF EXISTS "service_all_feedback" ON public.feedback;

-- Recreate with service_role restriction
CREATE POLICY "service_all_conversations" ON public.conversations FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_all_messages" ON public.messages FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_all_contacts" ON public.contact_submissions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_all_feedback" ON public.feedback FOR ALL USING (auth.role() = 'service_role');
