// src/features/orders/components/sections/OrderStatusSection.tsx
/**
 * OrderStatusSection - Trạng thái đơn hàng
 * Uses common OptionBox components with specific onChange handlers
 */

import React from 'react';
import { SectionCard } from '../../../../components/common';
import { OptionBox, type Option } from '../../../../components/common';
import { getStatusColorClasses } from '../../../../types/status';
import type { Status } from '../../../../types/status';

interface OrderStatusSectionProps {
    mode: 'view' | 'edit';
    // For view mode
    currentStatuses?: {
        general: Status | null;
        customer: Status | null;
        factory: Status | null;
        delivery: Status | null;
    };
    // For both modes
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
    // For view mode editing controls
    onUpdate?: () => void;
    onEdit?: () => void;
    onCancel?: () => void;
    isLoading?: boolean;
    editable?: boolean;
}

const StatusIcon = (
    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const getStatusBadge = (status: Status | null, onClick?: () => void, editable?: boolean) => {
    if (!status) return <span className="text-gray-500">Không xác định</span>;
    const colors = getStatusColorClasses(status.color);
    
    if (!editable || !onClick) {
        return (
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${colors.bg} ${colors.text}`}>
                {status.name_vi}
            </span>
        );
    }
    
    return (
        <button
            onClick={onClick}
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${colors.bg} ${colors.text} transition-all duration-200 hover:opacity-80 cursor-pointer hover:shadow-md`}
        >
            {status.name_vi}
            <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
        </button>
    );
};

export const OrderStatusSection: React.FC<OrderStatusSectionProps> = ({
    mode,
    currentStatuses,
    statusValues,
    statusOptions,
    onStatusChange,
    onUpdate,
    onEdit,
    onCancel,
    isLoading = false,
    editable = true
}) => {
    // Convert Status[] to Option[]
    const convertToOptions = (statuses: Status[]): Option[] => {
        return statuses.map(status => ({
            value: status.id,
            label: status.name_vi,
            color: status.color
        }));
    };

    // Handler wrapper for status changes
    const handleStatusChange = (type: 'general' | 'customer' | 'factory' | 'delivery') => 
        (value: string | number) => {
            onStatusChange(type, Number(value));
        };

    if (mode === 'view' && currentStatuses) {
        return (
            <SectionCard
                title="Trạng thái đơn hàng"
                icon={StatusIcon}
                iconGradient="from-purple-500 to-indigo-600"
            >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p className="text-xs text-gray-600 mb-2 font-medium">Tổng quan</p>
                        {getStatusBadge(currentStatuses.general, editable ? onEdit : undefined, editable)}
                    </div>
                    <div>
                        <p className="text-xs text-gray-600 mb-2 font-medium">Khách hàng</p>
                        {getStatusBadge(currentStatuses.customer, editable ? onEdit : undefined, editable)}
                    </div>
                    <div>
                        <p className="text-xs text-gray-600 mb-2 font-medium">Nhà máy</p>
                        {getStatusBadge(currentStatuses.factory, editable ? onEdit : undefined, editable)}
                    </div>
                    <div>
                        <p className="text-xs text-gray-600 mb-2 font-medium">Giao hàng</p>
                        {getStatusBadge(currentStatuses.delivery, editable ? onEdit : undefined, editable)}
                    </div>
                </div>
                {editable && (
                    <div className="mt-4 text-xs text-gray-500 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Click vào trạng thái để chỉnh sửa
                    </div>
                )}
            </SectionCard>
        );
    }

    // Edit mode
    return (
        <SectionCard
            title="Trạng thái đơn hàng"
            icon={StatusIcon}
            iconGradient="from-purple-500 to-indigo-600"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <OptionBox
                    label="Tổng quan"
                    name="general_status"
                    value={statusValues.general}
                    options={convertToOptions(statusOptions.general)}
                    editable={true}
                    onChange={handleStatusChange('general')}
                />
                
                <OptionBox
                    label="Khách hàng"
                    name="customer_status"
                    value={statusValues.customer}
                    options={convertToOptions(statusOptions.customer)}
                    editable={true}
                    onChange={handleStatusChange('customer')}
                />
                
                <OptionBox
                    label="Nhà máy"
                    name="factory_status"
                    value={statusValues.factory}
                    options={convertToOptions(statusOptions.factory)}
                    editable={true}
                    onChange={handleStatusChange('factory')}
                />
                
                <OptionBox
                    label="Giao hàng"
                    name="delivery_status"
                    value={statusValues.delivery}
                    options={convertToOptions(statusOptions.delivery)}
                    editable={true}
                    onChange={handleStatusChange('delivery')}
                />
            </div>
            
            {onUpdate && onCancel && (
                <div className="flex gap-3">
                    <button
                        onClick={onUpdate}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                    >
                        {isLoading ? 'Đang lưu...' : 'Lưu'}
                    </button>
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                    >
                        Hủy
                    </button>
                </div>
            )}
        </SectionCard>
    );
};
