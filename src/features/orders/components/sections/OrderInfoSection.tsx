// src/features/orders/components/sections/OrderInfoSection.tsx

import React from 'react';
import { SectionCard } from '../shared/SectionCard';
import { FormField } from '../FormField';
import type { OrderFormData } from '../../../../types/order';

interface OrderInfoSectionProps {
    mode: 'view' | 'edit';
    formData?: OrderFormData;
    shopName?: string;
    errors?: Record<string, string>;
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
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
                                                                      onChange
                                                                  }) => {
    if (mode === 'view') {
        return (
            <SectionCard
                title="Thông tin đơn hàng"
                icon={InfoIcon}
                iconGradient="from-blue-500 to-cyan-600"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm text-gray-600 mb-1 font-medium">Mã đơn hàng</p>
                        <p className="text-lg font-semibold text-gray-900">{formData?.order_id}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 mb-1 font-medium">Cửa hàng</p>
                        <p className="text-lg font-semibold text-gray-900">{formData?.shop_code}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 mb-1 font-medium">Ngày đặt hàng</p>
                        <p className="text-lg font-semibold text-gray-900">{formData?.order_date}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 mb-1 font-medium">Ngày giao dự kiến</p>
                        <p className="text-lg font-semibold text-gray-900">
                            {formData?.scheduled_ship_date || 'Chưa xác định'}
                        </p>
                    </div>
                    {formData?.artist_code && (
                        <div className="md:col-span-2">
                            <p className="text-sm text-gray-600 mb-1 font-medium">Mã nghệ sĩ</p>
                            <p className="text-lg font-semibold text-gray-900">{formData.artist_code}</p>
                        </div>
                    )}
                </div>
            </SectionCard>
        );
    }

    return (
        <SectionCard
            title="Thông tin đơn hàng"
            icon={InfoIcon}
            iconGradient="from-blue-500 to-cyan-600"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    label="Cửa hàng"
                    name="shop_code"
                    value={shopName || 'Chưa chọn cửa hàng'}
                    onChange={onChange!}
                    required
                    disabled
                    error={errors.shop_code}
                />

                <FormField
                    label="Mã đơn hàng"
                    name="order_id"
                    value={formData!.order_id}
                    onChange={onChange!}
                    placeholder="ORD-2024-001"
                    required
                    error={errors.order_id}
                />

                <FormField
                    label="Ngày đặt hàng"
                    name="order_date"
                    type="date"
                    value={formData!.order_date}
                    onChange={onChange!}
                    required
                    error={errors.order_date}
                />

                <FormField
                    label="Ngày giao dự kiến"
                    name="scheduled_ship_date"
                    type="date"
                    value={formData!.scheduled_ship_date}
                    onChange={onChange!}
                />

                <FormField
                    label="Mã nghệ sĩ"
                    name="artist_code"
                    value={formData!.artist_code}
                    onChange={onChange!}
                    placeholder="ARTIST001"
                    className="md:col-span-2"
                />
            </div>
        </SectionCard>
    );
};