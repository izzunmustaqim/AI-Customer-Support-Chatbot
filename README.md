# 🤖 AI Customer Support Chatbot

A production-ready AI-powered customer support chatbot built with **Next.js 16**, **Vercel AI SDK v6**, **Groq (Llama 3.3 70B)**, and **Supabase**.

![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black?logo=next.js)
![AI SDK](https://img.shields.io/badge/AI%20SDK-v6-blue)
![Groq](https://img.shields.io/badge/Groq-Llama%203.3-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

- 🔥 **Real-time AI Chat** — Streaming responses powered by Groq (Llama 3.3 70B)
- 🎨 **Glassmorphic UI** — Premium dark-themed design with animations
- 🧠 **Smart Intent Detection** — Automatically classifies user intents (pricing, support, demo, etc.)
- 📊 **Analytics Dashboard** — Track conversations, intents, ratings, and leads
- 📝 **Lead Capture** — Built-in contact form for collecting customer details
- ⭐ **Feedback System** — Star ratings with optional comments
- ⚡ **Blazing Fast** — Groq delivers responses in under 1 second
- 📱 **Fully Responsive** — Works on desktop, tablet, and mobile

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **AI Provider** | Groq (Llama 3.3 70B Versatile) |
| **AI SDK** | Vercel AI SDK v6 |
| **Database** | Supabase (PostgreSQL) |
| **Styling** | CSS Modules + Glassmorphism |
| **Fonts** | Inter + Outfit (Google Fonts) |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # Main AI chat endpoint (streaming)
│   │   ├── feedback/route.ts      # Feedback submission
│   │   ├── contact/route.ts       # Lead capture
│   │   └── analytics/route.ts     # Dashboard data
│   ├── dashboard/
│   │   ├── page.tsx               # Analytics dashboard
│   │   └── dashboard.css          # Dashboard styles
│   ├── globals.css                # Design system
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Landing page
├── components/
│   ├── chat/
│   │   ├── chat-widget.tsx        # Main chat container + FAB
│   │   ├── message-list.tsx       # Message renderer
│   │   ├── message-bubble.tsx     # Individual message
│   │   ├── chat-input.tsx         # Input area
│   │   ├── feedback-modal.tsx     # Star rating modal
│   │   └── contact-form.tsx       # Lead capture form
│   └── dashboard/
│       ├── stat-card.tsx          # Metric card
│       └── intent-chart.tsx       # Intent visualization
└── lib/
    ├── ai/
    │   ├── system-prompt.ts       # Chatbot persona
    │   └── intent-detector.ts     # AI intent classification
    └── supabase/
        ├── client.ts              # Browser client
        └── server.ts              # Server admin client
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ installed
- **Groq API key** (free) — [Get one here](https://console.groq.com/keys)
- **Supabase account** (free, optional) — [Sign up here](https://supabase.com)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd AI-chatbot
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# Get your FREE key from: https://console.groq.com/keys
GROQ_API_KEY=your_groq_api_key

# Optional: Get these from https://supabase.com/dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

> **Note:** The chat works with just the Groq API key. Supabase is optional — it enables conversation logging, analytics, and lead capture.

### 3. Set Up Database (Optional)

If using Supabase, run the SQL migration:

1. Go to your Supabase **SQL Editor**
2. Copy the contents of `supabase/schema.sql`
3. Click **Run**

### 4. Run the App

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## 📸 Pages

| Page | URL | Description |
|------|-----|-------------|
| **Landing Page** | `/` | Hero section with chat widget |
| **Dashboard** | `/dashboard` | Analytics and metrics |

---

## 🔄 Switching AI Providers

The app uses the Vercel AI SDK, making it easy to switch providers. Just change 2 lines per file:

### Example: Switch to OpenAI

```bash
npm install @ai-sdk/openai
```

```diff
// src/app/api/chat/route.ts
- import { groq } from '@ai-sdk/groq';
+ import { openai } from '@ai-sdk/openai';

- model: groq('llama-3.3-70b-versatile'),
+ model: openai('gpt-4o-mini'),
```

### Supported Providers

| Provider | Package | Env Variable |
|----------|---------|-------------|
| Groq | `@ai-sdk/groq` | `GROQ_API_KEY` |
| Google Gemini | `@ai-sdk/google` | `GOOGLE_GENERATIVE_AI_API_KEY` |
| OpenAI | `@ai-sdk/openai` | `OPENAI_API_KEY` |
| Anthropic | `@ai-sdk/anthropic` | `ANTHROPIC_API_KEY` |
| Mistral | `@ai-sdk/mistral` | `MISTRAL_API_KEY` |

---

## 🗄️ Database Schema

| Table | Purpose |
|-------|---------|
| `conversations` | Chat sessions with metadata |
| `messages` | All user and assistant messages |
| `detected_intents` | AI-classified user intents |
| `contact_submissions` | Captured leads |
| `feedback` | User ratings (1-5 stars) |

---

## 📦 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import your repo
3. Add your environment variables in Settings
4. Deploy!

```bash
npm run build  # Verify build passes locally first
```

---

## 📝 License

MIT License — feel free to use this for personal or commercial projects.

---

## 🙏 Acknowledgments

- [Vercel AI SDK](https://sdk.vercel.ai/) — AI streaming framework
- [Groq](https://groq.com/) — Ultra-fast AI inference
- [Supabase](https://supabase.com/) — Open-source Firebase alternative
- [Next.js](https://nextjs.org/) — React framework
