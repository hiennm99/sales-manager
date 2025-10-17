// src/features/orders/components/sections/ShippingInfoSection.tsx
/**
 * ShippingInfoSection - Thông tin vận chuyển
 * Simplified to match CustomerInfoSection pattern
 */

import React from 'react';
import { Truck, Hash, Calendar, DollarSign, FileText, RefreshCw } from 'lucide-react';
import { SectionCard } from '../../../../components/common';
import { TextBox, OptionBox, type Option } from '../../../../components/common';
import { CARRIER_UNITS } from '../../constants/orderDefaults';
import type { OrderFormData } from '../../../../types/order';
import { formatUSD, formatVND } from '../../../../lib/utils';

interface ShippingInfoSectionProps {
    mode: 'view' | 'edit';
    formData: OrderFormData;
    errors?: Record<string, string>;
    editableFields?: {
        carrierUnit?: boolean;
        internalTrackingNumber?: boolean;
        trackingNumber?: boolean;
        actualShipDate?: boolean;
        shippingFeeUsd?: boolean;
        shippingExchangeRate?: boolean;
        carrierNotes?: boolean;
    };
    // For edit mode
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    // For view mode inline editing
    onFieldChange?: (fieldName: string, value: string | number | React.ReactNode | undefined) => void;
    onFieldSave?: (fieldName: string) => Promise<void>;
}

const ShippingIcon = (
    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
    </svg>
);

