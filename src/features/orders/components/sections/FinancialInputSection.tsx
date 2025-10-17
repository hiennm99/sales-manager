// src/features/orders/components/sections/FinancialInputSection.tsx
/**
 * FinancialInputSection - Nhập thông tin tài chính
 * Standardized to match CustomerInfoSection pattern
 */

import React from 'react';
import { DollarSign, TrendingDown, CreditCard, Wallet, RefreshCw, AlertCircle, XCircle, Gift } from 'lucide-react';
import { SectionCard } from '../../../../components/common';
import { TextBox } from '../../../../components/common';
import type { OrderFormData } from '../../../../types/order';
import {formatPercentage, formatUSD, formatVND} from "../../../../lib/utils.ts";

interface FinancialInputSectionProps {
    mode: 'view' | 'edit';
    formData: OrderFormData;
    errors?: Record<string, string>;
    editableFields?: {
        itemTotalUsd?: boolean;
        discountRate?: boolean;
        buyerPaidUsd?: boolean;
        orderEarningsUsd?: boolean;
        exchangeRate?: boolean;
        refundFeeUsd?: boolean;
        refundFeeExchangeRate?: boolean;
        otherFeeUsd?: boolean;
        otherFeeExchangeRate?: boolean;
        otherBonusUsd?: boolean;
        otherBonusExchangeRate?: boolean;
    };
    // For edit mode
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    // For view mode inline editing
    onFieldChange?: (fieldName: string, value: string | number | React.ReactNode | undefined) => void;
    onFieldSave?: (fieldName: string) => Promise<void>;
}

