// src/types/orderHistory.ts

import type { BaseEntity } from "./common.ts";

export type OrderHistoryActionType =
  | "created"
  | "updated"
  | "status_changed"
  | "picture_added"
  | "shipped"
  | "delivered"
  | "refunded"
  | "other";

export interface OrderHistory extends BaseEntity {
  order_id: number;
  action_type: OrderHistoryActionType;
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
  changed_by_employee_id: number | null;
  description: string | null;
}

export interface OrderHistoryFormData {
  orderId: number;
  actionType: OrderHistoryActionType;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  changedByEmployeeId?: number;
  description?: string;
}

// Helper function to convert OrderHistory to OrderHistoryFormData
export const orderHistoryToFormData = (
  history: OrderHistory
): OrderHistoryFormData => {
  return {
    orderId: history.order_id,
    actionType: history.action_type,
    fieldName: history.field_name || undefined,
    oldValue: history.old_value || undefined,
    newValue: history.new_value || undefined,
    changedByEmployeeId: history.changed_by_employee_id || undefined,
    description: history.description || undefined
  };
};

// Helper function to create a human-readable description
export const createHistoryDescription = (
  actionType: OrderHistoryActionType,
  fieldName?: string,
  oldValue?: string,
  newValue?: string
): string => {
  switch (actionType) {
    case "created":
      return "Order created";
    case "status_changed":
      return `Status changed from "${oldValue}" to "${newValue}"`;
    case "picture_added":
      return `Preview picture added: ${fieldName || "New picture"}`;
    case "shipped":
      return "Order marked as shipped";
    case "delivered":
      return "Order marked as delivered";
    case "refunded":
      return "Refund processed";
    case "updated":
      return fieldName ? `${fieldName} updated` : "Order updated";
    default:
      return "Order updated";
  }
};
