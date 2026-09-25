import { Router } from "express";
import { Types } from "mongoose";
import { z } from "zod";
import { Team } from "../models/Team.js";
import { WorkspaceMember } from "../models/WorkspaceMember.js";
import { requireAuth } from "../middleware/auth.js";

const teamInput = z.object({
  workspaceId: z.string().refine(Types.ObjectId.isValid, "Invalid workspace ID"),
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(300).optional(),
  leadId: z.string().refine(Types.ObjectId.isValid, "Invalid user ID").optional()
});

export const teamRouter = Router();
teamRouter.use(requireAuth);

// Get all teams in a workspace
teamRouter.get("/", async (req, res, next) => {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId || !Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({ message: "Valid workspaceId query parameter is required." });
    }

    const member = await WorkspaceMember.findOne({ workspaceId, userId: req.userId, status: "active" });
    if (!member) return res.status(403).json({ message: "Access denied to this workspace." });

    const teams = await Team.find({ workspaceId }).populate("leadId", "name email avatarUrl").populate("members.userId", "name email avatarUrl");
    return res.json({ teams });
  } catch (error) {
    return next(error);
  }
});

// Create a team
teamRouter.post("/", async (req, res, next) => {
  try {
    const input = teamInput.parse(req.body);
    const member = await WorkspaceMember.findOne({ workspaceId: input.workspaceId, userId: req.userId, role: { $in: ["owner", "admin"] } });
    if (!member) return res.status(403).json({ message: "Admin permission required to create teams." });

    const team = await Team.create({
      workspaceId: input.workspaceId,
      name: input.name,
      description: input.description || "",
      leadId: input.leadId || req.userId,
      members: [{ userId: req.userId, role: "lead" }]
    });

    return res.status(201).json({ team });
  } catch (error) {
    return next(error);
  }
});

// Get single team
teamRouter.get("/:id", async (req, res, next) => {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid team ID." });
    const team = await Team.findById(req.params.id).populate("leadId", "name email avatarUrl").populate("members.userId", "name email avatarUrl");
    if (!team) return res.status(404).json({ message: "Team not found." });
    return res.json({ team });
  } catch (error) {
    return next(error);
  }
});

// Update team
teamRouter.patch("/:id", async (req, res, next) => {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid team ID." });
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: "Team not found." });

    const member = await WorkspaceMember.findOne({
      workspaceId: team.workspaceId,
      userId: req.userId,
      role: { $in: ["owner", "admin"] }
    });
    const isLead = team.leadId?.toString() === req.userId.toString();
    if (!member && !isLead) return res.status(403).json({ message: "Only team lead or workspace admins can update team." });

    const input = z.object({ name: z.string().trim().min(2).max(80).optional(), description: z.string().trim().max(300).optional(), leadId: z.string().refine(Types.ObjectId.isValid).optional() }).parse(req.body);

    const updated = await Team.findByIdAndUpdate(req.params.id, { $set: input }, { new: true });
    return res.json({ team: updated });
  } catch (error) {
    return next(error);
  }
});

// Delete team
teamRouter.delete("/:id", async (req, res, next) => {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid team ID." });
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: "Team not found." });

    const member = await WorkspaceMember.findOne({
      workspaceId: team.workspaceId,
      userId: req.userId,
      role: { $in: ["owner", "admin"] }
    });
    if (!member) return res.status(403).json({ message: "Only workspace admins or owners can delete teams." });

    await Team.findByIdAndDelete(req.params.id);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

