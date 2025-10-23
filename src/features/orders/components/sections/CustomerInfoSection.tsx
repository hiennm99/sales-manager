// src/features/orders/components/sections/CustomerInfoSection.tsx
/**
 * CustomerInfoSection - Thông tin khách hàng
 * Simple section component for customer information
 */

import { Mail, MapPin, MessageSquare, Phone, User } from "lucide-react";
import React from "react";
import { SectionCard, TextBox } from "../../../../components/common";
import type { OrderFormData } from "../../../../types/order";

interface CustomerInfoSectionProps {
  formData: OrderFormData;
  errors?: Record<string, string>;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
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
}) => {
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
          icon={<User className="w-5 h-5" />}
        />

        <div className="md:col-span-2">
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
            icon={<MapPin className="w-5 h-5" />}
          />
        </div>

        <TextBox
          label="Số điện thoại"
          name="customerPhone"
          value={formData.customerPhone || ""}
          editable={true}
          placeholder=""
          onChange={handleChange}
          icon={<Phone className="w-5 h-5" />}
        />

        <TextBox
          label="Email"
          name="customerEmail"
          value={formData.customerEmail || ""}
          editable={true}
          placeholder=""
          onChange={handleChange}
          icon={<Mail className="w-5 h-5" />}
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
            icon={<MessageSquare className="w-5 h-5" />}
          />
        </div>
      </div>
    </SectionCard>
  );
};
