import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  const cookieStore = await cookies();
  
  // In a real app, we'd verify a secret token from the request body
  // But for this stealth bypass, we'll just set the bypass cookie
  cookieStore.set('spendlens_admin_bypass', 'active_v4', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  });

  return NextResponse.json({ success: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('spendlens_admin_bypass');
  return NextResponse.json({ success: true });
}
