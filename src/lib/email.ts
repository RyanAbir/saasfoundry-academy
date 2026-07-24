import { Resend } from "resend";

import { siteConfig, formatBdt } from "@/lib/catalog";

// Resend is optional in dev: if RESEND_API_KEY isn't set we log and no-op so
// the payment flow still works end to end without email configured.
const apiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM ?? `${siteConfig.name} <onboarding@resend.dev>`;

const resend = apiKey ? new Resend(apiKey) : null;

export interface ReceiptEmailInput {
  to: string;
  name: string;
  courseTitle: string;
  amountBdt: number;
  transactionId: string;
}

/** Send the purchase receipt + welcome email. Safe to call unconditionally. */
export async function sendPurchaseReceipt(
  input: ReceiptEmailInput
): Promise<void> {
  if (!resend) {
    console.warn(
      "[email] RESEND_API_KEY not set — skipping receipt email to",
      input.to
    );
    return;
  }

  const { to, name, courseTitle, amountBdt, transactionId } = input;

  try {
    await resend.emails.send({
      from,
      to,
      subject: `Your ${siteConfig.name} enrollment — ${courseTitle}`,
      html: `
        <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:520px;margin:0 auto;color:#131726">
          <h2 style="margin:0 0 8px">Welcome to ${siteConfig.name} 🎉</h2>
          <p style="color:#5b6478">Hi ${escapeHtml(name)}, thanks for enrolling. Your payment is confirmed and your access is active.</p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px">
            <tr><td style="padding:8px 0;color:#5b6478">Course</td><td style="padding:8px 0;text-align:right;font-weight:600">${escapeHtml(courseTitle)}</td></tr>
            <tr><td style="padding:8px 0;color:#5b6478">Amount paid</td><td style="padding:8px 0;text-align:right;font-weight:600">${formatBdt(amountBdt)}</td></tr>
            <tr><td style="padding:8px 0;color:#5b6478">Transaction</td><td style="padding:8px 0;text-align:right;font-family:monospace">${escapeHtml(transactionId)}</td></tr>
          </table>
          <a href="${siteConfig.url}" style="display:inline-block;background:#6c5cff;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600">Go to your dashboard</a>
          <p style="color:#9aa2bd;font-size:12px;margin-top:24px">${siteConfig.name} · ${siteConfig.url}</p>
        </div>
      `,
    });
  } catch (err) {
    // Never let email failure break the payment confirmation.
    console.error("[email] Failed to send receipt:", err);
  }
}

/** Welcome email on first account creation. Safe to call unconditionally. */
export async function sendWelcomeEmail(input: { to: string; name: string }): Promise<void> {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — skipping welcome email to", input.to);
    return;
  }
  try {
    await resend.emails.send({
      from,
      to: input.to,
      subject: `Welcome to ${siteConfig.name} 👋`,
      html: `
        <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:520px;margin:0 auto;color:#131726">
          <h2 style="margin:0 0 8px">Welcome, ${escapeHtml(input.name)} 🎉</h2>
          <p style="color:#5b6478">Your ${siteConfig.name} account is ready. Browse the tracks, pick where you are, and start building toward getting paid to build.</p>
          <a href="${siteConfig.url}/pricing" style="display:inline-block;background:#6c5cff;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600;margin-top:8px">Explore the tracks</a>
          <p style="color:#9aa2bd;font-size:12px;margin-top:24px">${siteConfig.name} · ${siteConfig.url}</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("[email] Failed to send welcome:", err);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
