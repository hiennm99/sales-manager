// src/features/orders/components/sections/CustomerInfoSection.tsx

import React from 'react';
import { SectionCard } from '../shared/SectionCard';
import { FormField, TextAreaField } from '../';
import type { OrderFormData } from '../../../../types/order';

interface CustomerInfoSectionProps {
    mode: 'view' | 'edit';
    formData: OrderFormData;
    errors?: Record<string, string>;
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const CustomerIcon = (
    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

export const CustomerInfoSection: React.FC<CustomerInfoSectionProps> = ({
                                                                            mode,
                                                                            formData,
                                                                            errors = {},
                                                                            onChange
                                                                        }) => {
    if (mode === 'view') {
        return (
            <SectionCard
                title="Thông tin khách hàng"
                icon={CustomerIcon}
                iconGradient="from-pink-500 to-rose-600"
            >
                <div className="space-y-6">
                    <div>
                        <p className="text-sm text-gray-600 mb-2 font-medium">Tên khách hàng</p>
                        <p className="text-lg font-semibold text-gray-900">{formData.customer_name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 mb-2 font-medium">Địa chỉ</p>
                        <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{formData.customer_address}</p>
                    </div>
                    {formData.customer_phone && (
                        <div>
                            <p className="text-sm text-gray-600 mb-2 font-medium">Số điện thoại</p>
                            <p className="text-gray-900">
                                <a
                                    href={`tel:${formData.customer_phone}`}
                                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    {formData.customer_phone}
                                </a>
                            </p>
                        </div>
                    )}
                    {formData.customer_notes && (
                        <div>
                            <p className="text-sm text-gray-600 mb-2 font-medium">Ghi chú</p>
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{formData.customer_notes}</p>
                            </div>
                        </div>
                    )}
                </div>
            </SectionCard>
        );
    }

    return (
        <SectionCard
            title="Thông tin khách hàng"
            icon={CustomerIcon}
            iconGradient="from-pink-500 to-rose-600"
        >
            <div className="space-y-4">
                <FormField
                    label="Tên khách hàng"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={onChange!}
                    placeholder="Nguyễn Văn A"
                    required
                    error={errors.customer_name}
                />

                <TextAreaField
                    label="Địa chỉ"
                    name="customer_address"
                    value={formData.customer_address}
                    onChange={onChange!}
                    placeholder="123 Đường ABC, Phường XYZ, Quận 1, TP.HCM"
                    required
                    error={errors.customer_address}
                />

                <FormField
                    label="Số điện thoại"
                    name="customer_phone"
                    type="tel"
                    value={formData.customer_phone}
                    onChange={onChange!}
                    placeholder="0901234567"
                />

                <TextAreaField
                    label="Ghi chú"
                    name="customer_notes"
                    value={formData.customer_notes}
                    onChange={onChange!}
                    placeholder="Ghi chú từ khách hàng..."
                    rows={4}
                />
            </div>
        </SectionCard>
    );
};