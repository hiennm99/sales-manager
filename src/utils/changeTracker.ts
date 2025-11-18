// src/utils/changeTracker.ts
/**
 * Change Tracker Utility
 * Detects and formats changes between old and new Order/OrderItem objects
 */

import type {
  CustomerStatus,
  DeliveryStatus,
  Employee,
  FactoryStatus,
  GeneralStatus,
  Order,
  OrderFormData,
  OrderItem
} from "@types";

export interface FieldChange {
  field: string;
  label: string;
  oldValue: string | number | null;
  newValue: string | number | null;
}

export interface LookupData {
  employees?: Employee[];
  generalStatuses?: GeneralStatus[];
  customerStatuses?: CustomerStatus[];
  factoryStatuses?: FactoryStatus[];
  deliveryStatuses?: DeliveryStatus[];
}

/**
 * Field display labels for Order
 */
const ORDER_FIELD_LABELS: Record<string, string> = {
  // Basic info
  order_id: "Mã đơn hàng",
  order_date: "Ngày đặt hàng",
  scheduled_ship_date: "Ngày giao dự kiến",
  actual_ship_date: "Ngày giao thực tế",

  // Customer info
  customer_name: "Tên khách hàng",
  customer_address: "Địa chỉ khách hàng",
  customer_phone: "Số điện thoại",
  customer_email: "Email khách hàng",
  customer_notes: "Ghi chú khách hàng",

  // USD amounts
  item_total_usd: "Tổng tiền hàng (USD)",
  discount_rate: "Tỷ lệ giảm giá",
  buyer_paid_usd: "Tiền khách trả (USD)",
  order_earnings_usd: "Doanh thu đơn hàng (USD)",

  // VND amounts
  exchange_rate: "Tỷ giá VND/USD",
  item_total_vnd: "Tổng tiền hàng (VND)",
  buyer_paid_vnd: "Tiền khách trả (VND)",
  order_earnings_vnd: "Doanh thu đơn hàng (VND)",

  // Shipping info
  carrier_notes: "Ghi chú vận chuyển",
  internal_tracking_number: "Mã theo dõi nội bộ",
  carrier_unit: "Đơn vị vận chuyển",
  tracking_number: "Mã theo dõi",
  shipping_fee_usd: "Phí vận chuyển (USD)",
  shipping_exchange_rate: "Tỷ giá phí vận chuyển",
  shipping_fee_vnd: "Phí vận chuyển (VND)",

  // Refund info
  refund_fee_usd: "Phí hoàn tiền (USD)",
  refund_fee_exchange_rate: "Tỷ giá phí hoàn tiền",
  refund_fee_vnd: "Phí hoàn tiền (VND)",
  refund_fee_notes: "Ghi chú hoàn tiền",

  // Other fees
  other_fee_usd: "Phí khác (USD)",
  other_fee_exchange_rate: "Tỷ giá phí khác",
  other_fee_vnd: "Phí khác (VND)",
  other_fee_notes: "Ghi chú phí khác",

  // Other bonus
  other_bonus_usd: "Thưởng khác (USD)",
  other_bonus_exchange_rate: "Tỷ giá thưởng khác",
  other_bonus_vnd: "Thưởng khác (VND)",
  other_bonus_notes: "Ghi chú thưởng khác",

  // Profit
  profit_usd: "Lợi nhuận (USD)",
  profit_vnd: "Lợi nhuận (VND)",

  // Employees
  artist_employee_id: "Nhân viên vẽ",
  artist_commission_rate: "Tỷ lệ hoa hồng vẽ",
  seller_employee_id: "Nhân viên bán hàng",

  // Statuses
  general_status_id: "Trạng thái chung",
  customer_status_id: "Trạng thái khách hàng",
  factory_status_id: "Trạng thái nhà máy",
  delivery_status_id: "Trạng thái giao hàng"
};

/**
 * Field display labels for OrderItem
 */
const ORDER_ITEM_FIELD_LABELS: Record<string, string> = {
  sku: "Mã SKU",
  size: "Kích cỡ",
  type: "Loại sản phẩm",
  quantity: "Số lượng",
  unit_price_usd: "Giá đơn vị (USD)"
};

