import path from "path";
import cors from "cors";
import express from "express";
import { config } from "./config.js";
import { connectDatabase } from "./db.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { apiLimiter, authLimiter } from "./middleware/rateLimiter.js";
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
import { initScheduler } from "./workers/scheduler.js";
import "./services/redis.js"; // Initialize cache client

const app = express();
app.use(cors({ origin: config.clientOrigin }));
app.use(express.json({ limit: "5mb" }));

// Static file uploads (Object Storage)
app.use("/uploads", express.static(path.resolve(config.uploadDir)));

// Rate Limiting
app.use("/api", apiLimiter);
app.use("/api/auth", authLimiter);

// Health Check
app.get("/health", (_req, res) =>
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      database: "connected",
      scheduler: "active",
      storage: "local"
    }
  })
);

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
