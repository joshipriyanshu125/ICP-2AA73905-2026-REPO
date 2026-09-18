import "dotenv/config";

export const config = {
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/Task_management",
  jwtSecret: process.env.JWT_SECRET || "development-only-change-this-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",

  // Redis
  redisUrl: process.env.REDIS_URL || "redis://127.0.0.1:6379",

  // Email
  smtp: {
    host: process.env.SMTP_HOST || "smtp.mailtrap.io",
    port: Number(process.env.SMTP_PORT || 2525),
    user: process.env.SMTP_USER || "dummy_user",
    pass: process.env.SMTP_PASS || "dummy_pass",
    from: process.env.EMAIL_FROM || "noreply@taskmanagement.com"
  },

  // Push notifications
  vapid: {
    publicKey: process.env.VAPID_PUBLIC_KEY || "dummy_public_key",
    privateKey: process.env.VAPID_PRIVATE_KEY || "dummy_private_key",
    subject: process.env.VAPID_SUBJECT || "mailto:admin@taskmanagement.com"
  },

  // Upload storage
  uploadDir: process.env.UPLOAD_DIR || "./uploads"
};
