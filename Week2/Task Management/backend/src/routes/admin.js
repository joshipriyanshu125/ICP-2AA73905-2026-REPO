import { Router } from "express";
import { Types } from "mongoose";
import { User } from "../models/User.js";
import { UserRole } from "../models/UserRole.js";
import { Task } from "../models/Task.js";
import { Project } from "../models/Project.js";
import { Workspace } from "../models/Workspace.js";
import { requireAuth } from "../middleware/auth.js";

// Admin authorization middleware
async function requireAdmin(req, res, next) {
  try {
    const role = await UserRole.findOne({ userId: req.userId });
    if (!role || role.role !== "admin") {
      return res.status(403).json({ message: "Admin access required." });
    }
    return next();
  } catch (error) {
    return next(error);
  }
}

export const adminRouter = Router();
adminRouter.use(requireAuth);
adminRouter.use(requireAdmin);

// System-level statistics
adminRouter.get("/stats", async (req, res, next) => {
  try {
    const [totalUsers, totalTasks, totalProjects, totalWorkspaces, activeUsers] = await Promise.all([
      User.countDocuments({ isDeleted: false }),
      Task.countDocuments(),
      Project.countDocuments(),
      Workspace.countDocuments(),
      User.countDocuments({
        isDeleted: false,
        updatedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      })
    ]);

    return res.json({
      stats: { totalUsers, activeUsers, totalTasks, totalProjects, totalWorkspaces }
    });
  } catch (error) {
    return next(error);
  }
});

// List all users (paginated)
adminRouter.get("/users", async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.search) {
      const searchRegex = { $regex: String(req.query.search), $options: "i" };
      filter.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("name email avatarUrl timezone isDeleted isEmailVerified createdAt updatedAt")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      User.countDocuments(filter)
    ]);

    return res.json({ users, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    return next(error);
  }
});

// Update user role
adminRouter.patch("/users/:id/role", async (req, res, next) => {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid user ID." });
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Role must be 'user' or 'admin'." });
    }

    const userRole = await UserRole.findOneAndUpdate(
      { userId: req.params.id },
      { $set: { role } },
      { new: true, upsert: true }
    );

    return res.json({ message: "User role updated.", userRole });
  } catch (error) {
    return next(error);
  }
});

// Deactivate user
adminRouter.delete("/users/:id", async (req, res, next) => {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid user ID." });
    if (req.params.id === req.userId.toString()) {
      return res.status(400).json({ message: "Cannot deactivate your own account via admin." });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { isDeleted: true } },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found." });

    return res.json({ message: "User account deactivated." });
  } catch (error) {
    return next(error);
  }
});
