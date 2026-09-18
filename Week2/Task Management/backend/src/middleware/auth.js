import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { config } from "../config.js";
export function requireAuth(req, res, next) {
  const token = req.header("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ message: "Authentication token is required." });
  try { const { sub } = jwt.verify(token, config.jwtSecret); if (!sub || !Types.ObjectId.isValid(sub)) throw new Error(); req.userId = new Types.ObjectId(sub); return next(); }
  catch { return res.status(401).json({ message: "Invalid or expired authentication token." }); }
}
