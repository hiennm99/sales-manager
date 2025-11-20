// src/features/orders/constants/index.ts

import { DEFAULTS } from "@constants";
import type { OrderFormData, OrderItemFormData } from "@types";

export const ORDER_DEFAULT_VALUES = {
  // Default status IDs
  GENERAL_STATUS_ID: 1, // active
  CUSTOMER_STATUS_ID: 1, // new
  FACTORY_STATUS_ID: 1, // pending
  DELIVERY_STATUS_ID: 1, // not_shipped

  // Default financial values
  EXCHANGE_RATE: DEFAULTS.EXCHANGE_RATE,
  DISCOUNT: 0,
  TAX: 0,
  FEES: 0,

  // Default item values
  ITEM_QUANTITY: 1,
  ITEM_PRICE_USD: 0,
  ITEM_PRICE_VND: 0
} as const;

/**
 * Initial order form data - used for creating new orders
 * Uses camelCase to match OrderFormData type definition
 */
export const INITIAL_ORDER: OrderFormData = {
  shopId: 0,
  orderId: "",
  orderDate: new Date().toISOString().split("T")[0],
  scheduledShipDate: "",

  customerName: "",
  customerAddress: "",
  verifiedCustomerAddress: "",
  isVerifiedAddress: false,
  customerPhone: "",
  customerEmail: "",
  customerNotes: "",

  employeeCode: "",
  employeeName: "",
  employeeId: undefined,
  artistCommissionRate: 0,
  sellerEmployeeName: "",
  sellerEmployeeId: undefined,
  actualShipDate: "",
  carrierUnit: "",
  carrierNotes: "",
  trackingNumber: "",
  internalTrackingNumber: "",
  itemTotalUsd: 0,
  discountRate: 0,
  buyerPaidUsd: 0,
  orderEarningsUsd: 0,
  exchangeRate: DEFAULTS.EXCHANGE_RATE,
  shippingFeeUsd: 0,
  shippingExchangeRate: DEFAULTS.EXCHANGE_RATE,
  refundFeeUsd: 0,
  refundFeeExchangeRate: DEFAULTS.EXCHANGE_RATE,
  otherFeeUsd: 0,
  otherFeeExchangeRate: DEFAULTS.EXCHANGE_RATE,
  otherBonusUsd: 0,
  otherBonusExchangeRate: DEFAULTS.EXCHANGE_RATE,
  otherBonusNotes: "",
  refundFeeNotes: "",
  otherFeeNotes: "",
  generalStatusId: ORDER_DEFAULT_VALUES.GENERAL_STATUS_ID,
  customerStatusId: ORDER_DEFAULT_VALUES.CUSTOMER_STATUS_ID,
  factoryStatusId: ORDER_DEFAULT_VALUES.FACTORY_STATUS_ID,
  deliveryStatusId: ORDER_DEFAULT_VALUES.DELIVERY_STATUS_ID
};

/**
 * Initial order item data - used for creating new order items
 */
export const INITIAL_ORDER_ITEM: OrderItemFormData = {
  sku: "",
  size: "",
  type: "",
  quantity: ORDER_DEFAULT_VALUES.ITEM_QUANTITY,
  unit_price_usd: 0
};

/**
 * Initial status values
 */
export const INITIAL_STATUS_VALUES = {
  general: ORDER_DEFAULT_VALUES.GENERAL_STATUS_ID,
  customer: ORDER_DEFAULT_VALUES.CUSTOMER_STATUS_ID,
  factory: ORDER_DEFAULT_VALUES.FACTORY_STATUS_ID,
  delivery: ORDER_DEFAULT_VALUES.DELIVERY_STATUS_ID
};

// Product types
export const ITEM_TYPES = [
  { value: "rolled", label: "Cuộn" },
  { value: "stretched", label: "Căng" },
  { value: "gold_frame", label: "Khung vàng" },
  { value: "silver_frame", label: "Khung bạc" },
  { value: "black_frame", label: "Khung đen" },
  { value: "white_frame", label: "Khung trắng" },
  { value: "wood_frame", label: "Khung gỗ" }
] as const;

// Carrier/Shipping units
export const CARRIER_UNITS = [
  { value: "dhl", label: "DHL" },
  { value: "ups", label: "UPS" },
  { value: "fedex", label: "FedEx" },
  { value: "other", label: "Khác" }
] as const;
