// types/product.ts

import type { BaseEntity } from './common';

export interface Product extends BaseEntity {
    shop_code: string;
    sku: string;
    title: string;
    etsy_url: string;
    image_url: string;
    is_active: boolean;  // Database field - boolean
}

export interface ProductFormData {
    shop_code: string;
    sku: string;
    title: string;
    etsy_url: string;
    image_url: string;
}

// Helper function to get status string from is_active
export const getProductStatus = (is_active: boolean): 'active' | 'inactive' => {
    return is_active ? 'active' : 'inactive';
};

// Helper function to get status label in Vietnamese
export const getProductStatusLabel = (is_active: boolean): string => {
    return is_active ? 'Hoạt động' : 'Tạm ngưng';
};