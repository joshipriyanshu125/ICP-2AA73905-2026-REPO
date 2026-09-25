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
    try {
      console.log("[Scheduler] Running recurring task processor...");
      const now = new Date();

      // Find tasks with recurrence enabled
      const recurringTasks = await Task.find({
        "recurrence.pattern": { $in: ["daily", "weekly", "monthly"] },
        status: { $in: ["done", "todo"] }
      });

      for (const task of recurringTasks) {
        if (!task.dueDate) continue;

        // Check if end date reached
        if (task.recurrence.endDate && task.recurrence.endDate < now) continue;

        // Calculate next due date
        const nextDue = new Date(task.dueDate);
        const interval = task.recurrence.interval || 1;

        if (task.recurrence.pattern === "daily") {
          nextDue.setDate(nextDue.getDate() + interval);
        } else if (task.recurrence.pattern === "weekly") {
          nextDue.setDate(nextDue.getDate() + 7 * interval);
        } else if (task.recurrence.pattern === "monthly") {
          nextDue.setMonth(nextDue.getMonth() + interval);
        }

        // If completed or past due, spawn next task occurrence or reset
        if (task.status === "done" && nextDue > now) {
          await Task.create({
            title: task.title,
            description: task.description,
            priority: task.priority,
            category: task.category,
            status: "todo",
            workspaceId: task.workspaceId,
            projectId: task.projectId,
            ownerId: task.ownerId,
            assigneeId: task.assigneeId,
            labels: task.labels,
            dueDate: nextDue,
            recurrence: task.recurrence
          });

          // Disable recurrence on the old finished task so it won't duplicate again
          task.recurrence = { pattern: null };
          await task.save();
        }
      }
      console.log("[Scheduler] Daily maintenance and recurring task processor completed.");
    } catch (error) {
      console.error("[Scheduler Error] Recurring task job failed:", error.message);
    }
  });

  console.log("Background Scheduler initialized (Task Reminders & Cron jobs active)");
}

