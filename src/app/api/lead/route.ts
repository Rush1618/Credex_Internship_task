import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { email, companyName, role, auditUuid, isHighSavings } = await req.json();

    if (!email || !companyName || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { error } = await supabase.from('leads').insert({
      email,
      company_name: companyName,
      role,
      audit_uuid: auditUuid ?? null,
      is_high_savings: isHighSavings ?? false,
    });

    if (error) {
      console.error('Supabase lead insert error:', error);
      return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 });
    }

    // Optional: send welcome email via Resend (only if configured)
    const resendKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL;
    if (resendKey && fromEmail) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: fromEmail,
          to: email,
          subject: 'Your SpendLens AI Audit Report',
          html: `
            <h2>Hi there,</h2>
            <p>Thanks for using SpendLens! Your audit has been saved at:</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/audit/${auditUuid}">${process.env.NEXT_PUBLIC_APP_URL}/audit/${auditUuid}</a></p>
            <p>We'll be in touch with personalised savings recommendations.</p>
            <p>– The SpendLens team</p>
          `,
        });
      } catch (emailErr) {
        // Non-fatal — log and continue
        console.error('Resend email error:', emailErr);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Lead API error:', err);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
