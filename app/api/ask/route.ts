import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import { getRatelimiter } from '@/lib/ratelimit';

export const runtime = 'nodejs';
export const maxDuration = 60;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MODEL = 'claude-haiku-4-5'; //'claude-sonnet-4-5';
const MAX_TOKENS = 1024;
const SYSTEM =
  "You are a helpful ServiceNow assistant. Answer clearly and specifically. Keep responses under 250 words. If you don't know something or lack current documentation, say so rather than guessing.";

export async function POST(req: NextRequest) {
  // Rate limiting — fails open so a Redis outage doesn't take the demo down
  const ratelimiter = getRatelimiter();
  if (ratelimiter) {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous';
    try {
      const { success } = await ratelimiter.limit(ip);
      if (!success) {
        return new Response('Rate limit reached. Please wait a moment.', {
          status: 429,
        });
      }
    } catch (err) {
      console.error('Rate limiter unavailable, allowing request:', err);
    }
  }

  const { question, mode } = await req.json();
  if (!question || !['base', 'mcp'].includes(mode)) {
    return new Response('Invalid request', { status: 400 });
  }

  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: question },
  ];

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      try {
        if (mode === 'base') {
          // Superficial delay so base doesn't finish long before MCP starts
          await new Promise((resolve) => setTimeout(resolve, 3500));
          // Plain Claude with no tools
          const stream = anthropic.messages.stream({
            model: MODEL,
            max_tokens: MAX_TOKENS,
            system: SYSTEM,
            messages,
          });
          for await (const event of stream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
        } else {
          // Claude with ServiceNow docs MCP tool access
          const stream = anthropic.beta.messages.stream({
            model: MODEL,
            max_tokens: MAX_TOKENS,
            system: SYSTEM,
            messages,
            mcp_servers: [
              {
                type: 'url',
                url: 'https://sn-doc-search.fly.dev/mcp',
                name: 'sn-docs',
                authorization_token: process.env.SN_DOCS_API_KEY,
              },
            ],
            tools: [{ type: 'mcp_toolset', mcp_server_name: 'sn-docs' }],
            betas: ['mcp-client-2025-11-20'],
          } as Parameters<typeof anthropic.beta.messages.stream>[0]);
          for await (const event of stream) {
            if (
              event.type === 'content_block_delta' &&
              'delta' in event &&
              (event.delta as { type: string }).type === 'text_delta'
            ) {
              controller.enqueue(
                encoder.encode(
                  (event.delta as { type: string; text: string }).text,
                ),
              );
            }
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Stream error';
        controller.enqueue(encoder.encode(`\n\n[Error: ${msg}]`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-cache',
    },
  });
}