export const ShippingInfoSection: React.FC<ShippingInfoSectionProps> = ({
    mode,
    formData,
    errors = {},
    editableFields = {},
    onChange,
    onFieldChange,
    onFieldSave
}) => {
    // Convert CARRIER_UNITS to Option format
    const carrierOptions: Option[] = [
        { value: '', label: '-- Chọn đơn vị vận chuyển --' },
        ...CARRIER_UNITS.map(carrier => ({
            value: carrier.value,
            label: carrier.label
        }))
    ];

    // Handler for standard form input change (edit mode)
    const handleStandardChange = (name: string, value: string | number | React.ReactNode | undefined) => {
        if (onChange) {
            const fakeEvent = {
                target: { name, value }
            } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
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

    // Calculate shipping fee in VND
    const shippingFeeVnd = (formData?.shippingFeeUsd || 0) * (formData?.shippingExchangeRate || formData?.exchangeRate || 25000);

    if (mode === 'view') {
        return (
            <SectionCard
                title="Thông tin vận chuyển"
                icon={ShippingIcon}
                iconGradient="from-orange-500 to-amber-600"
            >
                <div className="space-y-6">
                    <OptionBox
                        label="Đơn vị vận chuyển"
                        name="carrierUnit"
                        value={formData?.carrierUnit || ''}
                        options={carrierOptions}
                        editable={editableFields.carrierUnit}
                        onChange={handleInlineChange}
                        onBlur={() => editableFields.carrierUnit && handleInlineSave('carrierUnit')}
                        icon={<Truck className="w-5 h-5" />}
                    />

                    <TextBox
                        label="Mã vận đơn nội bộ"
                        name="internalTrackingNumber"
                        value={formData.internalTrackingNumber}
                        editable={editableFields.internalTrackingNumber}
                        placeholder="INT-2024-001"
                        onChange={handleInlineChange}
                        onBlur={() => editableFields.internalTrackingNumber && handleInlineSave('internalTrackingNumber')}
                        icon={<Hash className="w-5 h-5" />}
                    />

                    <TextBox
                        label="Mã vận đơn"
                        name="trackingNumber"
                        value={formData.trackingNumber}
                        editable={editableFields.trackingNumber}
                        onChange={handleInlineChange}
                        onBlur={() => editableFields.trackingNumber && handleInlineSave('trackingNumber')}
                        icon={<Hash className="w-5 h-5" />}
                    />

                    <TextBox
                        label="Ngày giao thực tế"
                        name="actualShipDate"
                        type="date"
                        value={formData.actualShipDate}
                        editable={editableFields.actualShipDate}
                        onChange={handleInlineChange}
                        onBlur={() => editableFields.actualShipDate && handleInlineSave('actualShipDate')}
                        icon={<Calendar className="w-5 h-5" />}
                    />

                    {/* Shipping Fee Section */}
                    <div className="space-y-3 pt-4 border-t-2 border-orange-200">
                        <TextBox
                            label="Phí ship (USD)"
                            name="shippingFeeUsd"
                            type="number"
                            value={formData.shippingFeeUsd || 0}
                            displayValue={formatUSD(formData.shippingFeeUsd)}
                            editable={editableFields.shippingFeeUsd}
                            onChange={handleInlineChange}
                            onBlur={() => editableFields.shippingFeeUsd && handleInlineSave('shippingFeeUsd')}
                            icon={<DollarSign className="w-5 h-5" />}
                        />

                        {(formData?.shippingFeeUsd || 0) > 0 && (
                            <div className="ml-7 space-y-2">
                                <TextBox
                                    label="Tỷ giá phí ship"
                                    name="shippingExchangeRate"
                                    type="number"
                                    value={formData?.shippingExchangeRate || formData?.exchangeRate || 25000}
                                    displayValue={formatVND(formData?.shippingExchangeRate || 25000)}
                                    editable={editableFields.shippingExchangeRate}
                                    onChange={handleInlineChange}
                                    onBlur={() => editableFields.shippingExchangeRate && handleInlineSave('shippingExchangeRate')}
                                    icon={<RefreshCw className="w-4 h-4" />}
                                />
                                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                                    <p className="text-xs text-gray-600">Phí ship VND:</p>
                                    <p className="text-sm font-bold text-orange-700">{formatVND(shippingFeeVnd)}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <TextBox
                        label="Ghi chú vận chuyển"
                        name="carrierNotes"
                        type="textarea"
                        value={formData.carrierNotes || ''}
                        editable={editableFields.carrierNotes}
                        placeholder="Ghi chú về vận chuyển, đóng gói..."
                        onChange={handleInlineChange}
                        onBlur={() => editableFields.carrierNotes && handleInlineSave('carrierNotes')}
                        icon={<FileText className="w-5 h-5" />}
                    />
                </div>
                
                {Object.values(editableFields).some(v => v) && (
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
            title="Thông tin vận chuyển"
            icon={ShippingIcon}
            iconGradient="from-orange-500 to-amber-600"
        >
            <div className="space-y-4">
                <OptionBox
                    label="Đơn vị vận chuyển"
                    name="carrierUnit"
                    value={formData?.carrierUnit || ''}
                    options={carrierOptions}
                    editable={true}
                    error={errors.carrierUnit}
                    onChange={handleStandardChange}
                    icon={<Truck className="w-5 h-5" />}
                />

                <TextBox
                    label="Mã vận đơn nội bộ"
                    name="internalTrackingNumber"
                    value={formData.internalTrackingNumber}
                    editable={true}
                    placeholder="INT-2024-001"
                    error={errors.internalTrackingNumber}
                    onChange={handleStandardChange}
                    icon={<Hash className="w-5 h-5" />}
                />

                <TextBox
                    label="Mã vận đơn"
                    name="trackingNumber"
                    value={formData.trackingNumber}
                    editable={true}
                    placeholder="VTP123456789"
                    error={errors.trackingNumber}
                    onChange={handleStandardChange}
                    icon={<Hash className="w-5 h-5" />}
                />

                <TextBox
                    label="Ngày giao thực tế"
                    name="actualShipDate"
                    type="date"
                    value={formData.actualShipDate}
                    editable={true}
                    error={errors.actualShipDate}
                    onChange={handleStandardChange}
                    icon={<Calendar className="w-5 h-5" />}
                />

                {/* Shipping Fee Section */}
                <div className="space-y-3 pt-4 border-t-2 border-orange-200">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Phí vận chuyển
                    </h3>

                    <TextBox
                        label="Phí ship (USD)"
                        name="shippingFeeUsd"
                        type="number"
                        value={formData.shippingFeeUsd || 0}
                        displayValue={formatUSD(formData.shippingFeeUsd)}
                        editable={true}
                        error={errors.shippingFeeUsd}
                        onChange={handleStandardChange}
                        icon={<DollarSign className="w-5 h-5" />}
                    />

                    {(formData?.shippingFeeUsd || 0) > 0 && (
                        <div className="ml-7 space-y-2">
                            <TextBox
                                label="Tỷ giá phí ship"
                                name="shippingExchangeRate"
                                type="number"
                                value={formData?.shippingExchangeRate || formData?.exchangeRate || 25000}
                                editable={true}
                                error={errors.shippingExchangeRate}
                                onChange={handleStandardChange}
                                icon={<RefreshCw className="w-4 h-4" />}
                            />
                            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                                <p className="text-xs text-gray-600">Phí ship VND:</p>
                                <p className="text-sm font-bold text-orange-700">{formatVND(shippingFeeVnd)}</p>
                            </div>
                        </div>
                    )}

                    <p className="text-xs text-gray-500 italic">
                        💡 Tỷ giá mặc định lấy từ "Tỷ giá hối đoái" ở tab Tài chính
                    </p>
                </div>

                <TextBox
                    label="Ghi chú vận chuyển"
                    name="carrierNotes"
                    type="textarea"
                    value={formData.carrierNotes || ''}
                    editable={true}
                    placeholder="Ghi chú về vận chuyển, đóng gói..."
                    error={errors.carrierNotes}
                    onChange={handleStandardChange}
                    icon={<FileText className="w-5 h-5" />}
                />
            </div>
        </SectionCard>
    );
};
