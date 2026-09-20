import webpush from "web-push";
import { config } from "../config.js";

try {
  if (config.vapid.publicKey && config.vapid.privateKey) {
    webpush.setVapidDetails(
      config.vapid.subject,
      config.vapid.publicKey,
      config.vapid.privateKey
    );
  }
} catch {
  console.log("Push notification service running in simulation mode.");
}

export async function sendPushNotification(subscription, payload) {
  try {
    const result = await webpush.sendNotification(
      subscription,
      JSON.stringify(payload)
    );
    return { success: true, result };
  } catch (error) {
    console.log(`[Push Notification Simulation] Error sending push: ${error.message}`);
    return { success: false, error: error.message };
  }
}
