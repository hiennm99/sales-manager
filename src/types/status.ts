// types/status.ts

import type { BaseEntity } from './common';

// ============================================
// GENERAL STATUS
// ============================================
export interface GeneralStatus extends BaseEntity {
    name: string;
    name_vi: string;
    color: string;
    description?: string;
}

export const GENERAL_STATUSES: Record<string, GeneralStatus> = {
    active: {
        id: 1,
        name: 'active',
        name_vi: 'Hoạt động',
        color: 'green',
        is_active: true
    },
    cancelled: {
        id: 2,
        name: 'cancelled',
        name_vi: 'Đã hủy',
        color: 'red',
        is_active: true,
    },
    on_hold: {
        id: 3,
        name: 'on_hold',
        name_vi: 'Tạm giữ',
        color: 'yellow',
        is_active: true,
    },
};

// ============================================
// CUSTOMER STATUS
// ============================================
export interface CustomerStatus extends BaseEntity {
    name: string;
    name_vi: string;
    color: string;
    description?: string;
}

export const CUSTOMER_STATUSES: Record<string, CustomerStatus> = {
    new: {
        id: 1,
        name: 'new',
        name_vi: 'Mới',
        color: 'blue',
        is_active: true,
    },
    contacted: {
        id: 2,
        name: 'contacted',
        name_vi: 'Đã liên hệ',
        color: 'indigo',
        is_active: true,
    },
    confirmed: {
        id: 3,
        name: 'confirmed',
        name_vi: 'Đã xác nhận',
        color: 'green',
        is_active: true,
    },
    completed: {
        id: 4,
        name: 'completed',
        name_vi: 'Hoàn thành',
        color: 'purple',
        is_active: true,
    },
};

// ============================================
// FACTORY STATUS
// ============================================
export interface FactoryStatus extends BaseEntity {
    name: string;
    name_vi: string;
    color: string;
    description?: string;
}

export const FACTORY_STATUSES: Record<string, FactoryStatus> = {
    pending: {
        id: 1,
        name: 'pending',
        name_vi: 'Chờ sản xuất',
        color: 'gray',
        is_active: true,
    },
    in_production: {
        id: 2,
        name: 'in_production',
        name_vi: 'Đang sản xuất',
        color: 'blue',
        is_active: true,
    },
    quality_check: {
        id: 3,
        name: 'quality_check',
        name_vi: 'Kiểm tra chất lượng',
        color: 'yellow',
        is_active: true,
    },
    ready: {
        id: 4,
        name: 'ready',
        name_vi: 'Sẵn sàng',
        color: 'green',
        is_active: true,
    },
};

// ============================================
// DELIVERY STATUS
// ============================================
export interface DeliveryStatus extends BaseEntity {
    name: string;
    name_vi: string;
    color: string;
    description?: string;
}

export const DELIVERY_STATUSES: Record<string, DeliveryStatus> = {
    not_shipped: {
        id: 1,
        name: 'not_shipped',
        name_vi: 'Chưa giao',
        color: 'gray',
        is_active: true,
    },
    preparing: {
        id: 2,
        name: 'preparing',
        name_vi: 'Đang chuẩn bị',
        color: 'yellow',
        is_active: true,
    },
    in_transit: {
        id: 3,
        name: 'in_transit',
        name_vi: 'Đang vận chuyển',
        color: 'blue',
    },
    delivered: {
        id: 4,
        name: 'delivered',
        name_vi: 'Đã giao',
        color: 'green',
    },
    returned: {
        id: 5,
        name: 'returned',
        name_vi: 'Hoàn trả',
        color: 'red',
    },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getGeneralStatusById = (id: number | null): GeneralStatus | null => {
    if (!id) return null;
    return Object.values(GENERAL_STATUSES).find(s => s.id === id) || null;
};

export const getCustomerStatusById = (id: number | null): CustomerStatus | null => {
    if (!id) return null;
    return Object.values(CUSTOMER_STATUSES).find(s => s.id === id) || null;
};

export const getFactoryStatusById = (id: number | null): FactoryStatus | null => {
    if (!id) return null;
    return Object.values(FACTORY_STATUSES).find(s => s.id === id) || null;
};

export const getDeliveryStatusById = (id: number | null): DeliveryStatus | null => {
    if (!id) return null;
    return Object.values(DELIVERY_STATUSES).find(s => s.id === id) || null;
};

// Get badge color classes
export const getStatusColorClasses = (color: string): { bg: string; text: string } => {
    const colorMap: Record<string, { bg: string; text: string }> = {
        gray: { bg: 'bg-gray-100', text: 'text-gray-800' },
        red: { bg: 'bg-red-100', text: 'text-red-800' },
        yellow: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
        green: { bg: 'bg-green-100', text: 'text-green-800' },
        blue: { bg: 'bg-blue-100', text: 'text-blue-800' },
        indigo: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
        purple: { bg: 'bg-purple-100', text: 'text-purple-800' },
    };
    return colorMap[color] || colorMap.gray;
};