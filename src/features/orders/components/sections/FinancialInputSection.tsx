// src/features/orders/components/sections/FinancialInputSection.tsx
/**
 * FinancialInputSection - Nhập thông tin tài chính
 * Simple section component for financial information
 */

import {
  AlertCircle,
  CreditCard,
  DollarSign,
  Gift,
  RefreshCw,
  TrendingDown,
  Wallet,
  XCircle,
} from "lucide-react";
import React from "react";
import { SectionCard, TextBox } from "../../../../components/common";
import { DEFAULTS } from "../../../../constants/app-constants";
import { formatPercentage, formatUSD, formatVND } from "../../../../lib/utils";
import { useExchangeRateStore } from "../../../../store/useExchangeRateStore";
import type { OrderFormData } from "../../../../types/order";

interface FinancialInputSectionProps {
  formData: OrderFormData;
  errors?: Record<string, string>;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
}

const FinancialIcon = (
  <svg
    className="w-6 h-6 text-white"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

export const FinancialInputSection: React.FC<FinancialInputSectionProps> = ({
  formData,
  errors = {},
  onChange,
}) => {
  const globalExchangeRate = useExchangeRateStore(
    (state) => state.exchangeRate,
  );

  // Convert TextBox onChange to standard form event
  const handleChange = (
    name: string,
    value: string | number | React.ReactNode | undefined,
  ) => {
    const fakeEvent = {
      target: { name, value },
    } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
    onChange(fakeEvent);
  };

  const calculatedDiscountUsd =
    ((formData?.itemTotalUsd || 0) * (formData?.discountRate || 0)) / 100;
  const calculatedSubtotal =
    (formData?.itemTotalUsd || 0) - calculatedDiscountUsd;

  // Helper function to get effective exchange rate for any field
  const getEffectiveRate = (
    fieldValue: number | undefined,
    mainRate: number | undefined,
  ): number => {
    // If field has custom value (not default), use it
    if (fieldValue && fieldValue !== DEFAULTS.EXCHANGE_RATE) {
      return fieldValue;
    }
    // Otherwise use main rate or global rate or default
    const mainRateValue =
      mainRate && mainRate !== DEFAULTS.EXCHANGE_RATE ? mainRate : undefined;
    return mainRateValue || globalExchangeRate || DEFAULTS.EXCHANGE_RATE;
  };

  // Use form exchange rate if user changed it, otherwise use global rate
  // If formData.exchangeRate equals default, it means user hasn't changed it yet
  const isFormValueDefault = formData?.exchangeRate === DEFAULTS.EXCHANGE_RATE;
  const effectiveExchangeRate =
    !isFormValueDefault && formData?.exchangeRate
      ? formData.exchangeRate
      : globalExchangeRate || DEFAULTS.EXCHANGE_RATE;

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
            value={effectiveExchangeRate}
            editable={true}
            required
            error={errors.exchangeRate}
            onChange={handleChange}
            icon={<RefreshCw className="w-5 h-5" />}
          />
          <p className="text-xs text-purple-700 mt-2 ml-7">
            * Tỷ giá cho các giao dịch chính (sản phẩm, khách trả, thực nhận)
          </p>
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
                ≈{" "}
                {formatVND(
                  (formData?.itemTotalUsd || 0) * effectiveExchangeRate,
                )}
              </span>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              ✨ Tự động tính từ các sản phẩm (Số lượng × Giá)
            </p>
          </div>

          <TextBox
            label="Giảm giá (%)"
            name="discountRate"
            type="number"
            value={formData?.discountRate || 0}
            displayValue={formatPercentage(formData?.discountRate)}
            editable={true}
            error={errors.discountRate}
            onChange={handleChange}
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
                ≈ {formatVND(calculatedSubtotal * effectiveExchangeRate)}
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
            onChange={handleChange}
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
            onChange={handleChange}
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
              onChange={handleChange}
              icon={<XCircle className="w-5 h-5" />}
            />

            {(formData?.refundFeeUsd || 0) > 0 && (
              <div className="ml-7">
                <TextBox
                  label="Tỷ giá phí hoàn tiền"
                  name="refundFeeExchangeRate"
                  type="number"
                  value={getEffectiveRate(
                    formData?.refundFeeExchangeRate,
                    formData?.exchangeRate,
                  )}
                  editable={true}
                  onChange={handleChange}
                  icon={<RefreshCw className="w-4 h-4" />}
                />
                <p className="text-xs text-gray-500 mt-1">
                  ={" "}
                  {formatVND(
                    (formData?.refundFeeUsd || 0) *
                      getEffectiveRate(
                        formData?.refundFeeExchangeRate,
                        formData?.exchangeRate,
                      ),
                  )}
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
              onChange={handleChange}
              icon={<AlertCircle className="w-5 h-5" />}
            />

            {(formData?.otherFeeUsd || 0) > 0 && (
              <div className="ml-7">
                <TextBox
                  label="Tỷ giá phí khác"
                  name="otherFeeExchangeRate"
                  type="number"
                  value={getEffectiveRate(
                    formData?.otherFeeExchangeRate,
                    formData?.exchangeRate,
                  )}
                  editable={true}
                  onChange={handleChange}
                  icon={<RefreshCw className="w-4 h-4" />}
                />
                <p className="text-xs text-gray-500 mt-1">
                  ={" "}
                  {formatVND(
                    (formData?.otherFeeUsd || 0) *
                      getEffectiveRate(
                        formData?.otherFeeExchangeRate,
                        formData?.exchangeRate,
                      ),
                  )}
                </p>
              </div>
            )}
          </div>

          <p className="text-xs text-gray-500 italic">
            💡 Phí ship xem ở phần "Thông tin vận chuyển"
          </p>
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
              onChange={handleChange}
              icon={<Gift className="w-5 h-5" />}
            />

            {(formData?.otherBonusUsd || 0) > 0 && (
              <div className="ml-7">
                <TextBox
                  label="Tỷ giá tiền thưởng"
                  name="otherBonusExchangeRate"
                  type="number"
                  value={getEffectiveRate(
                    formData?.otherBonusExchangeRate,
                    formData?.exchangeRate,
                  )}
                  editable={true}
                  onChange={handleChange}
                  icon={<RefreshCw className="w-4 h-4" />}
                />
                <p className="text-xs text-gray-500 mt-1">
                  ={" "}
                  {formatVND(
                    (formData?.otherBonusUsd || 0) *
                      getEffectiveRate(
                        formData?.otherBonusExchangeRate,
                        formData?.exchangeRate,
                      ),
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Formula Info */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-xs font-semibold text-blue-900 mb-2">📝 Lưu ý:</p>
          <div className="space-y-1 text-xs text-blue-800">
            <p>
              • Tổng tiền sau giảm = Tổng tiền sản phẩm × (100 - Giảm giá%) /
              100
            </p>
            <p>
              • Mỗi khoản phí/bonus có thể có tỷ giá riêng để tính VND chính xác
            </p>
            <p>• Lợi nhuận = Thực nhận + Bonus - Ship - Hoàn tiền - Phí khác</p>
            <p>• Profit sẽ được tính TỰ ĐỘNG bởi database trigger</p>
          </div>
        </div>
      </div>
    </SectionCard>
  );
};
