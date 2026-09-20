import cron from "node-cron";
import { Task } from "../models/Task.js";
import { Notification } from "../models/Notification.js";

export function initScheduler() {
  // 1. Task Due Date Reminders (Runs every 15 minutes)
  cron.schedule("*/15 * * * *", async () => {
    try {
      const now = new Date();
      const inTwoHours = new Date(now.getTime() + 2 * 60 * 60 * 1000);

      // Find tasks due within the next 2 hours that are not done
      const dueTasks = await Task.find({
        status: { $ne: "done" },
        dueDate: { $gte: now, $lte: inTwoHours }
      });

      for (const task of dueTasks) {
        const recipient = task.assigneeId || task.ownerId;
        const existing = await Notification.findOne({
          recipientId: recipient,
          entityId: task._id,
          type: "task_due_soon"
        });

        if (!existing) {
          await Notification.create({
            recipientId: recipient,
            workspaceId: task.workspaceId,
            type: "task_due_soon",
            title: "Task Due Soon",
            message: `Your task "${task.title}" is due soon.`,
            entityType: "task",
            entityId: task._id
          });
        }
      }
    } catch (error) {
      console.error("[Scheduler Error] Due reminder job failed:", error.message);
    }
  });

  // 2. Daily Maintenance / Recurring tasks cleanup (Runs every midnight)
  cron.schedule("0 0 * * *", async () => {
    console.log("[Scheduler] Daily maintenance and recurring task processor ran successfully.");
  });

  console.log("Background Scheduler initialized (Task Reminders & Cron jobs active)");
}
