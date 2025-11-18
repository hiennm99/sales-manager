// src/features/orders/components/sections/OrderInfoSection.tsx
/**
 * OrderInfoSection - Thông tin đơn hàng
 * Simple section component for order information
 */

import { EmployeeAutocomplete, SectionCard, TextBox } from "@components/common";
import type { OrderFormData } from "@types";
import React from "react";

interface OrderInfoSectionProps {
  formData: OrderFormData;
  shopName?: string;
  errors?: Record<string, string>;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
}

const InfoIcon = (
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
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

export const OrderInfoSection: React.FC<OrderInfoSectionProps> = ({
                                                                    formData,
                                                                    shopName,
                                                                    errors = {},
                                                                    onChange
                                                                  }) => {
  // Convert TextBox onChange to standard form event
  const handleChange = (
    name: string,
    value: string | number | React.ReactNode | undefined
  ) => {
    const fakeEvent = {
      target: {
        name,
        value: typeof value === "number" ? value : (value as string)
      }
    } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
    onChange(fakeEvent);
  };

  return (
    <SectionCard
      title="Thông tin đơn hàng"
      icon={InfoIcon}
      iconGradient="from-blue-500 to-cyan-600"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextBox
          label="Cửa hàng"
          name="shopCode"
          value={shopName || "Chưa chọn cửa hàng"}
          editable={false}
          disabled={true}
          required
          error={errors.shopCode}
        />

        <TextBox
          label="Mã đơn hàng"
          name="orderId"
          value={formData.orderId}
          editable={true}
          placeholder="Mã đơn Etsy..."
          required
          error={errors.orderId}
          onChange={handleChange}
        />

        <TextBox
          label="Ngày đặt hàng"
          name="orderDate"
          type="date"
          value={formData.orderDate}
          editable={true}
          required
          error={errors.orderDate}
          onChange={handleChange}
        />

        <TextBox
          label="Ngày giao dự kiến"
          name="scheduledShipDate"
          type="date"
          value={formData.scheduledShipDate || ""}
          editable={true}
          onChange={handleChange}
        />

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Họa sĩ
          </label>
          <EmployeeAutocomplete
            value={formData.employeeName || ""}
            onChange={(value, employeeId) => {
              handleChange("employeeName", value);
              if (employeeId !== undefined) {
                handleChange("employeeId", employeeId);
              }
            }}
            placeholder="Nhập tên họa sĩ ..."
            className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              errors?.employeeName
                ? "border-red-500 bg-red-50"
                : "border-gray-300"
            }`}
            error={errors?.employeeName}
          />
        </div>

        <TextBox
          label="Hoa hồng (%)"
          name="artistCommissionRate"
          type="number"
          value={formData.artistCommissionRate || 0}
          editable={true}
          placeholder="0"
          onChange={handleChange}
        />

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nhân viên bán hàng
          </label>
          <EmployeeAutocomplete
            value={formData.sellerEmployeeName || ""}
            onChange={(value, sellerEmployeeId) => {
              handleChange("sellerEmployeeName", value);
              if (sellerEmployeeId !== undefined) {
                handleChange("sellerEmployeeId", sellerEmployeeId);
              }
            }}
            placeholder="Nhập tên nhân viên bán hàng ..."
            className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              errors?.sellerEmployeeName
                ? "border-red-500 bg-red-50"
                : "border-gray-300"
            }`}
            error={errors?.sellerEmployeeName}
          />
        </div>
      </div>
    </SectionCard>
  );
};
