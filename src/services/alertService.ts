// src/services/alertService.ts
/**
 * Global alert service to replace window.alert()
 * This will be intercepted by a global alert modal handler
 */

export type AlertType = "info" | "success" | "warning" | "error";

interface AlertOptions {
  title?: string;
  type?: AlertType;
}

// Store for alert callbacks
let alertCallback: ((config: { title: string; message: string; type: AlertType }) => void) | null = null;

/**
 * Register the alert callback (called by root component)
 */
export function registerAlertCallback(callback: (config: { title: string; message: string; type: AlertType }) => void) {
  alertCallback = callback;
}

/**
 * Show an alert message
 * If no callback is registered, falls back to window.alert()
 */
export function showAlert(message: string, options?: AlertOptions) {
  const config = {
    title: options?.title || "Thông báo",
    message,
    type: options?.type || "info" as AlertType
  };

  if (alertCallback) {
    alertCallback(config);
  } else {
    // Fallback to window.alert if no callback registered
    window.alert(message);
  }
}

/**
 * Convenience functions
 */
export const alert = {
  info: (message: string, title?: string) => showAlert(message, { title, type: "info" }),
  success: (message: string, title?: string) => showAlert(message, { title, type: "success" }),
  warning: (message: string, title?: string) => showAlert(message, { title, type: "warning" }),
  error: (message: string, title?: string) => showAlert(message, { title, type: "error" })
};

// Store for confirm callbacks
let confirmCallback: ((config: { title: string; message: string; onConfirm: () => void; onCancel: () => void }) => void) | null = null;

/**
 * Register the confirm callback (called by root component)
 */
export function registerConfirmCallback(callback: (config: { title: string; message: string; onConfirm: () => void; onCancel: () => void }) => void) {
  confirmCallback = callback;
}

/**
 * Show a confirmation dialog
 * If no callback is registered, falls back to window.confirm()
 */
export function showConfirm(message: string, title: string = "Xác nhận"): Promise<boolean> {
  return new Promise((resolve) => {
    if (confirmCallback) {
      confirmCallback({
        title,
        message,
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false)
      });
    } else {
      // Fallback to window.confirm if no callback registered
      resolve(window.confirm(message));
    }
  });
}
