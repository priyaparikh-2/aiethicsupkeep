import nodemailer from "nodemailer";

export function isSmtpConfigured(): boolean {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export async function sendEmail(params: { to: string; subject: string; html: string }): Promise<void> {
  if (!isSmtpConfigured()) {
    throw new Error(
      "SMTP_HOST / SMTP_USER / SMTP_PASS are not set. Set them in .env to enable sending " +
        "the morning brief by email. See .env.example."
    );
  }

  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transport.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: params.to,
    subject: params.subject,
    html: params.html,
  });
}
