// src/features/orders/components/sections/ShippingInfoSection.tsx
/**
 * ShippingInfoSection - Thông tin vận chuyển
 * Simple section component for shipping information
 */

import {
  Calendar,
  DollarSign,
  FileText,
  Hash,
  RefreshCw,
  Truck,
} from "lucide-react";
import React from "react";
import {
  OptionBox,
  SectionCard,
  TextBox,
  type Option,
} from "../../../../components/common";
import { DEFAULTS } from "../../../../constants/app-constants";
import { formatUSD, formatVND } from "../../../../lib/utils";
import { useExchangeRateStore } from "../../../../store/useExchangeRateStore";
import type { OrderFormData } from "../../../../types/order";
import { CARRIER_UNITS } from "../../constants/orderDefaults";

interface ShippingInfoSectionProps {
  formData: OrderFormData;
  errors?: Record<string, string>;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
}

const ShippingIcon = (
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
      d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
    />
  </svg>
);

export const ShippingInfoSection: React.FC<ShippingInfoSectionProps> = ({
  formData,
  errors = {},
  onChange,
}) => {
  const globalExchangeRate = useExchangeRateStore(
    (state) => state.exchangeRate,
  );

  // Convert CARRIER_UNITS to Option format
  const carrierOptions: Option[] = [
    { value: "", label: "-- Chọn đơn vị vận chuyển --" },
    ...CARRIER_UNITS.map((carrier) => ({
      value: carrier.value,
      label: carrier.label,
    })),
  ];

  // Convert TextBox onChange to standard form event
  const handleChange = (
    name: string,
    value: string | number | React.ReactNode | undefined,
  ) => {
    // Auto-set actualShipDate to today when carrier unit is selected
    if (name === "carrierUnit" && value && !formData.actualShipDate) {
      const today = new Date().toISOString().split("T")[0];
      const fakeEventCarrier = {
        target: { name: "carrierUnit", value },
      } as React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >;
      onChange(fakeEventCarrier);

      const fakeEventDate = {
        target: { name: "actualShipDate", value: today },
      } as React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >;
      onChange(fakeEventDate);
      return;
    }

    const fakeEvent = {
      target: { name, value },
    } as React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >;
    onChange(fakeEvent);
  };

  // Helper function to get effective exchange rate
  const getEffectiveRate = (
    fieldValue: number | undefined,
    mainRate: number | undefined,
  ): number => {
    if (fieldValue && fieldValue !== DEFAULTS.EXCHANGE_RATE) {
      return fieldValue;
    }
    const mainRateValue =
      mainRate && mainRate !== DEFAULTS.EXCHANGE_RATE ? mainRate : undefined;
    return mainRateValue || globalExchangeRate || DEFAULTS.EXCHANGE_RATE;
  };

  // Calculate shipping fee in VND
  const effectiveShippingRate = getEffectiveRate(
    formData?.shippingExchangeRate,
    formData?.exchangeRate,
  );
  const shippingFeeVnd =
    (formData?.shippingFeeUsd || 0) * effectiveShippingRate;

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
          value={formData?.carrierUnit || ""}
          options={carrierOptions}
          editable={true}
          error={errors.carrierUnit}
          onChange={handleChange}
          icon={<Truck className="w-5 h-5" />}
        />

        <TextBox
          label="Mã vận đơn nội bộ"
          name="internalTrackingNumber"
          value={formData.internalTrackingNumber || ""}
          editable={true}
          placeholder=""
          error={errors.internalTrackingNumber}
          onChange={handleChange}
          icon={<Hash className="w-5 h-5" />}
        />

        <TextBox
          label="Mã vận đơn"
          name="trackingNumber"
          value={formData.trackingNumber || ""}
          editable={true}
          placeholder=""
          error={errors.trackingNumber}
          onChange={handleChange}
          icon={<Hash className="w-5 h-5" />}
        />

        <TextBox
          label="Ngày giao thực tế"
          name="actualShipDate"
          type="date"
          value={formData.actualShipDate || ""}
          editable={true}
          error={errors.actualShipDate}
          onChange={handleChange}
          icon={<Calendar className="w-5 h-5" />}
        />
        <p className="text-xs text-blue-600 italic ml-7">
          💡 Chọn đơn vị sẽ tự động set ngày giao thực tế = hôm nay
        </p>

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
            onChange={handleChange}
            icon={<DollarSign className="w-5 h-5" />}
          />

          {(formData?.shippingFeeUsd || 0) > 0 && (
            <div className="ml-7 space-y-2">
              <TextBox
                label="Tỷ giá phí ship"
                name="shippingExchangeRate"
                type="number"
                value={effectiveShippingRate}
                editable={true}
                error={errors.shippingExchangeRate}
                onChange={handleChange}
                icon={<RefreshCw className="w-4 h-4" />}
              />
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-xs text-gray-600">Phí ship VND:</p>
                <p className="text-sm font-bold text-orange-700">
                  {formatVND(shippingFeeVnd)}
                </p>
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
          value={formData.carrierNotes || ""}
          editable={true}
          placeholder="Ghi chú về vận chuyển, đóng gói..."
          error={errors.carrierNotes}
          onChange={handleChange}
          icon={<FileText className="w-5 h-5" />}
        />
      </div>
    </SectionCard>
  );
};
