// src/hooks/useAlertModal.ts
/**
 * Custom hook for showing alert modals instead of window.alert()
 * Provides a simple interface to show alerts with ConfirmModal
 */

import { useState } from "react";

export type AlertVariant = "warning" | "info" | "success" | "delete" | "edit";

interface AlertConfig {
  title: string;
  message: string;
  variant?: AlertVariant;
  confirmText?: string;
}

export function useAlertModal() {
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    config: AlertConfig | null;
  }>({
    isOpen: false,
    config: null
  });

  const showAlert = (config: AlertConfig) => {
    setAlertState({
      isOpen: true,
      config: {
        confirmText: "Đóng",
        variant: "info",
        ...config
      }
    });
  };

  const closeAlert = () => {
    setAlertState({
      isOpen: false,
      config: null
    });
  };

  return {
    isOpen: alertState.isOpen,
    config: alertState.config,
    showAlert,
    closeAlert
  };
}
