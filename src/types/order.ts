// types/order.ts

import type { BaseEntity } from "./common";

export interface Order extends BaseEntity {
  shop_id: number;
  order_id: string;
  order_date: string;
  scheduled_ship_date: string | null;

  // Customer info
  customer_name: string;
  customer_address: string;
  customer_phone: string | null;
  customer_email: string | null;
  customer_notes: string | null;

  // USD amounts
  item_total_usd: number;
  discount_rate: number;
  buyer_paid_usd: number;
  order_earnings_usd: number;

  // VND amounts
  exchange_rate: number;
  item_total_vnd: number;
  buyer_paid_vnd: number;
  order_earnings_vnd: number;

  // Shipping info
  carrier_notes: string | null;
  internal_tracking_number: string | null;
  carrier_unit: string | null;
  tracking_number: string | null;
  actual_ship_date: string | null;
  shipping_fee_usd: number;
  shipping_exchange_rate: number;
  shipping_fee_vnd: number;

  // Refund info
  refund_fee_usd: number;
  refund_fee_exchange_rate: number;
  refund_fee_vnd: number;
  refund_fee_notes: string | null;

  // Other fees
  other_fee_usd: number;
  other_fee_exchange_rate: number;
  other_fee_vnd: number;
  other_fee_notes: string | null;

  // Other bonus
  other_bonus_usd: number;
  other_bonus_exchange_rate: number;
  other_bonus_vnd: number;
  other_bonus_notes: string | null;

  // Profit
  profit_usd: number;
  profit_vnd: number;

  // Artist (draws the order, gets artist_commission_rate % of profit per order)
  artist_employee_id: number | null;
  artist_commission_rate: number | null; // Artist commission percentage (0-100) of profit_vnd

  // Seller Employee (sells the order, gets fixed % of monthly total sales)
  seller_employee_id: number | null;

  // Statuses
  general_status_id: number | null;
  customer_status_id: number | null;
  factory_status_id: number | null;
  delivery_status_id: number | null;
}

export interface OrderItem extends BaseEntity {
  order_id: number;
  sku: string;
  size: string;
  type: string;
  quantity: number;
  unit_price_usd: number;
}

export interface OrderFormData {
  // Exchange rates
  shippingExchangeRate?: number;
  refundFeeExchangeRate?: number;
  otherFeeExchangeRate?: number;
  otherBonusExchangeRate?: number;

  // Basic info
  shopId: number;
  orderId: string;
  orderDate: string;
  scheduledShipDate?: string;

  // Customer info
  customerName: string;
  customerAddress: string;
  customerPhone?: string;
  customerEmail?: string;
  customerNotes?: string;

  // Artist Employee (draws the order)
  employeeCode?: string; // Used for form input/display (legacy)
  employeeName?: string; // Used for form input/display (new)
  employeeId?: number; // Used for database storage (artist_employee_id)
  artistCommissionRate?: number;

  // Seller Employee (sells the order)
  sellerEmployeeName?: string; // Used for form input/display
  sellerEmployeeId?: number; // Used for database storage (seller_employee_id)

  // Shipping info
  carrierUnit?: string;
  internalTrackingNumber?: string;
  trackingNumber?: string;
  actualShipDate?: string;
  shippingFeeUsd?: number;
  carrierNotes?: string;

  // Financial info - USD
  itemTotalUsd?: number;
  discountRate?: number;
  buyerPaidUsd?: number;
  orderEarningsUsd?: number;
  exchangeRate?: number;

  // Fees - USD
  refundFeeUsd?: number;
  otherFeeUsd?: number;
  otherBonusUsd?: number;

  // Notes
  refundFeeNotes?: string;
  otherFeeNotes?: string;
  otherBonusNotes?: string;

  // Statuses
  generalStatusId?: number;
  customerStatusId?: number;
  factoryStatusId?: number;
  deliveryStatusId?: number;
}

export interface OrderItemFormData {
  sku: string;
  size: string;
  type: string;
  quantity: number;
  unit_price_usd?: number;
}

