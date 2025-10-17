// src/features/orders/components/sections/OrderInfoSection.tsx
/**
 * OrderInfoSection - Thông tin đơn hàng
 * Uses common TextBox components with specific onChange handlers
 */

import React from 'react';
import { SectionCard } from '../../../../components/common';
import { TextBox } from '../../../../components/common';
import type { OrderFormData } from '../../../../types/order';

interface OrderInfoSectionProps {
    mode: 'view' | 'edit';
    formData: OrderFormData;
    shopName?: string;
    errors?: Record<string, string>;
    editableFields?: {
        scheduled_ship_date?: boolean;
        artist_code?: boolean;
        order_id?: boolean;
        order_date?: boolean;
    };
    // For edit mode
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    // For view mode inline editing
    onFieldChange?: (fieldName: string, value: string | number | React.ReactNode | undefined) => void;
    onFieldSave?: (fieldName: string) => Promise<void>;
}

const InfoIcon = (
    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

export const OrderInfoSection: React.FC<OrderInfoSectionProps> = ({
    mode,
    formData,
    shopName,
    errors = {},
    editableFields = {},
    onChange,
    onFieldChange,
    onFieldSave
}) => {
    // Handler for standard form input change (edit mode)
    const handleStandardChange = (name: string, value: string | number | React.ReactNode | undefined) => {
        if (onChange) {
            const fakeEvent = {
                target: { name, value }
            } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
            onChange(fakeEvent);
        }
    };

    // Handler for inline edit change (view mode)
    const handleInlineChange = (name: string, value: string | number | React.ReactNode | undefined) => {
        if (onFieldChange) {
            onFieldChange(name, value);
        }
    };

    // Handler for inline edit save (view mode)
    const handleInlineSave = async (name: string) => {
        if (onFieldSave) {
            await onFieldSave(name);
        }
    };

    if (mode === 'view') {
        return (
            <SectionCard
                title="Thông tin đơn hàng"
                icon={InfoIcon}
                iconGradient="from-blue-500 to-cyan-600"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TextBox
                        label="Mã đơn hàng"
                        name="order_id"
                        value={formData.order_id}
                        editable={false}
                    />
                    
                    <TextBox
                        label="Cửa hàng"
                        name="shop_code"
                        value={formData.shop_code}
                        editable={false}
                    />
                    
                    <TextBox
                        label="Ngày đặt hàng"
                        name="order_date"
                        type="date"
                        value={formData.order_date}
                        editable={false}
                    />
                    
                    <TextBox
                        label="Ngày giao dự kiến"
                        name="scheduled_ship_date"
                        type="date"
                        value={formData.scheduled_ship_date || ''}
                        editable={editableFields.scheduled_ship_date}
                        placeholder="Chưa xác định"
                        onChange={handleInlineChange}
                        onBlur={() => handleInlineSave('scheduled_ship_date')}
                    />
                    
                    <div className="md:col-span-2">
                        <TextBox
                            label="Mã nghệ sĩ"
                            name="artist_code"
                            value={formData.artist_code || ''}
                            editable={editableFields.artist_code}
                            placeholder="Chưa có mã nghệ sĩ"
                            onChange={handleInlineChange}
                            onBlur={() => handleInlineSave('artist_code')}
                        />
                    </div>
                </div>
                
                {(editableFields.scheduled_ship_date || editableFields.artist_code) && (
                    <div className="mt-4 text-xs text-gray-500 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Click vào các trường để chỉnh sửa (Enter để lưu, Esc để hủy)
                    </div>
                )}
            </SectionCard>
        );
    }

    // Edit mode
    return (
        <SectionCard
            title="Thông tin đơn hàng"
            icon={InfoIcon}
            iconGradient="from-blue-500 to-cyan-600"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextBox
                    label="Cửa hàng"
                    name="shop_code"
                    value={shopName || 'Chưa chọn cửa hàng'}
                    editable={false}
                    disabled={true}
                    required
                    error={errors.shop_code}
                />

                <TextBox
                    label="Mã đơn hàng"
                    name="order_id"
                    value={formData.order_id}
                    editable={true}
                    placeholder="ORD-2024-001"
                    required
                    error={errors.order_id}
                    onChange={handleStandardChange}
                />

                <TextBox
                    label="Ngày đặt hàng"
                    name="order_date"
                    type="date"
                    value={formData.order_date}
                    editable={true}
                    required
                    error={errors.order_date}
                    onChange={handleStandardChange}
                />

                <TextBox
                    label="Ngày giao dự kiến"
                    name="scheduled_ship_date"
                    type="date"
                    value={formData.scheduled_ship_date || ''}
                    editable={true}
                    onChange={handleStandardChange}
                />

                <TextBox
                    label="Mã nghệ sĩ"
                    name="artist_code"
                    value={formData.artist_code || ''}
                    editable={true}
                    placeholder="ARTIST001"
                    className="md:col-span-2"
                    onChange={handleStandardChange}
                />
            </div>
        </SectionCard>
    );
};
