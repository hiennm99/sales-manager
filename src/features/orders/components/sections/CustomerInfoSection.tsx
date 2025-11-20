// src/features/orders/components/sections/CustomerInfoSection.tsx
/**
 * CustomerInfoSection - Thông tin khách hàng
 * Simple section component for customer information
 */

import { SectionCard, TextBox } from "@components/common";
import type { OrderFormData } from "@types";
import React from "react";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiLoader,
  FiMail,
  FiMapPin,
  FiMessageSquare,
  FiPhone,
  FiUser
} from "react-icons/fi";

type VerificationState = {
  status: "idle" | "pending" | "success" | "error";
  message?: string;
};

interface CustomerInfoSectionProps {
  formData: OrderFormData;
  errors?: Record<string, string>;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onVerifyAddress?: () => void;
  verificationState?: VerificationState;
  isAddressVerified?: boolean;
  isVerifyingAddress?: boolean;
}

const CustomerIcon = (
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
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

export const CustomerInfoSection: React.FC<CustomerInfoSectionProps> = ({
                                                                          formData,
                                                                          errors = {},
                                                                          onChange,
                                                                          onVerifyAddress,
                                                                          verificationState,
                                                                          isAddressVerified = false,
                                                                          isVerifyingAddress = false
                                                                        }) => {
  // Convert TextBox onChange to standard form event
  const handleChange = (
    name: string,
    value: string | number | React.ReactNode | undefined
  ) => {
    const fakeEvent = {
      target: { name, value }
    } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
    onChange(fakeEvent);
  };

  const currentStatus = isAddressVerified
    ? "success"
    : verificationState?.status || "idle";

  const statusConfig = {
    success: {
      icon: <FiCheckCircle className="w-4 h-4 text-green-600" />,
      text: "Địa chỉ đã xác thực",
      className: "text-green-600"
    },
    pending: {
      icon: <FiLoader className="w-4 h-4 text-blue-600 animate-spin" />,
      text: "Đang xác thực địa chỉ...",
      className: "text-blue-600"
    },
    error: {
      icon: <FiAlertCircle className="w-4 h-4 text-red-600" />,
      text: "Chưa xác thực",
      className: "text-red-600"
    },
    idle: {
      icon: <FiAlertCircle className="w-4 h-4 text-amber-500" />,
      text: "Chưa xác thực",
      className: "text-amber-600"
    }
  } as const;

  const statusDisplay =
    statusConfig[currentStatus as keyof typeof statusConfig] ||
    statusConfig.idle;

  const addressInputStateClass =
    currentStatus === "success"
      ? "border-emerald-500 bg-emerald-50"
      : currentStatus === "pending"
        ? "border-blue-400 bg-blue-50"
        : currentStatus === "error"
          ? "border-red-500 bg-red-50"
          : "";

  return (
    <SectionCard
      title="Thông tin khách hàng"
      icon={CustomerIcon}
      iconGradient="from-pink-500 to-rose-600"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextBox
          label="Tên khách hàng"
          name="customerName"
          value={formData.customerName}
          editable={true}
          placeholder=""
          required
          error={errors.customerName}
          onChange={handleChange}
          icon={<FiUser className="w-5 h-5" />}
        />

        <div className="md:col-span-2 space-y-3">
          <div className="relative">
            <TextBox
              label="Địa chỉ"
              name="customerAddress"
              type="textarea"
              value={formData.customerAddress}
              editable={true}
              placeholder=""
              required
              error={errors.customerAddress}
              onChange={handleChange}
              icon={<FiMapPin className="w-5 h-5" />}
              inputClassName={`${addressInputStateClass} pr-32`}
            />
            <div className="absolute top-3 right-4 text-right">
              <div
                className={`inline-flex flex-col items-end px-3 py-1 rounded-full text-xs font-semibold shadow-sm bg-white ${statusDisplay.className}`}
              >
                <span>{statusDisplay.text}</span>
                {verificationState?.message && (
                  <span className="text-[11px] font-normal text-gray-600">
                    {verificationState.message}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={() => onVerifyAddress?.()}
              disabled={isVerifyingAddress}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors self-start sm:self-auto"
            >
              {isVerifyingAddress ? "Đang xác thực..." : "Xác thực địa chỉ"}
            </button>
          </div>

          {verificationState?.message && currentStatus === "error" && (
            <p className="text-sm text-red-600">{verificationState.message}</p>
          )}

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div
              className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-sm font-semibold text-emerald-700">
              <div className="flex items-center gap-2">
                <FiCheckCircle className="w-4 h-4" />
                <span>Địa chỉ đã xác thực</span>
              </div>
              {isAddressVerified && verificationState?.message && (
                <span className="text-xs text-emerald-600">
                  {verificationState.message}
                </span>
              )}
            </div>
            <p className="mt-2 text-base font-medium text-gray-900">
              {formData.verifiedCustomerAddress?.trim()
                ? formData.verifiedCustomerAddress
                : "Chưa có địa chỉ đã xác thực"}
            </p>
          </div>
        </div>

        <TextBox
          label="Số điện thoại"
          name="customerPhone"
          value={formData.customerPhone || ""}
          editable={true}
          placeholder=""
          onChange={handleChange}
          icon={<FiPhone className="w-5 h-5" />}
        />

        <TextBox
          label="Email"
          name="customerEmail"
          value={formData.customerEmail || ""}
          editable={true}
          placeholder=""
          onChange={handleChange}
          icon={<FiMail className="w-5 h-5" />}
        />

        <div className="md:col-span-2">
          <TextBox
            label="Ghi chú"
            name="customerNotes"
            type="textarea"
            value={formData.customerNotes || ""}
            editable={true}
            placeholder="Ghi chú về khách hàng..."
            onChange={handleChange}
            icon={<FiMessageSquare className="w-5 h-5" />}
          />
        </div>
      </div>
    </SectionCard>
  );
};
