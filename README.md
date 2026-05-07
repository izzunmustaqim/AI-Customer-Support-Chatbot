# ⚡ EECA Compliance & Readiness Assessment Tool

A production-ready AI-powered EECA (Energy Efficiency and Conservation Act) 2024 compliance assessment chatbot built with **Next.js 16**, **Vercel AI SDK v3**, **OpenAI GPT-4o-mini**, and **Supabase**.

Developed by **Sandhurst Advisory** in collaboration with **Enerlytic Intelligence**.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![AI SDK](https://img.shields.io/badge/AI%20SDK-v3-blue)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Tests](https://img.shields.io/badge/Tests-54%20passed-brightgreen)
![License](https://img.shields.io/badge/License-MIT-green)

🔗 **Live Demo:** [ai-customer-support-chatbot-dun.vercel.app](https://ai-customer-support-chatbot-dun.vercel.app/)

📂 **Repository:** [github.com/izzunmustaqim/Compliance-Readiness-Assessment-Tool](https://github.com/izzunmustaqim/Compliance-Readiness-Assessment-Tool)

---

## ✨ Features

- 📋 **EECA Readiness Assessment** — 1 awareness question + 10 scored questions + user info collection
- 🤖 **AI-Powered Chat** — Streaming responses with OpenAI GPT-4o-mini
- 🔘 **Interactive Buttons** — Clickable option buttons & checkboxes for quiz responses
- 📊 **Scoring & Reporting** — 0–100 score with readiness bands and gap analysis
- 📖 **EECA Regulations Built-In** — Full PUA466 2024 regulations embedded for legal reference
- 🎨 **Sandhurst Corporate Theme** — Light theme with navy & green branding
- 🔄 **Session Tracking** — Every conversation linked with unique session IDs
- 📇 **Automatic Lead Generation** — Contact info extracted and saved after Section C
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
| **AI SDK** | Vercel AI SDK v3 |
| **Database** | Supabase (PostgreSQL) |
| **Styling** | CSS Modules — Sandhurst corporate light theme |
| **Fonts** | Inter + Poppins (Google Fonts) |
| **Hosting** | Vercel (auto-deploy from GitHub) |
| **CI/CD** | GitHub Actions |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # AI chat endpoint (streaming + session tracking)
│   │   ├── feedback/route.ts      # Feedback submission
│   │   ├── contact/route.ts       # Lead capture
│   │   └── analytics/route.ts     # Dashboard data
│   ├── assessment/
│   │   ├── page.tsx               # Full-page assessment chat
│   │   └── assessment.css         # Assessment styles
│   ├── dashboard/
│   │   ├── page.tsx               # Analytics dashboard
│   │   └── dashboard.css          # Dashboard styles
│   ├── globals.css                # Design system (Sandhurst theme)
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

### Greeting & Introduction
The AI greets the user, explains this is an EECA Readiness Assessment Tool by Sandhurst Advisory & Enerlytic Intelligence, then asks for name and designation.

### Section A — EECA Awareness (Not Scored)

**Q. What is your current level of awareness or exposure to the EECA requirements?**

Multiple choice (checkboxes — select all that apply):
- I have attended an ST briefing or session on EECA
- I have attended a SEDA briefing or session on EECA
- An ESCO / consultant has briefed us on EECA
- I have personally read or studied the EECA Act or guidelines
- My company has discussed EECA internally
- I have heard of EECA, but I do not know the details
- This is my first time exploring EECA requirement

### Section B — EECA Readiness (Q1–Q10, Scored)

| # | Question | Type | Max Score |
|---|----------|------|-----------|
| Q1 | Which best describes your facility? | Single choice | 10 |
| Q2 | Is your facility within the scope of EECA? (≥21,600 GJ threshold) | Single choice | 10 |
| Q3 | Do you have 12 months of organized energy data? | Single choice | 10 |
| Q4 | Has your company appointed a Registered Energy Manager (REM)? | Single choice | 10 |
| Q5 | Do you have an Energy Management System (EnMS) in place? | Single choice | 10 |
| Q6 | Which EnMS elements are already in place? | Multiple choice (checkboxes) | 10 |
| Q7 | Which energy management activities are being carried out? | Multiple choice (checkboxes) | 10 |
| Q8 | Is your facility prepared for the first EE&C Report submission? | Single choice | 10 |
| Q9 | What is your energy audit readiness status? | Single choice | 10 |
| Q10 | Are you prepared for the Energy Intensity Label (EIL) by end 2026? | Single choice | 10 |

### Readiness Bands
| Score | Band |
|-------|------|
| 80–100 | 🟢 High Readiness |
| 60–79 | 🟡 Moderate Readiness |
| 40–59 | 🟠 Low Readiness |
| 0–39 | 🔴 Critical Readiness Gap |

### After Scoring
1. AI shows full score calculation, breakdown table, and readiness band
2. AI asks: "Would you like to receive the detailed EECA Compliance Report by email?"
3. **If Yes** → Proceed to Section C
4. **If No** → Thank you and end

### Section C — User Info (Not Scored)
If user wants the detailed report, AI asks for:
- Name (compulsory)
- Designation
- Email (compulsory)
- Mobile Number (compulsory)

Contact info is **automatically extracted** and saved to the `contact_submissions` table. The AI confirms the report will be sent within 2 working days.

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

# Supabase (for database features)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

> **Note:** The chatbot works with just an AI API key. Supabase enables conversation logging, analytics, lead capture, and feedback.

### 3. Run the App

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## 🎨 Theme & Branding

The app uses **Sandhurst Advisory's corporate branding**:

| Element | Color |
|---------|-------|
| Primary (headers, nav) | Navy `#001d39` |
| Accent (buttons, options) | Green `#4CAF50` |
| Background | White `#ffffff` |
| Text | Dark `#1a1a2e` |
| Font (headings) | Poppins |
| Font (body) | Inter |

The design system is defined in `src/app/globals.css` using CSS custom properties. To customize colors, edit the `:root` variables.

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

### Option 1: Vercel (Recommended)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import repo
3. Add environment variables in Settings
4. Deploy — auto-deploys on every `git push`

> **Note:** Vercel Free is for personal use only. For commercial use, upgrade to Pro ($20/mo) or use a VPS.

### Option 2: Self-Host with Docker

```bash
# Create .env.local with your API keys
cp .env.example .env.local
nano .env.local

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
npm test                # Run all tests (54 tests)
npm run test:coverage   # Run with coverage report
```

**Test Coverage:**
- Chat input component
- Chat widget component
- Contact form component
- Feedback modal component
- Message bubble component
- Message list component
- API route handler

---

## 🗄️ Database Schema

| Table | Purpose |
|-------|---------|
| `conversations` | Chat sessions with metadata (linked by session ID) |
| `messages` | All user and assistant messages (linked to conversation) |
| `detected_intents` | AI-classified user intents (currently disabled to save costs) |
| `contact_submissions` | Auto-captured leads from Section C |
| `feedback` | User ratings (1–5 stars) with optional comments |

### Data Flow

```
User starts chat → conversation created → messages saved per turn
                                       → contact info auto-extracted (Section C)
                                       → feedback saved (star rating)
```

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

- [Sandhurst Advisory](https://sandhurstadvisory.com.my/) — Domain expertise & branding
- [Vercel AI SDK](https://sdk.vercel.ai/) — AI streaming framework
- [OpenAI](https://openai.com/) — GPT-4o-mini model
- [Groq](https://groq.com/) — Ultra-fast AI inference
- [Supabase](https://supabase.com/) — Open-source Firebase alternative
- [Next.js](https://nextjs.org/) — React framework
- [Vercel](https://vercel.com/) — Hosting & deployment
