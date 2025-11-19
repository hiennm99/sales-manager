import { useNotificationStore } from "@stores";
import type { Notification } from "@types";
import { NotificationType } from "@types";
import { v4 as uuidv4 } from "uuid";

export const NotificationService = {
  /**
   * Create and add a new notification
   * @param message Notification message
   * @param type Notification type
   * @param duration Optional duration (default 5 seconds)
   * @returns Notification ID
   */
  create(
    message: string,
    type: NotificationType = NotificationType.INFO,
    duration: number = 5000
  ): string {
    const id = uuidv4();
    const notification: Notification = {
      id,
      message,
      type,
      duration,
      timestamp: new Date()
    };

    // Add to store
    const notificationStore = useNotificationStore.getState();
    notificationStore.add(notification);

    // Auto-remove after duration
    setTimeout(() => {
      notificationStore.remove(id);
    }, duration);

    return id;
  },

  /**
   * Create an info notification
   */
  info(message: string, duration?: number) {
    return this.create(message, NotificationType.INFO, duration);
  },

  /**
   * Create a success notification
   */
  success(message: string, duration?: number) {
    return this.create(message, NotificationType.SUCCESS, duration);
  },

  /**
   * Create a warning notification
   */
  warning(message: string, duration?: number) {
    return this.create(message, NotificationType.WARNING, duration);
  },

  /**
   * Create an error notification
   */
  error(message: string, duration?: number) {
    return this.create(message, NotificationType.ERROR, duration);
  },

  /**
   * Remove a specific notification
   */
  remove(id: string) {
    const notificationStore = useNotificationStore.getState();
    notificationStore.remove(id);
  },

  /**
   * Clear all notifications
   */
  clear() {
    const notificationStore = useNotificationStore.getState();
    notificationStore.clear();
  }
};
