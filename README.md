# AI × Moving Image Research Radar

A private research-intelligence application: a daily 5-story-max briefing on
AI, moving-image culture, artist/performer rights, authorship, and consent,
plus a research library, notes, and an idea-development engine, built
against the product spec in this repo's PRD.

This is a single-user MVP. It runs entirely on your own infrastructure —
there is no hosted service, no third party sees your notes, and every LLM
call goes directly to Anthropic's API using your own key.

## Stack

- **Next.js 14 (App Router) + TypeScript** — UI and API routes
- **Prisma + Postgres** — data model (see `prisma/schema.prisma`)
- **Anthropic API (`claude-sonnet-5`)** — briefing synthesis, idea
  constellations, weekly review, Ask My Archive
- **`rss-parser`** — best-effort ingestion from the trade/news/academic
  sources in `src/lib/taxonomy.ts`
- **Nodemailer** — sends the morning brief over SMTP

## How the editorial rules are enforced

Every LLM call in the app goes through `src/lib/llm.ts`, which prepends a
single `EDITORIAL_SYSTEM_PROMPT` encoding the PRD's hard rules: never invent
quotes/authors/dates/rulings, separate neutral reporting from the labeled
"research lens," only claim consensus when independent sources actually
agree, label preprints as preprints, and avoid AI-news clichés. This is the
one place those rules live — every generator (`generateBriefing.ts`,
`ideas.ts`, `weeklyReview.ts`, `askArchive.ts`) reuses it rather than
re-implementing the policy.

## Data model

See `prisma/schema.prisma`. The core editorial unit is a **Development**
(a clustered story — several `Article` rows from different outlets can
belong to one Development, so "5 developments ≠ 5 URLs" per PRD §14). A
**Briefing** links up to 5 ranked Developments for a given day. **Highlight**
always preserves exact passage + source (never separated from provenance).
**Note** exists at three levels (ARTICLE / HIGHLIGHT / RESEARCH).
**IdeaConstellation** and **WeeklyReview** are synthesized from the library.

Enum-like fields (`Tag.tier`, `Source.sourceCategory`, `LibraryItem.status`,
`Note.type`) are plain `String` columns rather than native Postgres enums,
kept portable in case you ever want to point this at SQLite for local-only
use; allowed values are documented as comments in the schema and as
constants in `src/lib/taxonomy.ts` / `src/lib/types.ts`.

## Setup (local)

You need a Postgres instance. Easiest local option is Docker:

```bash
docker run -d --name aiethicsupkeep-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16
```

Then:

```bash
npm install
cp .env.example .env   # set DATABASE_URL to your local Postgres, and ANTHROPIC_API_KEY/SMTP_* to enable live features
npx prisma migrate dev
npm run db:seed        # loads example/demo content so the app is usable immediately
npm run dev
```

Open http://localhost:3000 — it redirects to `/today`.

Without `ANTHROPIC_API_KEY` set, the app still runs against the seeded demo
briefing/library/notes; regeneration, Ask My Archive, and the idea engine
will return a clear error telling you the key is missing rather than
silently failing.

