// src/features/orders/pages/OrderCreate.tsx

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DEFAULTS } from "../../../constants/app-constants";
import { useExchangeRateStore } from "../../../store/useExchangeRateStore";
import type { Order, OrderItem } from "../../../types/order";
import { useShopStore } from "../../shops/store/useShopStore";
import { OrderForm } from "../components/OrderForm";
import { useOrderStore } from "../store/useOrderStore";

/**
 * Component for creating a new order
 * Initializes draft state and handles order creation
 */
export const OrderCreate: React.FC = () => {
  const navigate = useNavigate();
  const { selectedShop } = useShopStore();
  const { createOrder, initializeDraftForCreate } = useOrderStore();

  // Initialize draft state when component mounts or selected shop changes
  useEffect(() => {
    initializeDraftForCreate(selectedShop?.id);
  }, [initializeDraftForCreate, selectedShop?.id]);

  const handleSubmit = async (
    updatedOrder: Partial<Order>,
    updatedOrderItems: OrderItem[],
  ) => {
    try {
      // Extract required form fields
      const formData = extractFormData(updatedOrder);

      // Map order items to the expected format
      const items = updatedOrderItems.map((item) => ({
        sku: item.sku,
        size: item.size,
        type: item.type,
        quantity: item.quantity,
        unit_price_usd: item.unit_price_usd || 0,
      }));

      // Extract financial and status data (everything not in formData)
      const financialData = extractFinancialData(updatedOrder);

      const newOrder = await createOrder(formData, items, financialData);
      navigate(`/orders/${newOrder.id}`);
    } catch (error) {
      console.error("Failed to create order:", error);
      throw error; // Let OrderForm handle the error display
    }
  };

  return <OrderForm mode="create" onSubmit={handleSubmit} />;
};

/**
 * Extracts form data fields from the order object
 * Centralizes field extraction logic and default values
 * If exchange rate is old default (25000), use global rate instead
 */
function extractFormData(order: Partial<Order>) {
  const globalRate = useExchangeRateStore.getState().exchangeRate;
  const OLD_DEFAULT = 25000; // Old hardcoded default

  // Helper to replace old default with global rate
  const getRate = (value: number | undefined): number => {
    if (!value || value === OLD_DEFAULT) {
      return globalRate || DEFAULTS.EXCHANGE_RATE;
    }
    return value;
  };

  return {
    shopId: order.shop_id || 0,
    orderId: order.order_id || "",
    orderDate: order.order_date || "",
    scheduledShipDate: order.scheduled_ship_date || "",
    customerName: order.customer_name || "",
    customerAddress: order.customer_address || "",
    customerPhone: order.customer_phone || "",
    customerEmail: order.customer_email || "",
    customerNotes: order.customer_notes || "",
    employeeId: order.artist_employee_id || undefined,
    sellerEmployeeId: order.seller_employee_id || undefined,
    artistCommissionRate: order.artist_commission_rate || 0,
    actualShipDate: order.actual_ship_date || "",
    carrierUnit: order.carrier_unit || "",
    carrierNotes: order.carrier_notes || "",
    trackingNumber: order.tracking_number || "",
    internalTrackingNumber: order.internal_tracking_number || "",
    itemTotalUsd: order.item_total_usd || 0,
    discountRate: order.discount_rate || 0,
    buyerPaidUsd: order.buyer_paid_usd || 0,
    orderEarningsUsd: order.order_earnings_usd || 0,
    exchangeRate: getRate(order.exchange_rate),
    shippingFeeUsd: order.shipping_fee_usd || 0,
    shippingExchangeRate: getRate(order.shipping_exchange_rate),
    refundFeeUsd: order.refund_fee_usd || 0,
    refundFeeExchangeRate: getRate(order.refund_fee_exchange_rate),
    otherFeeUsd: order.other_fee_usd || 0,
    otherFeeExchangeRate: getRate(order.other_fee_exchange_rate),
    otherBonusUsd: order.other_bonus_usd || 0,
    otherBonusExchangeRate: getRate(order.other_bonus_exchange_rate),
    otherBonusNotes: order.other_bonus_notes || "",
  };
}

/**
 * Extracts financial and status data (fields not in formData)
 * This includes USD amounts, VND amounts, profit, commission, and status IDs
 */
function extractFinancialData(order: Partial<Order>) {
  return {
    // USD amounts (from form input)
    item_total_usd: order.item_total_usd,
    discount_rate: order.discount_rate,
    buyer_paid_usd: order.buyer_paid_usd,
    order_earnings_usd: order.order_earnings_usd,
    exchange_rate: order.exchange_rate,
    shipping_fee_usd: order.shipping_fee_usd,
    shipping_exchange_rate: order.shipping_exchange_rate,
    refund_fee_usd: order.refund_fee_usd,
    refund_fee_exchange_rate: order.refund_fee_exchange_rate,
    other_fee_usd: order.other_fee_usd,
    other_fee_exchange_rate: order.other_fee_exchange_rate,
    other_bonus_usd: order.other_bonus_usd,
    other_bonus_exchange_rate: order.other_bonus_exchange_rate,

    // VND amounts (calculated fields)
    item_total_vnd: order.item_total_vnd,
    buyer_paid_vnd: order.buyer_paid_vnd,
    order_earnings_vnd: order.order_earnings_vnd,
    shipping_fee_vnd: order.shipping_fee_vnd,
    refund_fee_vnd: order.refund_fee_vnd,
    other_fee_vnd: order.other_fee_vnd,
    other_bonus_vnd: order.other_bonus_vnd,
    profit_usd: order.profit_usd,
    profit_vnd: order.profit_vnd,

    // Commission
    artist_commission_rate: order.artist_commission_rate,

    // Status IDs
    general_status_id: order.general_status_id,
    customer_status_id: order.customer_status_id,
    factory_status_id: order.factory_status_id,
    delivery_status_id: order.delivery_status_id,

    // Additional notes
    refund_fee_notes: order.refund_fee_notes,
    other_fee_notes: order.other_fee_notes,
    other_bonus_notes: order.other_bonus_notes,
  };
}
