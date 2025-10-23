// src/features/orders/components/sections/OrderStatusSection.tsx
/**
 * OrderStatusSection - Trạng thái đơn hàng
 * Simple section component for order statuses
 */

import React from "react";
import {
  OptionBox,
  SectionCard,
  type Option,
} from "../../../../components/common";
import type { Status } from "../../../../types/status";

interface OrderStatusSectionProps {
  statusValues: {
    general: number;
    customer: number;
    factory: number;
    delivery: number;
  };
  statusOptions: {
    general: Status[];
    customer: Status[];
    factory: Status[];
    delivery: Status[];
  };
  onStatusChange: (
    type: "general" | "customer" | "factory" | "delivery",
    value: number,
  ) => void;
}

const StatusIcon = (
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
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

export const OrderStatusSection: React.FC<OrderStatusSectionProps> = ({
  statusValues,
  statusOptions,
  onStatusChange,
}) => {
  // Convert Status[] to Option[]
  const convertToOptions = (statuses: Status[]): Option[] => {
    return statuses.map((status) => ({
      value: status.id,
      label: status.name_vi,
      color: status.color,
    }));
  };

  // Handler wrapper for status changes
  const handleStatusChange =
    (type: "general" | "customer" | "factory" | "delivery") =>
    (value: string | number) => {
      onStatusChange(type, Number(value));
    };

  return (
    <SectionCard
      title="Trạng thái đơn hàng"
      icon={StatusIcon}
      iconGradient="from-purple-500 to-indigo-600"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <OptionBox
          label="Tổng quan"
          name="general_status"
          value={statusValues.general}
          options={convertToOptions(statusOptions.general)}
          editable={true}
          onChange={handleStatusChange("general")}
        />

        <OptionBox
          label="Khách hàng"
          name="customer_status"
          value={statusValues.customer}
          options={convertToOptions(statusOptions.customer)}
          editable={true}
          onChange={handleStatusChange("customer")}
        />

        <OptionBox
          label="Nhà máy"
          name="factory_status"
          value={statusValues.factory}
          options={convertToOptions(statusOptions.factory)}
          editable={true}
          onChange={handleStatusChange("factory")}
        />

        <OptionBox
          label="Giao hàng"
          name="delivery_status"
          value={statusValues.delivery}
          options={convertToOptions(statusOptions.delivery)}
          editable={true}
          onChange={handleStatusChange("delivery")}
        />
      </div>
    </SectionCard>
  );
};
