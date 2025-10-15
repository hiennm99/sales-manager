// src/features/orders/components/cards/FinancialSummaryCard.tsx

import React from 'react';
import { formatVND, formatUSD } from '../../../../lib/utils';

interface FinancialSummaryCardProps {
    itemTotal: number;
    itemTotalVND: number;
    discountRate: number;
    buyerPaidUSD: number;
    buyerPaidVND: number;
    orderEarnings: number;
    orderEarningsVND: number;
    exchangeRate: number;
}

export const FinancialSummaryCard: React.FC<FinancialSummaryCardProps> = ({
    itemTotal,
    itemTotalVND,
    discountRate,
    buyerPaidUSD,
    buyerPaidVND,
    orderEarnings,
    orderEarningsVND,
    exchangeRate
}) => {
    // Calculate values for display only
    const discountAmount = itemTotal * discountRate / 100;
    const discountAmountVND = discountAmount * exchangeRate;
    const subtotal = itemTotal * (100 - discountRate) / 100;
    const subtotalVND = subtotal * exchangeRate;

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sticky top-4 space-y-4">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h2 className="text-lg font-bold text-gray-900">Tóm tắt tài chính</h2>
            </div>

            {/* Item Total */}
            <div className="space-y-2 pb-3 border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tổng tiền sản phẩm:</span>
                    <span className="font-semibold text-gray-900">{formatUSD(itemTotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 pl-4">VND:</span>
                    <span className="text-sm font-medium text-gray-700">{formatVND(itemTotalVND)}</span>
                </div>
            </div>

            {/* Discount */}
            <div className="space-y-2 pb-3 border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Giảm giá ({discountRate}%):</span>
                    <span className="font-semibold text-red-600">- {formatUSD(discountAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 pl-4">VND:</span>
                    <span className="text-sm font-medium text-red-600">- {formatVND(discountAmountVND)}</span>
                </div>
            </div>

            {/* Subtotal - Display only */}
            <div className="space-y-2 pb-3 border-b border-gray-200 bg-gray-50 -mx-6 px-6 py-3">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Tổng tiền sau giảm:</span>
                    <span className="font-bold text-gray-900">{formatUSD(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 pl-4">VND:</span>
                    <span className="text-sm font-semibold text-gray-700">{formatVND(subtotalVND)}</span>
                </div>
            </div>

            {/* Buyer Paid */}
            <div className="space-y-2 pb-3 border-b border-gray-200 bg-gradient-to-br from-blue-50 to-cyan-50 -mx-6 px-6 py-4 border-y-2 border-blue-200">
                <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-gray-900">Khách trả:</span>
                    <span className="text-xl font-bold text-blue-600">{formatUSD(buyerPaidUSD)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 pl-4">VND:</span>
                    <span className="text-base font-bold text-blue-600">{formatVND(buyerPaidVND)}</span>
                </div>
            </div>

            {/* Order Earnings */}
            <div className="space-y-2 pb-3 bg-gradient-to-br from-green-50 to-emerald-50 -mx-6 px-6 py-4 rounded-b-2xl border-t-2 border-green-200">
                <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-gray-900">Thu nhập shop:</span>
                    <span className="text-xl font-bold text-green-600">{formatUSD(orderEarnings)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 pl-4">VND:</span>
                    <span className="text-base font-bold text-green-600">{formatVND(orderEarningsVND)}</span>
                </div>
            </div>

            {/* Exchange Rate */}
            <div className="p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-200 -mx-6 mx-0">
                <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                    <p className="text-xs font-semibold text-gray-700">Tỷ giá hối đoái</p>
                </div>
                <p className="text-sm font-bold text-gray-900 text-center">1 USD = {formatVND(exchangeRate)}</p>
            </div>
        </div>
    );
};
