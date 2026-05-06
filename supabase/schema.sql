-- =============================================
-- AI CHATBOT — DATABASE SCHEMA
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

-- 3. Detected Intents: AI-classified user intents
CREATE TABLE public.detected_intents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
    intent TEXT NOT NULL,
    confidence REAL,
    message_text TEXT,
    detected_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Contact Submissions: Captured lead info
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

-- 5. Feedback: User satisfaction ratings
CREATE TABLE public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    submitted_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- INDEXES for query performance
-- =============================================
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at);
CREATE INDEX idx_intents_conversation ON public.detected_intents(conversation_id);
CREATE INDEX idx_intents_type ON public.detected_intents(intent);
CREATE INDEX idx_contacts_email ON public.contact_submissions(email);
CREATE INDEX idx_conversations_session ON public.conversations(session_id);
CREATE INDEX idx_conversations_status ON public.conversations(status);
CREATE INDEX idx_feedback_rating ON public.feedback(rating);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detected_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (chatbot users aren't authenticated)
CREATE POLICY "anon_insert_conversations" ON public.conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_insert_messages" ON public.messages FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_insert_intents" ON public.detected_intents FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_insert_contacts" ON public.contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_insert_feedback" ON public.feedback FOR INSERT WITH CHECK (true);

-- Service role full access (for API routes and dashboard)
CREATE POLICY "service_all_conversations" ON public.conversations FOR ALL USING (true);
CREATE POLICY "service_all_messages" ON public.messages FOR ALL USING (true);
CREATE POLICY "service_all_intents" ON public.detected_intents FOR ALL USING (true);
CREATE POLICY "service_all_contacts" ON public.contact_submissions FOR ALL USING (true);
CREATE POLICY "service_all_feedback" ON public.feedback FOR ALL USING (true);
