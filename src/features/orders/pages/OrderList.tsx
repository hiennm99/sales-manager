// src/features/orders/pages/OrderList.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrderStore } from '../store/useOrderStore';
import { useShopStore } from '../../shops/store/useShopStore';
import { useStatusStore } from '../../statuses/store/useStatusStore';
import { getStatusColorClasses } from '../../../types/status';
import {formatUSD, formatVND} from "../../../lib/utils.ts";

export const OrderList: React.FC = () => {
    const navigate = useNavigate();
    const { orders, deleteOrder, fetchOrders } = useOrderStore();
    const { selectedShop } = useShopStore();
    const { 
        generalStatuses, 
        customerStatuses, 
        factoryStatuses, 
        deliveryStatuses,
        getGeneralStatusById,
        fetchAllStatuses 
    } = useStatusStore();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterGeneralStatus, setFilterGeneralStatus] = useState<number | 'all'>('all');
    const [filterCustomerStatus, setFilterCustomerStatus] = useState<number | 'all'>('all');
    const [filterFactoryStatus, setFilterFactoryStatus] = useState<number | 'all'>('all');
    const [filterDeliveryStatus, setFilterDeliveryStatus] = useState<number | 'all'>('all');
    const [sortBy, setSortBy] = useState('date-desc');
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

    useEffect(() => {
        fetchAllStatuses();
    }, [fetchAllStatuses]);

    useEffect(() => {
        if (selectedShop) {
            fetchOrders();
        }
    }, [selectedShop, fetchOrders]);

    // Filter and sort orders
    const filteredOrders = useMemo(() => {
        let filtered = orders;

        // Filter by shop
        if (selectedShop) {
            filtered = filtered.filter(order => order.shop_code === selectedShop.code);
        }

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(order =>
                order.order_id.toLowerCase().includes(term) ||
                order.customer_name.toLowerCase().includes(term) ||
                (order.customer_phone && order.customer_phone.toLowerCase().includes(term))
            );
        }

        // Filter by general status
        if (filterGeneralStatus !== 'all') {
            filtered = filtered.filter(order => order.general_status_id === filterGeneralStatus);
        }

        // Filter by customer status
        if (filterCustomerStatus !== 'all') {
            filtered = filtered.filter(order => order.customer_status_id === filterCustomerStatus);
        }

        // Filter by factory status
        if (filterFactoryStatus !== 'all') {
            filtered = filtered.filter(order => order.factory_status_id === filterFactoryStatus);
        }

        // Filter by delivery status
        if (filterDeliveryStatus !== 'all') {
            filtered = filtered.filter(order => order.delivery_status_id === filterDeliveryStatus);
        }

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'date-desc':
                    return new Date(b.order_date).getTime() - new Date(a.order_date).getTime();
                case 'date-asc':
                    return new Date(a.order_date).getTime() - new Date(b.order_date).getTime();
                case 'total-desc':
                    return (b.order_earnings_usd || 0) - (a.order_earnings_usd || 0);
                case 'total-asc':
                    return (a.order_earnings_usd || 0) - (b.order_earnings_usd || 0);
                case 'earnings-desc':
                    return (b.order_earnings_usd || 0) - (a.order_earnings_usd || 0);
                default:
                    return 0;
            }
        });

        return filtered;
    }, [orders, searchTerm, filterGeneralStatus, filterCustomerStatus, filterFactoryStatus, filterDeliveryStatus, sortBy, selectedShop]);

    // Calculate totals
    const totals = useMemo(() => {
        return {
            orders: filteredOrders.length,
            earnings_usd: filteredOrders.reduce((sum, o) => sum + (o.order_earnings_usd || 0), 0),
            earnings_vnd: filteredOrders.reduce((sum, o) => sum + (o.order_earnings_vnd || 0), 0),
        };
    }, [filteredOrders]);

    const handleSelectOrder = (orderId: string) => {
        setSelectedOrders(prev =>
            prev.includes(orderId)
                ? prev.filter(id => id !== orderId)
                : [...prev, orderId]
        );
    };

    const handleSelectAll = () => {
        if (selectedOrders.length === filteredOrders.length) {
            setSelectedOrders([]);
        } else {
            setSelectedOrders(filteredOrders.map(o => o.id.toString()));
        }
    };

    const handleDeleteOrder = async (orderId: string) => {
        setDeleteTarget(orderId);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (deleteTarget) {
            try {
                await deleteOrder(deleteTarget);
                setSelectedOrders(prev => prev.filter(id => id !== deleteTarget));
                setShowDeleteConfirm(false);
                setDeleteTarget(null);
            } catch (error) {
                console.error('Failed to delete order:', error);
                alert('Có lỗi xảy ra khi xóa đơn hàng!');
            }
        }
    };

    const getStatusBadge = (statusId: number | null | undefined) => {
        const status = getGeneralStatusById(statusId || null);
        if (!status) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Không xác định
                </span>
            );
        }

        const colors = getStatusColorClasses(status.color);
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                {status.name_vi}
            </span>
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Danh sách đơn hàng</h1>
                    <p className="text-gray-600 mt-1">
                        {selectedShop ? `Cửa hàng: ${selectedShop.name}` : 'Vui lòng chọn cửa hàng'}
                    </p>
                </div>
                <button
                    onClick={() => navigate('/orders/create')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Tạo đơn hàng
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Tổng đơn hàng</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{totals.orders}</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div className="bg-green-100 p-3 rounded-lg">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Tổng tiền kiếm được (USD)</p>
                            <p className="text-3xl font-bold text-green-600 mt-2">{formatUSD(totals.earnings_usd)}</p>
                        </div>
                        <div className="bg-yellow-100 p-3 rounded-lg">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Tổng tiền kiếm được (VND)</p>
                            <p className="text-2xl font-bold text-green-600 mt-2">{formatVND(totals.earnings_vnd)}</p>
                        </div>
                        <div className="bg-indigo-100 p-3 rounded-lg">
                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="lg:col-span-3">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo mã đơn, tên khách, SĐT..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* General Status Filter */}
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Trạng thái tổng quan</label>
                        <select
                            value={filterGeneralStatus}
                            onChange={(e) => setFilterGeneralStatus(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">Tất cả</option>
                            {generalStatuses.map(status => (
                                <option key={status.id} value={status.id}>{status.name_vi}</option>
                            ))}
                        </select>
                    </div>

                    {/* Customer Status Filter */}
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Trạng thái khách hàng</label>
                        <select
                            value={filterCustomerStatus}
                            onChange={(e) => setFilterCustomerStatus(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">Tất cả</option>
                            {customerStatuses.map(status => (
                                <option key={status.id} value={status.id}>{status.name_vi}</option>
                            ))}
                        </select>
                    </div>

                    {/* Factory Status Filter */}
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Trạng thái nhà máy</label>
                        <select
                            value={filterFactoryStatus}
                            onChange={(e) => setFilterFactoryStatus(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">Tất cả</option>
                            {factoryStatuses.map(status => (
                                <option key={status.id} value={status.id}>{status.name_vi}</option>
                            ))}
                        </select>
                    </div>

                    {/* Delivery Status Filter */}
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Trạng thái giao hàng</label>
                        <select
                            value={filterDeliveryStatus}
                            onChange={(e) => setFilterDeliveryStatus(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">Tất cả</option>
                            {deliveryStatuses.map(status => (
                                <option key={status.id} value={status.id}>{status.name_vi}</option>
                            ))}
                        </select>
                    </div>

                    {/* Sort */}
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Sắp xếp</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="date-desc">Mới nhất</option>
                            <option value="date-asc">Cũ nhất</option>
                            <option value="total-desc">Doanh thu cao</option>
                            <option value="total-asc">Doanh thu thấp</option>
                            <option value="earnings-desc">Thu nhập cao</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {filteredOrders.length === 0 ? (
                    <div className="p-8 text-center">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-gray-600">Không có đơn hàng nào</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                                        onChange={handleSelectAll}
                                        className="rounded border-gray-300 text-blue-600"
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Ngày đặt</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Ngày gửi hàng (dự kiến)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Mã đơn</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Khách hàng</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Trạng thái</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">Tiền kiếm được (USD)</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">Tiền kiếm được (VNĐ)</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">Hành động</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedOrders.includes(order.id.toString())}
                                            onChange={() => handleSelectOrder(order.id.toString())}
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
                                                onClick={() => handleDeleteOrder(order.id.toString())}
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
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Xác nhận xóa</h3>
                        <p className="text-gray-600 mb-6">Bạn có chắc chắn muốn xóa đơn hàng này? Hành động này không thể hoàn tác.</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
