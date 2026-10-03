import nodemailer from "nodemailer";
import { config } from "../config.js";

// Gmail SMTP configuration
const gmailUser = process.env.SMTP_USER;
const gmailPass = process.env.SMTP_PASS;

let transporter = null;

if (gmailUser && gmailPass) {
  try {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });
    console.log("[Email] Gmail transporter initialized successfully");
  } catch (error) {
    console.error("[Email] Failed to initialize Gmail transporter:", error.message);
  }
} else {
  console.warn("[Email] Gmail credentials not found in .env - emails will fail");
}

export async function sendEmail({ to, subject, html, text }) {
  if (!transporter) {
    console.error("[Email] Transporter not available - check SMTP_USER and SMTP_PASS in .env");
    return { success: false, message: "Email service not configured" };
  }

  if (!to) {
    return { success: false, message: "Recipient email is required" };
  }

  try {
    const info = await transporter.sendMail({
      from: config.smtp.from || `"TaskFlow" <${gmailUser}>`,
      to,
      subject,
      text: text || html?.replace(/<[^>]*>?/gm, "") || "",
      html,
    });

    console.log(`[Email] Sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Email] Failed to send to ${to}:`, error.message);

    // Handle Gmail specific errors
    if (error.code === 'EAUTH') {
      console.error("[Email] Authentication failed - check Gmail app password settings");
    }

    return { success: false, error: error.message };
  }
}

export async function sendWelcomeEmail(user) {
  return sendEmail({
    to: user.email,
    subject: "Welcome to TaskFlow!",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto;">
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
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #C25508;">Hello ${user.name},</h2>
        <p>We received a request to reset your password for your TaskFlow account.</p>
        <p>Click the button below to create a new password:</p>
        <div style="margin: 32px 0; text-align: center;">
          <a href="${resetUrl}" style="background: #C25508; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
        <p style="background: #f5f5f5; padding: 12px; border-radius: 6px; word-break: break-all; font-size: 12px;">${resetUrl}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
        <p style="color: #999; font-size: 12px;">This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
      </div>
    `,
  });
}
