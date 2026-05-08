import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(req: Request) {
  const supabase = getSupabaseClient(true); // use service role
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

    // --- Resend Notifications ----------------------------------------------
    const resendKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL;
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;

    if (resendKey && fromEmail) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(resendKey);
        
        // 1. Send User Report
        await resend.emails.send({
          from: fromEmail,
          to: email,
          subject: 'Your SpendLens AI Audit — Savings Report Inside',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #3b82f6;">SpendLens Audit Complete</h2>
              <p>Hi ${email.split('@')[0]},</p>
              <p>We've analysed your AI stack for <strong>${companyName}</strong> and found potential optimisations.</p>
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #64748b; font-size: 14px;">ESTIMATED ANNUAL SAVINGS</p>
                <p style="margin: 5px 0 0; color: #0f172a; font-size: 32px; font-weight: bold;">$${isHighSavings ? '6,000+' : '1,200+'}</p>
              </div>
              <p>You can access your full interactive report at any time here:</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/audit/${auditUuid}" 
                 style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                View Full Audit
              </a>
              <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;" />
              <p style="font-size: 12px; color: #94a3b8;">SpendLens is powered by Credex rocks. Stop leaking opex, start shipping products.</p>
            </div>
          `,
        });

        // 2. Send Admin Alert for High Savings
        if (isHighSavings && adminEmail) {
          await resend.emails.send({
            from: fromEmail,
            to: adminEmail,
            subject: `🔥 HIGH SAVINGS LEAD: ${companyName}`,
            html: `
              <h3>New High-Value Opportunity</h3>
              <ul>
                <li><strong>Email:</strong> ${email}</li>
                <li><strong>Company:</strong> ${companyName}</li>
                <li><strong>Role:</strong> ${role}</li>
                <li><strong>Audit UUID:</strong> ${auditUuid}</li>
              </ul>
              <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/audit/${auditUuid}">View Audit</a></p>
            `,
          });
        }
      } catch (emailErr) {
        console.error('Resend email error:', emailErr);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Lead API error:', err);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
