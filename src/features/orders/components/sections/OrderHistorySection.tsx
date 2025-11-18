// src/features/orders/components/sections/OrderHistorySection.tsx
/**
 * OrderHistorySection - Hiển thị lịch sử các thay đổi của đơn hàng
 * Displays order update history timeline with all changes and activities
 */

import { useEmployeeStore } from "@features/employees";
import {
    orderHistoryService,
    OrderHistoryTimeline
} from "@features/orders";
import type { OrderHistory } from "@types";
import React, { useEffect, useState } from "react";

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
        setError("Failed to load order history");
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
    <div className="w-full bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center gap-3 p-6 border-b border-gray-200">
        <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
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
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Order History
          </h2>
          <p className="text-sm text-gray-600">
            Lịch sử tất cả các thay đổi và hoạt động của đơn hàng
          </p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Loading history...</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Total records: <span className="font-semibold text-gray-900">{history.length}</span>
            </div>
            <OrderHistoryTimeline
              history={history}
              employeeNames={employeeNames}
            />
          </>
        )}
      </div>
    </div>
  );
};
