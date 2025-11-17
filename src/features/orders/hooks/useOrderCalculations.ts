// src/features/orders/hooks/useOrderCalculations.ts
/**
 * Custom hook for order financial calculations
 * Provides real-time calculations based on current draft state
 * Works consistently for both Create and Edit modes
 */

import { ORDER_DEFAULT_VALUES } from "@features/orders";
import type { OrderFormData, OrderItemFormData } from "@types";
import { useMemo } from "react";

interface UseOrderCalculationsProps {
  draftOrder: OrderFormData;
  draftItems: OrderItemFormData[];
}

interface OrderCalculations {
  // Item totals
  itemTotalUsd: number;
  itemTotalVnd: number;

  // After discount
  discountAmountUsd: number;
  subtotalUsd: number;
  subtotalVnd: number;

  // Buyer paid
  buyerPaidVnd: number;

  // Order earnings
  orderEarningsVnd: number;

  // Fees
  shippingFeeVnd: number;
  refundFeeVnd: number;
  otherFeeVnd: number;

  // Bonus
  otherBonusVnd: number;

  // Profit (calculated but not used - DB trigger handles this)
  profitUsd: number;
  profitVnd: number;
}

export const useOrderCalculations = ({
                                       draftOrder,
                                       draftItems
                                     }: UseOrderCalculationsProps): OrderCalculations => {
  return useMemo(() => {
    const exchangeRate =
      draftOrder.exchangeRate || ORDER_DEFAULT_VALUES.EXCHANGE_RATE;

    // 1. Calculate item total from current items (ALWAYS realtime)
    const itemTotalUsd = draftItems.reduce(
      (sum, item) => sum + item.quantity * (item.unit_price_usd || 0),
      0
    );

    // 2. Apply discount
    const discountAmountUsd =
      (itemTotalUsd * (draftOrder.discountRate || 0)) / 100;
    const subtotalUsd = itemTotalUsd - discountAmountUsd;

    // 3. Convert to VND
    const itemTotalVnd = itemTotalUsd * exchangeRate;
    const subtotalVnd = subtotalUsd * exchangeRate;
    const buyerPaidVnd = (draftOrder.buyerPaidUsd || 0) * exchangeRate;
    const orderEarningsVnd = (draftOrder.orderEarningsUsd || 0) * exchangeRate;

    // 4. Fees with their own exchange rates
    const shippingFeeVnd =
      (draftOrder.shippingFeeUsd || 0) *
      (draftOrder.shippingExchangeRate || exchangeRate);

    const refundFeeVnd =
      (draftOrder.refundFeeUsd || 0) *
      (draftOrder.refundFeeExchangeRate || exchangeRate);

    const otherFeeVnd =
      (draftOrder.otherFeeUsd || 0) *
      (draftOrder.otherFeeExchangeRate || exchangeRate);

    const otherBonusVnd =
      (draftOrder.otherBonusUsd || 0) *
      (draftOrder.otherBonusExchangeRate || exchangeRate);

    // 5. Calculate profit (for preview only, DB trigger will handle actual)
    const profitUsd =
      (draftOrder.orderEarningsUsd || 0) +
      (draftOrder.otherBonusUsd || 0) -
      (draftOrder.shippingFeeUsd || 0) -
      (draftOrder.refundFeeUsd || 0) -
      (draftOrder.otherFeeUsd || 0);

    const profitVnd =
      orderEarningsVnd +
      otherBonusVnd -
      shippingFeeVnd -
      refundFeeVnd -
      otherFeeVnd;

    return {
      itemTotalUsd,
      itemTotalVnd,
      discountAmountUsd,
      subtotalUsd,
      subtotalVnd,
      buyerPaidVnd,
      orderEarningsVnd,
      shippingFeeVnd,
      refundFeeVnd,
      otherFeeVnd,
      otherBonusVnd,
      profitUsd,
      profitVnd
    };
  }, [draftOrder, draftItems]);
};
