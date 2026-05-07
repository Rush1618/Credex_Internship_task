import { NextResponse, type NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Rate limiting — using in-memory Map for Edge-compatible lightweight limiting.
// For production scale, swap the store for @upstash/ratelimit with Redis.
// Chosen approach: sliding-window token bucket, 10 audit submissions / IP / hour.
// ---------------------------------------------------------------------------

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 10;

// In-memory store (resets on cold start — acceptable for MVP rate limiting)
const ipStore = new Map<string, RateLimitEntry>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipStore.get(ip);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    ipStore.set(ip, { count: 1, windowStart: now });
    return false;
  }

  if (entry.count >= MAX_REQUESTS) return true;

  entry.count += 1;
  return false;
}

// Paths to rate-limit
const RATE_LIMITED_PATHS = ['/api/audit', '/api/lead'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (RATE_LIMITED_PATHS.some((p) => pathname.startsWith(p))) {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      '127.0.0.1';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait before submitting again.' },
        { status: 429 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/audit', '/api/lead'],
};