// Helper function to convert Order to OrderFormData
// Note: employeeName will be populated by the component when employees are loaded
export const orderToFormData = (order: Order): OrderFormData => {
  return {
    shippingExchangeRate: order.shipping_exchange_rate,
    refundFeeExchangeRate: order.refund_fee_exchange_rate,
    otherFeeExchangeRate: order.other_fee_exchange_rate,
    otherBonusExchangeRate: order.other_bonus_exchange_rate,
    shopId: order.shop_id,
    orderId: order.order_id,
    orderDate: order.order_date,
    scheduledShipDate: order.scheduled_ship_date || "",
    customerName: order.customer_name,
    customerAddress: order.customer_address,
    customerPhone: order.customer_phone || "",
    customerEmail: order.customer_email || "",
    customerNotes: order.customer_notes || "",
    employeeCode: "", // Legacy field - will be populated by component if needed
    employeeName: "", // Will be populated by component when employee is loaded
    employeeId: order.artist_employee_id || undefined,
    artistCommissionRate: order.artist_commission_rate ?? undefined,
    sellerEmployeeName: "", // Will be populated by component when employee is loaded
    sellerEmployeeId: order.seller_employee_id || undefined,

    // Shipping info
    carrierUnit: order.carrier_unit || "",
    internalTrackingNumber: order.internal_tracking_number || "",
    trackingNumber: order.tracking_number || "",
    actualShipDate: order.actual_ship_date || "",
    shippingFeeUsd: order.shipping_fee_usd || 0,
    carrierNotes: order.carrier_notes || "",

    // Financial info
    itemTotalUsd: order.item_total_usd || 0,
    discountRate: order.discount_rate || 0,
    buyerPaidUsd: order.buyer_paid_usd || 0,
    orderEarningsUsd: order.order_earnings_usd || 0,
    exchangeRate: order.exchange_rate || 0,
    refundFeeUsd: order.refund_fee_usd || 0,
    otherFeeUsd: order.other_fee_usd || 0,
    otherBonusUsd: order.other_bonus_usd || 0,
    refundFeeNotes: order.refund_fee_notes || "",
    otherFeeNotes: order.other_fee_notes || "",
    otherBonusNotes: order.other_bonus_notes || "",

    // Statuses
    generalStatusId: order.general_status_id || 1,
    customerStatusId: order.customer_status_id || 1,
    factoryStatusId: order.factory_status_id || 1,
    deliveryStatusId: order.delivery_status_id || 1,
  };
};

// Helper function to populate employee names in form data
export const populateEmployeeName = (
  formData: OrderFormData,
  employees: Array<{ id: number; name: string; code: string }>,
): OrderFormData => {
  const updatedFormData = { ...formData };

  // Populate artist employee name
  if (formData.employeeId && employees.length > 0) {
    // Convert to number in case it's a string
    const employeeIdNum =
      typeof formData.employeeId === "string"
        ? parseInt(formData.employeeId, 10)
        : formData.employeeId;

    const employee = employees.find((emp) => emp.id === employeeIdNum);
    if (employee) {
      updatedFormData.employeeName = employee.name;
      updatedFormData.employeeCode = employee.code; // Also populate code for legacy compatibility
      updatedFormData.employeeId = employeeIdNum; // Ensure it's stored as number
    }
  }

  // Populate seller employee name
  if (formData.sellerEmployeeId && employees.length > 0) {
    // Convert to number in case it's a string
    const sellerEmployeeIdNum =
      typeof formData.sellerEmployeeId === "string"
        ? parseInt(formData.sellerEmployeeId, 10)
        : formData.sellerEmployeeId;

    const sellerEmployee = employees.find(
      (emp) => emp.id === sellerEmployeeIdNum,
    );
    if (sellerEmployee) {
      updatedFormData.sellerEmployeeName = sellerEmployee.name;
      updatedFormData.sellerEmployeeId = sellerEmployeeIdNum; // Ensure it's stored as number
    }
  }

  return updatedFormData;
};
