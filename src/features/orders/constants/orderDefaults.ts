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

// Carrier/Shipping units
export const CARRIER_UNITS = [
    { value: 'dhl', label: 'DHL' },
    { value: 'ups', label: 'UPS' },
    { value: 'fedex', label: 'FedEx' },
    { value: 'other', label: 'Khác' },
] as const;
