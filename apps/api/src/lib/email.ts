import nodemailer from "nodemailer";
import { logger } from "./logger";

let cachedTransport: nodemailer.Transporter | null = null;

function getTransport(): nodemailer.Transporter | null {
  if (cachedTransport) return cachedTransport;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST) return null;
  cachedTransport = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT ?? 587),
    secure: Number(SMTP_PORT ?? 587) === 465,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });
  return cachedTransport;
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}): Promise<{ ok: boolean; reason?: string }> {
  const transport = getTransport();
  if (!transport) {
    logger.warn({ to: opts.to, subject: opts.subject }, "SMTP not configured — skipping send");
    return { ok: false, reason: "smtp-not-configured" };
  }
  await transport.sendMail({
    from: opts.from ?? process.env.MAIL_FROM ?? "no-reply@cloudpartnerhub.com",
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  });
  return { ok: true };
}

export async function sendPasswordResetEmail(args: {
  email: string;
  name: string;
  resetToken: string;
}): Promise<void> {
  const base = process.env.PUBLIC_SITE_URL ?? "http://localhost:5173";
  const url = `${base}/admin/reset-password?token=${encodeURIComponent(args.resetToken)}`;
  await sendMail({
    to: args.email,
    subject: "Reset your Cloud Partner Hub password",
    html: `<p>Hi ${escapeHtml(args.name)},</p><p>Click the link below to reset your password. It expires in 1 hour.</p><p><a href="${url}">${url}</a></p>`,
    text: `Hi ${args.name},\n\nReset your password: ${url}\n\nThis link expires in 1 hour.`,
  });
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === '"' ? "&quot;" : "&#39;",
  );
}
