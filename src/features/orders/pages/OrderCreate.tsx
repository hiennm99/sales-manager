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
    ProductsListSection,
    FinancialInputSection,
    FinancialSummaryCard,
    ActionButtons,
    TabNavigation,
    type Tab
} from '../components';

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
    });

    const [items, setItems] = useState<OrderItemFormData[]>([{
        sku: '',
        size: '',
        type: '',
        quantity: ORDER_DEFAULT_VALUES.ITEM_QUANTITY,
    }]);

    const [selectedProducts, setSelectedProducts] = useState<(Product | null)[]>([null]);
    const [itemTotal, setItemTotal] = useState<number>(0);
    const [discountRate, setDiscountRate] = useState<number>(0);
    const [buyerPaidUSD, setBuyerPaidUSD] = useState<number>(0);
    const [orderEarnings, setOrderEarnings] = useState<number>(0);
    const [exchangeRate, setExchangeRate] = useState<number>(ORDER_DEFAULT_VALUES.EXCHANGE_RATE);

    // Status states
    const [generalStatusId, setGeneralStatusId] = useState<number>(ORDER_DEFAULT_VALUES.GENERAL_STATUS_ID);
    const [customerStatusId, setCustomerStatusId] = useState<number>(ORDER_DEFAULT_VALUES.CUSTOMER_STATUS_ID);
    const [factoryStatusId, setFactoryStatusId] = useState<number>(ORDER_DEFAULT_VALUES.FACTORY_STATUS_ID);
    const [deliveryStatusId, setDeliveryStatusId] = useState<number>(ORDER_DEFAULT_VALUES.DELIVERY_STATUS_ID);

    // Calculate VND values
    const itemTotalVND = itemTotal * exchangeRate;
    const buyerPaidVND = buyerPaidUSD * exchangeRate;
    const orderEarningsVND = orderEarnings * exchangeRate;

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

    // Don't auto-update itemTotal from items anymore
    // Let user input manually in financial section

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
                });
                setItemTotal(order.item_total_usd);
                setDiscountRate(order.commission_rate);
                setBuyerPaidUSD(order.buyer_paid_usd);
                setOrderEarnings(order.order_earnings_usd);
                setExchangeRate(order.exchange_rate);
                setGeneralStatusId(order.general_status_id || ORDER_DEFAULT_VALUES.GENERAL_STATUS_ID);
                setCustomerStatusId(order.customer_status_id || ORDER_DEFAULT_VALUES.CUSTOMER_STATUS_ID);
                setFactoryStatusId(order.factory_status_id || ORDER_DEFAULT_VALUES.FACTORY_STATUS_ID);
                setDeliveryStatusId(order.delivery_status_id || ORDER_DEFAULT_VALUES.DELIVERY_STATUS_ID);

                getOrderItems(order.id).then(orderItems => {
                    if (orderItems.length > 0) {
                        setItems(orderItems.map(item => ({
                            sku: item.sku,
                            size: item.size,
                            type: item.type,
                            quantity: item.quantity,
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

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
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
        }]);
        setSelectedProducts([...selectedProducts, null]);
    };

    const handleRemoveItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
            setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
        }
    };

    const handleExchangeRateChange = (newRate: number) => {
        setExchangeRate(newRate);
    };

    const handleStatusChange = (type: 'general' | 'customer' | 'factory' | 'delivery', value: number) => {
        switch (type) {
            case 'general':
                setGeneralStatusId(value);
                break;
            case 'customer':
                setCustomerStatusId(value);
                break;
            case 'factory':
                setFactoryStatusId(value);
                break;
            case 'delivery':
                setDeliveryStatusId(value);
                break;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('🎯 handleSubmit called!');
        console.log('📋 Form data:', formData);
        console.log('📦 Items:', items);

        if (!validateForm()) {
            console.log('❌ Form validation failed:', errors);
            return;
        }
        
        console.log('✅ Form validation passed');

        try {
            const financialData: Partial<Order> = {
                item_total_usd: itemTotal,
                discount_rate: discountRate,
                buyer_paid_usd: buyerPaidUSD,
                order_earnings_usd: orderEarnings,
                exchange_rate: exchangeRate,
                item_total_vnd: itemTotalVND,
                buyer_paid_vnd: buyerPaidVND,
                order_earnings_vnd: orderEarningsVND,
                shipping_fee_usd: 0,
                shipping_exchange_rate: exchangeRate,
                shipping_fee_vnd: 0,
                refund_fee_usd: 0,
                refund_fee_exchange_rate: exchangeRate,
                refund_fee_vnd: 0,
                other_fee_usd: 0,
                other_fee_exchange_rate: exchangeRate,
                other_fee_vnd: 0,
                profit_usd: orderEarnings,
                profit_vnd: orderEarningsVND,
                general_status_id: generalStatusId,
                customer_status_id: customerStatusId,
                factory_status_id: factoryStatusId,
                delivery_status_id: deliveryStatusId,
            };

            if (orderId) {
                console.log('🔄 Updating existing order:', orderId);
                await updateOrder(orderId, formData, financialData);
                await updateOrderItems(parseInt(orderId, 10), items);
                console.log('✅ Order updated, navigating...');
                navigate(`/orders/${orderId}`);
            } else {
                console.log('➕ Creating new order...');
                const newOrder = await createOrder(formData, items, financialData);
                console.log('✅ Order created:', newOrder.id);
                navigate(`/orders/${newOrder.id}`);
            }
        } catch (error) {
            console.error('❌ Failed to save order:', error);
            alert('Có lỗi xảy ra. Vui lòng thử lại!');
        }
    };

    const handleReset = () => {
        setFormData({
            shop_code: selectedShop?.code || '',
            order_id: '',
            order_date: new Date().toISOString().split('T')[0],
            scheduled_ship_date: '',
            customer_name: '',
            customer_address: '',
            customer_phone: '',
            customer_notes: '',
            artist_code: '',
        });
        setItems([{
            sku: '',
            size: '',
            type: '',
            quantity: ORDER_DEFAULT_VALUES.ITEM_QUANTITY,
        }]);
        setSelectedProducts([null]);
        setItemTotal(0);
        setDiscountRate(0);
        setBuyerPaidUSD(0);
        setOrderEarnings(0);
        setExchangeRate(ORDER_DEFAULT_VALUES.EXCHANGE_RATE);
        setGeneralStatusId(ORDER_DEFAULT_VALUES.GENERAL_STATUS_ID);
        setCustomerStatusId(ORDER_DEFAULT_VALUES.CUSTOMER_STATUS_ID);
        setFactoryStatusId(ORDER_DEFAULT_VALUES.FACTORY_STATUS_ID);
        setDeliveryStatusId(ORDER_DEFAULT_VALUES.DELIVERY_STATUS_ID);
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
                                        statusValues={{
                                            general: generalStatusId,
                                            customer: customerStatusId,
                                            factory: factoryStatusId,
                                            delivery: deliveryStatusId
                                        }}
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
                                <ProductsListSection
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
                                    itemTotal={itemTotal}
                                    discountRate={discountRate}
                                    buyerPaidUSD={buyerPaidUSD}
                                    orderEarnings={orderEarnings}
                                    exchangeRate={exchangeRate}
                                    onItemTotalChange={setItemTotal}
                                    onDiscountRateChange={setDiscountRate}
                                    onbuyerPaidUSDChange={setBuyerPaidUSD}
                                    onOrderEarningsChange={setOrderEarnings}
                                    onExchangeRateChange={handleExchangeRateChange}
                                />
                            )}
                        </div>

                        <div className="lg:col-span-1">
                            <FinancialSummaryCard
                                itemTotal={itemTotal}
                                itemTotalVND={itemTotalVND}
                                discountRate={discountRate}
                                buyerPaidUSD={buyerPaidUSD}
                                buyerPaidVND={buyerPaidVND}
                                orderEarnings={orderEarnings}
                                orderEarningsVND={orderEarningsVND}
                                exchangeRate={exchangeRate}
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
