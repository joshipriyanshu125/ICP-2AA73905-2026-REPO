import { Router } from "express";
import { Types } from "mongoose";
import { z } from "zod";
import { Workspace } from "../models/Workspace.js";
import { WorkspaceMember, workspaceMemberRoles } from "../models/WorkspaceMember.js";
import { User } from "../models/User.js";
import { Project } from "../models/Project.js";
import { Task } from "../models/Task.js";
import { Team } from "../models/Team.js";
import { Label } from "../models/Label.js";
import { Notification } from "../models/Notification.js";
import { requireAuth } from "../middleware/auth.js";
import { eventBus } from "../services/events.js";

const workspaceInput = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().min(2).max(100).toLowerCase().regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens").optional(),
  description: z.string().trim().max(500).optional()
});

export const workspaceRouter = Router();
workspaceRouter.use(requireAuth);

// List all workspaces user is a member of
workspaceRouter.get("/", async (req, res, next) => {
  try {
    const memberships = await WorkspaceMember.find({ userId: req.userId, status: "active" }).populate("workspaceId");
    const workspaces = memberships
      .filter((m) => m.workspaceId)
      .map((m) => ({
        ...m.workspaceId.toObject(),
        currentUserRole: m.role
      }));
    return res.json({ workspaces });
  } catch (error) {
    return next(error);
  }
});

// Create a new workspace
workspaceRouter.post("/", async (req, res, next) => {
  try {
    const input = workspaceInput.parse(req.body);
    const slug = input.slug || input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now().toString(36);

    const existingSlug = await Workspace.findOne({ slug });
    if (existingSlug) return res.status(409).json({ message: "A workspace with that slug already exists." });

    const workspace = await Workspace.create({
      name: input.name,
      slug,
      description: input.description || "",
      ownerId: req.userId
    });

    await WorkspaceMember.create({
      workspaceId: workspace._id,
      userId: req.userId,
      role: "owner",
      status: "active"
    });

    return res.status(201).json({ workspace });
  } catch (error) {
    return next(error);
  }
});

// Get single workspace
workspaceRouter.get("/:id", async (req, res, next) => {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid workspace ID." });
    const membership = await WorkspaceMember.findOne({ workspaceId: req.params.id, userId: req.userId, status: "active" });
    if (!membership) return res.status(403).json({ message: "Access denied to this workspace." });

    const workspace = await Workspace.findById(req.params.id).populate("ownerId", "name email avatarUrl");
    if (!workspace) return res.status(404).json({ message: "Workspace not found." });

    return res.json({ workspace, role: membership.role });
  } catch (error) {
    return next(error);
  }
});

// Update workspace (admin/owner only)
workspaceRouter.patch("/:id", async (req, res, next) => {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid workspace ID." });
    const membership = await WorkspaceMember.findOne({ workspaceId: req.params.id, userId: req.userId, role: { $in: ["owner", "admin"] } });
    if (!membership) return res.status(403).json({ message: "Only workspace admins or owners can update workspace details." });

    const input = workspaceInput.partial().parse(req.body);
    const workspace = await Workspace.findByIdAndUpdate(req.params.id, { $set: input }, { new: true });
    return res.json({ workspace });
  } catch (error) {
    return next(error);
  }
});

// Delete workspace (owner only - with full cascade cleanup)
workspaceRouter.delete("/:id", async (req, res, next) => {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid workspace ID." });
    const workspace = await Workspace.findOne({ _id: req.params.id, ownerId: req.userId });
    if (!workspace) return res.status(403).json({ message: "Only the workspace owner can delete it." });

    await Promise.all([
      Workspace.findByIdAndDelete(req.params.id),
      WorkspaceMember.deleteMany({ workspaceId: req.params.id }),
      Project.deleteMany({ workspaceId: req.params.id }),
      Task.deleteMany({ workspaceId: req.params.id }),
      Team.deleteMany({ workspaceId: req.params.id }),
      Label.deleteMany({ workspaceId: req.params.id }),
      Notification.deleteMany({ workspaceId: req.params.id })
    ]);

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

// List members of workspace
workspaceRouter.get("/:id/members", async (req, res, next) => {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid workspace ID." });
    const members = await WorkspaceMember.find({ workspaceId: req.params.id }).populate("userId", "name email avatarUrl");
    return res.json({ members });
  } catch (error) {
    return next(error);
  }
});

// Add / Invite member to workspace
workspaceRouter.post("/:id/members", async (req, res, next) => {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid workspace ID." });
    const membership = await WorkspaceMember.findOne({ workspaceId: req.params.id, userId: req.userId, role: { $in: ["owner", "admin"] } });
    if (!membership) return res.status(403).json({ message: "Admin permission required to invite members." });

    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) return res.status(404).json({ message: "Workspace not found." });

    const { email, role } = z.object({ email: z.string().email(), role: z.enum(workspaceMemberRoles).optional() }).parse(req.body);
    const targetUser = await User.findOne({ email: email.toLowerCase() });
    if (!targetUser) return res.status(404).json({ message: "User with this email not found." });

    const existingMember = await WorkspaceMember.findOne({ workspaceId: req.params.id, userId: targetUser._id });
    if (existingMember) return res.status(409).json({ message: "User is already a member of this workspace." });

    const newMember = await WorkspaceMember.create({
      workspaceId: req.params.id,
      userId: targetUser._id,
      role: role || "member",
      status: "active"
    });

    eventBus.emit("member:invited", {
      workspaceId: workspace._id,
      workspaceName: workspace.name,
      userId: req.userId,
      invitedUserId: targetUser._id
    });

    return res.status(201).json({ member: newMember });
  } catch (error) {
    return next(error);
  }
});


// Remove member from workspace
workspaceRouter.delete("/:id/members/:userId", async (req, res, next) => {
  try {
    const isSelf = req.params.userId === req.userId.toString();
    const isAdmin = await WorkspaceMember.findOne({ workspaceId: req.params.id, userId: req.userId, role: { $in: ["owner", "admin"] } });

    if (!isSelf && !isAdmin) return res.status(403).json({ message: "Insufficient permissions to remove this member." });

    await WorkspaceMember.findOneAndDelete({ workspaceId: req.params.id, userId: req.params.userId });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});
