// src/features/orders/components/OrderCardView.tsx

import { Calendar, Eye, Phone, PenLine, Trash2 } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { formatUSD, formatVND } from "../../../lib/utils";
import type { Order } from "../../../types/order.ts";

interface OrderCardViewProps {
  orders: Order[];
  selectedOrders: string[];
  onSelectOrder: (orderId: string) => void;
  onSelectAll: () => void;
  onDeleteOrder: (orderId: string) => void;
  getStatusBadge: (statusId: number | null | undefined) => React.ReactNode;
}

export const OrderCardView: React.FC<OrderCardViewProps> = ({
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
      <div className="p-12 text-center bg-white rounded-xl border border-gray-200 shadow-sm">
        <svg
          className="w-12 h-12 text-gray-400 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Chưa có đơn hàng nào
        </h3>
        <p className="text-gray-600">
          Bắt đầu bằng cách tạo đơn hàng đầu tiên của bạn
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Select All Header */}
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 rounded-2xl border-2 border-purple-200 shadow-lg shadow-purple-200/50">
        <div className="flex items-center gap-4">
          <input
            type="checkbox"
            checked={
              selectedOrders.length === orders.length && orders.length > 0
            }
            onChange={onSelectAll}
            className="rounded-xl border-2 border-purple-300 text-purple-600 focus:ring-purple-500 focus:ring-2 w-5 h-5 transform hover:scale-110 transition-transform"
          />
          <span className="text-lg font-bold text-purple-800 drop-shadow-sm">
            ✨ Chọn tất cả ({orders.length} đơn hàng) ✨
          </span>
        </div>
        {selectedOrders.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg animate-pulse">
            <span className="font-bold">
              🎯 Đã chọn {selectedOrders.length} đơn hàng
            </span>
          </div>
        )}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {orders.map((order, index) => (
          <div
            key={order.id}
            className={`relative overflow-hidden rounded-3xl border-4 transition-all duration-500 transform hover:scale-105 hover:rotate-1 ${
              selectedOrders.includes(order.id.toString())
                ? "border-gradient-to-r from-purple-500 to-pink-500 shadow-2xl shadow-purple-300/50 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 scale-105"
                : "border-gradient-to-r from-blue-200 to-purple-200 hover:border-gradient-to-r hover:from-blue-400 hover:to-purple-400 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 shadow-xl hover:shadow-2xl hover:shadow-blue-200/50"
            }`}
            style={{
              animationDelay: `${index * 100}ms`,
              animation: "fadeInUp 0.6s ease-out forwards",
            }}
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 -skew-x-12 transform translate-x-[-100%] hover:translate-x-[100%]"></div>
            {/* Card Header */}
            <div className="p-6 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 relative z-10">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selectedOrders.includes(order.id.toString())}
                    onChange={() => onSelectOrder(order.id.toString())}
                    className="rounded-xl border-2 border-white/50 text-pink-400 focus:ring-pink-400 focus:ring-2 w-5 h-5 bg-white/20 backdrop-blur-sm transform hover:scale-110 transition-transform"
                  />
                  <div>
                    <button
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="text-2xl font-black text-white hover:text-yellow-300 transition-colors drop-shadow-lg transform hover:scale-105"
                    >
                      ✨ {order.order_id} ✨
                    </button>
                    <div className="mt-2 transform hover:scale-105 transition-transform">
                      {getStatusBadge(order.general_status_id)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/orders/${order.id}`)}
                    title="Xem chi tiết"
                    className="p-3 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 rounded-xl transition-all duration-300 transform hover:scale-110 hover:rotate-12 shadow-lg"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => navigate(`/orders/${order.id}/edit`)}
                    title="Chỉnh sửa"
                    className="p-3 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 rounded-xl transition-all duration-300 transform hover:scale-110 hover:-rotate-12 shadow-lg"
                  >
                    <PenLine size={18} />
                  </button>
                  <button
                    onClick={() => onDeleteOrder(order.id.toString())}
                    title="Xóa"
                    className="p-3 bg-white/20 backdrop-blur-sm text-white hover:bg-red-500 rounded-xl transition-all duration-300 transform hover:scale-110 hover:rotate-12 shadow-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6 space-y-6 relative z-10">
              {/* Customer Info */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl border-2 border-blue-200 transform hover:scale-105 transition-transform">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-black text-xl shadow-2xl shadow-purple-300/50 animate-pulse">
                    {order.customer_name?.charAt(0)?.toUpperCase() || "N"}
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-bounce flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-black text-gray-900 text-xl hover:text-purple-700 transition-colors">
                    {order.customer_name}
                  </p>
                  <div className="flex items-center gap-2 text-lg text-gray-600 hover:text-blue-600 transition-colors">
                    <Phone className="w-5 h-5 text-green-500 animate-pulse" />
                    <span className="font-bold">
                      {order.customer_phone || "📞 Chưa có SĐT"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl border-2 border-blue-200 transform hover:scale-105 transition-transform">
                  <Calendar className="w-8 h-8 text-blue-600 animate-bounce" />
                  <div>
                    <p className="text-blue-600 font-bold text-sm">
                      📅 Ngày đặt
                    </p>
                    <p className="font-black text-gray-900 text-lg">
                      {order.order_date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl border-2 border-orange-200 transform hover:scale-105 transition-transform">
                  <Calendar className="w-8 h-8 text-orange-600 animate-bounce" />
                  <div>
                    <p className="text-orange-600 font-bold text-sm">
                      🚚 Ngày gửi
                    </p>
                    <p className="font-black text-gray-900 text-lg">
                      {order.scheduled_ship_date || "⏳ Chưa xác định"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Earnings */}
              <div className="bg-gradient-to-r from-emerald-100 via-green-100 to-lime-100 rounded-2xl p-6 border-4 border-green-200 shadow-lg shadow-green-200/50 transform hover:scale-105 transition-transform">
                <h4 className="text-center text-green-800 font-black text-lg mb-4">
                  💰 Thu Nhập 💰
                </h4>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-4 bg-gradient-to-r from-emerald-200 to-green-200 rounded-xl border-2 border-emerald-300 transform hover:scale-110 transition-transform">
                    <p className="text-emerald-700 font-bold text-sm mb-2">
                      💵 USD
                    </p>
                    <p className="font-black text-emerald-900 text-2xl drop-shadow-lg animate-pulse">
                      {formatUSD(order.order_earnings_usd)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-green-200 to-lime-200 rounded-xl border-2 border-green-300 transform hover:scale-110 transition-transform">
                    <p className="text-green-700 font-bold text-sm mb-2">
                      💴 VNĐ
                    </p>
                    <p className="font-black text-green-900 text-2xl drop-shadow-lg animate-pulse">
                      {formatVND(order.order_earnings_vnd)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Footer */}
      <div className="mt-8 p-8 bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 rounded-3xl border-4 border-gradient-to-r from-purple-300 to-pink-300 shadow-2xl shadow-purple-200/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-white font-black text-2xl">📊</span>
            </div>
            <div>
              <span className="text-2xl font-black text-purple-800 drop-shadow-lg">
                ✨ Hiển thị{" "}
                <span className="text-pink-600 animate-pulse">
                  {orders.length}
                </span>{" "}
                đơn hàng ✨
              </span>
            </div>
          </div>
          <div className="text-right p-6 bg-gradient-to-r from-green-200 to-emerald-200 rounded-2xl border-4 border-green-300 shadow-lg transform hover:scale-105 transition-transform">
            <p className="text-green-700 font-bold text-lg mb-2">
              💰 Tổng Thu Nhập 💰
            </p>
            <p className="font-black text-green-900 text-3xl drop-shadow-lg animate-pulse">
              {formatUSD(
                orders.reduce((sum, o) => sum + (o.order_earnings_usd || 0), 0),
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
