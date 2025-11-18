// src/features/orders/components/sections/OrderHistorySection.tsx
/**
 * OrderHistorySection - Hiển thị lịch sử các thay đổi của đơn hàng
 * Displays order update history with tree view and grouping
 */

import { useEmployeeStore } from "@features/employees";
import {
    orderHistoryService,
    OrderHistoryTree
} from "@features/orders";
import type { OrderHistory } from "@types";
import React, { useEffect, useState } from "react";
import { FiClock } from "react-icons/fi";

interface OrderHistorySectionProps {
  orderId: number;
}

export const OrderHistorySection: React.FC<OrderHistorySectionProps> = ({
  orderId
}) => {
  const [history, setHistory] = useState<OrderHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { employees } = useEmployeeStore();

  // Load order history
  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      try {
        const data = await orderHistoryService.getOrderHistory(orderId);
        setHistory(data);
        setError(null);
      } catch (err) {
        console.error("Failed to load order history:", err);
        setError("Không thể tải lịch sử đơn hàng");
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, [orderId]);

  // Create employee name map
  const employeeNames = employees.reduce(
    (acc, emp) => {
      acc[emp.id] = emp.name;
      return acc;
    },
    {} as Record<number, string>
  );

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center gap-4 p-6 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white">
        <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg shadow-md">
          <FiClock className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-900">
            Lịch sử đơn hàng
          </h2>
          <p className="text-sm text-gray-600 mt-0.5">
            Theo dõi tất cả các thay đổi và hoạt động
          </p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-3 border-gray-200 border-t-blue-600"></div>
            </div>
            <p className="text-gray-600 text-sm mt-4">Đang tải lịch sử...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <FiClock className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 text-sm font-medium">Chưa có lịch sử</p>
            <p className="text-gray-500 text-xs mt-1">Các thay đổi sẽ xuất hiện ở đây</p>
          </div>
        ) : (
          <>
            <OrderHistoryTree
              history={history}
              employeeNames={employeeNames}
            />
          </>
        )}
      </div>
    </div>
  );
};
