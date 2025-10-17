// src/features/orders/components/sections/CustomerInfoSection.tsx
/**
 * CustomerInfoSection - Thông tin khách hàng
 * Uses common TextBox components with specific onChange handlers
 */

import React from 'react';
import { User, MapPin, Phone, Mail, MessageSquare } from 'lucide-react';
import { SectionCard } from '../../../../components/common';
import { TextBox } from '../../../../components/common';
import type { OrderFormData } from '../../../../types/order';

interface CustomerInfoSectionProps {
    mode: 'view' | 'edit';
    formData: OrderFormData;
    errors?: Record<string, string>;
    editableFields?: {
        customer_name?: boolean;
        customer_address?: boolean;
        customer_phone?: boolean;
        customer_email?: boolean;
        customer_notes?: boolean;
    };
    // For edit mode
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    // For view mode inline editing
    onFieldChange?: (fieldName: string, value: string | number | React.ReactNode | undefined) => void;
    onFieldSave?: (fieldName: string) => Promise<void>;
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

    const handleInlineSave = async (name: string) => {
        if (onFieldSave) {
            await onFieldSave(name);
        }
    };

    if (mode === 'view') {
        return (
            <SectionCard
                title="Thông tin khách hàng"
                icon={CustomerIcon}
                iconGradient="from-pink-500 to-rose-600"
            >
                <div className="space-y-6">
                    <TextBox
                        label="Tên khách hàng"
                        name="customer_name"
                        value={formData.customer_name}
                        editable={editableFields.customer_name}
                        placeholder="Tên khách hàng ..."
                        onChange={handleInlineChange}
                        onBlur={() => editableFields.customer_name && handleInlineSave('customer_name')}
                        icon={<User className="w-5 h-5" />}
                    />

                    <TextBox
                        label="Địa chỉ"
                        name="customer_address"
                        value={formData.customer_address}
                        editable={editableFields.customer_address}
                        placeholder="Địa chỉ khách hàng ..."
                        onChange={handleInlineChange}
                        onBlur={() => editableFields.customer_address && handleInlineSave('customer_address')}
                        icon={<MapPin className="w-5 h-5" />}
                    />

                    <TextBox
                        label="Số điện thoại"
                        name="customer_phone"
                        value={formData.customer_phone}
                        editable={editableFields.customer_phone}
                        placeholder="Số điện thoại khách hàng ..."
                        onChange={handleInlineChange}
                        onBlur={() => editableFields.customer_phone && handleInlineSave('customer_phone')}
                        icon={<Phone className="w-5 h-5" />}
                    />

                    <TextBox
                        label="Email"
                        name="customer_email"
                        type="email"
                        value={formData.customer_email}
                        editable={editableFields.customer_email}
                        placeholder="email@example.com"
                        onChange={handleInlineChange}
                        onBlur={() => editableFields.customer_email && handleInlineSave('customer_email')}
                        icon={<Mail className="w-5 h-5" />}
                    />
                    
                    <TextBox
                        label="Ghi chú"
                        name="customer_notes"
                        type="textarea"
                        value={formData.customer_notes || ''}
                        editable={editableFields.customer_notes}
                        placeholder="Ghi chú từ khách hàng..."
                        onChange={handleInlineChange}
                        onBlur={() => editableFields.customer_notes && handleInlineSave('customer_notes')}
                        icon={<MessageSquare className="w-5 h-5" />}
                    />
                </div>
                
                {(editableFields.customer_name || editableFields.customer_notes) && (
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
            title="Thông tin khách hàng"
            icon={CustomerIcon}
            iconGradient="from-pink-500 to-rose-600"
        >
            <div className="space-y-4">
                <TextBox
                    label="Tên khách hàng"
                    name="customer_name"
                    value={formData.customer_name}
                    editable={true}
                    placeholder="Nguyễn Văn A"
                    required
                    error={errors.customer_name}
                    onChange={handleStandardChange}
                    icon={<User className="w-5 h-5" />}
                />

                <TextBox
                    label="Địa chỉ"
                    name="customer_address"
                    type="textarea"
                    value={formData.customer_address}
                    editable={true}
                    placeholder="123 Đường ABC, Phường XYZ, Quận 1, TP.HCM"
                    required
                    error={errors.customer_address}
                    onChange={handleStandardChange}
                    icon={<MapPin className="w-5 h-5" />}
                />

                <TextBox
                    label="Số điện thoại"
                    name="customer_phone"
                    type="tel"
                    value={formData.customer_phone || ''}
                    editable={true}
                    placeholder="0901234567"
                    onChange={handleStandardChange}
                    icon={<Phone className="w-5 h-5" />}
                />

                <TextBox
                    label="Email"
                    name="customer_email"
                    type="email"
                    value={formData.customer_email || ''}
                    editable={true}
                    placeholder="email@example.com"
                    onChange={handleStandardChange}
                    icon={<Mail className="w-5 h-5" />}
                />

                <TextBox
                    label="Ghi chú"
                    name="customer_notes"
                    type="textarea"
                    value={formData.customer_notes || ''}
                    editable={true}
                    placeholder="Ghi chú từ khách hàng..."
                    onChange={handleStandardChange}
                    icon={<MessageSquare className="w-5 h-5" />}
                />
            </div>
        </SectionCard>
    );
};
