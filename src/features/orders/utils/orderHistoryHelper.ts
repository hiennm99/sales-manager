// src/features/orders/utils/orderHistoryHelper.ts

import type { Order, OrderItem } from "../../../types/order";
import { orderHistoryServiceApi } from "../services/orderHistory.service.api";

/**
 * Helper to track order creation
 */
export const trackOrderCreated = async (
  orderId: number,
  employeeId?: number,
): Promise<void> => {
  try {
    await orderHistoryServiceApi.createHistoryRecord(orderId, "created", {
      description: "Order created",
      changedByEmployeeId: employeeId,
    });
  } catch (error) {
    console.error("Failed to track order creation:", error);
  }
};

/**
 * Helper to track status changes
 */
export const trackStatusChange = async (
  orderId: number,
  statusType: "general" | "customer" | "factory" | "delivery",
  oldStatusId: number | null,
  newStatusId: number | null,
  employeeId?: number,
): Promise<void> => {
  try {
    const statusLabels: Record<string, string> = {
      general: "General Status",
      customer: "Customer Status",
      factory: "Factory Status",
      delivery: "Delivery Status",
    };

    await orderHistoryServiceApi.createHistoryRecord(
      orderId,
      "status_changed",
      {
        fieldName: `${statusLabels[statusType]} (ID)`,
        oldValue: oldStatusId?.toString() || "None",
        newValue: newStatusId?.toString() || "None",
        description: `${statusLabels[statusType]} changed`,
        changedByEmployeeId: employeeId,
      },
    );
  } catch (error) {
    console.error("Failed to track status change:", error);
  }
};

/**
 * Helper to track picture upload
 */
export const trackPictureUpload = async (
  orderId: number,
  pictureName: string,
  employeeId?: number,
): Promise<void> => {
  try {
    await orderHistoryServiceApi.createHistoryRecord(orderId, "picture_added", {
      fieldName: pictureName,
      description: `Preview picture uploaded: ${pictureName}`,
      changedByEmployeeId: employeeId,
    });
  } catch (error) {
    console.error("Failed to track picture upload:", error);

    // Type guard to safely access error properties
    if (error && typeof error === "object" && "message" in error) {
      console.error("Error details:", {
        message: (error as any).message,
        code: (error as any).code,
        details: (error as any).details,
        hint: (error as any).hint,
      });
    }
    throw error; // Re-throw to see the actual error
  }
};

/**
 * Helper to track picture deletion
 */
export const trackPictureDelete = async (
  orderId: number,
  pictureName: string,
  employeeId?: number,
): Promise<void> => {
  try {
    await orderHistoryServiceApi.createHistoryRecord(orderId, "updated", {
      fieldName: pictureName,
      description: `Preview picture deleted: ${pictureName}`,
      changedByEmployeeId: employeeId,
    });
  } catch (error) {
    console.error("Failed to track picture deletion:", error);
  }
};

/**
 * Helper to track shipping
 */
export const trackOrderShipped = async (
  orderId: number,
  trackingNumber?: string,
  employeeId?: number,
): Promise<void> => {
  try {
    await orderHistoryServiceApi.createHistoryRecord(orderId, "shipped", {
      description: trackingNumber
        ? `Order shipped with tracking: ${trackingNumber}`
        : "Order marked as shipped",
      changedByEmployeeId: employeeId,
    });
  } catch (error) {
    console.error("Failed to track order shipment:", error);
  }
};

/**
 * Helper to track delivery
 */
export const trackOrderDelivered = async (
  orderId: number,
  employeeId?: number,
): Promise<void> => {
  try {
    await orderHistoryServiceApi.createHistoryRecord(orderId, "delivered", {
      description: "Order marked as delivered",
      changedByEmployeeId: employeeId,
    });
  } catch (error) {
    console.error("Failed to track order delivery:", error);
  }
};

/**
 * Helper to track refund
 */
export const trackRefund = async (
  orderId: number,
  refundAmount?: number,
  employeeId?: number,
): Promise<void> => {
  try {
    await orderHistoryServiceApi.createHistoryRecord(orderId, "refunded", {
      description: refundAmount
        ? `Refund processed: $${refundAmount}`
        : "Refund processed",
      changedByEmployeeId: employeeId,
    });
  } catch (error) {
    console.error("Failed to track refund:", error);
  }
};

/**
 * Helper to track generic field update
 */
