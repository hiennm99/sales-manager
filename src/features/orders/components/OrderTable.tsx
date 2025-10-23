// src/features/orders/components/OrderTableEnhanced.tsx
/**
 * Enhanced OrderTable with delay detection
 * Shows warning when orders are delayed past scheduled ship date
 */

import {
  AlertTriangle,
  Clock,
  Package,
  SquarePen,
  Trash2,
  Zap,
} from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { formatUSD, formatVND } from "../../../lib/utils";
import type { Order } from "../../../types/order.ts";

interface OrderTableProps {
  orders: Order[];
  selectedOrders: string[];
  onSelectOrder: (orderId: string) => void;
  onSelectAll: () => void;
  onDeleteOrder: (orderId: string) => void;
  getStatusBadge: (statusId: number | null | undefined) => React.ReactNode;
}

// Helper function to check if order is delayed (overdue - scheduled date passed but not shipped yet)
const isOrderDelayed = (order: Order): boolean => {
  if (!order.scheduled_ship_date || order.actual_ship_date) return false;
  const scheduled = new Date(order.scheduled_ship_date);
  const today = new Date();
  scheduled.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return scheduled < today;
};

// Helper function to get delay days (days overdue)
const getDelayDays = (order: Order): number => {
  if (!order.scheduled_ship_date || order.actual_ship_date) return 0;
  const scheduled = new Date(order.scheduled_ship_date);
  const today = new Date();
  scheduled.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diffTime = today.getTime() - scheduled.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Helper function to check if order is within 3 days of scheduled ship date
// Only show if order hasn't been shipped yet (no actual_ship_date)
const isWithin3Days = (order: Order): boolean => {
  if (!order.scheduled_ship_date || order.actual_ship_date) return false;
  const scheduled = new Date(order.scheduled_ship_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  scheduled.setHours(0, 0, 0, 0);
  const diffTime = scheduled.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 && diffDays <= 3;
};

// Helper function to get days remaining until scheduled ship date
// Only calculate if order hasn't been shipped yet (no actual_ship_date)
const getDaysRemaining = (order: Order): number => {
  if (!order.scheduled_ship_date || order.actual_ship_date) return 0;
  const scheduled = new Date(order.scheduled_ship_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  scheduled.setHours(0, 0, 0, 0);
  const diffTime = scheduled.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  selectedOrders,
  onSelectOrder,
  onSelectAll,
  onDeleteOrder,
  getStatusBadge,
}) => {
  const navigate = useNavigate();

  if (orders.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 via-white to-purple-50 border border-gray-200/50 shadow-sm">
        <div className="p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 mb-6">
            <Package className="w-10 h-10 text-blue-600" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Chưa có đơn hàng
          </h3>
          <p className="text-gray-600">
            Danh sách đơn hàng của bạn sẽ xuất hiện ở đây
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200/50 overflow-hidden shadow-sm bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200/70">
            <tr>
              <th className="px-6 py-4 text-left w-12">
                <input
                  type="checkbox"
                  checked={
                    selectedOrders.length === orders.length && orders.length > 0
                  }
                  onChange={onSelectAll}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 focus:ring-offset-0 cursor-pointer transition-all"
                />
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Ngày đặt
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Ngày gửi hàng
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Mã đơn
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Khách hàng
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Trạng thái
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Thu nhập (USD)
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Thu nhập (VNĐ)
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order, index) => (
              <tr
                key={order.id}
                className={`group transition-all duration-200 ${
                  isOrderDelayed(order)
                    ? "bg-red-50/40 hover:bg-red-50/60 hover:shadow-lg hover:shadow-red-100/50"
                    : "hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-purple-50/30"
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedOrders.includes(order.id.toString())}
                    onChange={() => onSelectOrder(order.id.toString())}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 focus:ring-offset-0 cursor-pointer transition-all"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700 font-medium">
                      {order.order_date}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    {isOrderDelayed(order) ? (
                      <>
                        <AlertTriangle
                          size={16}
                          className="text-red-500 animate-pulse flex-shrink-0"
                        />
                        <span className="text-sm text-red-700 font-bold">
                          {order.scheduled_ship_date}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full border border-red-300 whitespace-nowrap">
                          <Clock size={12} />
                          Trễ {getDelayDays(order)} ngày
                        </span>
                      </>
                    ) : !order.actual_ship_date && isWithin3Days(order) ? (
                      <>
                        <Zap
                          size={16}
                          className="text-amber-500 animate-pulse flex-shrink-0"
                        />
                        <span className="text-sm text-amber-700 font-bold">
                          {order.scheduled_ship_date}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full border border-amber-300 whitespace-nowrap animate-pulse">
                          <Clock size={12} />
                          Còn {getDaysRemaining(order)} ngày
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-gray-700 font-medium">
                        {order.scheduled_ship_date}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => navigate(`/orders/${order.id}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-3xl transition-all duration-200 group-hover:shadow-sm"
                  >
                    <span className="font-mono">{order.order_id}</span>
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                      {order.customer_name?.charAt(0).toUpperCase() || "K"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 truncate">
                        {order.customer_name}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        {order.customer_phone}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="inline-block transform group-hover:scale-105 transition-transform">
                    {getStatusBadge(order.general_status_id)}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg">
                    <span className="font-bold text-gray-900">
                      {formatUSD(order.order_earnings_usd)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                    <span className="font-bold text-green-700">
                      {formatVND(order.order_earnings_vnd)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => navigate(`/orders/${order.id}/edit`)}
                      title="Chỉnh sửa"
                      className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-all duration-200 group/btn"
                    >
                      <SquarePen
                        size={18}
                        className="group-hover/btn:scale-110 transition-transform"
                        strokeWidth={2}
                      />
                    </button>
                    <button
                      onClick={() => onDeleteOrder(order.id.toString())}
                      title="Xóa"
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-all duration-200 group/btn"
                    >
                      <Trash2
                        size={18}
                        className="group-hover/btn:scale-110 transition-transform"
                        strokeWidth={2}
                      />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
