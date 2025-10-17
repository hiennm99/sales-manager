// src/features/orders/pages/OrderDetail.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Order, OrderFormData, OrderItemFormData } from '../../../types/order';
import { orderToFormData } from '../../../types/order';
import type { Product } from '../../../types/product';
import { useOrderStore } from '../store/useOrderStore';
import { useStatusStore } from '../../statuses/store/useStatusStore';
import { useProductStore } from '../../products/store/useProductStore';
import { useConfirmModal } from '../../../hooks';
import { ConfirmModal } from '../../../components/modals';
import {
    OrderHeader,
    OrderInfoSection,
    OrderStatusSection,
    CustomerInfoSection,
    ShippingInfoSection,
    OrderItemsSection,
    FinancialInputSection,
    FinancialSummaryCard,
    TabNavigation,
    type Tab
} from '../components';

export const OrderDetail: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const { getOrderById, getOrderItems, deleteOrder, updateOrder, updateOrderItems, isLoading } = useOrderStore();
    const { getProductBySku, fetchProducts } = useProductStore();
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
    
    // Confirm modal
    const confirmModal = useConfirmModal();

    const [activeTab, setActiveTab] = useState<string>('overview');
    const [order, setOrder] = useState<Order | null>(null);
    const [formData, setFormData] = useState<OrderFormData | null>(null);
    const [items, setItems] = useState<OrderItemFormData[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<(Product | null)[]>([]);
    const [editingProducts, setEditingProducts] = useState(false);

    // Inline editing states
    const [fieldValues, setFieldValues] = useState<Record<string, string | number | React.ReactNode | undefined>>({});

    // Status editing
    const [editingStatus, setEditingStatus] = useState(false);
    const [statusValues, setStatusValues] = useState({
        general: 1,
        customer: 1,
        factory: 1,
        delivery: 1
    });

    // Editable fields configuration
    const editableConfig = {
        status: true,
        orderInfo: {
            scheduled_ship_date: true,
            artist_code: true
        },
        customerInfo: {
            customer_name: true,
            customer_phone: true,
            customer_address: true,
            customer_notes: true,
        },
        shippingInfo: {
            carrierUnit: true,
            internalTrackingNumber: true,
            trackingNumber: true,
            actualShipDate: true,
            shippingFeeUsd: true,
            shippingExchangeRate: true,
            carrierNotes: true,
        },
        financialInfo: {
            itemTotalUsd: true,
            discountRate: true,
            buyerPaidUsd: true,
            orderEarningsUsd: true,
            exchangeRate: true,
            refundFeeUsd: true,
            refundFeeExchangeRate: true,
            otherFeeUsd: true,
            otherFeeExchangeRate: true,
            otherBonusUsd: true,
            otherBonusExchangeRate: true,
        }
    };

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
            id: 'financial',
            label: 'Tài chính',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
        fetchProducts(); // Fetch products để có data
    }, [fetchAllStatuses, fetchProducts]);

    useEffect(() => {
        if (orderId) {
            const orderData = getOrderById(orderId);
            if (orderData) {
                setOrder(orderData);
                setFormData(orderToFormData(orderData));
                
                setStatusValues({
                    general: orderData.general_status_id || 1,
                    customer: orderData.customer_status_id || 1,
                    factory: orderData.factory_status_id || 1,
                    delivery: orderData.delivery_status_id || 1
                });

                setFieldValues({
                    scheduled_ship_date: orderData.scheduled_ship_date || '',
                    customer_notes: orderData.customer_notes || '',
                    artist_code: orderData.artist_code || '',
                    customer_name: orderData.customer_name || '',
                    customer_phone: orderData.customer_phone || '',
                    customer_address: orderData.customer_address || '',
                });
                
                getOrderItems(orderData.id).then(orderItems => {
                    const formattedItems = orderItems.map(item => ({
                        sku: item.sku,
                        size: item.size,
                        type: item.type,
                        quantity: item.quantity,
                    }));
                    setItems(formattedItems);
                    // Load product info for each item
                    const products = orderItems.map(item => getProductBySku(item.sku) || null);
                    setSelectedProducts(products);
                });
            }
        }
    }, [orderId, getOrderById, getOrderItems, getProductBySku]);

    // Field change handler for inline editing
    const handleFieldChange = (fieldName: string, value: string | number | React.ReactNode | undefined) => {
        setFieldValues(prev => ({ ...prev, [fieldName]: value }));
    };

    // Field save handler for inline editing
    const handleFieldSaveAction = async (fieldName: string) => {
        if (!order) return;

        try {
            // Map camelCase field names to snake_case for database
            const fieldMapping: Record<string, string> = {
                carrierUnit: 'carrier_unit',
                internalTrackingNumber: 'internal_tracking_number',
                trackingNumber: 'tracking_number',
                actualShipDate: 'actual_ship_date',
                shippingFeeUsd: 'shipping_fee_usd',
                shippingExchangeRate: 'shipping_exchange_rate',
                carrierNotes: 'carrier_notes',
                refundFeeUsd: 'refund_fee_usd',
                refundFeeExchangeRate: 'refund_fee_exchange_rate',
                otherFeeUsd: 'other_fee_usd',
                otherFeeExchangeRate: 'other_fee_exchange_rate',
                otherBonusUsd: 'other_bonus_usd',
                otherBonusExchangeRate: 'other_bonus_exchange_rate',
            };

            const dbFieldName = fieldMapping[fieldName] || fieldName;
            
            // Get the actual value, ensuring not null for required fields
            let fieldValue = fieldValues[fieldName];
            
            // For exchange rate fields, never allow null/undefined - default to main exchange rate
            if (fieldName === 'shippingExchangeRate' || fieldName === 'refundFeeExchangeRate' || fieldName === 'otherFeeExchangeRate') {
                fieldValue = fieldValue || order.exchange_rate;
            }
            
            // For string fields, convert undefined/null to empty string or null appropriately
            if (fieldValue === undefined) {
                fieldValue = null;
            }
            
            const updateData: Record<string, string | number | React.ReactNode | undefined> = {};
            
            // Only add the field if it has a value or explicitly allow null
            if (fieldValue !== undefined) {
                updateData[dbFieldName] = fieldValue;
            }

            // If updating shipping fee, also update VND amount
            if (fieldName === 'shippingFeeUsd') {
                const exchangeRate = order.shipping_exchange_rate || order.exchange_rate;
                updateData.shipping_fee_vnd = (fieldValues[fieldName] as number || 0) * exchangeRate;
            }
            
            // If updating shipping exchange rate, recalculate VND
            if (fieldName === 'shippingExchangeRate') {
                updateData.shipping_fee_vnd = (order.shipping_fee_usd || 0) * (fieldValues[fieldName] as number || order.exchange_rate);
            }
            
            // If updating refund fee, also update VND amount
            if (fieldName === 'refundFeeUsd') {
                const exchangeRate = order.refund_fee_exchange_rate || order.exchange_rate;
                updateData.refund_fee_vnd = (fieldValues[fieldName] as number || 0) * exchangeRate;
            }
            
            // If updating refund exchange rate, recalculate VND
            if (fieldName === 'refundFeeExchangeRate') {
                updateData.refund_fee_vnd = (order.refund_fee_usd || 0) * (fieldValues[fieldName] as number || order.exchange_rate);
            }
            
            // If updating other fee, also update VND amount
            if (fieldName === 'otherFeeUsd') {
                const exchangeRate = order.other_fee_exchange_rate || order.exchange_rate;
                updateData.other_fee_vnd = (fieldValues[fieldName] as number || 0) * exchangeRate;
            }
            
            // If updating other exchange rate, recalculate VND
            if (fieldName === 'otherFeeExchangeRate') {
                updateData.other_fee_vnd = (order.other_fee_usd || 0) * (fieldValues[fieldName] as number || order.exchange_rate);
            }
            
            // If updating other bonus, also update VND amount
            if (fieldName === 'otherBonusUsd') {
                const exchangeRate = order.other_bonus_exchange_rate || order.exchange_rate;
                updateData.other_bonus_vnd = (fieldValues[fieldName] as number || 0) * exchangeRate;
            }
            
            // If updating other bonus exchange rate, recalculate VND
            if (fieldName === 'otherBonusExchangeRate') {
                updateData.other_bonus_vnd = (order.other_bonus_usd || 0) * (fieldValues[fieldName] as number || order.exchange_rate);
            }

            await updateOrder(orderId || '', {}, updateData);
            
            // Update local order state with snake_case field name
            const updatedFields: Record<string, any> = {
                [dbFieldName]: fieldValues[fieldName] || null,
            };
            
            // Update VND fields when updating fees
            if (fieldName === 'shippingFeeUsd') {
                const exchangeRate = order.shipping_exchange_rate || order.exchange_rate;
                updatedFields.shipping_fee_vnd = (fieldValues[fieldName] as number || 0) * exchangeRate;
            }
            
            if (fieldName === 'shippingExchangeRate') {
                updatedFields.shipping_fee_vnd = (order.shipping_fee_usd || 0) * (fieldValues[fieldName] as number || order.exchange_rate);
            }
            
            if (fieldName === 'refundFeeUsd') {
                const exchangeRate = order.refund_fee_exchange_rate || order.exchange_rate;
                updatedFields.refund_fee_vnd = (fieldValues[fieldName] as number || 0) * exchangeRate;
            }
            
            if (fieldName === 'refundFeeExchangeRate') {
                updatedFields.refund_fee_vnd = (order.refund_fee_usd || 0) * (fieldValues[fieldName] as number || order.exchange_rate);
            }
            
            if (fieldName === 'otherFeeUsd') {
                const exchangeRate = order.other_fee_exchange_rate || order.exchange_rate;
                updatedFields.other_fee_vnd = (fieldValues[fieldName] as number || 0) * exchangeRate;
            }
            
            if (fieldName === 'otherFeeExchangeRate') {
                updatedFields.other_fee_vnd = (order.other_fee_usd || 0) * (fieldValues[fieldName] as number || order.exchange_rate);
            }
            
            if (fieldName === 'otherBonusUsd') {
                const exchangeRate = order.other_bonus_exchange_rate || order.exchange_rate;
                updatedFields.other_bonus_vnd = (fieldValues[fieldName] as number || 0) * exchangeRate;
            }
            
            if (fieldName === 'otherBonusExchangeRate') {
                updatedFields.other_bonus_vnd = (order.other_bonus_usd || 0) * (fieldValues[fieldName] as number || order.exchange_rate);
            }
            
            setOrder(prev => prev ? {
                ...prev,
                ...updatedFields
            } : null);

            // Update formData with camelCase field name
            setFormData(prev => prev ? {
                ...prev,
                [fieldName]: fieldValues[fieldName] || null
            } : null);
            
            // Refresh order from database to ensure sync
            if (orderId) {
                const refreshedOrder = getOrderById(orderId);
                if (refreshedOrder) {
                    setOrder(refreshedOrder);
                    setFormData(orderToFormData(refreshedOrder));
                }
            }
        } catch (error) {
            console.error(`Failed to update ${fieldName}:`, error);
            alert('Có lỗi xảy ra khi cập nhật!');
        }
    };

    // Wrapper to save field directly with confirmation
    const handleFieldSave = async (fieldName: string) => {
        const fieldLabels: Record<string, string> = {
            customer_name: 'Tên khách hàng',
            customer_phone: 'Số điện thoại',
            customer_address: 'Địa chỉ',
            customer_notes: 'Ghi chú khách hàng',
            scheduled_ship_date: 'Ngày giao dự kiến',
            artist_code: 'Mã nghệ sĩ',
            carrierUnit: 'Đơn vị vận chuyển',
            internalTrackingNumber: 'Mã theo dõi nội bộ',
            trackingNumber: 'Mã vận đơn',
            actualShipDate: 'Ngày giao thực tế',
            shippingFeeUsd: 'Phí vận chuyển (USD)',
            shippingExchangeRate: 'Tỷ giá vận chuyển',
            carrierNotes: 'Ghi chú vận chuyển',
            refundFeeUsd: 'Phí hoàn trả (USD)',
            refundFeeExchangeRate: 'Tỷ giá hoàn trả',
            otherFeeUsd: 'Phí khác (USD)',
            otherFeeExchangeRate: 'Tỷ giá phí khác',
            otherBonusUsd: 'Tiền thưởng khác (USD)',
            otherBonusExchangeRate: 'Tỷ giá tiền thưởng',
            itemTotalUsd: 'Tổng giá trị sản phẩm (USD)',
            discountRate: 'Tỷ lệ chiết khấu',
            buyerPaidUsd: 'Người mua trả (USD)',
            orderEarningsUsd: 'Lợi nhuận đơn hàng (USD)',
            exchangeRate: 'Tỷ giá',
        };
        
        const label = fieldLabels[fieldName] || fieldName;
        const newValue = fieldValues[fieldName];
        
        confirmModal.showConfirm(
            {
                title: 'Xác nhận cập nhật',
                message: (
                    <div className="space-y-2">
                        <p>Bạn có chắc chắn muốn cập nhật <strong>{label}</strong>?</p>
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Giá trị mới:</p>
                            <p className="text-base font-semibold text-gray-900 mt-1">{newValue?.toString() || '(Trống)'}</p>
                        </div>
                    </div>
                ),
                confirmText: 'Cập nhật',
                cancelText: 'Hủy',
                variant: 'edit',
            },
            async () => {
                await handleFieldSaveAction(fieldName);
            }
        );
    };

    // Status handlers
    const handleStatusEdit = () => {
        setEditingStatus(true);
    };

    const handleStatusChange = (type: 'general' | 'customer' | 'factory' | 'delivery', value: number) => {
        setStatusValues(prev => ({ ...prev, [type]: value }));
    };

    const handleStatusUpdate = () => {
        if (!order) return;

        confirmModal.showConfirm(
            {
                title: 'Xác nhận cập nhật trạng thái',
                message: (
                    <div className="space-y-3">
                        <p>Bạn có chắc chắn muốn cập nhật các trạng thái sau?</p>
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Trạng thái chung:</span>
                                <span className="font-semibold text-gray-900">{getGeneralStatusById(statusValues.general)?.name_vi}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Trạng thái khách hàng:</span>
                                <span className="font-semibold text-gray-900">{getCustomerStatusById(statusValues.customer)?.name_vi}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Trạng thái xưởng:</span>
                                <span className="font-semibold text-gray-900">{getFactoryStatusById(statusValues.factory)?.name_vi}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Trạng thái giao hàng:</span>
                                <span className="font-semibold text-gray-900">{getDeliveryStatusById(statusValues.delivery)?.name_vi}</span>
                            </div>
                        </div>
                    </div>
                ),
                confirmText: 'Cập nhật',
                cancelText: 'Hủy',
                variant: 'edit',
            },
            async () => {
                try {
                    await updateOrder(orderId || '', {}, {
                        general_status_id: statusValues.general,
                        customer_status_id: statusValues.customer,
                        factory_status_id: statusValues.factory,
                        delivery_status_id: statusValues.delivery,
                    });
                    
                    setOrder(prev => prev ? {
                        ...prev,
                        general_status_id: statusValues.general,
                        customer_status_id: statusValues.customer,
                        factory_status_id: statusValues.factory,
                        delivery_status_id: statusValues.delivery,
                    } : null);
                    
                    setEditingStatus(false);
                } catch (error) {
                    console.error('Failed to update status:', error);
                    alert('Có lỗi xảy ra khi cập nhật trạng thái!');
                }
            }
        );
    };

    const handleStatusCancel = () => {
        if (order) {
            setStatusValues({
                general: order.general_status_id || 1,
                customer: order.customer_status_id || 1,
                factory: order.factory_status_id || 1,
                delivery: order.delivery_status_id || 1
            });
        }
        setEditingStatus(false);
    };
    
    // Delete handler with confirmation
    const handleDeleteClick = () => {
        if (!order) return;
        
        confirmModal.showConfirm(
            {
                title: 'Xóa đơn hàng',
                message: (
                    <div className="space-y-2">
                        <p>Bạn có chắc chắn muốn xóa đơn hàng <strong>{order.order_id}</strong>?</p>
                        <p className="text-sm text-red-600 mt-2">
                            ⚠️ Hành động này không thể hoàn tác!
                        </p>
                    </div>
                ),
                confirmText: 'Xóa đơn hàng',
                cancelText: 'Hủy',
                variant: 'delete',
            },
            async () => {
                await deleteOrder(order.id.toString());
                navigate('/orders');
            }
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
                <div className="flex items-center justify-between mb-6">
                    <OrderHeader
                        title={`Đơn hàng ${order.order_id}`}
                        subtitle={`Ngày đặt: ${new Date(order.order_date).toLocaleDateString('vi-VN')}`}
                        showBackButton
                        onBack={() => navigate('/orders')}
                    />
                    
                    {/* Delete button */}
                    <button
                        type="button"
                        onClick={handleDeleteClick}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Xóa đơn hàng
                    </button>
                </div>

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
                                    mode={editingStatus ? 'edit' : 'view'}
                                    currentStatuses={{
                                        general: getGeneralStatusById(order.general_status_id),
                                        customer: getCustomerStatusById(order.customer_status_id),
                                        factory: getFactoryStatusById(order.factory_status_id),
                                        delivery: getDeliveryStatusById(order.delivery_status_id)
                                    }}
                                    statusValues={statusValues}
                                    statusOptions={{
                                        general: generalStatuses,
                                        customer: customerStatuses,
                                        factory: factoryStatuses,
                                        delivery: deliveryStatuses
                                    }}
                                    onStatusChange={handleStatusChange}
                                    onUpdate={handleStatusUpdate}
                                    onEdit={handleStatusEdit}
                                    onCancel={handleStatusCancel}
                                    isLoading={isLoading}
                                    editable={editableConfig.status}
                                />

                                <OrderInfoSection
                                    mode="view"
                                    formData={formData!}
                                    editableFields={editableConfig.orderInfo}
                                    onFieldChange={handleFieldChange}
                                    onFieldSave={handleFieldSave}
                                />
                            </>
                        )}

                        {activeTab === 'customer' && (
                            <CustomerInfoSection
                                mode="view"
                                formData={formData!}
                                editableFields={editableConfig.customerInfo}
                                onFieldChange={handleFieldChange}
                                onFieldSave={handleFieldSave}
                            />
                        )}

                        {activeTab === 'shipping' && formData && (
                            <ShippingInfoSection
                                mode="view"
                                formData={formData}
                                editableFields={editableConfig.shippingInfo}
                                onFieldChange={handleFieldChange}
                                onFieldSave={handleFieldSave}
                            />
                        )}

                        {activeTab === 'financial' && formData && (
                            <FinancialInputSection
                                mode="view"
                                formData={formData}
                                editableFields={editableConfig.financialInfo}
                                onFieldChange={handleFieldChange}
                                onFieldSave={handleFieldSave}
                            />
                        )}

                        {activeTab === 'products' && (
                            <>
                                {/* Edit/Cancel buttons */}
                                {!editingProducts ? (
                                    <div className="mb-4 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setEditingProducts(true)}
                                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Chỉnh sửa sản phẩm
                                        </button>
                                    </div>
                                ) : (
                                    <div className="mb-4 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                if (order) {
                                                    // Validate items
                                                    const itemErrors: Record<string, string> = {};
                                                    items.forEach((item, index) => {
                                                        if (!item.sku.trim()) itemErrors[`item_sku_${index}`] = 'SKU là bắt buộc';
                                                        if (!item.size.trim()) itemErrors[`item_size_${index}`] = 'Size là bắt buộc';
                                                        if (!item.type.trim()) itemErrors[`item_type_${index}`] = 'Loại là bắt buộc';
                                                        if (item.quantity <= 0) itemErrors[`item_quantity_${index}`] = 'Số lượng phải lớn hơn 0';
                                                    });
                                                    
                                                    if (Object.keys(itemErrors).length > 0) {
                                                        alert('Vui lòng điền đầy đủ thông tin sản phẩm!');
                                                        return;
                                                    }
                                                    
                                                    try {
                                                        await updateOrderItems(order.id, items);
                                                        setEditingProducts(false);
                                                        // Refresh items
                                                        const refreshedItems = await getOrderItems(order.id);
                                                        const formattedItems = refreshedItems.map(item => ({
                                                            sku: item.sku,
                                                            size: item.size,
                                                            type: item.type,
                                                            quantity: item.quantity,
                                                        }));
                                                        setItems(formattedItems);
                                                        // Reload products
                                                        const products = refreshedItems.map(item => getProductBySku(item.sku) || null);
                                                        setSelectedProducts(products);
                                                    } catch (error) {
                                                        console.error('Failed to update items:', error);
                                                        alert('Có lỗi xảy ra khi cập nhật sản phẩm!');
                                                    }
                                                }
                                            }}
                                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Lưu thay đổi
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (order) {
                                                    // Reset to original items
                                                    getOrderItems(order.id).then(orderItems => {
                                                        const formattedItems = orderItems.map(item => ({
                                                            sku: item.sku,
                                                            size: item.size,
                                                            type: item.type,
                                                            quantity: item.quantity,
                                                        }));
                                                        setItems(formattedItems);
                                                        setSelectedProducts(orderItems.map(() => null));
                                                    });
                                                }
                                                setEditingProducts(false);
                                            }}
                                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 font-medium"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            Hủy
                                        </button>
                                    </div>
                                )}
                                <OrderItemsSection
                                    mode={editingProducts ? 'edit' : 'view'}
                                items={items}
                                selectedProducts={selectedProducts}
                                errors={{}}
                                onChange={(index, field, value) => {
                                    const newItems = [...items];
                                    newItems[index] = { ...newItems[index], [field]: value };
                                    setItems(newItems);
                                }}
                                onAdd={() => {
                                    setItems([...items, {
                                        sku: '',
                                        size: '',
                                        type: '',
                                        quantity: 1,
                                    }]);
                                    setSelectedProducts([...selectedProducts, null]);
                                }}
                                onRemove={(index) => {
                                    if (items.length > 1) {
                                        setItems(items.filter((_, i) => i !== index));
                                        setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
                                    }
                                }}
                                onProductSelect={(index, product) => {
                                    const newSelectedProducts = [...selectedProducts];
                                    newSelectedProducts[index] = product;
                                    setSelectedProducts(newSelectedProducts);
                                }}
                                />
                            </>
                        )}
                    </div>

                    <div className="lg:col-span-1">
                        <FinancialSummaryCard
                            key={`financial-${order.id}-${order.refund_fee_usd}-${order.other_fee_usd}-${order.other_bonus_usd}`}
                            itemTotal={order.item_total_usd || 0}
                            itemTotalVND={order.item_total_vnd || 0}
                            discountRate={order.discount_rate || 0}
                            buyerPaidUSD={order.buyer_paid_usd || 0}
                            buyerPaidVND={order.buyer_paid_vnd}
                            orderEarnings={order.order_earnings_usd || 0}
                            orderEarningsVND={order.order_earnings_vnd || 0}
                            exchangeRate={order.exchange_rate}
                            shippingFeeUsd={order.shipping_fee_usd}
                            shippingExchangeRate={order.shipping_exchange_rate}
                            refundFeeUsd={order.refund_fee_usd}
                            refundFeeExchangeRate={order.refund_fee_exchange_rate}
                            otherFeeUsd={order.other_fee_usd}
                            otherFeeExchangeRate={order.other_fee_exchange_rate}
                            otherBonusUsd={order.other_bonus_usd}
                            otherBonusExchangeRate={order.other_bonus_exchange_rate}
                        />
                    </div>
                </div>
                
                <ConfirmModal
                    isOpen={confirmModal.isOpen}
                    onClose={confirmModal.closeModal}
                    onConfirm={confirmModal.handleConfirm}
                    title={confirmModal.modalConfig?.title}
                    message={confirmModal.modalConfig?.message || ''}
                    confirmText={confirmModal.modalConfig?.confirmText}
                    cancelText={confirmModal.modalConfig?.cancelText}
                    variant={confirmModal.modalConfig?.variant}
                    isLoading={confirmModal.isLoading} onCancel={function (): void {
                    throw new Error("Function not implemented.");
                }}                />
            </div>
        </div>
    );
};
