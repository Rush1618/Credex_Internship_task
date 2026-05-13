import { NextResponse } from 'next/server';
import { sendEmail, verifySmtp } from '@/lib/mail';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  // 1. Verify Admin Session
  const cookieStore = await cookies();
  const bypassCookie = cookieStore.get('spendlens_admin_bypass')?.value;
  
  if (bypassCookie !== 'active_v4') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Target email required' }, { status: 400 });
    }

    // 2. Run Verify first
    const verification = await verifySmtp();
    if (!verification.success) {
      return NextResponse.json({ error: 'SMTP Verification Failed', details: verification.error }, { status: 500 });
    }

    // 3. Send Test Email
    console.log(`[AdminMailTest] Attempting test to ${email}`);
    const result = await sendEmail({
      to: email,
      subject: '📡 SpendLens Connectivity Test',
      html: `
        <div style="font-family: sans-serif; background: #000; color: #fff; padding: 40px; border-radius: 20px;">
          <h2 style="color: #a855f7;">Connection Established</h2>
          <p>This is a test signal from your SpendLens Administrative Dashboard.</p>
          <div style="background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.3); padding: 20px; border-radius: 12px; margin-top: 20px;">
            <p style="margin: 0; color: #94a3b8; font-size: 12px; text-transform: uppercase;">Node Identification</p>
            <p style="margin: 5px 0 0; font-weight: bold;">${process.env.NEXT_PUBLIC_APP_URL || 'LocalNode'}</p>
          </div>
          <hr style="margin: 30px 0; border: 0; border-top: 1px solid #333;" />
          <p style="font-size: 10px; color: #666;">SpendLens v4.0.0-Handshake</p>
        </div>
      `,
    });

    if (result.success) {
      return NextResponse.json({ ok: true, messageId: result.messageId });
    } else {
      console.error('[AdminMailTest] Mail Utility Error:', result.error);
      return NextResponse.json({ 
        ok: false,
        error: result.error || 'Unknown mailing error',
        details: result.error 
      });
    }
  } catch (err) {
    console.error('Admin mail test error:', err);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
