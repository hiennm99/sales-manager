// src/features/orders/components/cards/FinancialSummaryCard.tsx

import React from 'react';
import { formatVND, formatUSD } from '../../../../lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface FinancialSummaryCardProps {
    itemTotal: number;
    itemTotalVND: number;
    discountRate: number;
    buyerPaidUSD: number;
    buyerPaidVND: number;
    orderEarnings: number;
    orderEarningsVND: number;
    exchangeRate: number;
    // Fees
    shippingFeeUsd?: number;
    shippingExchangeRate?: number;
    refundFeeUsd?: number;
    refundFeeExchangeRate?: number;
    otherFeeUsd?: number;
    otherFeeExchangeRate?: number;
    // Bonus
    otherBonusUsd?: number;
    otherBonusExchangeRate?: number;
}

export const FinancialSummaryCard: React.FC<FinancialSummaryCardProps> = ({
    itemTotal,
    itemTotalVND,
    discountRate,
    buyerPaidUSD,
    buyerPaidVND,
    orderEarnings,
    orderEarningsVND,
    exchangeRate,
    shippingFeeUsd = 0,
    shippingExchangeRate = 0,
    refundFeeUsd = 0,
    refundFeeExchangeRate = 0,
    otherFeeUsd = 0,
    otherFeeExchangeRate = 0,
    otherBonusUsd = 0,
    otherBonusExchangeRate = 0,
}) => {
    // Calculate discount
    const discountAmount = itemTotal * discountRate / 100;
    const discountAmountVND = discountAmount * exchangeRate;
    const subtotal = itemTotal * (100 - discountRate) / 100;
    const subtotalVND = subtotal * exchangeRate;

    // Calculate fees in VND with their respective exchange rates
    const shippingFeeVnd = shippingFeeUsd * (shippingExchangeRate || exchangeRate);
    const refundFeeVnd = refundFeeUsd * (refundFeeExchangeRate || exchangeRate);
    const otherFeeVnd = otherFeeUsd * (otherFeeExchangeRate || exchangeRate);

    // Calculate bonus in VND
    const otherBonusVnd = otherBonusUsd * (otherBonusExchangeRate || exchangeRate);

    // Calculate total fees
    const totalFeesUsd = shippingFeeUsd + refundFeeUsd + otherFeeUsd;
    const totalFeesVnd = shippingFeeVnd + refundFeeVnd + otherFeeVnd;

    // Calculate profit (including bonus)
    const profitUsd = orderEarnings + otherBonusUsd - totalFeesUsd;
    const profitVnd = orderEarningsVND + otherBonusVnd - totalFeesVnd;

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sticky top-4 space-y-4">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h2 className="text-lg font-bold text-gray-900">Tổng quan tài chính</h2>
            </div>

            {/* Column Headers */}
            <div className="grid grid-cols-3 gap-3 pb-2 border-b-2 border-gray-300">
                <div className="text-xs font-bold text-gray-600 text-left">Hạng mục</div>
                <div className="text-xs font-bold text-blue-600 text-right">USD ($)</div>
                <div className="text-xs font-bold text-green-600 text-right">VND (₫)</div>
            </div>

            {/* Item Total */}
            <div className="grid grid-cols-3 gap-3 items-center py-2 border-b border-gray-200">
                <div className="text-sm text-gray-700">Tổng tiền SP</div>
                <div className="text-sm font-semibold text-gray-900 text-right">{formatUSD(itemTotal)}</div>
                <div className="text-sm font-semibold text-gray-900 text-right">{formatVND(itemTotalVND)}</div>
            </div>

            {/* Discount */}
            {discountRate > 0 && (
                <div className="grid grid-cols-3 gap-3 items-center py-2 border-b border-gray-200">
                    <div className="text-sm text-gray-700">Giảm giá ({discountRate}%)</div>
                    <div className="text-sm font-semibold text-red-600 text-right">- {formatUSD(discountAmount)}</div>
                    <div className="text-sm font-semibold text-red-600 text-right">- {formatVND(discountAmountVND)}</div>
                </div>
            )}

            {/* Subtotal */}
            <div className="grid grid-cols-3 gap-3 items-center py-3 border-b-2 border-gray-200 bg-blue-50 -mx-6 px-6">
                <div className="text-sm font-bold text-gray-800">Sau giảm</div>
                <div className="text-base font-bold text-blue-700 text-right">{formatUSD(subtotal)}</div>
                <div className="text-base font-bold text-green-700 text-right">{formatVND(subtotalVND)}</div>
            </div>

            {/* Buyer Paid */}
            <div className="grid grid-cols-3 gap-3 items-center py-3 border-b-2 border-gray-200 bg-orange-50 -mx-6 px-6">
                <div className="text-sm font-bold text-gray-800">Khách trả</div>
                <div className="text-base font-bold text-orange-700 text-right">{formatUSD(buyerPaidUSD)}</div>
                <div className="text-base font-bold text-orange-700 text-right">{formatVND(buyerPaidVND)}</div>
            </div>

            {/* Order Earnings */}
            <div className="grid grid-cols-3 gap-3 items-center py-3 border-b-2 border-gray-200 bg-purple-50 -mx-6 px-6">
                <div className="text-sm font-bold text-gray-800">Thu nhập shop</div>
                <div className="text-base font-bold text-purple-700 text-right">{formatUSD(orderEarnings)}</div>
                <div className="text-base font-bold text-purple-700 text-right">{formatVND(orderEarningsVND)}</div>
            </div>

            {/* Bonus Section */}
            {otherBonusUsd > 0 && (
                <div className="space-y-2 pb-3 border-b-2 border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <h3 className="text-sm font-bold text-gray-900">Tiền thưởng</h3>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 items-center py-1 pl-6">
                        <div className="text-xs text-gray-600">
                            Bonus khác
                            {otherBonusExchangeRate && otherBonusExchangeRate !== exchangeRate && (
                                <span className="text-[10px] text-gray-400 block">
                                    (TG: {otherBonusExchangeRate})
                                </span>
                            )}
                        </div>
                        <div className="text-sm font-medium text-green-600 text-right">+ {formatUSD(otherBonusUsd)}</div>
                        <div className="text-sm font-medium text-green-600 text-right">+ {formatVND(otherBonusVnd)}</div>
                    </div>
                </div>
            )}

            {/* Fees Breakdown */}
            {totalFeesUsd > 0 && (
                <div className="space-y-2 pb-3 border-b-2 border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingDown className="w-4 h-4 text-red-500" />
                        <h3 className="text-sm font-bold text-gray-900">Các khoản phí</h3>
                    </div>
                    
                    {shippingFeeUsd > 0 && (
                        <div className="grid grid-cols-3 gap-3 items-center py-1 pl-6">
                            <div className="text-xs text-gray-600">
                                Phí ship
                                {shippingExchangeRate && shippingExchangeRate !== exchangeRate && (
                                    <span className="text-[10px] text-gray-400 block">
                                        (TG: {shippingExchangeRate})
                                    </span>
                                )}
                            </div>
                            <div className="text-sm font-medium text-red-600 text-right">- {formatUSD(shippingFeeUsd)}</div>
                            <div className="text-sm font-medium text-red-600 text-right">- {formatVND(shippingFeeVnd)}</div>
                        </div>
                    )}

                    {refundFeeUsd > 0 && (
                        <div className="grid grid-cols-3 gap-3 items-center py-1 pl-6">
                            <div className="text-xs text-gray-600">
                                Phí hoàn tiền
                                {refundFeeExchangeRate && refundFeeExchangeRate !== exchangeRate && (
                                    <span className="text-[10px] text-gray-400 block">
                                        (TG: {refundFeeExchangeRate})
                                    </span>
                                )}
                            </div>
                            <div className="text-sm font-medium text-red-600 text-right">- {formatUSD(refundFeeUsd)}</div>
                            <div className="text-sm font-medium text-red-600 text-right">- {formatVND(refundFeeVnd)}</div>
                        </div>
                    )}

                    {otherFeeUsd > 0 && (
                        <div className="grid grid-cols-3 gap-3 items-center py-1 pl-6">
                            <div className="text-xs text-gray-600">
                                Phí khác
                                {otherFeeExchangeRate && otherFeeExchangeRate !== exchangeRate && (
                                    <span className="text-[10px] text-gray-400 block">
                                        (TG: {otherFeeExchangeRate})
                                    </span>
                                )}
                            </div>
                            <div className="text-sm font-medium text-red-600 text-right">- {formatUSD(otherFeeUsd)}</div>
                            <div className="text-sm font-medium text-red-600 text-right">- {formatVND(otherFeeVnd)}</div>
                        </div>
                    )}

                    {/* Total Fees */}
                    <div className="grid grid-cols-3 gap-3 items-center py-2 pl-6 mt-2 pt-2 border-t border-gray-200">
                        <div className="text-xs font-bold text-gray-700">Tổng phí</div>
                        <div className="text-sm font-bold text-red-600 text-right">- {formatUSD(totalFeesUsd)}</div>
                        <div className="text-sm font-bold text-red-600 text-right">- {formatVND(totalFeesVnd)}</div>
                    </div>
                </div>
            )}

            {/* Profit */}
            <div className={`-mx-6 px-6 py-4 rounded-b-2xl border-t-2 ${
                profitUsd >= 0 
                    ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-300' 
                    : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-300'
            }`}>
                <div className="grid grid-cols-3 gap-3 items-center mb-2">
                    <div className="text-base font-bold text-gray-900 flex items-center gap-2">
                        {profitUsd >= 0 ? (
                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                        ) : (
                            <TrendingDown className="w-5 h-5 text-red-600" />
                        )}
                        LỢI NHUẬN
                    </div>
                    <div className={`text-xl font-bold text-right ${profitUsd >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatUSD(profitUsd)}
                    </div>
                    <div className={`text-xl font-bold text-right ${profitUsd >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatVND(profitVnd)}
                    </div>
                </div>
                <p className="text-[10px] text-gray-600 italic mt-2">
                    = Thu nhập shop + Tiền thưởng - (Phí ship + Phí hoàn tiền + Phí khác)
                </p>
            </div>

            {/* Exchange Rate */}
            <div className="p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-200 -mx-6 mx-0">
                <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                    <p className="text-xs font-semibold text-gray-700">Tỷ giá cơ bản</p>
                </div>
                <p className="text-sm font-bold text-gray-900 text-center">1 USD = {formatVND(exchangeRate)}</p>
                {(shippingExchangeRate || refundFeeExchangeRate || otherFeeExchangeRate || otherBonusExchangeRate) && (
                    <p className="text-[10px] text-gray-500 text-center mt-1 italic">
                        * Phí/Bonus có thể dùng tỷ giá riêng
                    </p>
                )}
            </div>
        </div>
    );
};
