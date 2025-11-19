export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number; // in milliseconds
  timestamp?: Date;
}

export enum NotificationType {
  INFO = "info",
  SUCCESS = "success",
  WARNING = "warning",
  ERROR = "error"
}