// src/features/orders/components/sections/FinancialInputSection.tsx

import React from 'react';
import { SectionCard } from '../shared/SectionCard';
import { formatVND } from '../../../../lib/utils';

interface FinancialInputSectionProps {
    itemTotal: number;
    discountRate: number;
    buyerPaidUSD: number;
    orderEarnings: number;
    exchangeRate: number;
    onItemTotalChange: (value: number) => void;
    onDiscountRateChange: (value: number) => void;
    onbuyerPaidUSDChange: (value: number) => void;
    onOrderEarningsChange: (value: number) => void;
    onExchangeRateChange: (value: number) => void;
}

const FinancialIcon = (
    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const FinancialInputSection: React.FC<FinancialInputSectionProps> = ({
    itemTotal,
    discountRate,
    buyerPaidUSD,
    orderEarnings,
    exchangeRate,
    onItemTotalChange,
    onDiscountRateChange,
    onbuyerPaidUSDChange,
    onOrderEarningsChange,
    onExchangeRateChange
}) => {
    const subtotal = itemTotal * (100 - discountRate) / 100;

    return (
        <SectionCard
            title="Thông tin tài chính"
            icon={FinancialIcon}
            iconGradient="from-green-500 to-emerald-600"
        >
            <div className="space-y-6">
                {/* Exchange Rate */}
                <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                            </svg>
                            Tỷ giá hối đoái
                        </div>
                    </label>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">1 USD =</span>
                        <input
                            type="number"
                            min="0"
                            step="100"
                            value={exchangeRate}
                            onChange={(e) => onExchangeRateChange(parseFloat(e.target.value) || 0)}
                            className="flex-1 px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg font-bold text-purple-700"
                        />
                    </div>
                    <p className="text-xs text-gray-600 mt-2">* Tất cả giá VND sẽ được tính tự động theo tỷ giá này</p>
                </div>

                {/* USD Inputs */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 pb-2 border-b border-gray-200">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Nhập số tiền (USD)
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Item Total */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tổng tiền sản phẩm <span className="text-red-500">*</span>
                            </label>
                            <div className="space-y-2">
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={itemTotal}
                                        onChange={(e) => onItemTotalChange(parseFloat(e.target.value) || 0)}
                                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="text-xs text-gray-500 pl-2">
                                    ≈ {formatVND(itemTotal * exchangeRate)}
                                </div>
                            </div>
                        </div>

                        {/* Commission Rate */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Giảm giá (%)
                            </label>
                            <div className="space-y-2">
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        value={discountRate}
                                        onChange={(e) => onDiscountRateChange(parseFloat(e.target.value) || 0)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">%</span>
                                </div>
                            </div>
                        </div>

                        {/* Subtotal - Display only */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tổng tiền sau giảm
                            </label>
                            <div className="space-y-2">
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                                    <input
                                        type="text"
                                        value={subtotal.toFixed(2)}
                                        disabled
                                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-semibold cursor-not-allowed"
                                    />
                                </div>
                                <div className="text-xs text-gray-500 pl-2">
                                    ≈ {formatVND(subtotal * exchangeRate)}
                                </div>
                            </div>
                        </div>

                        {/* Buyer Paid */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-900 mb-1">
                                Tổng tiền khách trả <span className="text-red-500">*</span>
                            </label>
                            <div className="space-y-2">
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 font-bold text-lg">$</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={buyerPaidUSD}
                                        onChange={(e) => onbuyerPaidUSDChange(parseFloat(e.target.value) || 0)}
                                        className="w-full pl-8 pr-4 py-3 border-2 border-blue-300 rounded-lg bg-blue-50 text-blue-700 font-bold text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="text-sm font-semibold text-blue-600 pl-2">
                                    ≈ {formatVND(buyerPaidUSD * exchangeRate)}
                                </div>
                            </div>
                        </div>

                        {/* Order Earnings */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-900 mb-1">
                                Tổng tiền thực nhận <span className="text-red-500">*</span>
                            </label>
                            <div className="space-y-2">
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-600 font-bold text-lg">$</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={orderEarnings}
                                        onChange={(e) => onOrderEarningsChange(parseFloat(e.target.value) || 0)}
                                        className="w-full pl-8 pr-4 py-3 border-2 border-green-300 rounded-lg bg-green-50 text-green-700 font-bold text-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="text-sm font-semibold text-green-600 pl-2">
                                    ≈ {formatVND(orderEarnings * exchangeRate)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Calculation Formula */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-xs font-semibold text-blue-900 mb-2">📝 Công thức tính:</p>
                    <div className="space-y-1 text-xs text-blue-800">
                        <p>• Tổng tiền sau giảm = Tổng tiền sản phẩm - Tiền giảm giá</p>
                        <p>• Tổng tiền thực nhận = Tổng tiền khách trả - Các khoản phí *</p>
                    </div>
                </div>
            </div>
        </SectionCard>
    );
};
