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
}

export interface OrderFormData {
    shop_code: string;
    order_id: string;
    order_date: string;
    scheduled_ship_date?: string;
    customer_name: string;
    customer_address: string;
    customer_phone?: string;
    customer_notes?: string;
    artist_code?: string;
}

export interface OrderItemFormData {
    sku: string;
    size: string;
    type: string;
    quantity: number;
}

// Helper function to calculate profit USD
export const calculateProfitUSD = (order: Order): number => {
    return order.order_earnings_usd - order.shipping_fee_usd - order.refund_fee_usd - order.other_fee_usd;
};

// Helper function to calculate profit VND
export const calculateProfitVND = (order: Order): number => {
    return order.order_earnings_vnd - order.shipping_fee_vnd - order.refund_fee_vnd - order.other_fee_vnd;
};

// Helper function to check if order is shipped
export const isOrderShipped = (order: Order): boolean => {
    return order.actual_ship_date !== null;
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