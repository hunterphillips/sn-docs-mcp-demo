import { Redis } from '@upstash/redis';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const redis = Redis.fromEnv();
  await redis.ping();

  return new Response('ok');
}
