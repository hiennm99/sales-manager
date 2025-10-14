// src/components/StatusBadge.tsx

import React from 'react';
import {
    getGeneralStatusById,
    getCustomerStatusById,
    getFactoryStatusById,
    getDeliveryStatusById,
    getStatusColorClasses,
} from '../types/status';

interface StatusBadgeProps {
    type: 'general' | 'customer' | 'factory' | 'delivery';
    statusId: number | null;
    size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, statusId, size = 'md' }) => {
    let status = null;

    switch (type) {
        case 'general':
            status = getGeneralStatusById(statusId);
            break;
        case 'customer':
            status = getCustomerStatusById(statusId);
            break;
        case 'factory':
            status = getFactoryStatusById(statusId);
            break;
        case 'delivery':
            status = getDeliveryStatusById(statusId);
            break;
    }

    if (!status) {
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Chưa xác định
            </span>
        );
    }

    const { bg, text } = getStatusColorClasses(status.color);

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
    };

    return (
        <span className={`inline-flex items-center rounded-full font-medium ${bg} ${text} ${sizeClasses[size]}`}>
            {status.name_vi}
        </span>
    );
};

// Component for displaying all statuses of an order
interface OrderStatusesProps {
    generalStatusId: number | null;
    customerStatusId: number | null;
    factoryStatusId: number | null;
    deliveryStatusId: number | null;
    layout?: 'horizontal' | 'vertical' | 'grid';
}

export const OrderStatuses: React.FC<OrderStatusesProps> = ({
                                                                generalStatusId,
                                                                customerStatusId,
                                                                factoryStatusId,
                                                                deliveryStatusId,
                                                                layout = 'grid',
                                                            }) => {
    const statuses = [
        { type: 'general' as const, id: generalStatusId, label: 'Tổng quan' },
        { type: 'customer' as const, id: customerStatusId, label: 'Khách hàng' },
        { type: 'factory' as const, id: factoryStatusId, label: 'Nhà máy' },
        { type: 'delivery' as const, id: deliveryStatusId, label: 'Giao hàng' },
    ];

    if (layout === 'horizontal') {
        return (
            <div className="flex flex-wrap items-center gap-2">
                {statuses.map(({ type, id, label }) => (
                    <div key={type} className="flex items-center gap-1">
                        <span className="text-xs text-gray-600">{label}:</span>
                        <StatusBadge type={type} statusId={id} size="sm" />
                    </div>
                ))}
            </div>
        );
    }

    if (layout === 'vertical') {
        return (
            <div className="space-y-2">
                {statuses.map(({ type, id, label }) => (
                    <div key={type} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{label}:</span>
                        <StatusBadge type={type} statusId={id} size="sm" />
                    </div>
                ))}
            </div>
        );
    }

    // Grid layout (default)
    return (
        <div className="grid grid-cols-2 gap-3">
            {statuses.map(({ type, id, label }) => (
                <div key={type}>
                    <p className="text-xs text-gray-600 mb-1">{label}</p>
                    <StatusBadge type={type} statusId={id} size="md" />
                </div>
            ))}
        </div>
    );
};