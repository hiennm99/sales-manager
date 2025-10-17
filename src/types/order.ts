// types/order.ts

import type { BaseEntity } from './common';

export interface Order extends BaseEntity {
    shop_code: string;
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

    // Artist
    commission_rate: number; // Percentage (0-100)
    artist_code: string | null;

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
    refundFeeExchangeRate: number | undefined;
    otherFeeExchangeRate: number | undefined;
    otherBonusExchangeRate: number | undefined;
    shippingExchangeRate: number | undefined;
    shop_code: string;
    order_id: string;
    order_date: string;
    scheduled_ship_date?: string;
    customer_name: string;
    customer_address: string;
    customer_phone?: string;
    customer_email?: string;
    customer_notes?: string;
    artist_code?: string;
    
    // Shipping info (optional for partial forms)
    carrierUnit?: string;
    internalTrackingNumber?: string;
    trackingNumber?: string;
    actualShipDate?: string;
    shippingFeeUsd?: number;
    carrierNotes?: string;
    
    // Financial info (optional for partial forms)
    itemTotalUsd?: number;
    discountRate?: number;
    buyerPaidUsd?: number;
    orderEarningsUsd?: number;
    exchangeRate?: number;
    refundFeeUsd?: number;
    otherFeeUsd?: number;
    otherBonusUsd?: number;
    otherBonusNotes?: string;
}

export interface OrderItemFormData {
    sku: string;
    size: string;
    type: string;
    quantity: number;
    unit_price_usd?: number;
}

// Helper function to calculate profit USD
// NOTE: This is for DISPLAY purposes only. The actual profit is calculated automatically
// by the database trigger 'calculate_order_financials' on INSERT/UPDATE.
// Formula: profit = earnings + bonus - shipping - refund - other_fee
export const calculateProfitUSD = (order: Order): number => {
    return order.order_earnings_usd - order.shipping_fee_usd - order.refund_fee_usd - order.other_fee_usd + order.other_bonus_usd;
};

// Helper function to calculate profit VND
// NOTE: This is for DISPLAY purposes only. The actual profit is calculated automatically
// by the database trigger 'calculate_order_financials' on INSERT/UPDATE.
// Formula: profit = earnings + bonus - shipping - refund - other_fee
export const calculateProfitVND = (order: Order): number => {
    return order.order_earnings_vnd - order.shipping_fee_vnd - order.refund_fee_vnd - order.other_fee_vnd + order.other_bonus_vnd;
};

// Helper function to check if order is shipped
export const isOrderShipped = (order: Order): boolean => {
    return order.actual_ship_date !== null;
};

// Helper function to convert Order to OrderFormData
export const orderToFormData = (order: Order): OrderFormData => {
    return {
        otherFeeExchangeRate: undefined, 
        refundFeeExchangeRate: undefined, 
        otherBonusExchangeRate: undefined,
        shippingExchangeRate: undefined,
        shop_code: order.shop_code,
        order_id: order.order_id,
        order_date: order.order_date,
        scheduled_ship_date: order.scheduled_ship_date || '',
        customer_name: order.customer_name,
        customer_address: order.customer_address,
        customer_phone: order.customer_phone || '',
        customer_email: order.customer_email || '',
        customer_notes: order.customer_notes || '',
        artist_code: order.artist_code || '',
        
        // Shipping info
        carrierUnit: order.carrier_unit || '',
        internalTrackingNumber: order.internal_tracking_number || '',
        trackingNumber: order.tracking_number || '',
        actualShipDate: order.actual_ship_date || '',
        shippingFeeUsd: order.shipping_fee_usd || 0,
        carrierNotes: order.carrier_notes || '',
        
        // Financial info
        itemTotalUsd: order.item_total_usd || 0,
        discountRate: order.discount_rate || 0,
        buyerPaidUsd: order.buyer_paid_usd || 0,
        orderEarningsUsd: order.order_earnings_usd || 0,
        exchangeRate: order.exchange_rate || 0,
        refundFeeUsd: order.refund_fee_usd || 0,
        otherFeeUsd: order.other_fee_usd || 0,
        otherBonusUsd: order.other_bonus_usd || 0,
        otherBonusNotes: order.other_bonus_notes || ''
    };
};

// Helper function to format currency
export const formatCurrency = (amount: number, currency: 'USD' | 'VND'): string => {
    if (currency === 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    }
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
};

// Helper function to get status string from is_active
export const getOrderStatus = (is_active: boolean): 'active' | 'inactive' => {
    return is_active ? 'active' : 'inactive';
};

// Helper function to get status label in Vietnamese
export const getOrderStatusLabel = (is_active: boolean): string => {
    return is_active ? 'Hoạt động' : 'Tạm ngưng';
};