# Database Storage Flow — EECA Assessment

All database writes happen in [chat/route.ts](file:///c:/Source%20Code/AI%20chatbot/src/app/api/chat/route.ts) during the `POST` handler.

---

## Step-by-Step Flow

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant API as chat/route.ts
    participant AI as OpenAI GPT
    participant DB as Supabase

    Note over U,DB: ── STEP 1: User sends first message ──
    U->>API: POST { messages, sessionId }
    API->>DB: SELECT from conversations WHERE session_id
    Note right of DB: No existing row found
    API->>DB: INSERT into conversations { session_id, status: 'active' }
    Note right of DB: ✅ conversations (1 row created)

    Note over U,DB: ── STEP 2: Save user message ──
    API->>DB: INSERT into messages { conversation_id, role: 'user', content }
    Note right of DB: ✅ messages (user message saved)

    Note over U,DB: ── STEP 3: Stream AI response ──
    API->>AI: streamText(system prompt + messages)
    AI-->>API: streaming response...

    Note over U,DB: ── STEP 4: onFinish callback fires ──
    API->>DB: INSERT into messages { conversation_id, role: 'assistant', content }
    Note right of DB: ✅ messages (assistant message saved)

    Note over U,DB: ── Steps 2-4 repeat for each Q&A round (Q1-Q10) ──

    Note over U,DB: ── STEP 5: AI generates the assessment report ──
    AI-->>API: Response contains "XX/100" score + breakdown
    API->>API: Regex extracts total_score + q1-q10 scores
    API->>DB: INSERT into assessment_results { conversation_id, total_score, readiness_band, q1-q10 }
    Note right of DB: ✅ assessment_results (1 row created)

    Note over U,DB: ── STEP 6: User provides contact info ──
    U->>API: "John, john@email.com, +60123456789"
    API->>DB: INSERT into messages (user message)

    Note over U,DB: ── STEP 7: AI confirms receipt ──
    AI-->>API: "Thank you for the information, we will send..."
    API->>API: Regex detects "thank you" pattern
    API->>API: Extracts name, email, phone, designation from user text
    API->>DB: UPDATE assessment_results SET user_name, report_email, phone, user_designation
    Note right of DB: ✅ assessment_results (same row updated with contact info)

    Note over U,DB: ── STEP 8: Report opt-in detection ──
    U->>API: "Yes I want the detailed report via email"
    API->>API: Regex detects report preference
    API->>DB: UPDATE assessment_results SET wants_detailed_report = true
    Note right of DB: ✅ assessment_results (same row updated)
```

---

## Summary: What Gets Written Where

### `conversations` — 1 row per session
| When | Code Line | What |
|------|-----------|------|
| First message | [L90-109](file:///c:/Source%20Code/AI%20chatbot/src/app/api/chat/route.ts#L90-L109) | `session_id`, `status: 'active'`, `page_url` |

### `messages` — N rows per session (audit log)
| When | Code Line | What |
|------|-----------|------|
| Every user message | [L128-134](file:///c:/Source%20Code/AI%20chatbot/src/app/api/chat/route.ts#L128-L134) | `role: 'user'`, raw text |
| Every AI response | [L188-192](file:///c:/Source%20Code/AI%20chatbot/src/app/api/chat/route.ts#L188-L192) | `role: 'assistant'`, raw text |

### `assessment_results` — 1 row per assessment (3 writes to same row)
| When | Code Line | What |
|------|-----------|------|
| AI shows score report | [L237-251](file:///c:/Source%20Code/AI%20chatbot/src/app/api/chat/route.ts#L237-L251) | **INSERT** — `total_score`, `readiness_band`, `q1-q10_score` |
| User gives contact info | [L293-305](file:///c:/Source%20Code/AI%20chatbot/src/app/api/chat/route.ts#L293-L305) | **UPDATE** — `user_name`, `report_email`, `phone`, `user_designation` |
| User opts in/out of report | [L146-149](file:///c:/Source%20Code/AI%20chatbot/src/app/api/chat/route.ts#L146-L149) | **UPDATE** — `wants_detailed_report` |

---

## Final State: 1 Assessment = 3 Tables

```
conversations     → 1 row   (session metadata)
messages          → ~22 rows (10 user + 10 assistant + extras — raw audit log)
assessment_results → 1 row   (all structured data in one place)
```

> [!NOTE]
> `messages` is NOT a duplicate of `assessment_results`. It stores the **full conversation text** used by the report generator to produce AI analysis. `assessment_results` stores **structured, extracted fields** for the dashboard and report template.