**The seed data is illustrative**, not live editorial output. One
development (SAG-AFTRA's 2023 digital-replica contract terms) reflects
well-documented public record; the other two are explicitly marked
`[Example]` and carry a `verificationNote` saying they aren't tied to a
verified event. Replace them by running live generation once your API key
is configured.

## Running the daily pipeline

```bash
npm run brief:generate   # fetch RSS candidates -> LLM cluster/score/tag -> save today's Briefing
npm run brief:send       # render + email the latest Briefing via SMTP
npm run brief:preview    # render the latest Briefing to a local HTML file, no SMTP needed
npm run weekly:generate  # Friday (or whenever configured) research review
```

`brief:generate` fails loudly (non-zero exit) if every configured RSS feed
failed to fetch, or if `ANTHROPIC_API_KEY` is unset — it will not silently
publish an empty or stale briefing.

### Cron

The app has no built-in scheduler; wire these into your own cron (or a
serverless scheduled function) at the delivery time configured on the
Settings page:

```cron
# Daily brief, 7:00am server time
0 7 * * * cd /path/to/aiethicsupkeep && npm run brief:generate && npm run brief:send

# Weekly review, Friday 8:00am
0 8 * * 5 cd /path/to/aiethicsupkeep && npm run weekly:generate
```

## Deploying to Vercel

This needs your own Vercel account and a hosted Postgres — I can't create
either of those for you from here (no account access), but the repo is set
up so the click-path is short:

1. **Get a Postgres instance.** [Neon](https://neon.tech) has a free tier
   and is the simplest option; Vercel Postgres and Supabase also work.
   Copy the **pooled** connection string (Neon calls it the "pooled
   connection" — serverless functions open many short-lived connections,
   and the direct/unpooled string will exhaust Postgres's connection limit
   under load).
2. **Import the repo into Vercel**: vercel.com → Add New → Project → import
   `priyaparikh-2/aiethicsupkeep` → select the `claude/ai-moving-image-radar-axge3i`
   branch (or merge it to `main` first).
3. **Set environment variables** on the Vercel project (Settings →
   Environment Variables): `DATABASE_URL` (the pooled string from step 1),
   `ANTHROPIC_API_KEY`, `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS`/`SMTP_FROM`,
   `BRIEFING_RECIPIENT`, and `APP_URL` (your Vercel deployment URL, e.g.
   `https://aiethicsupkeep.vercel.app`).
4. **Deploy.** `vercel.json` in this repo already points the build command
   at `npm run vercel-build`, which runs `prisma migrate deploy` (applies
   the schema to your fresh Postgres instance) before `next build`. No
   manual migration step needed on first deploy.
5. **Seed it** (optional, for demo content): run
   `DATABASE_URL="<your pooled string>" npm run db:seed` from your own
   machine once, pointed at the hosted database.
6. **Schedule the daily brief.** `.github/workflows/daily-brief.yml` is
   already in this repo — it runs `brief:generate` + `brief:send` daily and
   `weekly:generate` on Fridays, using GitHub Actions' own scheduler (not
   Vercel, which has no free cron). Add these repo secrets under **Settings
   → Secrets and variables → Actions**: `DATABASE_URL`, `ANTHROPIC_API_KEY`,
   `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`,
   `SMTP_FROM`, `BRIEFING_RECIPIENT`, `APP_URL` — same values as the Vercel
   env vars above. Once the secrets are set, the workflow runs on its own;
   you can also trigger it manually from the **Actions** tab ("Run
   workflow") to test it immediately rather than waiting for the schedule.

## Source policy

`src/lib/taxonomy.ts` is the registry of monitored sources (PRD §6) and the
two-tier subject taxonomy (PRD §5). RSS feeds are fetched best-effort — a
dead/blocked feed is skipped and logged, not treated as a fatal error, since
several listed outlets don't expose a public feed at all. Content
farms/SEO blogs/social posts/AI-generated summaries are never added to this
registry (PRD §7); the LLM prompt in `src/lib/ingestion/synthesize.ts` is
also instructed to only cluster/score the given candidate set, never to
supplement it from outside knowledge.

## Known limitations / what's intentionally out of scope for this MVP

- **Semantic search** is implemented as keyword retrieval feeding an LLM
  reasoning pass (`askArchive.ts`), not a vector embeddings index. It's
  honest about this trade-off rather than pretending to do vector search
  without a vector store.
- **Highlighting** is a manual paste-the-passage flow, not an in-app reader
  with click-to-select on the original article (most trade/news sites
  can't legally be reframed/scraped for that; PRD §16 anticipates this by
  scoping the feature to "where technically/legalistically possible").
- **`next@14.2.35`** (latest patched 14.x) still shows one `npm audit`
  finding (AVIF RCE in the Image Optimization API); this app never uses
  `next/image` or the optimization API, so the code path isn't reachable,
  but a jump to Next 16 would be the complete fix if that's ever revisited.
- Single-user only; no auth. Don't deploy this publicly without adding it.

## Project structure

```
src/
  app/            Next.js routes (pages + API routes)
  components/     Client/server UI components
  lib/
    ingestion/    RSS fetch -> LLM cluster/score/tag -> persist Briefing
    email/        Morning-brief HTML rendering + SMTP send
    llm.ts         Single Anthropic wrapper + editorial system prompt
    taxonomy.ts     Tag taxonomy + source registry (PRD §5-6)
    ideas.ts        Idea Development Engine / constellations (PRD §19-20)
    weeklyReview.ts  Weekly Research Review generator (PRD §21)
    askArchive.ts    "Ask My Archive" retrieval + grounded answer (PRD §18)
    search.ts        Keyword search across developments/notes/highlights
scripts/          CLI entry points for cron (generate/send briefing, weekly review)
prisma/           Schema, migrations, seed data
```
