import nodemailer from "nodemailer";
import { config } from "../config.js";

let transporter;

try {
  if (config.smtp.host && config.smtp.user && config.smtp.pass) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });
  }
} catch {
  console.log("Email transporter initialization failed — check SMTP environment variables.");
}

export async function sendEmail({ to, subject, html, text }) {
  try {
    if (!to) return { success: false, message: "Recipient email is required" };
    if (!transporter) return { success: false, message: "Email transporter not configured — set SMTP_HOST, SMTP_USER, SMTP_PASS" };

    const info = await transporter.sendMail({
      from: config.smtp.from,
      to,
      subject,
      text: text || html.replace(/<[^>]*>?/gm, ""),
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.log(`[Email Service Error] ${error.message}`);
    return { success: false, error: error.message };
  }
}

export async function sendWelcomeEmail(user) {
  return sendEmail({
    to: user.email,
    subject: "Welcome to Task Management!",
    html: `<h2>Hello ${user.name},</h2><p>Welcome to your workspace.</p>`,
  });
}

export async function sendPasswordResetEmail(user, resetToken) {
  const resetUrl = `${config.clientOrigin}/reset-password?token=${resetToken}`;
  return sendEmail({
    to: user.email,
    subject: "Password Reset Request",
    html: `<h2>Hello ${user.name},</h2><p>Reset link: <a href="${resetUrl}">${resetUrl}</a></p>`,
  });
}
