// types/product.ts

import type { BaseEntity, Status } from './common';

export interface Product extends BaseEntity {
    sku: string;
    title: string;
    etsy_url: string;
    image_url: string;
    status: Status;
    logo?: string;
}

export interface ProductFormData {
    sku: string;
    title: string;
    etsy_url: string;
    image_url: string;
}