# Supabase → VPS PostgreSQL Migration Assessment

## Verdict: 🟢 Easy (~2-3 hours of work)

Your project uses Supabase as a **dumb database** — no auth, no storage, no realtime, no edge functions. This makes the migration straightforward.

---

## What Supabase Features You're Actually Using

| Feature | Used? | Impact |
|---------|-------|--------|
| PostgreSQL Database | ✅ | Core — must replace |
| Supabase JS Client (`@supabase/supabase-js`) | ✅ | Must replace with raw `pg` or an ORM |
| Row Level Security (RLS) | ✅ | Not needed on VPS — your app is the only client |
| `auth.role()` in RLS policies | ✅ | Supabase-specific — remove entirely |
| Supabase Auth | ❌ | Not used |
| Supabase Storage | ❌ | Not used |
| Supabase Realtime | ❌ | Not used |
| Supabase Edge Functions | ❌ | Not used |

---

## Files That Need Changes

### Core DB Layer (2 files — **replace entirely**)

| File | What it does | Change needed |
|------|-------------|---------------|
| [server.ts](file:///c:/Source%20Code/AI%20chatbot/src/lib/supabase/server.ts) | Admin Supabase client | Replace with `pg` Pool connection |
| [client.ts](file:///c:/Source%20Code/AI%20chatbot/src/lib/supabase/client.ts) | Browser Supabase client | **Delete** — not actually used anywhere meaningful |

### API Routes (6 files — **moderate changes**)

All API routes use the Supabase query builder (`.from().select().eq()` etc.) which must be converted to raw SQL or an ORM.

| File | Queries | Complexity |
|------|---------|------------|
| [chat/route.ts](file:///c:/Source%20Code/AI%20chatbot/src/app/api/chat/route.ts) | ~10 queries (insert/select/update) | Medium |
| [analytics/route.ts](file:///c:/Source%20Code/AI%20chatbot/src/app/api/analytics/route.ts) | ~7 queries (select with count, filters) | Medium |
| [feedback/route.ts](file:///c:/Source%20Code/AI%20chatbot/src/app/api/feedback/route.ts) | 1-2 queries | Easy |
| [contact/route.ts](file:///c:/Source%20Code/AI%20chatbot/src/app/api/contact/route.ts) | 1-2 queries | Easy |
| [send-report/route.ts](file:///c:/Source%20Code/AI%20chatbot/src/app/api/send-report/route.ts) | 1-2 queries | Easy |
| [assessment-status/route.ts](file:///c:/Source%20Code/AI%20chatbot/src/app/api/assessment-status/route.ts) | 1-2 queries | Easy |

### Dashboard (1 file — **minor changes**)

| File | Change needed |
|------|---------------|
| [dashboard/page.tsx](file:///c:/Source%20Code/AI%20chatbot/src/app/dashboard/page.tsx) | Replace Supabase import with new DB helper |

### Config / Infra (3 files — **minor changes**)

| File | Change needed |
|------|---------------|
| [.env.local](file:///c:/Source%20Code/AI%20chatbot/.env.local) | Replace 3 Supabase vars with `DATABASE_URL` |
| [Dockerfile](file:///c:/Source%20Code/AI%20chatbot/Dockerfile) | Remove Supabase ARGs, add `DATABASE_URL` |
| [docker-compose.yml](file:///c:/Source%20Code/AI%20chatbot/docker-compose.yml) | Already has PostgreSQL service ✅ — just wire the URL |

### Schema (1 file — **minor changes**)

| File | Change needed |
|------|---------------|
| [schema.sql](file:///c:/Source%20Code/AI%20chatbot/supabase/schema.sql) | Remove RLS policies & `auth.role()` references |

### Tests (2 files — **update mocks**)

| File | Change needed |
|------|---------------|
| [supabase-server.test.ts](file:///c:/Source%20Code/AI%20chatbot/src/__tests__/lib/supabase-server.test.ts) | Rewrite for new DB module |
| [feedback.test.ts](file:///c:/Source%20Code/AI%20chatbot/src/__tests__/api/feedback.test.ts) | Update mocks |

### Auth Helper (1 file — **1 line change**)

| File | Change needed |
|------|---------------|
| [dashboard-auth.ts](file:///c:/Source%20Code/AI%20chatbot/src/lib/dashboard-auth.ts) | Change fallback secret env var name |

---

## Migration Strategy

### Option A: Raw `pg` (Recommended — minimal dependencies)

Replace `@supabase/supabase-js` with the `pg` package. Create a thin helper that wraps a connection pool.

```typescript
// src/lib/db.ts (replaces supabase/server.ts)
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function query(text: string, params?: unknown[]) {
  return pool.query(text, params);
}

export { pool };
```

**Query translation example:**
```diff
// Before (Supabase)
- const { data, error } = await supabase
-   .from('conversations')
-   .select('id')
-   .eq('session_id', sessionId)
-   .single();

// After (pg)
+ const { rows } = await query(
+   'SELECT id FROM conversations WHERE session_id = $1 LIMIT 1',
+   [sessionId]
+ );
+ const data = rows[0] || null;
```

### Option B: Drizzle ORM (type-safe, more work upfront)

More boilerplate but gives you type safety and migration tooling. Overkill for this project size.

---

## Step-by-Step Plan

1. **Install `pg`** — `npm install pg @types/pg`
2. **Create `src/lib/db.ts`** — connection pool wrapper
3. **Update `.env.local`** — add `DATABASE_URL=postgresql://eeca_user:password@localhost:5432/eeca_chatbot`
4. **Convert each API route** — replace Supabase query builder calls with raw SQL
5. **Update `docker-compose.yml`** — pass `DATABASE_URL` to the chatbot service
6. **Update `Dockerfile`** — remove Supabase build ARGs
7. **Clean up `schema.sql`** — remove RLS policies (not needed when your app is the only client)
8. **Remove `@supabase/supabase-js`** — `npm uninstall @supabase/supabase-js`
9. **Delete `src/lib/supabase/`** — no longer needed
10. **Update tests** — point mocks at new `db.ts`

---

## What You Gain

- **No external dependency** — database lives on the same VPS as your app
- **Zero latency** — localhost connections vs cross-internet to Supabase
- **No Supabase billing** — free tier limits won't be a concern
- **Full control** — backups, extensions, tuning all in your hands

## What You Lose

- **Supabase Dashboard** — no more web UI for browsing tables (use pgAdmin or DBeaver instead)
- **Managed backups** — you'll need to set up `pg_dump` cron jobs yourself
- **Auto-scaling** — you manage PostgreSQL resources

---

> [!TIP]
> Your `docker-compose.yml` **already has a PostgreSQL service** (`db` service with `postgres:16-alpine`). You're halfway there — you just need to stop pointing the app at Supabase cloud and wire it to the local container instead.

> [!IMPORTANT]
> The biggest chunk of work is converting ~20 Supabase query builder calls to raw SQL across 6 API routes. The queries themselves are simple (SELECT, INSERT, UPDATE with basic WHERE clauses) — no complex joins or stored procedures.
