import nodemailer from "nodemailer";
import { config } from "../config.js";

let transporter;

try {
  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass
    }
  });
} catch {
  console.log("Email transporter initialized in offline/dummy mode.");
}

export async function sendEmail({ to, subject, html, text }) {
  try {
    if (!transporter) return { success: false, message: "Email transporter not initialized" };
    const info = await transporter.sendMail({
      from: config.smtp.from,
      to,
      subject,
      text: text || html.replace(/<[^>]*>?/gm, ""),
      html
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.log(`[Email Service Simulation] Email to ${to} (${subject}): ${error.message}`);
    return { success: false, error: error.message };
  }
}

export async function sendWelcomeEmail(user) {
  return sendEmail({
    to: user.email,
    subject: "Welcome to Task Management!",
    html: `
      <h2>Hello ${user.name},</h2>
      <p>Welcome to your new Task Management workspace.</p>
      <p>Start creating tasks, projects, and collaborating with your team today!</p>
    `
  });
}

export async function sendPasswordResetEmail(user, resetToken) {
  const resetUrl = `${config.clientOrigin}/reset-password?token=${resetToken}`;
  return sendEmail({
    to: user.email,
    subject: "Password Reset Request",
    html: `
      <h2>Hello ${user.name},</h2>
      <p>You requested a password reset. Click the link below to set a new password:</p>
      <p><a href="${resetUrl}">Reset Your Password</a></p>
      <p>If you did not request this, please ignore this email.</p>
    `
  });
}
