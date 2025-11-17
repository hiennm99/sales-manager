// src/features/orders/components/sections/OrderItemsSection.tsx
/**
 * OrderItemsSection - Danh sách sản phẩm
 * Simple section component for order items
 */

import { SectionCard } from "@components/common";
import { OrderItemInput } from "@features/orders";
import type { OrderItemFormData, Product } from "@types";
import React from "react";

interface OrderItemsSectionProps {
  items: OrderItemFormData[];
  selectedProducts?: (Product | null)[];
  errors?: Record<string, string>;
  onChange: (
    index: number,
    field: keyof OrderItemFormData,
    value: string | number
  ) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onProductSelect: (index: number, product: Product | null) => void;
}

const ProductIcon = (
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
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
    />
  </svg>
);

export const OrderItemsSection: React.FC<OrderItemsSectionProps> = ({
                                                                      items,
                                                                      selectedProducts = [],
                                                                      errors = {},
                                                                      onChange,
                                                                      onAdd,
                                                                      onRemove,
                                                                      onProductSelect
                                                                    }) => {
  return (
    <SectionCard
      title="Danh sách sản phẩm"
      icon={ProductIcon}
      iconGradient="from-teal-500 to-cyan-600"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          {errors.items && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm font-medium">{errors.items}</span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Thêm sản phẩm
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <OrderItemInput
            key={index}
            item={item}
            index={index}
            selectedProduct={selectedProducts[index] || null}
            canRemove={items.length > 1}
            errors={errors}
            onChange={onChange}
            onRemove={onRemove}
            onProductSelect={onProductSelect}
          />
        ))}
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <p className="text-gray-500 font-medium mb-4">Chưa có sản phẩm nào</p>
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Thêm sản phẩm đầu tiên
          </button>
        </div>
      )}
    </SectionCard>
  );
};