/**
 * Format value for display with optional lookup data
 */
function formatValue(
  value: unknown,
  field?: string,
  lookupData?: LookupData
): string {
  if (value === null || value === undefined) {
    return "N/A";
  }
  if (typeof value === "boolean") {
    return value ? "Có" : "Không";
  }
  if (typeof value === "number") {
    // Check if it's a date-like field
    if (value > 1000000000) {
      return new Date(value).toLocaleDateString("vi-VN");
    }

    // Handle employee ID lookups
    if (field && (field === "artist_employee_id" || field === "seller_employee_id")) {
      const employee = lookupData?.employees?.find((e) => e.id === value);
      return employee ? `${employee.name} (${employee.code})` : `ID: ${value}`;
    }

    // Handle status ID lookups
    if (field === "general_status_id") {
      const status = lookupData?.generalStatuses?.find((s) => s.id === value);
      return status ? `${status.name_vi} (${status.name})` : `ID: ${value}`;
    }
    if (field === "customer_status_id") {
      const status = lookupData?.customerStatuses?.find((s) => s.id === value);
      return status ? `${status.name_vi} (${status.name})` : `ID: ${value}`;
    }
    if (field === "factory_status_id") {
      const status = lookupData?.factoryStatuses?.find((s) => s.id === value);
      return status ? `${status.name_vi} (${status.name})` : `ID: ${value}`;
    }
    if (field === "delivery_status_id") {
      const status = lookupData?.deliveryStatuses?.find((s) => s.id === value);
      return status ? `${status.name_vi} (${status.name})` : `ID: ${value}`;
    }

    return value.toLocaleString("vi-VN");
  }
  if (value instanceof Date) {
    return value.toLocaleDateString("vi-VN");
  }
  return String(value);
}

/**
 * Detect changes between two Order objects
 */
export function detectOrderChanges(
  oldOrder: Order,
  newOrder: Order,
  lookupData?: LookupData
): FieldChange[] {
  const changes: FieldChange[] = [];

  // Get all keys from both objects
  const allKeys = new Set([
    ...Object.keys(oldOrder),
    ...Object.keys(newOrder)
  ]);

  for (const key of allKeys) {
    const oldValue = oldOrder[key as keyof Order];
    const newValue = newOrder[key as keyof Order];

    // Skip id, created_at, updated_at
    if (["id", "created_at", "updated_at"].includes(key)) {
      continue;
    }

    // Compare values
    if (oldValue !== newValue) {
      changes.push({
        field: key,
        label: ORDER_FIELD_LABELS[key] || key,
        oldValue: formatValue(oldValue, key, lookupData),
        newValue: formatValue(newValue, key, lookupData)
      });
    }
  }

  return changes;
}

/**
 * Detect changes between two OrderItem objects
 */
export function detectOrderItemChanges(
  oldItem: OrderItem,
  newItem: OrderItem
): FieldChange[] {
  const changes: FieldChange[] = [];

  const allKeys = new Set([
    ...Object.keys(oldItem),
    ...Object.keys(newItem)
  ]);

  for (const key of allKeys) {
    const oldValue = oldItem[key as keyof OrderItem];
    const newValue = newItem[key as keyof OrderItem];

    // Skip id, order_id, created_at, updated_at
    if (["id", "order_id", "created_at", "updated_at"].includes(key)) {
      continue;
    }

    if (oldValue !== newValue) {
      changes.push({
        field: key,
        label: ORDER_ITEM_FIELD_LABELS[key] || key,
        oldValue: formatValue(oldValue),
        newValue: formatValue(newValue)
      });
    }
  }

  return changes;
}

/**
 * Format changes for notification message
 */
export function formatChangesForNotification(changes: FieldChange[]): string[] {
  return changes.map((change) => {
    return `${change.label}: ${change.oldValue} → ${change.newValue}`;
  });
}

/**
 * Detect changes between OrderFormData and Order
 * Useful for tracking changes made in the form
 */
