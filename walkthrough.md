# AI Chatbot — Build Walkthrough

## What Was Built

A production-ready AI chatbot application with:

- **Frontend**: Next.js 16.2.4 (App Router) with a premium glassmorphic dark-themed UI
- **AI Engine**: Google Gemini 1.5 Flash via Vercel AI SDK v6
- **Database**: Supabase (PostgreSQL) for logging conversations, messages, intents, contacts, and feedback
- **Dashboard**: Server-rendered analytics page with metrics, intent distribution, and contact table

## Architecture

```mermaid
graph LR
    A[Chat Widget] -->|sendMessage| B[useChat Hook v6]
    B -->|POST| C[/api/chat]
    C -->|streamText| D[Gemini 1.5 Flash]
    C -->|log| E[Supabase PostgreSQL]
    C -->|async| F[Intent Detector]
    F -->|generateObject| D
    F -->|log| E
```

## Key Technical Decisions

### AI SDK v6 Migration
The installed `ai@6.0.164` has **breaking changes** from v4/v5:
- `useChat` no longer provides `input`, `handleInputChange`, `handleSubmit`, or `isLoading`
- New API: `sendMessage({ text: "..." })` and `status` (`'ready' | 'submitted' | 'streaming' | 'error'`)
- Messages use `parts` array (e.g., `{ type: 'text', text: '...' }`) instead of a flat `content` string
- Response format: `toUIMessageStreamResponse()` replaces `toDataStreamResponse()`

### Lazy Supabase Initialization
Supabase clients are wrapped in getter functions (`getSupabaseAdmin()`) to prevent build-time failures when env vars contain placeholder values. This is critical for `next build` to succeed without a live Supabase instance.

## Files Created (26 files)

### Core Configuration
| File | Purpose |
|------|---------|
| [.env.local](file:///c:/Source%20Code/AI%20chatbot/.env.local) | API key template |
| [supabase/schema.sql](file:///c:/Source%20Code/AI%20chatbot/supabase/schema.sql) | Database migration (5 tables, indexes, RLS) |

### Library Layer
| File | Purpose |
|------|---------|
| [src/lib/supabase/client.ts](file:///c:/Source%20Code/AI%20chatbot/src/lib/supabase/client.ts) | Browser Supabase client (lazy) |
| [src/lib/supabase/server.ts](file:///c:/Source%20Code/AI%20chatbot/src/lib/supabase/server.ts) | Server Supabase admin client (lazy) |
| [src/lib/ai/system-prompt.ts](file:///c:/Source%20Code/AI%20chatbot/src/lib/ai/system-prompt.ts) | Configurable chatbot persona |
| [src/lib/ai/intent-detector.ts](file:///c:/Source%20Code/AI%20chatbot/src/lib/ai/intent-detector.ts) | Zod-validated intent classification |

### API Routes
| File | Purpose |
|------|---------|
| [src/app/api/chat/route.ts](file:///c:/Source%20Code/AI%20chatbot/src/app/api/chat/route.ts) | Main chat endpoint with streaming |
| [src/app/api/feedback/route.ts](file:///c:/Source%20Code/AI%20chatbot/src/app/api/feedback/route.ts) | Rating submission |
| [src/app/api/contact/route.ts](file:///c:/Source%20Code/AI%20chatbot/src/app/api/contact/route.ts) | Lead capture |
| [src/app/api/analytics/route.ts](file:///c:/Source%20Code/AI%20chatbot/src/app/api/analytics/route.ts) | Dashboard data aggregation |

### Pages
| File | Purpose |
|------|---------|
| [src/app/layout.tsx](file:///c:/Source%20Code/AI%20chatbot/src/app/layout.tsx) | Root layout with fonts + SEO |
| [src/app/globals.css](file:///c:/Source%20Code/AI%20chatbot/src/app/globals.css) | Full design system |
| [src/app/page.tsx](file:///c:/Source%20Code/AI%20chatbot/src/app/page.tsx) | Landing page |
| [src/app/dashboard/page.tsx](file:///c:/Source%20Code/AI%20chatbot/src/app/dashboard/page.tsx) | Analytics dashboard |
| [src/app/dashboard/dashboard.css](file:///c:/Source%20Code/AI%20chatbot/src/app/dashboard/dashboard.css) | Dashboard styles |

### Chat Components (6 components + 6 CSS modules)
| File | Purpose |
|------|---------|
| [chat-widget.tsx](file:///c:/Source%20Code/AI%20chatbot/src/components/chat/chat-widget.tsx) | Main container with FAB toggle |
| [message-list.tsx](file:///c:/Source%20Code/AI%20chatbot/src/components/chat/message-list.tsx) | Message renderer + typing indicator |
| [message-bubble.tsx](file:///c:/Source%20Code/AI%20chatbot/src/components/chat/message-bubble.tsx) | Individual message with copy button |
| [chat-input.tsx](file:///c:/Source%20Code/AI%20chatbot/src/components/chat/chat-input.tsx) | Auto-resize textarea |
| [feedback-modal.tsx](file:///c:/Source%20Code/AI%20chatbot/src/components/chat/feedback-modal.tsx) | Star rating modal |
| [contact-form.tsx](file:///c:/Source%20Code/AI%20chatbot/src/components/chat/contact-form.tsx) | Lead capture form |

### Dashboard Components
| File | Purpose |
|------|---------|
| [stat-card.tsx](file:///c:/Source%20Code/AI%20chatbot/src/components/dashboard/stat-card.tsx) | Metric card |
| [intent-chart.tsx](file:///c:/Source%20Code/AI%20chatbot/src/components/dashboard/intent-chart.tsx) | Horizontal bar chart |

## Database Schema

5 tables with indexes and RLS policies:

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `conversations` | Chat sessions | session_id, status, page_url |
| `messages` | All messages | conversation_id, role, content |
| `detected_intents` | AI-classified intents | intent, confidence |
| `contact_submissions` | Lead captures | name, email, company |
| `feedback` | User ratings | rating (1-5), comment |

## Verification Results

| Check | Result |
|-------|--------|
| `npm run build` | ✅ Compiled successfully, zero TypeScript errors |
| `npm run dev` | ✅ Server running at http://localhost:3000 |
| Landing page (`/`) | ✅ Hero section, features, CTA, chat FAB |
| Dashboard (`/dashboard`) | ✅ Metrics grid, intent chart, activity, contacts table |
| API routes | ✅ All 4 routes registered (chat, feedback, contact, analytics) |

## Next Steps to Go Live

### 1. Add API Keys
Edit `.env.local` with real values:
```env
GOOGLE_GENERATIVE_AI_API_KEY=your_real_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Run Database Migration
Copy the contents of `supabase/schema.sql` into the Supabase SQL Editor and execute.

### 3. Deploy to Vercel
```bash
git init && git add . && git commit -m "Initial commit"
# Push to GitHub, then connect to Vercel
```

Set the same environment variables in Vercel's project settings.
