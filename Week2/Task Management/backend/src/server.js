import path from "path";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import { config } from "./config.js";
import { connectDatabase } from "./db.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { apiLimiter, authLimiter } from "./middleware/rateLimiter.js";
import { sanitizeMiddleware } from "./utils/sanitize.js";
import { authRouter } from "./routes/auth.js";
import { userRouter } from "./routes/users.js";
import { workspaceRouter } from "./routes/workspaces.js";
import { teamRouter } from "./routes/teams.js";
import { projectRouter } from "./routes/projects.js";
import { taskRouter } from "./routes/tasks.js";
import { labelRouter } from "./routes/labels.js";
import { notificationRouter } from "./routes/notifications.js";
import { analyticsRouter } from "./routes/analytics.js";
import { uploadRouter } from "./routes/upload.js";
import { adminRouter } from "./routes/admin.js";
import { searchRouter } from "./routes/search.js";
import { initScheduler } from "./workers/scheduler.js";
import { cache } from "./services/redis.js";

const app = express();
app.use(cors({ origin: config.clientOrigin }));
app.use(express.json({ limit: "5mb" }));
app.use(sanitizeMiddleware);

// Static file uploads (Object Storage)
app.use("/uploads", express.static(path.resolve(config.uploadDir)));

// Rate Limiting
app.use("/api", apiLimiter);
app.use("/api/auth", authLimiter);

// Dynamic Health Check
app.get("/health", (_req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  const redisStatus = cache.isRedisReady ? "connected" : "in-memory fallback";

  return res.json({
    status: dbStatus === "connected" ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus,
      redis: redisStatus,
      scheduler: "active",
      storage: "local"
    }
  });
});

// Core API Routes
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/workspaces", workspaceRouter);
app.use("/api/teams", teamRouter);
app.use("/api/projects", projectRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/labels", labelRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/admin", adminRouter);
app.use("/api/search", searchRouter);

// Error Handling
app.use(notFound);
app.use(errorHandler);


// Connect DB & Start Server
connectDatabase()
  .then(() => {
    initScheduler();
    app.listen(config.port, () => console.log(`API listening on http://localhost:${config.port}`));
  })
  .catch((error) => {
    console.error("Unable to start the API", error);
    process.exit(1);
  });
