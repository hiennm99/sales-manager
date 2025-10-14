// types/shop.ts

import type { BaseEntity } from './common';

export interface Shop extends BaseEntity {
    name: string;
    code: string;
    is_active: boolean;
    logo: string;
}

export interface ShopFormData {
    name: string;
    code: string;
    logo: string;
}