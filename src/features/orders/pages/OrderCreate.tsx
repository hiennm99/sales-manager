// src/features/orders/pages/OrderCreate.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { OrderFormData, OrderItemFormData, Order } from '../../../types/order';
import type { Product } from '../../../types/product';
import { useOrderStore } from '../store/useOrderStore';
import { useShopStore } from "../../shops/store/useShopStore";
import { useStatusStore } from '../../statuses/store/useStatusStore';
import { ORDER_DEFAULT_VALUES } from '../constants/orderDefaults';
import {
    OrderHeader,
    OrderInfoSection,
    OrderStatusSection,
    CustomerInfoSection,
    OrderItemsSection,
    FinancialInputSection,
    FinancialSummaryCard,
    TabNavigation,
    type Tab
} from '../components';
import { ActionButtons } from '../../../components/common';

export const OrderCreate: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const { getOrderById, getOrderItems, createOrder, updateOrder, updateOrderItems, isLoading } = useOrderStore();
    const { selectedShop } = useShopStore();
    const {
        generalStatuses,
        customerStatuses,
        factoryStatuses,
        deliveryStatuses,
        fetchAllStatuses
    } = useStatusStore();

    const [activeTab, setActiveTab] = useState<string>('order-info');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState<OrderFormData>({
        shop_code: selectedShop?.code || '',
        order_id: '',
        order_date: new Date().toISOString().split('T')[0],
        scheduled_ship_date: '',
        customer_name: '',
        customer_address: '',
        customer_phone: '',
        customer_notes: '',
        artist_code: '',
        actualShipDate: "",
        carrierNotes: "",
        carrierUnit: "",
        internalTrackingNumber: "",
        otherFeeExchangeRate: undefined,
        refundFeeExchangeRate: undefined,
        shippingExchangeRate: undefined,
        trackingNumber: "",
        // Financial fields
        itemTotalUsd: 0,
        discountRate: 0,
        buyerPaidUsd: 0,
        orderEarningsUsd: 0,
        exchangeRate: ORDER_DEFAULT_VALUES.EXCHANGE_RATE,
        shippingFeeUsd: 0,
        refundFeeUsd: 0,
        otherFeeUsd: 0
    });

    const [items, setItems] = useState<OrderItemFormData[]>([{
        sku: '',
        size: '',
        type: '',
        quantity: ORDER_DEFAULT_VALUES.ITEM_QUANTITY,
        unit_price_usd: 0,
    }]);

    const [selectedProducts, setSelectedProducts] = useState<(Product | null)[]>([null]);

    // Auto-calculate itemTotalUsd from items
    useEffect(() => {
        const total = items.reduce((sum, item) => {
            return sum + (item.quantity * (item.unit_price_usd || 0));
        }, 0);
        setFormData(prev => ({ ...prev, itemTotalUsd: total }));
    }, [items]);

    // Status states
    const [statusValues, setStatusValues] = useState<{
        general: number;
        customer: number;
        factory: number;
        delivery: number;
    }>({
        general: ORDER_DEFAULT_VALUES.GENERAL_STATUS_ID,
        customer: ORDER_DEFAULT_VALUES.CUSTOMER_STATUS_ID,
        factory: ORDER_DEFAULT_VALUES.FACTORY_STATUS_ID,
        delivery: ORDER_DEFAULT_VALUES.DELIVERY_STATUS_ID
    });

    // Calculate VND values
    const itemTotalVND = (formData.itemTotalUsd || 0) * (formData.exchangeRate || ORDER_DEFAULT_VALUES.EXCHANGE_RATE);
    const buyerPaidVND = (formData.buyerPaidUsd || 0) * (formData.exchangeRate || ORDER_DEFAULT_VALUES.EXCHANGE_RATE);
    const orderEarningsVND = (formData.orderEarningsUsd || 0) * (formData.exchangeRate || ORDER_DEFAULT_VALUES.EXCHANGE_RATE);

    // Define tabs
    const tabs: Tab[] = [
        {
            id: 'order-info',
            label: 'Thông tin đơn',
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
            id: 'products',
            label: 'Sản phẩm',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
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
    ];

    useEffect(() => {
        fetchAllStatuses();
    }, [fetchAllStatuses]);

    useEffect(() => {
        if (selectedShop) {
            setFormData(prev => ({ ...prev, shop_code: selectedShop.code }));
        }
    }, [selectedShop]);

    useEffect(() => {
        if (orderId) {
            const order = getOrderById(orderId);
            if (order) {
                setFormData({
                    shop_code: order.shop_code,
                    order_id: order.order_id,
                    order_date: order.order_date,
                    scheduled_ship_date: order.scheduled_ship_date || '',
                    customer_name: order.customer_name,
                    customer_address: order.customer_address,
                    customer_phone: order.customer_phone || '',
                    customer_notes: order.customer_notes || '',
                    artist_code: order.artist_code || '',
                    actualShipDate: "",
                    carrierNotes: "",
                    carrierUnit: "",
                    internalTrackingNumber: "",
                    otherFeeExchangeRate: undefined,
                    refundFeeExchangeRate: undefined,
                    shippingExchangeRate: undefined,
                    trackingNumber: "",
                    itemTotalUsd: order.item_total_usd,
                    discountRate: order.commission_rate,
                    buyerPaidUsd: order.buyer_paid_usd,
                    orderEarningsUsd: order.order_earnings_usd,
                    exchangeRate: order.exchange_rate,
                    shippingFeeUsd: order.shipping_fee_usd || 0,
                    refundFeeUsd: order.refund_fee_usd || 0,
                    otherFeeUsd: order.other_fee_usd || 0
                });
                setStatusValues({
                    general: order.general_status_id || ORDER_DEFAULT_VALUES.GENERAL_STATUS_ID,
                    customer: order.customer_status_id || ORDER_DEFAULT_VALUES.CUSTOMER_STATUS_ID,
                    factory: order.factory_status_id || ORDER_DEFAULT_VALUES.FACTORY_STATUS_ID,
                    delivery: order.delivery_status_id || ORDER_DEFAULT_VALUES.DELIVERY_STATUS_ID
                });

                getOrderItems(order.id).then(orderItems => {
                    if (orderItems.length > 0) {
                        setItems(orderItems.map(item => ({
                            sku: item.sku,
                            size: item.size,
                            type: item.type,
                            quantity: item.quantity,
                            unit_price_usd: item.unit_price_usd || 0,
                        })));
                        setSelectedProducts(orderItems.map(() => null));
                    }
                });
            }
        }
    }, [orderId, getOrderById, getOrderItems]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.shop_code) newErrors.shop_code = 'Vui lòng chọn cửa hàng';
        if (!formData.order_id.trim()) newErrors.order_id = 'Mã đơn hàng là bắt buộc';
        if (!formData.order_date) newErrors.order_date = 'Ngày đặt hàng là bắt buộc';
        if (!formData.customer_name.trim()) newErrors.customer_name = 'Tên khách hàng là bắt buộc';
        if (!formData.customer_address.trim()) newErrors.customer_address = 'Địa chỉ khách hàng là bắt buộc';
        if (items.length === 0) newErrors.items = 'Phải có ít nhất 1 sản phẩm';

        items.forEach((item, index) => {
            if (!item.sku.trim()) newErrors[`item_sku_${index}`] = 'SKU là bắt buộc';
            if (item.quantity <= 0) newErrors[`item_quantity_${index}`] = 'Số lượng phải lớn hơn 0';
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handler for form data changes (used by sections)
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        // All fields (including financial) go into formData
        setFormData((prev) => ({
            ...prev,
            [name]: typeof value === 'string' && ['itemTotalUsd', 'discountRate', 'buyerPaidUsd', 'orderEarningsUsd', 'exchangeRate', 'shippingFeeUsd', 'refundFeeUsd', 'otherFeeUsd'].includes(name)
                ? Number(value)
                : value,
        }));
        
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Handler for status changes
    const handleStatusChange = (type: 'general' | 'customer' | 'factory' | 'delivery', value: number) => {
        setStatusValues(prev => ({ ...prev, [type]: value }));
    };

    const handleItemChange = (index: number, field: keyof OrderItemFormData, value: string | number) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);

        if (errors[`item_${field}_${index}`]) {
            setErrors(prev => ({ ...prev, [`item_${field}_${index}`]: '' }));
        }
    };

    const handleProductSelect = (index: number, product: Product | null) => {
        const newSelectedProducts = [...selectedProducts];
        newSelectedProducts[index] = product;
        setSelectedProducts(newSelectedProducts);
    };

    const handleAddItem = () => {
        setItems([...items, {
            sku: '',
            size: '',
            type: '',
            quantity: ORDER_DEFAULT_VALUES.ITEM_QUANTITY,
            unit_price_usd: 0,
        }]);
        setSelectedProducts([...selectedProducts, null]);
    };

    const handleRemoveItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
            setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const financialData: Partial<Order> = {
                item_total_usd: formData.itemTotalUsd || 0,
                discount_rate: formData.discountRate || 0,
                buyer_paid_usd: formData.buyerPaidUsd || 0,
                order_earnings_usd: formData.orderEarningsUsd || 0,
                exchange_rate: formData.exchangeRate || ORDER_DEFAULT_VALUES.EXCHANGE_RATE,
                item_total_vnd: itemTotalVND,
                buyer_paid_vnd: buyerPaidVND,
                order_earnings_vnd: orderEarningsVND,
                shipping_fee_usd: formData.shippingFeeUsd || 0,
                shipping_exchange_rate: formData.exchangeRate || ORDER_DEFAULT_VALUES.EXCHANGE_RATE,
                shipping_fee_vnd: (formData.shippingFeeUsd || 0) * (formData.exchangeRate || ORDER_DEFAULT_VALUES.EXCHANGE_RATE),
                refund_fee_usd: formData.refundFeeUsd || 0,
                refund_fee_exchange_rate: formData.exchangeRate || ORDER_DEFAULT_VALUES.EXCHANGE_RATE,
                refund_fee_vnd: (formData.refundFeeUsd || 0) * (formData.exchangeRate || ORDER_DEFAULT_VALUES.EXCHANGE_RATE),
                other_fee_usd: formData.otherFeeUsd || 0,
                other_fee_exchange_rate: formData.exchangeRate || ORDER_DEFAULT_VALUES.EXCHANGE_RATE,
                other_fee_vnd: (formData.otherFeeUsd || 0) * (formData.exchangeRate || ORDER_DEFAULT_VALUES.EXCHANGE_RATE),
                profit_usd: (formData.orderEarningsUsd || 0) - (formData.shippingFeeUsd || 0) - (formData.refundFeeUsd || 0) - (formData.otherFeeUsd || 0),
                profit_vnd: orderEarningsVND - (formData.shippingFeeUsd || 0) * (formData.exchangeRate || ORDER_DEFAULT_VALUES.EXCHANGE_RATE) - (formData.refundFeeUsd || 0) * (formData.exchangeRate || ORDER_DEFAULT_VALUES.EXCHANGE_RATE) - (formData.otherFeeUsd || 0) * (formData.exchangeRate || ORDER_DEFAULT_VALUES.EXCHANGE_RATE),
                general_status_id: statusValues.general,
                customer_status_id: statusValues.customer,
                factory_status_id: statusValues.factory,
                delivery_status_id: statusValues.delivery,
            };

            if (orderId) {
                await updateOrder(orderId, formData, financialData);
                await updateOrderItems(parseInt(orderId, 10), items);
                navigate(`/orders/${orderId}`);
            } else {
                const newOrder = await createOrder(formData, items, financialData);
                navigate(`/orders/${newOrder.id}`);
            }
        } catch (error) {
            console.error('Failed to save order:', error);
            alert('Có lỗi xảy ra. Vui lòng thử lại!');
        }
    };

    const handleReset = () => {
        setFormData({
            actualShipDate: "",
            carrierNotes: "",
            carrierUnit: "",
            internalTrackingNumber: "",
            otherFeeExchangeRate: undefined,
            refundFeeExchangeRate: undefined,
            shippingExchangeRate: undefined,
            trackingNumber: "",
            shop_code: selectedShop?.code || '',
            order_id: '',
            order_date: new Date().toISOString().split('T')[0],
            scheduled_ship_date: '',
            customer_name: '',
            customer_address: '',
            customer_phone: '',
            customer_notes: '',
            artist_code: '',
            itemTotalUsd: 0,
            discountRate: 0,
            buyerPaidUsd: 0,
            orderEarningsUsd: 0,
            exchangeRate: ORDER_DEFAULT_VALUES.EXCHANGE_RATE,
            shippingFeeUsd: 0,
            refundFeeUsd: 0,
            otherFeeUsd: 0
        });
        setItems([{
            sku: '',
            size: '',
            type: '',
            quantity: ORDER_DEFAULT_VALUES.ITEM_QUANTITY,
            unit_price_usd: 0,
        }]);
        setSelectedProducts([null]);
        setStatusValues({
            general: ORDER_DEFAULT_VALUES.GENERAL_STATUS_ID,
            customer: ORDER_DEFAULT_VALUES.CUSTOMER_STATUS_ID,
            factory: ORDER_DEFAULT_VALUES.FACTORY_STATUS_ID,
            delivery: ORDER_DEFAULT_VALUES.DELIVERY_STATUS_ID
        });
        setErrors({});
    };

    const handleCancel = () => {
        if (orderId) {
            navigate(`/orders/${orderId}`);
        } else {
            navigate('/orders');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <OrderHeader
                    title={orderId ? 'Chỉnh sửa đơn hàng' : 'Tạo đơn hàng mới'}
                    subtitle={orderId ? 'Cập nhật thông tin đơn hàng' : 'Điền thông tin để tạo đơn hàng mới'}
                    isEdit={!!orderId}
                />

                <div className="mb-6">
                    <TabNavigation
                        tabs={tabs}
                        activeTab={activeTab}
                        onChange={setActiveTab}
                    />
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            {activeTab === 'order-info' && (
                                <>
                                    <OrderInfoSection
                                        mode="edit"
                                        formData={formData}
                                        shopName={selectedShop?.name}
                                        errors={errors}
                                        onChange={handleChange}
                                    />
                                    <OrderStatusSection
                                        mode="edit"
                                        statusValues={statusValues}
                                        statusOptions={{
                                            general: generalStatuses,
                                            customer: customerStatuses,
                                            factory: factoryStatuses,
                                            delivery: deliveryStatuses
                                        }}
                                        onStatusChange={handleStatusChange}
                                    />
                                </>
                            )}

                            {activeTab === 'customer' && (
                                <CustomerInfoSection
                                    mode="edit"
                                    formData={formData}
                                    errors={errors}
                                    onChange={handleChange}
                                />
                            )}

                            {activeTab === 'products' && (
                                <OrderItemsSection
                                    mode="edit"
                                    items={items}
                                    selectedProducts={selectedProducts}
                                    errors={errors}
                                    onChange={handleItemChange}
                                    onAdd={handleAddItem}
                                    onRemove={handleRemoveItem}
                                    onProductSelect={handleProductSelect}
                                />
                            )}

                            {activeTab === 'financial' && (
                                <FinancialInputSection
                                    mode="edit"
                                    formData={formData}
                                    errors={errors}
                                    onChange={handleChange}
                                />
                            )}
                        </div>

                        <div className="lg:col-span-1">
                            <FinancialSummaryCard
                                itemTotal={formData.itemTotalUsd || 0}
                                itemTotalVND={itemTotalVND}
                                discountRate={formData.discountRate || 0}
                                buyerPaidUSD={formData.buyerPaidUsd || 0}
                                buyerPaidVND={buyerPaidVND}
                                orderEarnings={formData.orderEarningsUsd || 0}
                                orderEarningsVND={orderEarningsVND}
                                exchangeRate={formData.exchangeRate || ORDER_DEFAULT_VALUES.EXCHANGE_RATE}
                            />
                        </div>
                    </div>

                    <ActionButtons
                        mode={orderId ? 'edit' : 'create'}
                        isLoading={isLoading}
                        onReset={handleReset}
                        onCancel={handleCancel}
                    />
                </form>
            </div>
        </div>
    );
};
