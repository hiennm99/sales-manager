// src/features/orders/components/OrderTable.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatUSD, formatVND } from '../../../lib/utils';
import type { Order } from "../../../types/order.ts";

interface OrderTableProps {
    orders: Order[];
    selectedOrders: string[];
    onSelectOrder: (orderId: string) => void;
    onSelectAll: () => void;
    onDeleteOrder: (orderId: string) => void;
    getStatusBadge: (statusId: number | null | undefined) => React.ReactNode;
}

export const OrderTable: React.FC<OrderTableProps> = ({
                                                          orders,
                                                          selectedOrders,
                                                          onSelectOrder,
                                                          onSelectAll,
                                                          onDeleteOrder,
                                                          getStatusBadge
                                                      }) => {
    const navigate = useNavigate();

    if (orders.length === 0) {
        return (
            <div className="p-8 text-center bg-white rounded-lg border border-gray-200">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-gray-600">Không có đơn hàng nào</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-3 text-left">
                            <input
                                type="checkbox"
                                checked={selectedOrders.length === orders.length && orders.length > 0}
                                onChange={onSelectAll}
                                className="rounded border-gray-300 text-blue-600"
                            />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Ngày đặt</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Ngày gửi hàng (dự kiến)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Mã đơn</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Khách hàng</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Trạng thái</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">Thu nhập (USD)</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">Thu nhập (VNĐ)</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">Hành động</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                                <input
                                    type="checkbox"
                                    checked={selectedOrders.includes(order.id.toString())}
                                    onChange={() => onSelectOrder(order.id.toString())}
                                    className="rounded border-gray-300 text-blue-600"
                                />
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                                {order.order_date}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                                {order.scheduled_ship_date}
                            </td>
                            <td className="px-6 py-4">
                                <button
                                    onClick={() => navigate(`/orders/${order.id}`)}
                                    className="text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    {order.order_id}
                                </button>
                            </td>
                            <td className="px-6 py-4">
                                <div>
                                    <p className="font-medium text-gray-900">{order.customer_name}</p>
                                    <p className="text-sm text-gray-600">{order.customer_phone}</p>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                {getStatusBadge(order.general_status_id)}
                            </td>
                            <td className="px-6 py-4 text-right font-medium text-gray-900">
                                {formatUSD(order.order_earnings_usd)}
                            </td>
                            <td className="px-6 py-4 text-right font-medium text-green-600">
                                {formatVND(order.order_earnings_vnd)}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => navigate(`/orders/${order.id}`)}
                                        title="Xem chi tiết"
                                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => navigate(`/orders/${order.id}/edit`)}
                                        title="Chỉnh sửa"
                                        className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => onDeleteOrder(order.id.toString())}
                                        title="Xóa"
                                        className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
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