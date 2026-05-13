import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { sendEmail } from '@/lib/mail';

export async function POST(req: Request) {
  const supabase = getSupabaseClient(true); // use service role
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { error } = await supabase.from('messages').insert({
      name,
      email,
      subject: subject || 'General Inquiry',
      message,
    });

    if (error) {
      console.error('Supabase message insert error:', error);
      return NextResponse.json({ error: 'Failed to log transmission' }, { status: 500 });
    }

    // --- Email Notifications via Shared Mail Utility ------------------------
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;

    if (adminEmail) {
      try {
        console.log(`[ContactAPI] Notifying admin: ${adminEmail}`);
        await sendEmail({
          to: adminEmail,
          subject: `📩 New Message: ${subject || 'No Subject'}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h3 style="color: #6366f1;">Secure Signal Received</h3>
              <ul style="list-style: none; padding: 0;">
                <li><strong>Name:</strong> ${name}</li>
                <li><strong>Email:</strong> ${email}</li>
                <li><strong>Subject:</strong> ${subject}</li>
              </ul>
              <p><strong>Message:</strong></p>
              <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; font-style: italic;">
                ${message.replace(/\n/g, '<br/>')}
              </div>
              <hr style="margin: 20px 0; border: 0; border-top: 1px solid #eee;" />
              <p style="font-size: 10px; color: #94a3b8; text-transform: uppercase;">SpendLens System Transmission</p>
            </div>
          `,
        });
        console.log('[ContactAPI] Admin notification sent successfully');
      } catch (err) {
        console.error('[ContactAPI] Failed to send admin notification:', err);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Contact API error:', err);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
