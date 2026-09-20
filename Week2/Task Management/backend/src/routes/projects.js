import { Router } from "express";
import { Types } from "mongoose";
import { z } from "zod";
import { Project, projectStatuses } from "../models/Project.js";
import { WorkspaceMember } from "../models/WorkspaceMember.js";
import { requireAuth } from "../middleware/auth.js";

const projectInput = z.object({
  workspaceId: z.string().refine(Types.ObjectId.isValid, "Invalid workspace ID"),
  teamId: z.string().refine(Types.ObjectId.isValid).optional(),
  name: z.string().trim().min(2).max(100),
  key: z.string().trim().min(2).max(10).toUpperCase().optional(),
  description: z.string().trim().max(2000).optional(),
  status: z.enum(projectStatuses).optional(),
  isPrivate: z.boolean().optional(),
  startDate: z.coerce.date().nullable().optional(),
  endDate: z.coerce.date().nullable().optional()
});

export const projectRouter = Router();
projectRouter.use(requireAuth);

// List projects in a workspace
projectRouter.get("/", async (req, res, next) => {
  try {
    const { workspaceId, status, teamId } = req.query;
    const filter = {};
    if (workspaceId && Types.ObjectId.isValid(workspaceId)) filter.workspaceId = workspaceId;
    if (teamId && Types.ObjectId.isValid(teamId)) filter.teamId = teamId;
    if (status) filter.status = status;

    const projects = await Project.find(filter).populate("ownerId", "name email avatarUrl").sort({ createdAt: -1 });
    return res.json({ projects });
  } catch (error) {
    return next(error);
  }
});

// Create project
projectRouter.post("/", async (req, res, next) => {
  try {
    const input = projectInput.parse(req.body);
    const member = await WorkspaceMember.findOne({ workspaceId: input.workspaceId, userId: req.userId, status: "active" });
    if (!member) return res.status(403).json({ message: "Access denied to create projects in this workspace." });

    const key = input.key || input.name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4).toUpperCase();

    const project = await Project.create({
      ...input,
      key,
      ownerId: req.userId
    });

    return res.status(201).json({ project });
  } catch (error) {
    return next(error);
  }
});

// Get single project
projectRouter.get("/:id", async (req, res, next) => {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid project ID." });
    const project = await Project.findById(req.params.id).populate("ownerId", "name email avatarUrl").populate("teamId", "name");
    if (!project) return res.status(404).json({ message: "Project not found." });
    return res.json({ project });
  } catch (error) {
    return next(error);
  }
});

// Update project
projectRouter.patch("/:id", async (req, res, next) => {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid project ID." });
    const input = projectInput.partial().parse(req.body);
    const project = await Project.findByIdAndUpdate(req.params.id, { $set: input }, { new: true });
    if (!project) return res.status(404).json({ message: "Project not found." });
    return res.json({ project });
  } catch (error) {
    return next(error);
  }
});

// Archive project
projectRouter.patch("/:id/archive", async (req, res, next) => {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid project ID." });
    const project = await Project.findByIdAndUpdate(req.params.id, { $set: { status: "archived" } }, { new: true });
    if (!project) return res.status(404).json({ message: "Project not found." });
    return res.json({ message: "Project archived.", project });
  } catch (error) {
    return next(error);
  }
});

// Restore project
projectRouter.patch("/:id/restore", async (req, res, next) => {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid project ID." });
    const project = await Project.findByIdAndUpdate(req.params.id, { $set: { status: "active" } }, { new: true });
    if (!project) return res.status(404).json({ message: "Project not found." });
    return res.json({ message: "Project restored.", project });
  } catch (error) {
    return next(error);
  }
});

// Delete project
projectRouter.delete("/:id", async (req, res, next) => {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid project ID." });
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found." });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});
