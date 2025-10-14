// types/product.ts

import type { BaseEntity, Status } from './common';

export interface Product extends BaseEntity {
    shop_code: string;
    sku: string;
    title: string;
    etsy_url: string;
    image_url: string;
    status: Status;
    logo?: string;
}

export interface ProductFormData {
    shop_code: string;
    sku: string;
    title: string;
    etsy_url: string;
    image_url: string;
}