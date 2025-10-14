// src/features/orders/pages/OrderDetail.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Order } from '../../../types/order';
import { useOrderStore } from '../store/useOrderStore';

export const OrderDetail: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const { getOrderById, getOrderItems, deleteOrder, updateOrder, isLoading } = useOrderStore();

    const [order, setOrder] = useState<Order | null>(null);
    const [items, setItems] = useState<any[]>([]);
    const [newStatus, setNewStatus] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (orderId) {
            const orderData = getOrderById(orderId);
            if (orderData) {
                setOrder(orderData);
                setNewStatus(orderData.status);

                // Load order items
                getOrderItems(orderData.id).then(orderItems => {
                    setItems(orderItems);
                });
            }
        }
    }, [orderId, getOrderById, getOrderItems]);

    const handleStatusChange = async () => {
        if (order && newStatus !== order.status) {
            try {
                await updateOrder(orderId || '', {}, { status: newStatus });
                setOrder(prev => prev ? { ...prev, status: newStatus } : null);
            } catch (error) {
                console.error('Failed to update status:', error);
                alert('Có lỗi xảy ra khi cập nhật trạng thái!');
            }
        }
    };

    const handleDelete = async () => {
        try {
            await deleteOrder(orderId || '');
            navigate('/orders');
        } catch (error) {
            console.error('Failed to delete order:', error);
            alert('Có lỗi xảy ra khi xóa đơn hàng!');
        }
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { bg: string; text: string; label: string }> = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ xử lý' },
            confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Đã xác nhận' },
            shipped: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Đã gửi' },
            delivered: { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã giao' },
            cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Đã hủy' },
        };

        const s = statusMap[status] || statusMap.pending;
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${s.bg} ${s.text}`}>
                {s.label}
            </span>
        );
    };

    if (!order) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center">
                    <p className="text-gray-600">Không tìm thấy đơn hàng</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <button
                        onClick={() => navigate('/orders')}
                        className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-1"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Quay lại
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Đơn hàng {order.order_id}</h1>
                    <p className="text-gray-600 mt-1">
                        Ngày đặt: {new Date(order.order_date).toLocaleDateString('vi-VN')}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(`/orders/${orderId}/edit`)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Chỉnh sửa
                    </button>
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Xóa
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Status Card */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Trạng thái đơn hàng</h2>
                        <div className="flex items-center gap-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-2">Trạng thái hiện tại</p>
                                {getStatusBadge(order.status)}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-600 mb-2">Thay đổi trạng thái</p>
                                <div className="flex gap-2">
                                    <select
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="pending">Chờ xử lý</option>
                                        <option value="confirmed">Đã xác nhận</option>
                                        <option value="shipped">Đã gửi</option>
                                        <option value="delivered">Đã giao</option>
                                        <option value="cancelled">Đã hủy</option>
                                    </select>
                                    <button
                                        onClick={handleStatusChange}
                                        disabled={newStatus === order.status || isLoading}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Cập nhật
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Info Card */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin đơn hàng</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Mã đơn hàng</p>
                                <p className="text-lg font-medium text-gray-900">{order.order_id}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Cửa hàng</p>
                                <p className="text-lg font-medium text-gray-900">{order.shop_code}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Ngày đặt hàng</p>
                                <p className="text-lg font-medium text-gray-900">
                                    {new Date(order.order_date).toLocaleDateString('vi-VN')}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Ngày giao dự kiến</p>
                                <p className="text-lg font-medium text-gray-900">
                                    {order.scheduled_ship_date
                                        ? new Date(order.scheduled_ship_date).toLocaleDateString('vi-VN')
                                        : 'Chưa xác định'}
                                </p>
                            </div>
                            {order.artist_code && (
                                <div className="md:col-span-2">
                                    <p className="text-sm text-gray-600 mb-1">Mã nghệ sĩ</p>
                                    <p className="text-lg font-medium text-gray-900">{order.artist_code}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Customer Info Card */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin khách hàng</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Tên khách hàng</p>
                                <p className="text-lg font-medium text-gray-900">{order.customer_name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Địa chỉ</p>
                                <p className="text-gray-900 whitespace-pre-wrap">{order.customer_address}</p>
                            </div>
                            {order.customer_phone && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Số điện thoại</p>
                                    <p className="text-gray-900">
                                        <a href={`tel:${order.customer_phone}`} className="text-blue-600 hover:text-blue-700">
                                            {order.customer_phone}
                                        </a>
                                    </p>
                                </div>
                            )}
                            {order.customer_notes && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Ghi chú</p>
                                    <p className="text-gray-900 whitespace-pre-wrap">{order.customer_notes}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Items Card */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Sản phẩm ({items.length})</h2>
                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {item.sku} {item.size && `- Size: ${item.size}`}
                                                {item.type && ` - ${item.type}`}
                                            </p>
                                            <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                        <div>
                                            <p className="text-gray-600">Giá USD</p>
                                            <p className="font-medium text-gray-900">${item.unit_price_usd.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Giá VND</p>
                                            <p className="font-medium text-gray-900">{item.unit_price_vnd.toLocaleString('vi-VN')} ₫</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Tổng USD</p>
                                            <p className="font-medium text-gray-900">
                                                ${(item.unit_price_usd * item.quantity).toFixed(2)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Tổng VND</p>
                                            <p className="font-medium text-gray-900">
                                                {(item.unit_price_vnd * item.quantity).toLocaleString('vi-VN')} ₫
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column - Financial Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-4 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900">Tóm tắt tài chính</h2>

                        <div className="space-y-3 border-b border-gray-200 pb-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Tổng sản phẩm:</span>
                                <span className="font-medium">${order.item_total_usd?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">VND:</span>
                                <span className="font-medium">{order.item_total_vnd?.toLocaleString('vi-VN')} ₫</span>
                            </div>
                        </div>

                        {order.discount_usd ? (
                            <div className="space-y-3 border-b border-gray-200 pb-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Giảm giá:</span>
                                    <span className="font-medium text-red-600">-${order.discount_usd.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">VND:</span>
                                    <span className="font-medium text-red-600">-{order.discount_vnd?.toLocaleString('vi-VN')} ₫</span>
                                </div>
                            </div>
                        ) : null}

                        <div className="space-y-3 border-b border-gray-200 pb-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Thuế:</span>
                                <span className="font-medium">+${order.tax_usd?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">VND:</span>
                                <span className="font-medium">+{order.tax_vnd?.toLocaleString('vi-VN')} ₫</span>
                            </div>
                        </div>

                        <div className="space-y-3 border-b border-gray-200 pb-3 bg-blue-50 p-3 rounded">
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-900">Tổng đơn hàng:</span>
                                <span className="font-semibold text-blue-600">${order.order_total_usd?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">VND:</span>
                                <span className="font-medium text-blue-600">{order.order_total_vnd?.toLocaleString('vi-VN')} ₫</span>
                            </div>
                        </div>

                        {order.fees_usd ? (
                            <div className="space-y-3 border-b border-gray-200 pb-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Phí:</span>
                                    <span className="font-medium text-red-600">-${order.fees_usd.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">VND:</span>
                                    <span className="font-medium text-red-600">-{order.fees_vnd?.toLocaleString('vi-VN')} ₫</span>
                                </div>
                            </div>
                        ) : null}

                        <div className="space-y-3 bg-green-50 p-3 rounded">
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-900">Thu nhập:</span>
                                <span className="font-semibold text-green-600">${order.order_earnings_usd?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">VND:</span>
                                <span className="font-medium text-green-600">{order.order_earnings_vnd?.toLocaleString('vi-VN')} ₫</span>
                            </div>
                        </div>

                        <div className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
                            <p className="font-medium mb-1">Tỷ giá:</p>
                            <p>1 USD = {order.exchange_rate?.toLocaleString('vi-VN')} ₫</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Xác nhận xóa</h3>
                        <p className="text-gray-600 mb-6">
                            Bạn có chắc chắn muốn xóa đơn hàng <strong>{order.order_id}</strong>? Hành động này không thể hoàn tác.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isLoading}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Đang xóa...' : 'Xóa'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};