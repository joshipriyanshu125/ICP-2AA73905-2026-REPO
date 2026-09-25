import { EventEmitter } from "events";
import { Notification } from "../models/Notification.js";
import { User } from "../models/User.js";
import { sendPushNotification } from "./push.js";

async function notifyUser(userId, payload) {
  try {
    const user = await User.findById(userId).select("pushSubscription preferences");
    if (user?.pushSubscription) {
      await sendPushNotification(user.pushSubscription, payload);
    }
  } catch (err) {
    // Non-blocking
  }
}

class AppEventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50);
    this._registerListeners();
  }

  _registerListeners() {
    // When a task is created and assigned to someone else, notify the assignee
    this.on("task:created", async ({ task, userId }) => {
      try {
        if (task.assigneeId && task.assigneeId.toString() !== userId.toString()) {
          const notif = await Notification.create({
            recipientId: task.assigneeId,
            senderId: userId,
            workspaceId: task.workspaceId,
            type: "task_assigned",
            title: "New Task Assigned",
            message: `You have been assigned the task "${task.title}".`,
            entityType: "task",
            entityId: task._id
          });
          notifyUser(task.assigneeId, { title: notif.title, body: notif.message, url: `/tasks/${task._id}` });
        }
      } catch (err) {
        console.error("[EventBus] task:created notification error:", err.message);
      }
    });

    // When a task is updated, notify relevant parties
    this.on("task:updated", async ({ task, userId, changes }) => {
      try {
        if (changes.assigneeId && changes.assigneeId.toString() !== userId.toString()) {
          await Notification.create({
            recipientId: changes.assigneeId,
            senderId: userId,
            workspaceId: task.workspaceId,
            type: "task_assigned",
            title: "Task Assigned to You",
            message: `You have been assigned the task "${task.title}".`,
            entityType: "task",
            entityId: task._id
          });
        }

        if (changes.status && task.assigneeId && task.assigneeId.toString() !== userId.toString()) {
          await Notification.create({
            recipientId: task.assigneeId,
            senderId: userId,
            workspaceId: task.workspaceId,
            type: "task_status_changed",
            title: "Task Status Updated",
            message: `Task "${task.title}" status changed to "${changes.status}".`,
            entityType: "task",
            entityId: task._id
          });
        }
      } catch (err) {
        console.error("[EventBus] task:updated notification error:", err.message);
      }
    });

    // When a comment is added, notify the task owner/assignee
    this.on("comment:added", async ({ comment, task, userId }) => {
      try {
        const recipientId = task.assigneeId || task.ownerId;
        if (recipientId.toString() !== userId.toString()) {
          await Notification.create({
            recipientId,
            senderId: userId,
            workspaceId: task.workspaceId,
            type: "comment_added",
            title: "New Comment",
            message: `A new comment was added to "${task.title}".`,
            entityType: "comment",
            entityId: comment._id
          });
        }
      } catch (err) {
        console.error("[EventBus] comment:added notification error:", err.message);
      }
    });

    // When a member is invited to a workspace, notify them
    this.on("member:invited", async ({ workspaceId, workspaceName, userId, invitedUserId }) => {
      try {
        await Notification.create({
          recipientId: invitedUserId,
          senderId: userId,
          workspaceId,
          type: "workspace_invite",
          title: "Workspace Invitation",
          message: `You have been added to workspace "${workspaceName}".`,
          entityType: "workspace",
          entityId: workspaceId
        });
      } catch (err) {
        console.error("[EventBus] member:invited notification error:", err.message);
      }
    });

    console.log("Event bus initialized with notification listeners");
  }
}

export const eventBus = new AppEventBus();
