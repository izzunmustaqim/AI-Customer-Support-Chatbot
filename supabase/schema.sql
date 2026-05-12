-- =============================================
-- EECA CHATBOT — DATABASE SCHEMA
-- Run this in the Supabase SQL Editor
-- =============================================

-- 1. Conversations: Each chat session
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    started_at TIMESTAMPTZ DEFAULT now(),
    ended_at TIMESTAMPTZ,
    page_url TEXT,
    user_agent TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'ended', 'abandoned'))
);

-- 2. Messages: Every message in a conversation
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    token_count INTEGER
);

-- 3. Contact Submissions: Captured lead info
CREATE TABLE public.contact_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    phone TEXT,
    company TEXT,
    message TEXT,
    submitted_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Feedback: User satisfaction ratings
CREATE TABLE public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    submitted_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Assessment Results: Scored assessment outcomes
CREATE TABLE public.assessment_results (
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

-- =============================================
-- INDEXES for query performance
-- =============================================
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at);
CREATE INDEX idx_contacts_email ON public.contact_submissions(email);
CREATE INDEX idx_conversations_session ON public.conversations(session_id);
CREATE INDEX idx_conversations_status ON public.conversations(status);
CREATE INDEX idx_feedback_rating ON public.feedback(rating);
CREATE INDEX idx_results_conversation ON public.assessment_results(conversation_id);
CREATE INDEX idx_results_band ON public.assessment_results(readiness_band);
CREATE INDEX idx_results_score ON public.assessment_results(total_score);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (chatbot users aren't authenticated)
CREATE POLICY "anon_insert_conversations" ON public.conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_insert_messages" ON public.messages FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_insert_contacts" ON public.contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_insert_feedback" ON public.feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_insert_results" ON public.assessment_results FOR INSERT WITH CHECK (true);

-- Service role full access (for API routes and dashboard only)
CREATE POLICY "service_all_conversations" ON public.conversations FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_all_messages" ON public.messages FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_all_contacts" ON public.contact_submissions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_all_feedback" ON public.feedback FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_all_results" ON public.assessment_results FOR ALL USING (auth.role() = 'service_role');
