import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { generateAuditPDF } from '@/lib/pdf-generator';
import { AuditResult } from '@/types';
import { sendEmail } from '@/lib/mail';

export async function POST(req: Request) {
  const supabase = getSupabaseClient(true); // use service role
  try {
    const { email, companyName, role, auditUuid, isHighSavings, monthlySavings, annualSavings } = await req.json();

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

    // --- Fetch Audit Data for PDF generation --------------------------------
    let pdfBuffer: Buffer | null = null;
    if (auditUuid) {
      const { data: auditData } = await supabase
        .from('audits')
        .select('audit_result, ai_summary')
        .eq('uuid', auditUuid)
        .single();

      if (auditData) {
        try {
          pdfBuffer = await generateAuditPDF(
            auditData.audit_result as AuditResult,
            auditData.ai_summary as string,
            companyName,
            email
          );
        } catch (pdfErr) {
          console.error('PDF generation error in Lead API:', pdfErr);
        }
      }
    }

    // --- Email Notifications via Shared Mail Utility ------------------------
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;

    // 1. Send User Report (PDF)
    try {
      console.log(`[LeadAPI] Sending report to: ${email} via shared utility`);
      await sendEmail({
        to: email,
        subject: 'Your SpendLens AI Audit — Savings Report Inside',
        attachments: pdfBuffer ? [
          {
            filename: `SpendLens_Audit_${auditUuid?.slice(0, 8)}.pdf`,
            content: pdfBuffer,
          }
        ] : [],
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #3b82f6;">SpendLens Audit Complete</h2>
            <p>Hi ${email.split('@')[0]},</p>
            <p>We've analysed your AI stack for <strong>${companyName}</strong> and generated your detailed Savings Report, which is attached to this email as a PDF.</p>
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #64748b; font-size: 14px;">ESTIMATED ANNUAL SAVINGS</p>
              <p style="margin: 5px 0 0; color: #0f172a; font-size: 32px; font-weight: bold;">$${Number(annualSavings).toLocaleString()}</p>
              <p style="margin: 5px 0 0; color: #3b82f6; font-size: 14px;">$${Number(monthlySavings).toLocaleString()} / month</p>
            </div>
            <p>You can also access your interactive roadmap online here:</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/audit/${auditUuid}" 
               style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
              View Interactive Roadmap
            </a>
            <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;" />
            <p style="font-size: 12px; color: #94a3b8;">SpendLens is powered by Credex rocks. Stop leaking opex, start shipping products.</p>
          </div>
        `,
      });
      console.log('[LeadAPI] User email sent successfully');
    } catch (userErr) {
      console.error('[LeadAPI] Exception sending user email:', userErr);
    }

    // 2. Send Admin Alert for High Savings
    if (isHighSavings && adminEmail) {
      try {
        console.log(`[LeadAPI] Sending admin alert to: ${adminEmail}`);
        await sendEmail({
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
        console.log('[LeadAPI] Admin email sent successfully');
      } catch (adminErr) {
        console.error('[LeadAPI] Exception sending admin email:', adminErr);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Lead API error:', err);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
