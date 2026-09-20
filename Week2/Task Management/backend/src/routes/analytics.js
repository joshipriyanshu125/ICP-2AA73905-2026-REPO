import { Router } from "express";
import { Types } from "mongoose";
import { Task } from "../models/Task.js";
import { Project } from "../models/Project.js";
import { requireAuth } from "../middleware/auth.js";

export const analyticsRouter = Router();
analyticsRouter.use(requireAuth);

analyticsRouter.get("/dashboard", async (req, res, next) => {
  try {
    const { workspaceId, projectId } = req.query;
    const filter = { ownerId: req.userId };
    if (workspaceId && Types.ObjectId.isValid(workspaceId)) filter.workspaceId = new Types.ObjectId(workspaceId);
    if (projectId && Types.ObjectId.isValid(projectId)) filter.projectId = new Types.ObjectId(projectId);

    const [totalTasks, completedTasks, todoTasks, inProgressTasks, blockedTasks, overdueTasks] = await Promise.all([
      Task.countDocuments(filter),
      Task.countDocuments({ ...filter, status: "done" }),
      Task.countDocuments({ ...filter, status: "todo" }),
      Task.countDocuments({ ...filter, status: { $in: ["in_progress", "in-progress"] } }),
      Task.countDocuments({ ...filter, status: "blocked" }),
      Task.countDocuments({ ...filter, status: { $ne: "done" }, dueDate: { $lt: new Date() } })
    ]);

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return res.json({
      summary: {
        totalTasks,
        completedTasks,
        todoTasks,
        inProgressTasks,
        blockedTasks,
        overdueTasks,
        completionRate: `${completionRate}%`
      }
    });
  } catch (error) {
    return next(error);
  }
});
