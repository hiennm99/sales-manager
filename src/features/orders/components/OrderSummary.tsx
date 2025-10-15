// src/features/orders/components/OrderSummary.tsx

import React from 'react';

interface OrderSummaryProps {
    itemTotal: number;
    itemTotalVND: number;
    discount: number;
    subtotal: number;
    subtotalVND: number;
    tax: number;
    orderTotal: number;
    orderTotalVND: number;
    fees: number;
    orderEarnings: number;
    orderEarningsVND: number;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
    itemTotal,
    itemTotalVND,
    discount,
    subtotal,
    subtotalVND,
    tax,
    orderTotal,
    orderTotalVND,
    fees,
    orderEarnings,
    orderEarningsVND,
}) => {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Tổng quan đơn hàng
            </h2>

            <div className="space-y-3">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tổng sản phẩm:</span>
                    <span className="font-medium text-gray-900">${itemTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">VND:</span>
                    <span className="font-medium text-gray-900">{itemTotalVND.toLocaleString('vi-VN')} ₫</span>
                </div>

                <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Giảm giá:</span>
                        <span className="font-medium text-red-600">-${discount.toFixed(2)}</span>
                    </div>
                </div>

                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sau giảm giá:</span>
                    <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">VND:</span>
                    <span className="font-medium text-gray-900">{subtotalVND.toLocaleString('vi-VN')} ₫</span>
                </div>

                <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Thuế:</span>
                        <span className="font-medium text-gray-900">+${tax.toFixed(2)}</span>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-base font-semibold">
                        <span className="text-gray-900">Tổng đơn hàng:</span>
                        <span className="text-blue-600">${orderTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-600">VND:</span>
                        <span className="font-medium text-blue-600">{orderTotalVND.toLocaleString('vi-VN')} ₫</span>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Phí:</span>
                        <span className="font-medium text-red-600">-${fees.toFixed(2)}</span>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-base font-semibold">
                        <span className="text-gray-900">Thu nhập:</span>
                        <span className="text-green-600">${orderEarnings.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-600">VND:</span>
                        <span className="font-medium text-green-600">{orderEarningsVND.toLocaleString('vi-VN')} ₫</span>
                    </div>
                </div>
            </div>

            <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Lưu ý</p>
                        <p className="text-xs">Giá VND được tính tự động theo tỷ giá. Lợi nhuận = Thu nhập - Chi phí vận chuyển - Hoàn tiền - Chi phí khác.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
