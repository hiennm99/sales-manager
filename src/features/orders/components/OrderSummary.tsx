// src/features/orders/components/OrderSummary.tsx
/**
 * OrderSummary - Summary display component
 * Shows order financial overview with improved UI
 */

import React from 'react';
import { formatVND } from '../../../lib/utils';

interface OrderSummaryProps {
    itemTotal: number;
    itemTotalVND: number;
    discountRate: number;
    buyerPaid: number;
    buyerPaidVND: number;
    orderEarnings: number;
    orderEarningsVND: number;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
    itemTotal,
    itemTotalVND,
    discountRate,
    buyerPaid,
    buyerPaidVND,
    orderEarnings,
    orderEarningsVND,
}) => {
    // Calculate display values
    const commissionAmount = itemTotal * discountRate / 100;
    const commissionAmountVND = itemTotalVND * discountRate / 100;
    const subtotal = itemTotal * (100 - discountRate) / 100;
    const subtotalVND = itemTotalVND * (100 - discountRate) / 100;

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sticky top-4">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                    Tổng quan đơn hàng
                </h2>
            </div>

            <div className="space-y-4">
                {/* Item Total */}
                <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                    <div className="flex justify-between items-baseline mb-1">
                        <span className="text-sm text-gray-600 font-medium">Tổng sản phẩm</span>
                        <span className="text-lg font-bold text-gray-900">${itemTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-end">
                        <span className="text-xs text-gray-600">{formatVND(itemTotalVND)}</span>
                    </div>
                </div>

                {/* Commission */}
                {discountRate > 0 && (
                    <div className="p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-200">
                        <div className="flex justify-between items-baseline mb-1">
                            <span className="text-sm text-gray-600 font-medium">Hoa hồng ({discountRate}%)</span>
                            <span className="text-lg font-bold text-red-600">-${commissionAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-end">
                            <span className="text-xs text-red-600">-{formatVND(commissionAmountVND)}</span>
                        </div>
                    </div>
                )}

                {/* Subtotal */}
                <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                    <div className="flex justify-between items-baseline mb-1">
                        <span className="text-sm text-gray-600 font-medium">Tạm tính</span>
                        <span className="text-lg font-bold text-gray-900">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-end">
                        <span className="text-xs text-gray-600">{formatVND(subtotalVND)}</span>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t-2 border-gray-200"></div>

                {/* Buyer Paid */}
                <div className="p-4 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl border-2 border-blue-300">
                    <div className="flex justify-between items-baseline mb-1">
                        <span className="text-sm font-bold text-gray-900">Khách trả</span>
                        <span className="text-2xl font-bold text-blue-600">${buyerPaid.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-end">
                        <span className="text-sm font-bold text-blue-600">{formatVND(buyerPaidVND)}</span>
                    </div>
                </div>

                {/* Order Earnings */}
                <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl border-2 border-green-300">
                    <div className="flex justify-between items-baseline mb-1">
                        <span className="text-sm font-bold text-gray-900">Thu nhập shop</span>
                        <span className="text-2xl font-bold text-green-600">${orderEarnings.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-end">
                        <span className="text-sm font-bold text-green-600">{formatVND(orderEarningsVND)}</span>
                    </div>
                </div>
            </div>

            {/* Info Note */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-xs text-yellow-800">
                        <p className="font-semibold mb-1">💡 Lưu ý</p>
                        <p>Tạm tính chỉ để hiển thị. Lợi nhuận = Thu nhập - Chi phí vận chuyển - Hoàn tiền - Chi phí khác.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
