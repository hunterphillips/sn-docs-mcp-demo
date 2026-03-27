# sn-docs-demo

Demo UI comparing Claude's responses with and without access to the [ServiceNow Docs MCP server](https://sn-doc-search.fly.dev). Users pick a predefined question and see both answers stream side-by-side.

## Stack

- Next.js 14 (App Router), TypeScript, Tailwind CSS
- `@anthropic-ai/sdk` — direct SDK for both base and MCP-enhanced calls
- `@upstash/ratelimit` + `@upstash/redis` — IP-based rate limiting (optional)
- Deployed on Vercel

## Structure

- `app/page.tsx` — single-page UI: question picker + two streaming comparison panels
- `app/api/ask/route.ts` — POST streaming API route; `mode=base` or `mode=mcp`
- `app/api/cron/ping/route.ts` — weekly keepalive ping for Upstash Redis (called by Vercel cron)
- `lib/questions.ts` — hardcoded demo questions (edit here to add/change questions)
- `lib/ratelimit.ts` — Upstash config; no-ops if env vars are absent
- `vercel.json` — Vercel cron schedule (weekly Redis ping)

## Development

### Setup

```bash
npm install
cp .env.local.example .env.local  # fill in ANTHROPIC_API_KEY and SN_DOCS_API_KEY
```

### Running

```bash
npm run dev   # http://localhost:3000
```

Rate limiting is disabled locally unless `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set.

### Verification

```bash
npx tsc --noEmit   # type check
npm run build      # production build
```

## Key Facts

**MCP integration**: Uses `anthropic.beta.messages.stream` with `mcp_servers` + `betas: ["mcp-client-2025-11-20"]`. Anthropic's infrastructure calls the Fly.io MCP server — no local MCP client process needed.

**Base mode**: Uses `anthropic.messages.stream` with no tools — same model, same question, no doc access.

**No freeform input**: All questions are predefined in `lib/questions.ts`. The UI has no text input.

**Auth**: `ANTHROPIC_API_KEY` and `SN_DOCS_API_KEY` are server-side only (Next.js API route). Never exposed to the browser.
