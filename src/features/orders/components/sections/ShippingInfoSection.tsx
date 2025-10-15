// src/features/orders/components/sections/ShippingInfoSection.tsx

import React from 'react';
import { SectionCard } from '../shared/SectionCard';
import { FormField, TextAreaField } from '../';
import { CARRIER_UNITS } from '../../constants/orderDefaults';

interface ShippingFormData {
    carrierUnit: string;
    internalTrackingNumber: string;
    trackingNumber: string;
    actualShipDate: string;
    shippingFeeUsd: number;
    carrierNotes: string;
}

interface ShippingInfoSectionProps {
    isEditing: boolean;
    formData: ShippingFormData;
    exchangeRate: number;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onFeeChange: (value: number) => void;
    onEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}

const ShippingIcon = (
    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
    </svg>
);

export const ShippingInfoSection: React.FC<ShippingInfoSectionProps> = ({
                                                                            isEditing,
                                                                            formData,
                                                                            exchangeRate,
                                                                            onChange,
                                                                            onFeeChange,
                                                                            onEdit,
                                                                            onSave,
                                                                            onCancel,
                                                                            isLoading = false
                                                                        }) => {
    const editButton = !isEditing ? (
        <button
            onClick={onEdit}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 font-medium"
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Chỉnh sửa
        </button>
    ) : null;

    return (
        <SectionCard
            title="Thông tin vận chuyển"
            icon={ShippingIcon}
            iconGradient="from-orange-500 to-amber-600"
            actions={editButton}
        >
            {isEditing ? (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Đơn vị vận chuyển
                            </label>
                            <select
                                name="carrierUnit"
                                value={formData.carrierUnit}
                                onChange={onChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">-- Chọn đơn vị vận chuyển --</option>
                                {CARRIER_UNITS.map(carrier => (
                                    <option key={carrier.value} value={carrier.value}>
                                        {carrier.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <FormField
                            label="Mã vận đơn nội bộ"
                            name="internalTrackingNumber"
                            value={formData.internalTrackingNumber}
                            onChange={onChange}
                            placeholder="INT-2024-001"
                        />

                        <FormField
                            label="Mã vận đơn"
                            name="trackingNumber"
                            value={formData.trackingNumber}
                            onChange={onChange}
                            placeholder="VTP123456789"
                        />

                        <FormField
                            label="Ngày giao thực tế"
                            name="actualShipDate"
                            type="date"
                            value={formData.actualShipDate}
                            onChange={onChange}
                        />

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phí ship (USD)
                            </label>
                            <input
                                type="number"
                                name="shippingFeeUsd"
                                value={formData.shippingFeeUsd}
                                onChange={(e) => onFeeChange(parseFloat(e.target.value) || 0)}
                                step="0.01"
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <TextAreaField
                        label="Ghi chú vận chuyển"
                        name="carrierNotes"
                        value={formData.carrierNotes}
                        onChange={onChange}
                        placeholder="Ghi chú về vận chuyển, đóng gói..."
                        rows={3}
                    />

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            onClick={onCancel}
                            className="px-5 py-2.5 text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={onSave}
                            disabled={isLoading}
                            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                        >
                            {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                            <p className="text-sm text-gray-600 mb-1 font-medium">Đơn vị vận chuyển</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {formData.carrierUnit
                                    ? CARRIER_UNITS.find(c => c.value === formData.carrierUnit)?.label || formData.carrierUnit
                                    : 'Chưa cập nhật'}
                            </p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                            <p className="text-sm text-gray-600 mb-1 font-medium">Mã vận đơn nội bộ</p>
                            <p className="text-lg font-semibold text-gray-900">{formData.internalTrackingNumber || 'Chưa có'}</p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                            <p className="text-sm text-gray-600 mb-1 font-medium">Mã vận đơn</p>
                            <p className="text-lg font-semibold text-gray-900">{formData.trackingNumber || 'Chưa có'}</p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                            <p className="text-sm text-gray-600 mb-1 font-medium">Ngày giao thực tế</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {formData.actualShipDate
                                    ? new Date(formData.actualShipDate).toLocaleDateString('vi-VN')
                                    : 'Chưa giao'}
                            </p>
                        </div>
                        <div className="md:col-span-2 p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-200">
                            <p className="text-sm text-gray-600 mb-1 font-medium">Phí ship</p>
                            <p className="text-xl font-bold text-gray-900">
                                ${formData.shippingFeeUsd?.toFixed(2) || '0.00'}
                                <span className="text-sm font-normal text-gray-600 ml-2">
                                    ({(formData.shippingFeeUsd * exchangeRate).toLocaleString('vi-VN') || '0'} ₫)
                                </span>
                            </p>
                        </div>
                    </div>
                    {formData.carrierNotes && (
                        <div>
                            <p className="text-sm text-gray-600 mb-2 font-medium">Ghi chú vận chuyển</p>
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{formData.carrierNotes}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </SectionCard>
    );
};