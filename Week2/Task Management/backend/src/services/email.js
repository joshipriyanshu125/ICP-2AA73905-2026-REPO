import nodemailer from "nodemailer";
import { config } from "../config.js";

let transporter;

function initTransporter() {
  if (!config.smtp.host || !config.smtp.user || !config.smtp.pass) {
    console.warn("[Email] SMTP not configured - emails disabled");
    return null;
  }

  // Determine if using Gmail (port 465 = SSL, 587 = TLS)
  const isGmail = config.smtp.host.includes('gmail.com') || config.smtp.host === 'smtp.gmail.com';

  const transporterConfig = {
    host: config.smtp.host,
    port: Number(config.smtp.port) || 587,
    secure: Number(config.smtp.port) === 465, // true for SSL, false for TLS
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  };

  // Gmail requires specific secure settings
  if (isGmail) {
    transporterConfig.tls = {
      rejectUnauthorized: false,
    };
  }

  try {
    const transporter = nodemailer.createTransport(transporterConfig);
    console.log(`[Email] Transporter created: ${config.smtp.host}:${config.smtp.port}`);
    return transporter;
  } catch (error) {
    console.error("[Email] Failed to create transporter:", error.message);
    return null;
  }
}

transporter = initTransporter();

export async function sendEmail({ to, subject, html, text }) {
  try {
    if (!to) return { success: false, message: "Recipient email is required" };
    if (!transporter) return { success: false, message: "Email transporter not configured" };

    // Parse EMAIL_FROM - handle both "Name <email>" and "email" formats
    let fromAddress = config.smtp.from;
    if (!fromAddress && config.smtp.user) {
      fromAddress = config.smtp.user;
    }

    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      text: text || html?.replace(/<[^>]*>?/gm, "") || "",
      html,
    });

    console.log(`[Email] Sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Email] Failed to send to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}

export async function sendWelcomeEmail(user) {
  return sendEmail({
    to: user.email,
    subject: "Welcome to TaskFlow!",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #C25508;">Hello ${user.name},</h2>
        <p>Welcome to TaskFlow! Your account has been created successfully.</p>
        <p>You can now start creating tasks and organizing your work.</p>
        <p style="color: #666; font-size: 14px;">- The TaskFlow Team</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(user, resetToken) {
  const resetUrl = `${config.clientOrigin}/reset-password?token=${resetToken}`;
  return sendEmail({
    to: user.email,
    subject: "TaskFlow - Reset Your Password",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #C25508;">Hello ${user.name},</h2>
        <p>We received a request to reset your password.</p>
        <p>Click the button below to create a new password:</p>
        <div style="margin: 24px 0;">
          <a href="${resetUrl}" style="background: #C25508; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #666; font-size: 14px;">Or copy this link: ${resetUrl}</p>
        <p style="color: #999; font-size: 12px;">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });
}