// types/shop.ts

import type { BaseEntity, Status } from './common';

export interface Shop extends BaseEntity {
    name: string;
    code: string;
    status: Status;
    logo?: string;
}

export interface ShopFormData {
    name: string;
    code: string;
    logo?: string;
}