const FinancialIcon = (
    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const FinancialInputSection: React.FC<FinancialInputSectionProps> = ({
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

    // Handler for inline edit save (view mode)
    const handleInlineSave = async (name: string) => {
        if (onFieldSave) {
            await onFieldSave(name);
        }
    };

    const calculatedDiscountUsd = (formData?.itemTotalUsd || 0) * (formData?.discountRate || 0) / 100;
    const calculatedSubtotal = (formData?.itemTotalUsd || 0) - calculatedDiscountUsd;

    if (mode === 'view') {
        return (
            <SectionCard
                title="Thông tin tài chính"
                icon={FinancialIcon}
                iconGradient="from-green-500 to-emerald-600"
            >
                <div className="space-y-6">
                    {/* Exchange Rate - Highlighted */}
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200">
                        <TextBox
                            label="Tỷ giá hối đoái"
                            name="exchangeRate"
                            type="number"
                            value={formData?.exchangeRate || 25000}
                            displayValue={formatVND(formData?.exchangeRate || 25000)}
                            editable={editableFields.exchangeRate}
                            onChange={handleInlineChange}
                            onBlur={() => editableFields.exchangeRate && handleInlineSave('exchangeRate')}
                            icon={<RefreshCw className="w-5 h-5" />}
                        />
                        <p className="text-xs text-purple-700 mt-2 ml-7">* Tỷ giá cho các giao dịch chính (sản phẩm, khách trả, thực nhận)</p>
                    </div>

                    {/* USD Amounts */}
                    <div className="space-y-4">
                        <TextBox
                            label="Tổng tiền sản phẩm (USD)"
                            name="itemTotalUsd"
                            type="number"
                            value={formData?.itemTotalUsd || 0}
                            displayValue={formatUSD(formData?.itemTotalUsd)}
                            editable={editableFields.itemTotalUsd}
                            onChange={handleInlineChange}
                            onBlur={() => editableFields.itemTotalUsd && handleInlineSave('itemTotalUsd')}
                            icon={<DollarSign className="w-5 h-5" />}
                        />

                        <TextBox
                            label="Giảm giá (%)"
                            name="discountRate"
                            type="number"
                            value={formData?.discountRate || 0}
                            displayValue={formatPercentage(formData?.discountRate)}
                            editable={editableFields.discountRate}
                            onChange={handleInlineChange}
                            onBlur={() => editableFields.discountRate && handleInlineSave('discountRate')}
                            icon={<TrendingDown className="w-5 h-5" />}
                        />

                        {/* Subtotal - Calculated, always read-only */}
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                <DollarSign className="w-4 h-4 text-gray-500" />
                                Tổng tiền sau giảm
                            </div>
                            <div className="text-lg font-bold text-gray-900">
                                {formatUSD(calculatedSubtotal)}
                                <span className="text-sm font-normal text-gray-600 ml-2">
                                    ≈ {formatVND(calculatedSubtotal * (formData?.exchangeRate || 25000))}
                                </span>
                            </div>
                        </div>

                        <TextBox
                            label="Tổng tiền khách trả (USD)"
                            name="buyerPaidUsd"
                            type="number"
                            value={formData?.buyerPaidUsd || 0}
                            displayValue={formatUSD(formData?.buyerPaidUsd)}
                            editable={editableFields.buyerPaidUsd}
                            onChange={handleInlineChange}
                            onBlur={() => editableFields.buyerPaidUsd && handleInlineSave('buyerPaidUsd')}
                            icon={<CreditCard className="w-5 h-5" />}
                        />

                        <TextBox
                            label="Tổng tiền thực nhận (USD)"
                            name="orderEarningsUsd"
                            type="number"
                            value={formData?.orderEarningsUsd || 0}
                            displayValue={formatUSD(formData?.orderEarningsUsd)}
                            editable={editableFields.orderEarningsUsd}
                            onChange={handleInlineChange}
                            onBlur={() => editableFields.orderEarningsUsd && handleInlineSave('orderEarningsUsd')}
                            icon={<Wallet className="w-5 h-5" />}
                        />
                    </div>

                    {/* Fees Section */}
                    <div className="space-y-4 pt-4 border-t-2 border-gray-200">
                        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Các khoản phí khấu trừ
                        </h3>

                        {/* Refund Fee */}
                        <div className="space-y-3">
                            <TextBox
                                label="Phí hoàn tiền (USD)"
                                name="refundFeeUsd"
                                type="number"
                                value={formData?.refundFeeUsd || 0}
                                displayValue={formatUSD(formData?.refundFeeUsd || 0)}
                                editable={editableFields.refundFeeUsd}
                                onChange={handleInlineChange}
                                onBlur={() => editableFields.refundFeeUsd && handleInlineSave('refundFeeUsd')}
                                icon={<XCircle className="w-5 h-5" />}
                            />
                            
                            {formData.refundFeeUsd && (
                                <div className="ml-7">
                                    <TextBox
                                        label="Tỷ giá phí hoàn tiền"
                                        name="refundFeeExchangeRate"
                                        type="number"
                                        value={formData?.refundFeeExchangeRate || formData?.exchangeRate || 25000}
                                        displayValue={formatVND(formData?.refundFeeExchangeRate || formData?.exchangeRate || 25000)}
                                        editable={editableFields.refundFeeExchangeRate}
                                        onChange={handleInlineChange}
                                        onBlur={() => editableFields.refundFeeExchangeRate && handleInlineSave('refundFeeExchangeRate')}
                                        icon={<RefreshCw className="w-4 h-4" />}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        = {formatVND((formData?.refundFeeUsd || 0) * (formData?.refundFeeExchangeRate || formData?.exchangeRate || 25000))}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Other Fee */}
                        <div className="space-y-3">
                            <TextBox
                                label="Phí khác (USD)"
                                name="otherFeeUsd"
                                type="number"
                                value={formData?.otherFeeUsd || 0}
                                displayValue={formatUSD(formData?.otherFeeUsd || 0)}
                                editable={editableFields.otherFeeUsd}
                                onChange={handleInlineChange}
                                onBlur={() => editableFields.otherFeeUsd && handleInlineSave('otherFeeUsd')}
                                icon={<AlertCircle className="w-5 h-5" />}
                            />
                            
                            {(formData?.otherFeeUsd || 0) > 0 && (
                                <div className="ml-7">
                                    <TextBox
                                        label="Tỷ giá phí khác"
                                        name="otherFeeExchangeRate"
                                        type="number"
                                        value={formData?.otherFeeExchangeRate || formData?.exchangeRate || 25000}
                                        displayValue={formatVND(formData?.otherFeeExchangeRate || formData?.exchangeRate || 25000)}
                                        editable={editableFields.otherFeeExchangeRate}
                                        onChange={handleInlineChange}
                                        onBlur={() => editableFields.otherFeeExchangeRate && handleInlineSave('otherFeeExchangeRate')}
                                        icon={<RefreshCw className="w-4 h-4" />}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        = {formatVND((formData?.otherFeeUsd || 0) * (formData?.otherFeeExchangeRate || formData?.exchangeRate || 25000))}
                                    </p>
                                </div>
                            )}
                        </div>

                        <p className="text-xs text-gray-500 italic">💡 Phí ship xem ở phần "Thông tin vận chuyển"</p>
                    </div>

                    {/* Bonus Section */}
                    <div className="space-y-4 pt-4 border-t-2 border-green-200">
                        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <Gift className="w-4 h-4" />
                            Tiền thưởng/Bonus
                        </h3>

                        {/* Other Bonus */}
                        <div className="space-y-3">
                            <TextBox
                                label="Tiền thưởng khác (USD)"
                                name="otherBonusUsd"
                                type="number"
                                value={formData?.otherBonusUsd || 0}
                                displayValue={formatUSD(formData?.otherBonusUsd || 0)}
                                editable={editableFields.otherBonusUsd}
                                onChange={handleInlineChange}
                                onBlur={() => editableFields.otherBonusUsd && handleInlineSave('otherBonusUsd')}
                                icon={<Gift className="w-5 h-5" />}
                            />
                            
                            {(formData?.otherBonusUsd || 0) > 0 && (
                                <div className="ml-7">
                                    <TextBox
                                        label="Tỷ giá tiền thưởng"
                                        name="otherBonusExchangeRate"
                                        type="number"
                                        value={formData?.otherBonusExchangeRate || formData?.exchangeRate || 25000}
                                        displayValue={formatVND(formData?.otherBonusExchangeRate || formData?.exchangeRate || 25000)}
                                        editable={editableFields.otherBonusExchangeRate}
                                        onChange={handleInlineChange}
                                        onBlur={() => editableFields.otherBonusExchangeRate && handleInlineSave('otherBonusExchangeRate')}
                                        icon={<RefreshCw className="w-4 h-4" />}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        = {formatVND((formData?.otherBonusUsd || 0) * (formData?.otherBonusExchangeRate || formData?.exchangeRate || 25000))}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Formula Info */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <p className="text-xs font-semibold text-blue-900 mb-2">📝 Lưu ý:</p>
                        <div className="space-y-1 text-xs text-blue-800">
                            <p>• Tổng tiền sau giảm = Tổng tiền sản phẩm × (100 - Giảm giá%) / 100</p>
                            <p>• Mỗi khoản phí/bonus có thể có tỷ giá riêng để tính VND chính xác</p>
                            <p>• Lợi nhuận = Thực nhận + Bonus - Ship - Hoàn tiền - Phí khác</p>
                        <p>• Profit sẽ được tính TỰ ĐỘNG bởi database trigger</p>
                        </div>
                    </div>
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
            title="Thông tin tài chính"
            icon={FinancialIcon}
            iconGradient="from-green-500 to-emerald-600"
        >
            <div className="space-y-6">
                {/* Exchange Rate - Highlighted */}
                <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200">
                    <TextBox
                        label="Tỷ giá hối đoái"
                        name="exchangeRate"
                        type="number"
                        value={formData?.exchangeRate || 0}
                        displayValue={formatVND(formData?.exchangeRate || 0)}
                        editable={true}
                        required
                        error={errors.exchangeRate}
                        onChange={handleStandardChange}
                        icon={<RefreshCw className="w-5 h-5" />}
                    />
                    <p className="text-xs text-purple-700 mt-2 ml-7">* Tỷ giá cho các giao dịch chính (sản phẩm, khách trả, thực nhận)</p>
                </div>

                {/* USD Amounts */}
                <div className="space-y-4">
                    {/* Item Total - Auto-calculated from items */}
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                            <DollarSign className="w-4 h-4 text-blue-600" />
                            Tổng tiền sản phẩm (USD)
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                            {formatUSD(formData?.itemTotalUsd || 0)}
                            <span className="text-sm font-normal text-gray-600 ml-2">
                                ≈ {formatVND((formData?.itemTotalUsd || 0) * (formData?.exchangeRate || 25000))}
                            </span>
                        </div>
                        <p className="text-xs text-blue-600 mt-1">✨ Tự động tính từ các sản phẩm (Số lượng × Giá)</p>
                    </div>

                    <TextBox
                        label="Giảm giá (%)"
                        name="discountRate"
                        type="number"
                        value={formData?.discountRate || 0}
                        displayValue={formatPercentage(formData?.discountRate)}
                        editable={true}
                        error={errors.discountRate}
                        onChange={handleStandardChange}
                        icon={<TrendingDown className="w-5 h-5" />}
                    />

                    {/* Subtotal - Calculated, always read-only */}
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                            <DollarSign className="w-4 h-4 text-gray-500" />
                            Tổng tiền sau giảm
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                            {formatUSD(calculatedSubtotal)}
                            <span className="text-sm font-normal text-gray-600 ml-2">
                                ≈ {formatVND(calculatedSubtotal * (formData?.exchangeRate || 25000))}
                            </span>
                        </div>
                    </div>

                    <TextBox
                        label="Tổng tiền khách trả (USD)"
                        name="buyerPaidUsd"
                        type="number"
                        value={formData?.buyerPaidUsd || 0}
                        displayValue={formatUSD(formData?.buyerPaidUsd)}
                        editable={true}
                        required
                        error={errors.buyerPaidUsd}
                        onChange={handleStandardChange}
                        icon={<CreditCard className="w-5 h-5" />}
                    />

                    <TextBox
                        label="Tổng tiền thực nhận (USD)"
                        name="orderEarningsUsd"
                        type="number"
                        value={formData?.orderEarningsUsd || 0}
                        displayValue={formatUSD(formData?.orderEarningsUsd)}
                        editable={true}
                        required
                        error={errors.orderEarningsUsd}
                        onChange={handleStandardChange}
                        icon={<Wallet className="w-5 h-5" />}
                    />
                </div>

                {/* Fees Section */}
                <div className="space-y-4 pt-4 border-t-2 border-gray-200">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Các khoản phí khấu trừ
                    </h3>

                    {/* Refund Fee */}
                    <div className="space-y-3">
                        <TextBox
                            label="Phí hoàn tiền (USD)"
                            name="refundFeeUsd"
                            type="number"
                            value={formData?.refundFeeUsd || 0}
                            displayValue={formatUSD(formData?.refundFeeUsd)}
                            editable={true}
                            error={errors.refundFeeUsd}
                            onChange={handleStandardChange}
                            icon={<XCircle className="w-5 h-5" />}
                        />
                        
                        {(formData?.refundFeeUsd || 0) > 0 && (
                            <div className="ml-7">
                                <TextBox
                                    label="Tỷ giá phí hoàn tiền"
                                    name="refundFeeExchangeRate"
                                    type="number"
                                    value={formData?.refundFeeExchangeRate || formData?.exchangeRate || 25000}
                                    displayValue={formatVND(formData?.refundFeeExchangeRate || formData?.exchangeRate || 25000)}
                                    editable={true}
                                    onChange={handleStandardChange}
                                    icon={<RefreshCw className="w-4 h-4" />}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    = {formatVND((formData?.refundFeeUsd || 0) * (formData?.refundFeeExchangeRate || formData?.exchangeRate || 25000))}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Other Fee */}
                    <div className="space-y-3">
                        <TextBox
                            label="Phí khác (USD)"
                            name="otherFeeUsd"
                            type="number"
                            value={formData?.otherFeeUsd || 0}
                            displayValue={formatUSD(formData?.otherFeeUsd)}
                            editable={true}
                            error={errors.otherFeeUsd}
                            onChange={handleStandardChange}
                            icon={<AlertCircle className="w-5 h-5" />}
                        />
                        
                        {(formData?.otherFeeUsd || 0) > 0 && (
                            <div className="ml-7">
                                <TextBox
                                    label="Tỷ giá phí khác"
                                    name="otherFeeExchangeRate"
                                    type="number"
                                    value={formData?.otherFeeExchangeRate || formData?.exchangeRate || 25000}
                                    editable={true}
                                    onChange={handleStandardChange}
                                    icon={<RefreshCw className="w-4 h-4" />}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    = {formatVND((formData?.otherFeeUsd || 0) * (formData?.otherFeeExchangeRate || formData?.exchangeRate || 25000))}
                                </p>
                            </div>
                        )}
                    </div>

                    <p className="text-xs text-gray-500 italic">💡 Phí ship xem ở phần "Thông tin vận chuyển"</p>
                    </div>

                        {/* Bonus Section */}
                    <div className="space-y-4 pt-4 border-t-2 border-green-200">
                        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <Gift className="w-4 h-4" />
                            Tiền thưởng/Bonus
                        </h3>

                        {/* Other Bonus */}
                        <div className="space-y-3">
                            <TextBox
                                label="Tiền thưởng khác (USD)"
                                name="otherBonusUsd"
                                type="number"
                                value={formData?.otherBonusUsd || 0}
                                displayValue={formatUSD(formData?.otherBonusUsd)}
                                editable={true}
                                error={errors.otherBonusUsd}
                                onChange={handleStandardChange}
                                icon={<Gift className="w-5 h-5" />}
                            />
                            
                            {(formData?.otherBonusUsd || 0) > 0 && (
                                <div className="ml-7">
                                    <TextBox
                                        label="Tỷ giá tiền thưởng"
                                        name="otherBonusExchangeRate"
                                        type="number"
                                        value={formData?.otherBonusExchangeRate || formData?.exchangeRate || 25000}
                                        editable={true}
                                        onChange={handleStandardChange}
                                        icon={<RefreshCw className="w-4 h-4" />}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        = {formatVND((formData?.otherBonusUsd || 0) * (formData?.otherBonusExchangeRate || formData?.exchangeRate || 25000))}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                {/* Formula Info */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-xs font-semibold text-blue-900 mb-2">📝 Lưu ý:</p>
                    <div className="space-y-1 text-xs text-blue-800">
                        <p>• Tổng tiền sau giảm = Tổng tiền sản phẩm × (100 - Giảm giá%) / 100</p>
                        <p>• Mỗi khoản phí/bonus có thể có tỷ giá riêng để tính VND chính xác</p>
                        <p>• Lợi nhuận = Thực nhận + Bonus - Ship - Hoàn tiền - Phí khác</p>
                        <p>• Profit sẽ được tính TỰ ĐỘNG bởi database trigger</p>
                    </div>
                </div>
            </div>
        </SectionCard>
    );
};
