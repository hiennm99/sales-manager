// src/features/orders/pages/OrderDetail.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Order } from '../../../types/order';
import { useOrderStore } from '../store/useOrderStore';
import { useStatusStore } from '../../statuses/store/useStatusStore';
import {
    OrderHeader,
    OrderInfoSection,
    OrderStatusSection,
    CustomerInfoSection,
    ShippingInfoSection,
    ProductsListSection,
    FinancialSummaryCard,
    DeleteConfirmModal,
    TabNavigation,
    type Tab
} from '../components';

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

    const handleStatusChange = (type: 'general' | 'customer' | 'factory' | 'delivery', value: number) => {
        switch (type) {
            case 'general':
                setNewGeneralStatusId(value);
                break;
            case 'customer':
                setNewCustomerStatusId(value);
                break;
            case 'factory':
                setNewFactoryStatusId(value);
                break;
            case 'delivery':
                setNewDeliveryStatusId(value);
                break;
        }
    };

    const handleStatusUpdate = async () => {
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

    const headerActions = (
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
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <OrderHeader
                    title={`Đơn hàng ${order.order_id}`}
                    subtitle={`Ngày đặt: ${new Date(order.order_date).toLocaleDateString('vi-VN')}`}
                    showBackButton
                    onBack={() => navigate('/orders')}
                    actions={headerActions}
                />

                <div className="mb-6">
                    <TabNavigation
                        tabs={tabs}
                        activeTab={activeTab}
                        onChange={setActiveTab}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {activeTab === 'overview' && (
                            <>
                                <OrderStatusSection
                                    mode="view"
                                    currentStatuses={{
                                        general: getGeneralStatusById(order.general_status_id),
                                        customer: getCustomerStatusById(order.customer_status_id),
                                        factory: getFactoryStatusById(order.factory_status_id),
                                        delivery: getDeliveryStatusById(order.delivery_status_id)
                                    }}
                                    statusValues={{
                                        general: newGeneralStatusId,
                                        customer: newCustomerStatusId,
                                        factory: newFactoryStatusId,
                                        delivery: newDeliveryStatusId
                                    }}
                                    statusOptions={{
                                        general: generalStatuses,
                                        customer: customerStatuses,
                                        factory: factoryStatuses,
                                        delivery: deliveryStatuses
                                    }}
                                    onStatusChange={handleStatusChange}
                                    onUpdate={handleStatusUpdate}
                                    isLoading={isLoading}
                                />

                                <OrderInfoSection
                                    mode="view"
                                    formData={{
                                        ...order,
                                        scheduled_ship_date: order.scheduled_ship_date || undefined,
                                        customer_phone: order.customer_phone || undefined,
                                        customer_notes: order.customer_notes || undefined,
                                        artist_code: order.artist_code || undefined,
                                    }}
                                />
                            </>
                        )}

                        {activeTab === 'customer' && (
                            <CustomerInfoSection
                                mode="view"
                                formData={{
                                    ...order,
                                    scheduled_ship_date: order.scheduled_ship_date || undefined,
                                    customer_phone: order.customer_phone || undefined,
                                    customer_notes: order.customer_notes || undefined,
                                    artist_code: order.artist_code || undefined,
                                }}
                            />
                        )}

                        {activeTab === 'shipping' && (
                            <ShippingInfoSection
                                isEditing={isEditingShipping}
                                formData={shippingForm}
                                exchangeRate={order.exchange_rate}
                                onChange={handleShippingFormChange}
                                onFeeChange={(value) => setShippingForm(prev => ({ ...prev, shippingFeeUsd: value }))}
                                onEdit={() => setIsEditingShipping(true)}
                                onSave={handleShippingUpdate}
                                onCancel={cancelShippingEdit}
                                isLoading={isLoading}
                            />
                        )}

                        {activeTab === 'products' && (
                            <ProductsListSection
                                mode="view"
                                items={items}
                            />
                        )}
                    </div>

                    <div className="lg:col-span-1">
                        <FinancialSummaryCard
                            itemTotal={order.item_total_usd || 0}
                            itemTotalVND={order.item_total_vnd || 0}
                            discountRate={order.discount_rate || 0}
                            buyerPaidUSD={order.buyer_paid_usd || 0}
                            buyerPaidVND={order.buyer_paid_vnd}
                            orderEarnings={order.order_earnings_usd || 0}
                            orderEarningsVND={order.order_earnings_vnd || 0}
                            exchangeRate={order.exchange_rate}
                        />
                    </div>
                </div>

                <DeleteConfirmModal
                    isOpen={showDeleteConfirm}
                    orderCode={order.order_id}
                    isLoading={isLoading}
                    onConfirm={handleDelete}
                    onCancel={() => setShowDeleteConfirm(false)}
                />
            </div>
        </div>
    );
};