export function detectFormChanges(
  formData: OrderFormData,
  originalOrder: Order,
  lookupData?: LookupData
): FieldChange[] {
  const changes: FieldChange[] = [];

  const fieldMappings: Record<string, keyof Order> = {
    orderId: "order_id",
    orderDate: "order_date",
    scheduledShipDate: "scheduled_ship_date",
    customerName: "customer_name",
    customerAddress: "customer_address",
    customerPhone: "customer_phone",
    customerEmail: "customer_email",
    customerNotes: "customer_notes",
    itemTotalUsd: "item_total_usd",
    discountRate: "discount_rate",
    buyerPaidUsd: "buyer_paid_usd",
    orderEarningsUsd: "order_earnings_usd",
    exchangeRate: "exchange_rate",
    itemTotalVnd: "item_total_vnd",
    buyerPaidVnd: "buyer_paid_vnd",
    orderEarningsVnd: "order_earnings_vnd",
    carrierUnit: "carrier_unit",
    internalTrackingNumber: "internal_tracking_number",
    trackingNumber: "tracking_number",
    actualShipDate: "actual_ship_date",
    shippingFeeUsd: "shipping_fee_usd",
    carrierNotes: "carrier_notes",
    refundFeeUsd: "refund_fee_usd",
    otherFeeUsd: "other_fee_usd",
    otherBonusUsd: "other_bonus_usd",
    refundFeeNotes: "refund_fee_notes",
    otherFeeNotes: "other_fee_notes",
    otherBonusNotes: "other_bonus_notes",
    employeeId: "artist_employee_id",
    artistCommissionRate: "artist_commission_rate",
    sellerEmployeeId: "seller_employee_id",
    generalStatusId: "general_status_id",
    customerStatusId: "customer_status_id",
    factoryStatusId: "factory_status_id",
    deliveryStatusId: "delivery_status_id"
  };

  for (const [formKey, orderKey] of Object.entries(fieldMappings)) {
    const formValue = formData[formKey as keyof OrderFormData];
    const orderValue = originalOrder[orderKey];

    // Normalize empty strings to null for comparison
    const normalizedFormValue = formValue === "" ? null : formValue;
    const normalizedOrderValue = orderValue === "" ? null : orderValue;

    if (normalizedFormValue !== normalizedOrderValue) {
      changes.push({
        field: orderKey,
        label: ORDER_FIELD_LABELS[orderKey] || orderKey,
        oldValue: formatValue(normalizedOrderValue, orderKey, lookupData),
        newValue: formatValue(normalizedFormValue, orderKey, lookupData)
      });
    }
  }

  return changes;
}

/**
 * Detect changes in OrderItems array
 */
export function detectOrderItemsChanges(
  oldItems: OrderItem[],
  newItems: OrderItem[]
): FieldChange[] {
  const changes: FieldChange[] = [];

  // Check for added items
  newItems.forEach((newItem) => {
    const oldItem = oldItems.find((item) => item.id === newItem.id);
    if (!oldItem) {
      changes.push({
        field: "items_added",
        label: "Thêm sản phẩm",
        oldValue: null,
        newValue: `${newItem.sku} - ${newItem.size} (x${newItem.quantity})`
      });
    }
  });

  // Check for removed items
  oldItems.forEach((oldItem) => {
    const newItem = newItems.find((item) => item.id === oldItem.id);
    if (!newItem) {
      changes.push({
        field: "items_removed",
        label: "Xóa sản phẩm",
        oldValue: `${oldItem.sku} - ${oldItem.size} (x${oldItem.quantity})`,
        newValue: null
      });
    }
  });

  // Check for modified items
  oldItems.forEach((oldItem) => {
    const newItem = newItems.find((item) => item.id === oldItem.id);
    if (newItem) {
      const itemChanges = detectOrderItemChanges(oldItem, newItem);
      itemChanges.forEach((change) => {
        changes.push({
          ...change,
          label: `${change.label} (${oldItem.sku})`
        });
      });
    }
  });

  return changes;
}
