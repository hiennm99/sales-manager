// src/features/orders/constants/orderDefaults.ts

export const ORDER_DEFAULT_VALUES = {
    // Default status IDs
    GENERAL_STATUS_ID: 1,      // active
    CUSTOMER_STATUS_ID: 1,     // new
    FACTORY_STATUS_ID: 1,      // pending
    DELIVERY_STATUS_ID: 1,     // not_shipped
    
    // Default financial values
    EXCHANGE_RATE: 25000,
    DISCOUNT: 0,
    TAX: 0,
    FEES: 0,
    
    // Default item values
    ITEM_QUANTITY: 1,
    ITEM_PRICE_USD: 0,
    ITEM_PRICE_VND: 0,
} as const;

// Product types
export const ITEM_TYPES = [
    { value: 'rolled', label: 'Cuộn' },
    { value: 'stretched', label: 'Căng' },
    { value: 'gold_frame', label: 'Khung vàng' },
    { value: 'silver_frame', label: 'Khung bạc' },
    { value: 'black_frame', label: 'Khung đen' },
    { value: 'white_frame', label: 'Khung trắng' },
    { value: 'wood_frame', label: 'Khung gỗ' },
] as const;

// Carrier/Shipping units
export const CARRIER_UNITS = [
    { value: 'dhl', label: 'DHL' },
    { value: 'ups', label: 'UPS' },
    { value: 'fedex', label: 'FedEx' },
    { value: 'other', label: 'Khác' },
] as const;
