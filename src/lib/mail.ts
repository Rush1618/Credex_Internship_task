import nodemailer from 'nodemailer';
import { Resend } from 'resend';

// Initialize Providers
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const mailersendKey = process.env.MAILERSEND_API_KEY;

export interface MailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
  }>;
}

export async function sendEmail(options: MailOptions) {
  const fromEmail = process.env.EMAIL_FROM_ADDRESS || 'info@test-z0vklo65owxl7qrx.mlsender.net';
  const fromName = process.env.EMAIL_FROM_NAME || 'SpendLens';

  // --- Priority 1: MailerSend (REST API) ------------------------------------
  if (mailersendKey) {
    try {
      console.log(`[Mail] Using MailerSend REST API for ${options.to}`);
      
      const payload = {
        from: { email: fromEmail, name: fromName },
        to: [{ email: options.to }],
        subject: options.subject,
        html: options.html,
        attachments: options.attachments?.map(a => ({
          filename: a.filename,
          content: (a.content instanceof Buffer ? a.content : Buffer.from(a.content)).toString('base64'),
          disposition: 'attachment',
        }))
      };

      const res = await fetch('https://api.mailersend.com/v1/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mailersendKey}`,
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(`MailerSend API Error (${res.status}): ${errorData}`);
      }

      const responseId = res.headers.get('X-Message-Id') || 'success';
      return { success: true, messageId: responseId };
    } catch (error) {
      console.error(`[Mail] MailerSend Failure:`, error);
      // Fallback to other providers
    }
  }

  // --- Priority 2: Resend API -----------------------------------------------
  if (resend) {
    try {
      console.log(`[Mail] Using Resend API for ${options.to}`);
      const { data, error } = await resend.emails.send({
        from: `"${fromName}" <${fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        attachments: options.attachments?.map(a => ({
          filename: a.filename,
          content: a.content instanceof Buffer ? a.content : Buffer.from(a.content),
        })),
      });

      if (error) throw error;
      return { success: true, messageId: data?.id };
    } catch (error) {
      console.error(`[Mail] Resend error:`, error);
    }
  }

  // --- Priority 3: SMTP Fallback --------------------------------------------
  const host = process.env.EMAIL_SERVER_HOST;
  const port = parseInt(process.env.EMAIL_SERVER_PORT || '587');
  const user = process.env.EMAIL_SERVER_USER;
  const pass = process.env.EMAIL_SERVER_PASSWORD;

  if (host && user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });

      const info = await transporter.sendMail({
        from: `"${fromName}" <${user}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        attachments: options.attachments,
      });

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`[Mail] SMTP error:`, error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  return { success: false, error: 'No mail provider configured (Check .env keys)' };
}

export async function verifySmtp() {
  if (mailersendKey) return { success: true, provider: 'MailerSend API' };
  if (resend) return { success: true, provider: 'Resend API' };

  const host = process.env.EMAIL_SERVER_HOST;
  const port = parseInt(process.env.EMAIL_SERVER_PORT || '587');
  const user = process.env.EMAIL_SERVER_USER;
  const pass = process.env.EMAIL_SERVER_PASSWORD;

  if (!host || !user || !pass) return { success: false, error: 'Config missing' };

  try {
    const transporter = nodemailer.createTransport({
      host, port, secure: port === 465, auth: { user, pass }
    });
    await transporter.verify();
    return { success: true, provider: 'SMTP' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
