# 📋 EECA Compliance & Readiness Assessment Tool

A production-ready AI-powered EECA (Energy Efficiency and Conservation Act) 2024 compliance assessment chatbot built with **Next.js 16**, **Vercel AI SDK v6**, **OpenAI GPT-4o-mini**, and **Supabase**.

Developed by **Sandhurst Advisory** in collaboration with **Enerlytic Intelligence**.

![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black?logo=next.js)
![AI SDK](https://img.shields.io/badge/AI%20SDK-v6-blue)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

- 📋 **EECA Readiness Assessment** — 15-question structured questionnaire (5 user info + 10 scored)
- 🤖 **AI-Powered Chat** — Streaming responses with OpenAI GPT-4o-mini
- 🔘 **Interactive Buttons** — Clickable option buttons for quiz responses
- 📊 **Scoring & Reporting** — 0–100 score with readiness bands and gap analysis
- 📖 **EECA Regulations Built-In** — Full PUA466 2024 regulations embedded for legal reference
- 🎨 **Glassmorphic UI** — Premium dark-themed design with animations
- 🧠 **Smart Intent Detection** — Classifies user queries into EECA compliance categories
- ⭐ **Feedback System** — Star ratings with optional comments
- 🔄 **Error Handling** — Retry with exponential backoff for rate limits
- 📱 **Fully Responsive** — Works on desktop, tablet, and mobile

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **AI Provider** | OpenAI GPT-4o-mini (swappable to Groq / Gemini) |
| **AI SDK** | Vercel AI SDK v6 |
| **Database** | Supabase (PostgreSQL) — optional |
| **Styling** | CSS Modules + Glassmorphism |
| **Fonts** | Inter + Space Grotesk (Google Fonts) |
| **CI/CD** | GitHub Actions |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # AI chat endpoint (streaming + retry)
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
│   │   ├── message-bubble.tsx     # Message + option button parser
│   │   ├── chat-input.tsx         # Input area
│   │   ├── feedback-modal.tsx     # Star rating modal
│   │   └── contact-form.tsx       # Lead capture form
│   └── dashboard/
│       ├── stat-card.tsx          # Metric card
│       └── intent-chart.tsx       # Intent visualization
└── lib/
    ├── ai/
    │   ├── system-prompt.ts       # EECA questionnaire + regulations
    │   └── intent-detector.ts     # AI intent classification
    └── supabase/
        ├── client.ts              # Browser client
        └── server.ts              # Server admin client
```

---

## 📋 Assessment Flow

### Section A — User Info (Q1–Q5, Not Scored)
| Question | Type |
|----------|------|
| Q1. Full name | Free text |
| Q2. Designation / role | Single choice (buttons) |
| Q3. Company name | Free text |
| Q4. Facility name | Free text |
| Q5. Contact info | Free text |

### Section B — EECA Readiness (Q6–Q15, Scored)
| Question | Topic | Max Score |
|----------|-------|-----------|
| Q6 | Facility type | 10 |
| Q7 | EECA scope | 10 |
| Q8 | Energy data availability | 10 |
| Q9 | REM appointment | 10 |
| Q10 | EnMS in place | 10 |
| Q11 | EnMS elements | 10 |
| Q12 | Internal review & training | 10 |
| Q13 | EE&C report submission | 10 |
| Q14 | Energy audit by REA | 10 |
| Q15 | Building energy performance | 10 |

### Readiness Bands
| Score | Band |
|-------|------|
| 80–100 | 🟢 High Readiness |
| 50–79 | 🟡 Moderate Readiness |
| 30–49 | 🟠 Low Readiness |
| 0–29 | 🔴 Critical Readiness Gap |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ installed
- **API Key** — one of the following:
  - OpenAI API key (paid) — [platform.openai.com](https://platform.openai.com/api-keys)
  - Groq API key (free) — [console.groq.com](https://console.groq.com/keys)
  - Google Gemini key (free) — [aistudio.google.com](https://aistudio.google.com/apikey)

### 1. Clone & Install

```bash
git clone https://github.com/izzunmustaqim/AI-Customer-Support-Chatbot.git
cd AI-Customer-Support-Chatbot
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# AI Provider (use one)
OPENAI_API_KEY=your_openai_api_key
# GROQ_API_KEY=your_groq_api_key
# GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key

# Optional: Supabase (for database features)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

> **Note:** The chatbot works with just an AI API key. Supabase is optional — it enables conversation logging, analytics, and lead capture.

### 3. Run the App

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## 🔄 Switching AI Providers

Change 2 lines in `src/app/api/chat/route.ts` and `src/lib/ai/intent-detector.ts`:

```diff
# Switch to Groq (free)
- import { openai } from '@ai-sdk/openai';
+ import { groq } from '@ai-sdk/groq';
- model: openai('gpt-4o-mini'),
+ model: groq('llama-3.3-70b-versatile'),

# Switch to Gemini (free)
- import { openai } from '@ai-sdk/openai';
+ import { google } from '@ai-sdk/google';
- model: openai('gpt-4o-mini'),
+ model: google('gemini-2.0-flash'),
```

### Supported Providers

| Provider | Package | Env Variable | Cost |
|----------|---------|-------------|------|
| OpenAI | `@ai-sdk/openai` | `OPENAI_API_KEY` | Paid ($5 min) |
| Groq | `@ai-sdk/groq` | `GROQ_API_KEY` | Free (30 req/min) |
| Google Gemini | `@ai-sdk/google` | `GOOGLE_GENERATIVE_AI_API_KEY` | Free (15 req/min) |
| Anthropic | `@ai-sdk/anthropic` | `ANTHROPIC_API_KEY` | Paid |

---

## 📦 Deployment

### Option 1: Vercel (Easiest)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import repo
3. Add `OPENAI_API_KEY` in Settings → Environment Variables
4. Deploy!

### Option 2: Self-Host with Docker

```bash
# Create .env.local with your API key
echo "OPENAI_API_KEY=sk-xxx" > .env.local

# Run
docker compose up -d
```

### Option 3: Self-Host + Cloudflare Tunnel

```bash
# 1. Run app
docker compose up -d

# 2. Create Cloudflare Tunnel
cloudflared tunnel create eeca-chatbot
cloudflared tunnel route dns eeca-chatbot eeca.yourdomain.com

# 3. Start tunnel
cloudflared tunnel run eeca-chatbot
```

---

## 🧪 Testing

```bash
npm test                # Run all tests
npm run test:coverage   # Run with coverage report
```

---

## 🗄️ Database Schema (Optional)

| Table | Purpose |
|-------|---------|
| `conversations` | Chat sessions with metadata |
| `messages` | All user and assistant messages |
| `detected_intents` | AI-classified user intents |
| `contact_submissions` | Captured leads |
| `feedback` | User ratings (1–5 stars) |

---

## 📖 Legal Reference

This app includes the full text of **P.U. (A) 466 — Energy Efficiency and Conservation Regulations 2024** embedded in the system prompt, covering:

- Energy consumption threshold (21,600 GJ)
- REM appointment requirements and qualifications
- Energy Management System (EnMS) requirements
- Energy audit and reporting obligations
- Building energy intensity labels
- Fee schedule (28 items)

---

## 📝 License

MIT License — feel free to use this for personal or commercial projects.

---

## 🙏 Acknowledgments

- [Sandhurst Advisory](https://sandhurstadvisory.com.my/) — Domain expertise
- [Vercel AI SDK](https://sdk.vercel.ai/) — AI streaming framework
- [OpenAI](https://openai.com/) — GPT-4o-mini model
- [Groq](https://groq.com/) — Ultra-fast AI inference
- [Supabase](https://supabase.com/) — Open-source Firebase alternative
- [Next.js](https://nextjs.org/) — React framework