export const trackFieldUpdate = async (
  orderId: number,
  fieldName: string,
  oldValue: string | number | null,
  newValue: string | number | null,
  employeeId?: number,
): Promise<void> => {
  try {
    await orderHistoryServiceApi.createHistoryRecord(orderId, "updated", {
      fieldName,
      oldValue: oldValue?.toString() || "None",
      newValue: newValue?.toString() || "None",
      description: `${fieldName} updated`,
      changedByEmployeeId: employeeId,
    });
  } catch (error) {
    console.error("Failed to track field update:", error);
  }
};

/**
 * Helper to detect and track changes between two orders
 */
export const trackOrderChanges = async (
  orderId: number,
  oldOrder: Partial<Order>,
  newOrder: Partial<Order>,
  employeeId?: number,
): Promise<void> => {
  const fieldsToTrack = [
    // Basic order info
    "shop_id",
    "order_id",
    "order_date",
    "scheduled_ship_date",

    // Customer info
    "customer_name",
    "customer_address",
    "customer_phone",
    "customer_email",
    "customer_notes",

    // Financial info - USD amounts
    "item_total_usd",
    "discount_rate",
    "buyer_paid_usd",
    "order_earnings_usd",

    // Financial info - VND amounts
    "exchange_rate",
    "item_total_vnd",
    "buyer_paid_vnd",
    "order_earnings_vnd",

    // Shipping info
    "carrier_notes",
    "internal_tracking_number",
    "carrier_unit",
    "tracking_number",
    "actual_ship_date",
    "shipping_fee_usd",
    "shipping_exchange_rate",
    "shipping_fee_vnd",

    // Refund info
    "refund_fee_usd",
    "refund_fee_exchange_rate",
    "refund_fee_vnd",
    "refund_fee_notes",

    // Other fees
    "other_fee_usd",
    "other_fee_exchange_rate",
    "other_fee_vnd",
    "other_fee_notes",

    // Other bonus
    "other_bonus_usd",
    "other_bonus_exchange_rate",
    "other_bonus_vnd",
    "other_bonus_notes",

    // Profit
    "profit_usd",
    "profit_vnd",

    // Employees
    "artist_commission_rate",
    "artist_employee_id",
    "seller_employee_id",

    // Statuses
    "general_status_id",
    "customer_status_id",
    "factory_status_id",
    "delivery_status_id",
  ];

  for (const field of fieldsToTrack) {
    const oldValue = oldOrder[field as keyof Order];
    const newValue = newOrder[field as keyof Order];

    if (oldValue !== newValue && newValue !== undefined) {
      const fieldLabel = field
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      // Convert Date objects to strings for history tracking
      const oldValueForHistory =
        oldValue instanceof Date ? oldValue.toISOString() : (oldValue ?? null);
      const newValueForHistory =
        newValue instanceof Date ? newValue.toISOString() : (newValue ?? null);

      await trackFieldUpdate(
        orderId,
        fieldLabel,
        oldValueForHistory as string | number | null,
        newValueForHistory as string | number | null,
        employeeId,
      );
    }
  }
};

/**
 * Helper to track order items changes
 */
export const trackOrderItemsUpdate = async (
  orderId: number,
  oldItems: OrderItem[],
  newItems: OrderItem[],
  employeeId?: number,
): Promise<void> => {
  try {
    // Create a summary of the changes
    const oldItemsCount = oldItems.length;
    const newItemsCount = newItems.length;

    let description = `Order items updated: ${oldItemsCount} → ${newItemsCount} items`;

    // Add details about specific changes if helpful
    if (oldItemsCount !== newItemsCount) {
      if (newItemsCount > oldItemsCount) {
        description += ` (${newItemsCount - oldItemsCount} items added)`;
      } else {
        description += ` (${oldItemsCount - newItemsCount} items removed)`;
      }
    }

    // Create a simple summary of the new items
    const itemsSummary = newItems
      .map(
        (item) => `${item.sku} (${item.size}, ${item.type}) x${item.quantity}`,
      )
      .join("; ");

    await orderHistoryServiceApi.createHistoryRecord(orderId, "updated", {
      fieldName: "Order Items",
      oldValue: `${oldItemsCount} items`,
      newValue: `${newItemsCount} items: ${itemsSummary}`,
      description,
      changedByEmployeeId: employeeId,
    });
  } catch (error) {
    console.error("Failed to track order items update:", error);
  }
};
