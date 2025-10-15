// src/features/orders/pages/OrderDetail.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Order } from '../../../types/order';
import { useOrderStore } from '../store/useOrderStore';
import { useStatusStore } from '../../statuses/store/useStatusStore';
import { getStatusColorClasses } from '../../../types/status';
import { CARRIER_UNITS } from '../constants/orderDefaults';
import { FormField, TextAreaField, StatusSelect } from '../components';
import { TabNavigation, type Tab } from '../components/TabNavigation';

export const OrderDetail: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const { getOrderById, getOrderItems, deleteOrder, updateOrder, isLoading } = useOrderStore();
    const {
        generalStatuses,
        customerStatuses,
        factoryStatuses,
        deliveryStatuses,
        getGeneralStatusById,
        getCustomerStatusById,
        getFactoryStatusById,
        getDeliveryStatusById,
        fetchAllStatuses
    } = useStatusStore();

    const [activeTab, setActiveTab] = useState<string>('overview');
    const [order, setOrder] = useState<Order | null>(null);
    const [items, setItems] = useState<any[]>([]);
    const [newGeneralStatusId, setNewGeneralStatusId] = useState(1);
    const [newCustomerStatusId, setNewCustomerStatusId] = useState(1);
    const [newFactoryStatusId, setNewFactoryStatusId] = useState(1);
    const [newDeliveryStatusId, setNewDeliveryStatusId] = useState(1);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Shipping info states
    const [isEditingShipping, setIsEditingShipping] = useState(false);
    const [shippingForm, setShippingForm] = useState({
        carrierUnit: '',
        internalTrackingNumber: '',
        trackingNumber: '',
        actualShipDate: '',
        shippingFeeUsd: 0,
        carrierNotes: '',
    });

    // Define tabs
    const tabs: Tab[] = [
        {
            id: 'overview',
            label: 'Tổng quan',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
        },
        {
            id: 'customer',
            label: 'Khách hàng',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
        },
        {
            id: 'shipping',
            label: 'Vận chuyển',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
            ),
        },
        {
            id: 'products',
            label: 'Sản phẩm',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            ),
        },
    ];

    useEffect(() => {
        fetchAllStatuses();
    }, [fetchAllStatuses]);

    useEffect(() => {
        if (orderId) {
            const orderData = getOrderById(orderId);
            if (orderData) {
                setOrder(orderData);
                setNewGeneralStatusId(orderData.general_status_id || 1);
                setNewCustomerStatusId(orderData.customer_status_id || 1);
                setNewFactoryStatusId(orderData.factory_status_id || 1);
                setNewDeliveryStatusId(orderData.delivery_status_id || 1);

                // Load shipping info
                setShippingForm({
                    carrierUnit: orderData.carrier_unit || '',
                    internalTrackingNumber: orderData.internal_tracking_number || '',
                    trackingNumber: orderData.tracking_number || '',
                    actualShipDate: orderData.actual_ship_date || '',
                    shippingFeeUsd: orderData.shipping_fee_usd || 0,
                    carrierNotes: orderData.carrier_notes || '',
                });

                // Load order items
                getOrderItems(orderData.id).then(orderItems => {
                    setItems(orderItems);
                });
            }
        }
    }, [orderId, getOrderById, getOrderItems]);

    const handleShippingFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setShippingForm(prev => ({ ...prev, [name]: value }));

        // Auto-set actual ship date when internal tracking number is filled
        if (name === 'internalTrackingNumber' && value.trim() && !shippingForm.actualShipDate) {
            setShippingForm(prev => ({
                ...prev,
                actualShipDate: new Date().toISOString().split('T')[0]
            }));
        }
    };

    const handleShippingUpdate = async () => {
        if (!order) return;

        try {
            await updateOrder(orderId || '', {}, {
                carrier_unit: shippingForm.carrierUnit || null,
                internal_tracking_number: shippingForm.internalTrackingNumber || null,
                tracking_number: shippingForm.trackingNumber || null,
                actual_ship_date: shippingForm.actualShipDate || null,
                shipping_fee_usd: shippingForm.shippingFeeUsd,
                shipping_exchange_rate: order.exchange_rate,
                shipping_fee_vnd: shippingForm.shippingFeeUsd * order.exchange_rate,
                carrier_notes: shippingForm.carrierNotes || null,
            });

            setOrder(prev => prev ? {
                ...prev,
                carrier_unit: shippingForm.carrierUnit || null,
                internal_tracking_number: shippingForm.internalTrackingNumber || null,
                tracking_number: shippingForm.trackingNumber || null,
                actual_ship_date: shippingForm.actualShipDate || null,
                shipping_fee_usd: shippingForm.shippingFeeUsd,
                shipping_fee_vnd: shippingForm.shippingFeeUsd * order.exchange_rate,
                carrier_notes: shippingForm.carrierNotes || null,
            } : null);

            setIsEditingShipping(false);
        } catch (error) {
            console.error('Failed to update shipping info:', error);
            alert('Có lỗi xảy ra khi cập nhật thông tin giao hàng!');
        }
    };

    const cancelShippingEdit = () => {
        if (order) {
            setShippingForm({
                carrierUnit: order.carrier_unit || '',
                internalTrackingNumber: order.internal_tracking_number || '',
                trackingNumber: order.tracking_number || '',
                actualShipDate: order.actual_ship_date || '',
                shippingFeeUsd: order.shipping_fee_usd || 0,
                carrierNotes: order.carrier_notes || '',
            });
        }
        setIsEditingShipping(false);
    };

    const handleStatusChange = async () => {
        if (order && (
            newGeneralStatusId !== order.general_status_id ||
            newCustomerStatusId !== order.customer_status_id ||
            newFactoryStatusId !== order.factory_status_id ||
            newDeliveryStatusId !== order.delivery_status_id
        )) {
            try {
                await updateOrder(orderId || '', {}, {
                    general_status_id: newGeneralStatusId,
                    customer_status_id: newCustomerStatusId,
                    factory_status_id: newFactoryStatusId,
                    delivery_status_id: newDeliveryStatusId,
                });
                setOrder(prev => prev ? {
                    ...prev,
                    general_status_id: newGeneralStatusId,
                    customer_status_id: newCustomerStatusId,
                    factory_status_id: newFactoryStatusId,
                    delivery_status_id: newDeliveryStatusId,
                } : null);
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

    const getStatusBadge = (statusId: number | null, type: 'general' | 'customer' | 'factory' | 'delivery') => {
        let status;
        switch (type) {
            case 'general':
                status = getGeneralStatusById(statusId);
                break;
            case 'customer':
                status = getCustomerStatusById(statusId);
                break;
            case 'factory':
                status = getFactoryStatusById(statusId);
                break;
            case 'delivery':
                status = getDeliveryStatusById(statusId);
                break;
        }

        if (!status) return null;

        const colors = getStatusColorClasses(status.color);
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text}`}>
                {status.name_vi}
            </span>
        );
    };

    if (!order) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center">
                        <p className="text-gray-600">Không tìm thấy đơn hàng</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-6">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <button
                                    onClick={() => navigate('/orders')}
                                    className="text-blue-600 hover:text-blue-700 mb-3 flex items-center gap-1 text-sm font-medium"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Quay lại
                                </button>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    Đơn hàng {order.order_id}
                                </h1>
                                <p className="text-gray-600 mt-1 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Ngày đặt: {new Date(order.order_date).toLocaleDateString('vi-VN')}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => navigate(`/orders/${orderId}/edit`)}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Chỉnh sửa
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="mb-6">
                    <TabNavigation
                        tabs={tabs}
                        activeTab={activeTab}
                        onChange={setActiveTab}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Tab Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <>
                                {/* Order Status Section */}
                                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-shadow duration-300">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900">Trạng thái đơn hàng</h2>
                                    </div>

                                    {/* Current Statuses */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                        <div>
                                            <p className="text-xs text-gray-600 mb-2 font-medium">Tổng quan</p>
                                            {getStatusBadge(order.general_status_id, 'general')}
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 mb-2 font-medium">Khách hàng</p>
                                            {getStatusBadge(order.customer_status_id, 'customer')}
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 mb-2 font-medium">Nhà máy</p>
                                            {getStatusBadge(order.factory_status_id, 'factory')}
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 mb-2 font-medium">Giao hàng</p>
                                            {getStatusBadge(order.delivery_status_id, 'delivery')}
                                        </div>
                                    </div>

                                    {/* Update Statuses */}
                                    <div className="border-t border-gray-200 pt-6">
                                        <p className="text-sm font-semibold text-gray-900 mb-4">Cập nhật trạng thái</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <StatusSelect
                                                label="Tổng quan"
                                                value={newGeneralStatusId}
                                                onChange={setNewGeneralStatusId}
                                                options={generalStatuses}
                                            />

                                            <StatusSelect
                                                label="Khách hàng"
                                                value={newCustomerStatusId}
                                                onChange={setNewCustomerStatusId}
                                                options={customerStatuses}
                                            />

                                            <StatusSelect
                                                label="Nhà máy"
                                                value={newFactoryStatusId}
                                                onChange={setNewFactoryStatusId}
                                                options={factoryStatuses}
                                            />

                                            <StatusSelect
                                                label="Giao hàng"
                                                value={newDeliveryStatusId}
                                                onChange={setNewDeliveryStatusId}
                                                options={deliveryStatuses}
                                            />
                                        </div>
                                        <button
                                            onClick={handleStatusChange}
                                            disabled={isLoading}
                                            className="w-full px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                                        >
                                            {isLoading ? 'Đang cập nhật...' : 'Cập nhật trạng thái'}
                                        </button>
                                    </div>
                                </div>

                                {/* Order Info Section */}
                                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-shadow duration-300">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900">Thông tin đơn hàng</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1 font-medium">Mã đơn hàng</p>
                                            <p className="text-lg font-semibold text-gray-900">{order.order_id}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1 font-medium">Cửa hàng</p>
                                            <p className="text-lg font-semibold text-gray-900">{order.shop_code}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1 font-medium">Ngày đặt hàng</p>
                                            <p className="text-lg font-semibold text-gray-900">{order.order_date}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1 font-medium">Ngày giao dự kiến</p>
                                            <p className="text-lg font-semibold text-gray-900">
                                                {order.scheduled_ship_date || 'Chưa xác định'}
                                            </p>
                                        </div>
                                        {order.artist_code && (
                                            <div className="md:col-span-2">
                                                <p className="text-sm text-gray-600 mb-1 font-medium">Mã nghệ sĩ</p>
                                                <p className="text-lg font-semibold text-gray-900">{order.artist_code}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Customer Tab */}
                        {activeTab === 'customer' && (
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-shadow duration-300">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Thông tin khách hàng</h2>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2 font-medium">Tên khách hàng</p>
                                        <p className="text-lg font-semibold text-gray-900">{order.customer_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2 font-medium">Địa chỉ</p>
                                        <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{order.customer_address}</p>
                                    </div>
                                    {order.customer_phone && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-2 font-medium">Số điện thoại</p>
                                            <p className="text-gray-900">
                                                <a
                                                    href={`tel:${order.customer_phone}`}
                                                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                    </svg>
                                                    {order.customer_phone}
                                                </a>
                                            </p>
                                        </div>
                                    )}
                                    {order.customer_notes && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-2 font-medium">Ghi chú</p>
                                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{order.customer_notes}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Shipping Tab */}
                        {activeTab === 'shipping' && (
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-shadow duration-300">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                                            </svg>
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900">Thông tin vận chuyển</h2>
                                    </div>
                                    {!isEditingShipping && (
                                        <button
                                            onClick={() => setIsEditingShipping(true)}
                                            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 font-medium"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Chỉnh sửa
                                        </button>
                                    )}
                                </div>

                                {isEditingShipping ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Đơn vị vận chuyển
                                                </label>
                                                <select
                                                    name="carrierUnit"
                                                    value={shippingForm.carrierUnit}
                                                    onChange={handleShippingFormChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="">-- Chọn đơn vị vận chuyển --</option>
                                                    {CARRIER_UNITS.map(carrier => (
                                                        <option key={carrier.value} value={carrier.value}>
                                                            {carrier.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <FormField
                                                label="Mã vận đơn nội bộ"
                                                name="internalTrackingNumber"
                                                value={shippingForm.internalTrackingNumber}
                                                onChange={handleShippingFormChange}
                                                placeholder="INT-2024-001"
                                            />

                                            <FormField
                                                label="Mã vận đơn"
                                                name="trackingNumber"
                                                value={shippingForm.trackingNumber}
                                                onChange={handleShippingFormChange}
                                                placeholder="VTP123456789"
                                            />

                                            <FormField
                                                label="Ngày giao thực tế"
                                                name="actualShipDate"
                                                type="date"
                                                value={shippingForm.actualShipDate}
                                                onChange={handleShippingFormChange}
                                            />

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Phí ship (USD)
                                                </label>
                                                <input
                                                    type="number"
                                                    name="shippingFeeUsd"
                                                    value={shippingForm.shippingFeeUsd}
                                                    onChange={(e) => setShippingForm(prev => ({
                                                        ...prev,
                                                        shippingFeeUsd: parseFloat(e.target.value) || 0
                                                    }))}
                                                    step="0.01"
                                                    min="0"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>

                                        <TextAreaField
                                            label="Ghi chú vận chuyển"
                                            name="carrierNotes"
                                            value={shippingForm.carrierNotes}
                                            onChange={handleShippingFormChange}
                                            placeholder="Ghi chú về vận chuyển, đóng gói..."
                                            rows={3}
                                        />

                                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                            <button
                                                onClick={cancelShippingEdit}
                                                className="px-5 py-2.5 text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                                            >
                                                Hủy
                                            </button>
                                            <button
                                                onClick={handleShippingUpdate}
                                                disabled={isLoading}
                                                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                                            >
                                                {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                                                <p className="text-sm text-gray-600 mb-1 font-medium">Đơn vị vận chuyển</p>
                                                <p className="text-lg font-semibold text-gray-900">
                                                    {order.carrier_unit
                                                        ? CARRIER_UNITS.find(c => c.value === order.carrier_unit)?.label || order.carrier_unit
                                                        : 'Chưa cập nhật'}
                                                </p>
                                            </div>
                                            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                                                <p className="text-sm text-gray-600 mb-1 font-medium">Mã vận đơn nội bộ</p>
                                                <p className="text-lg font-semibold text-gray-900">{order.internal_tracking_number || 'Chưa có'}</p>
                                            </div>
                                            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                                                <p className="text-sm text-gray-600 mb-1 font-medium">Mã vận đơn</p>
                                                <p className="text-lg font-semibold text-gray-900">{order.tracking_number || 'Chưa có'}</p>
                                            </div>
                                            <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                                                <p className="text-sm text-gray-600 mb-1 font-medium">Ngày giao thực tế</p>
                                                <p className="text-lg font-semibold text-gray-900">
                                                    {order.actual_ship_date
                                                        ? new Date(order.actual_ship_date).toLocaleDateString('vi-VN')
                                                        : 'Chưa giao'}
                                                </p>
                                            </div>
                                            <div className="md:col-span-2 p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-200">
                                                <p className="text-sm text-gray-600 mb-1 font-medium">Phí ship</p>
                                                <p className="text-xl font-bold text-gray-900">
                                                    ${order.shipping_fee_usd?.toFixed(2) || '0.00'}
                                                    <span className="text-sm font-normal text-gray-600 ml-2">
                                                        ({order.shipping_fee_vnd?.toLocaleString('vi-VN') || '0'} ₫)
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                        {order.carrier_notes && (
                                            <div>
                                                <p className="text-sm text-gray-600 mb-2 font-medium">Ghi chú vận chuyển</p>
                                                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                                                    <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{order.carrier_notes}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Products Tab */}
                        {activeTab === 'products' && (
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-shadow duration-300">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Sản phẩm ({items.length})</h2>
                                </div>
                                <div className="space-y-4">
                                    {items.map((item, index) => (
                                        <div key={index} className="p-5 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all duration-200">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <p className="text-lg font-semibold text-gray-900">
                                                        {item.sku}
                                                        {item.size && <span className="text-blue-600"> • Size: {item.size}</span>}
                                                        {item.type && <span className="text-purple-600"> • {item.type}</span>}
                                                    </p>
                                                    <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                        </svg>
                                                        Số lượng: <strong>{item.quantity}</strong>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="p-3 bg-blue-50 rounded-lg">
                                                    <p className="text-xs text-gray-600 mb-1 font-medium">Giá USD</p>
                                                    <p className="text-base font-bold text-gray-900">${item.unit_price_usd.toFixed(2)}</p>
                                                </div>
                                                <div className="p-3 bg-purple-50 rounded-lg">
                                                    <p className="text-xs text-gray-600 mb-1 font-medium">Giá VND</p>
                                                    <p className="text-base font-bold text-gray-900">{item.unit_price_vnd.toLocaleString('vi-VN')} ₫</p>
                                                </div>
                                                <div className="p-3 bg-green-50 rounded-lg">
                                                    <p className="text-xs text-gray-600 mb-1 font-medium">Tổng USD</p>
                                                    <p className="text-base font-bold text-green-600">
                                                        ${(item.unit_price_usd * item.quantity).toFixed(2)}
                                                    </p>
                                                </div>
                                                <div className="p-3 bg-emerald-50 rounded-lg">
                                                    <p className="text-xs text-gray-600 mb-1 font-medium">Tổng VND</p>
                                                    <p className="text-base font-bold text-green-600">
                                                        {(item.unit_price_vnd * item.quantity).toLocaleString('vi-VN')} ₫
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Financial Summary (Always Visible) */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sticky top-4 space-y-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h2 className="text-lg font-bold text-gray-900">Tóm tắt tài chính</h2>
                            </div>

                            <div className="space-y-3 border-b border-gray-200 pb-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Tổng sản phẩm:</span>
                                    <span className="font-semibold text-gray-900">${order.item_total_usd?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">VND:</span>
                                    <span className="font-medium text-gray-900">{order.item_total_vnd?.toLocaleString('vi-VN')} ₫</span>
                                </div>
                            </div>

                            {order.discount_usd ? (
                                <div className="space-y-3 border-b border-gray-200 pb-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Giảm giá:</span>
                                        <span className="font-semibold text-red-600">-${order.discount_usd.toFixed(2)}</span>
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
                                    <span className="font-semibold text-gray-900">+${order.tax_usd?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">VND:</span>
                                    <span className="font-medium text-gray-900">+{order.tax_vnd?.toLocaleString('vi-VN')} ₫</span>
                                </div>
                            </div>

                            <div className="space-y-3 border-b border-gray-200 pb-3 bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-900">Tổng đơn hàng:</span>
                                    <span className="font-bold text-blue-600 text-lg">${order.order_total_usd?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">VND:</span>
                                    <span className="font-semibold text-blue-600">{order.order_total_vnd?.toLocaleString('vi-VN')} ₫</span>
                                </div>
                            </div>

                            {order.fees_usd ? (
                                <div className="space-y-3 border-b border-gray-200 pb-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Phí:</span>
                                        <span className="font-semibold text-red-600">-${order.fees_usd.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">VND:</span>
                                        <span className="font-medium text-red-600">-{order.fees_vnd?.toLocaleString('vi-VN')} ₫</span>
                                    </div>
                                </div>
                            ) : null}

                            <div className="space-y-3 bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-900">Thu nhập:</span>
                                    <span className="font-bold text-green-600 text-lg">${order.order_earnings_usd?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">VND:</span>
                                    <span className="font-semibold text-green-600">{order.order_earnings_vnd?.toLocaleString('vi-VN')} ₫</span>
                                </div>
                            </div>

                            <div className="p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                    </svg>
                                    <p className="text-xs font-semibold text-gray-700">Tỷ giá hối đoái</p>
                                </div>
                                <p className="text-sm font-bold text-gray-900">1 USD = {order.exchange_rate?.toLocaleString('vi-VN')} ₫</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-red-100 rounded-full">
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Xác nhận xóa</h3>
                            </div>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                Bạn có chắc chắn muốn xóa đơn hàng <strong className="text-gray-900">{order.order_id}</strong>? Hành động này không thể hoàn tác.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="px-5 py-2.5 text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isLoading}
                                    className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                                >
                                    {isLoading ? 'Đang xóa...' : 'Xóa đơn hàng'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};