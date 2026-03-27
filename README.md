# sn-docs-demo

Demo UI comparing Claude's responses with and without access to the [ServiceNow Docs MCP server](https://sn-doc-search.fly.dev). Pick a predefined question and see both answers stream side-by-side.

## Stack

- Next.js 14 (App Router), TypeScript, Tailwind CSS
- `@anthropic-ai/sdk` — streaming API calls, base and MCP-enhanced
- `@upstash/ratelimit` + `@upstash/redis` — IP-based rate limiting (5 req/min)
- Deployed on Vercel

## Setup

```bash
npm install
cp .env.local.example .env.local
```

Fill in `.env.local`:

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key |
| `SN_DOCS_API_KEY` | Yes | Bearer token for the SN docs MCP server |
| `UPSTASH_REDIS_REST_URL` | No | Enables rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | No | Enables rate limiting |
| `CRON_SECRET` | No | Secures the `/api/cron/ping` keepalive route |

Rate limiting is disabled locally unless the Upstash vars are set.

## Development

```bash
npm run dev       # http://localhost:3000
npx tsc --noEmit  # type check
npm run build     # production build
```

## Structure

- `app/page.tsx` — single-page UI: question picker + two streaming comparison panels
- `app/api/ask/route.ts` — POST streaming API route; `mode=base` or `mode=mcp`
- `app/api/cron/ping/route.ts` — weekly keepalive ping for Upstash Redis
- `lib/questions.ts` — predefined demo questions (edit here to add/change)
- `lib/ratelimit.ts` — Upstash config; no-ops if env vars are absent
- `vercel.json` — Vercel cron schedule (weekly Redis ping)

## How it works

**Base mode**: Streams a plain Claude response with no tools.

**MCP mode**: Uses `anthropic.beta.messages.stream` with `mcp_servers` pointing to the Fly.io MCP server. Anthropic's infrastructure calls the MCP server — no local MCP client process needed.

Both modes use the same model and system prompt so the only variable is doc access.

**No freeform input**: All questions are predefined in `lib/questions.ts`. The UI has no text input field.
