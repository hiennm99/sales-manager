// src/features/orders/components/sections/OrderStatusSection.tsx

import React from 'react';
import { SectionCard } from '../shared/SectionCard';
import { StatusSelect } from '../StatusSelect';
import { getStatusColorClasses } from '../../../../types/status';
import type { Status } from '../../../../types/status';

interface OrderStatusSectionProps {
    mode: 'view' | 'edit';
    currentStatuses?: {
        general: Status | null;
        customer: Status | null;
        factory: Status | null;
        delivery: Status | null;
    };
    statusValues: {
        general: number;
        customer: number;
        factory: number;
        delivery: number;
    };
    statusOptions: {
        general: Status[];
        customer: Status[];
        factory: Status[];
        delivery: Status[];
    };
    onStatusChange: (type: 'general' | 'customer' | 'factory' | 'delivery', value: number) => void;
    onUpdate?: () => void;
    isLoading?: boolean;
}

const StatusIcon = (
    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const getStatusBadge = (status: Status | null) => {
    if (!status) return null;
    const colors = getStatusColorClasses(status.color);
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text}`}>
            {status.name_vi}
        </span>
    );
};

export const OrderStatusSection: React.FC<OrderStatusSectionProps> = ({
                                                                          mode,
                                                                          currentStatuses,
                                                                          statusValues,
                                                                          statusOptions,
                                                                          onStatusChange,
                                                                          onUpdate,
                                                                          isLoading = false
                                                                      }) => {
    if (mode === 'view' && currentStatuses) {
        return (
            <SectionCard
                title="Trạng thái đơn hàng"
                icon={StatusIcon}
                iconGradient="from-purple-500 to-indigo-600"
            >
                {/* Current Statuses */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div>
                        <p className="text-xs text-gray-600 mb-2 font-medium">Tổng quan</p>
                        {getStatusBadge(currentStatuses.general)}
                    </div>
                    <div>
                        <p className="text-xs text-gray-600 mb-2 font-medium">Khách hàng</p>
                        {getStatusBadge(currentStatuses.customer)}
                    </div>
                    <div>
                        <p className="text-xs text-gray-600 mb-2 font-medium">Nhà máy</p>
                        {getStatusBadge(currentStatuses.factory)}
                    </div>
                    <div>
                        <p className="text-xs text-gray-600 mb-2 font-medium">Giao hàng</p>
                        {getStatusBadge(currentStatuses.delivery)}
                    </div>
                </div>

                {/* Update Statuses */}
                <div className="border-t border-gray-200 pt-6">
                    <p className="text-sm font-semibold text-gray-900 mb-4">Cập nhật trạng thái</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <StatusSelect
                            label="Tổng quan"
                            value={statusValues.general}
                            onChange={(value) => onStatusChange('general', value)}
                            options={statusOptions.general}
                        />
                        <StatusSelect
                            label="Khách hàng"
                            value={statusValues.customer}
                            onChange={(value) => onStatusChange('customer', value)}
                            options={statusOptions.customer}
                        />
                        <StatusSelect
                            label="Nhà máy"
                            value={statusValues.factory}
                            onChange={(value) => onStatusChange('factory', value)}
                            options={statusOptions.factory}
                        />
                        <StatusSelect
                            label="Giao hàng"
                            value={statusValues.delivery}
                            onChange={(value) => onStatusChange('delivery', value)}
                            options={statusOptions.delivery}
                        />
                    </div>
                    {onUpdate && (
                        <button
                            onClick={onUpdate}
                            disabled={isLoading}
                            className="w-full px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                        >
                            {isLoading ? 'Đang cập nhật...' : 'Cập nhật trạng thái'}
                        </button>
                    )}
                </div>
            </SectionCard>
        );
    }

    return (
        <SectionCard
            title="Trạng thái đơn hàng"
            icon={StatusIcon}
            iconGradient="from-purple-500 to-indigo-600"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatusSelect
                    label="Trạng thái tổng quan"
                    value={statusValues.general}
                    onChange={(value) => onStatusChange('general', value)}
                    options={statusOptions.general}
                />
                <StatusSelect
                    label="Trạng thái khách hàng"
                    value={statusValues.customer}
                    onChange={(value) => onStatusChange('customer', value)}
                    options={statusOptions.customer}
                />
                <StatusSelect
                    label="Trạng thái nhà máy"
                    value={statusValues.factory}
                    onChange={(value) => onStatusChange('factory', value)}
                    options={statusOptions.factory}
                />
                <StatusSelect
                    label="Trạng thái giao hàng"
                    value={statusValues.delivery}
                    onChange={(value) => onStatusChange('delivery', value)}
                    options={statusOptions.delivery}
                />
            </div>
        </SectionCard>
    );
};