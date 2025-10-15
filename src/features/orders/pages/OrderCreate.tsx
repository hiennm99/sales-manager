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
    FormField,
    TextAreaField,
    StatusSelect,
    FormSection,
    OrderItem,
    OrderSummary
} from '../components';
import { TabNavigation, type Tab } from '../components/TabNavigation';

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
        unit_price_usd: ORDER_DEFAULT_VALUES.ITEM_PRICE_USD,
        unit_price_vnd: ORDER_DEFAULT_VALUES.ITEM_PRICE_VND,
    }]);

    const [selectedProducts, setSelectedProducts] = useState<(Product | null)[]>([null]);
    const [exchangeRate, setExchangeRate] = useState<number>(ORDER_DEFAULT_VALUES.EXCHANGE_RATE);
    const [discount, setDiscount] = useState<number>(ORDER_DEFAULT_VALUES.DISCOUNT);
    const [tax, setTax] = useState<number>(ORDER_DEFAULT_VALUES.TAX);
    const [fees, setFees] = useState<number>(ORDER_DEFAULT_VALUES.FEES);

    // Status states
    const [generalStatusId, setGeneralStatusId] = useState<number>(ORDER_DEFAULT_VALUES.GENERAL_STATUS_ID);
    const [customerStatusId, setCustomerStatusId] = useState<number>(ORDER_DEFAULT_VALUES.CUSTOMER_STATUS_ID);
    const [factoryStatusId, setFactoryStatusId] = useState<number>(ORDER_DEFAULT_VALUES.FACTORY_STATUS_ID);
    const [deliveryStatusId, setDeliveryStatusId] = useState<number>(ORDER_DEFAULT_VALUES.DELIVERY_STATUS_ID);

    // Calculate totals
    const itemTotal = items.reduce((sum, item) => sum + (item.unit_price_usd * item.quantity), 0);
    const subtotal = itemTotal - discount;
    const orderTotal = subtotal + tax;
    const orderEarnings = orderTotal - fees;
    const itemTotalVND = itemTotal * exchangeRate;
    const subtotalVND = subtotal * exchangeRate;
    const orderTotalVND = orderTotal * exchangeRate;
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
                setExchangeRate(order.exchange_rate);
                setDiscount(order.discount_usd);
                setTax(order.tax_usd);
                setFees(order.fees_usd);
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
                            unit_price_usd: item.unit_price_usd,
                            unit_price_vnd: item.unit_price_vnd,
                        })));
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
            if (item.unit_price_usd <= 0) newErrors[`item_price_${index}`] = 'Giá phải lớn hơn 0';
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

        if (field === 'unit_price_usd') {
            newItems[index].unit_price_vnd = Number(value) * exchangeRate;
        }

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
            unit_price_usd: ORDER_DEFAULT_VALUES.ITEM_PRICE_USD,
            unit_price_vnd: ORDER_DEFAULT_VALUES.ITEM_PRICE_VND,
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
        setItems(items.map(item => ({
            ...item,
            unit_price_vnd: item.unit_price_usd * newRate,
        })));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const financialData: Partial<Order> = {
                item_total_usd: itemTotal,
                discount_usd: discount,
                subtotal_usd: subtotal,
                tax_usd: tax,
                order_total_usd: orderTotal,
                fees_usd: fees,
                order_earnings_usd: orderEarnings,
                exchange_rate: exchangeRate,
                item_total_vnd: itemTotalVND,
                discount_vnd: discount * exchangeRate,
                subtotal_vnd: subtotalVND,
                tax_vnd: tax * exchangeRate,
                order_total_vnd: orderTotalVND,
                fees_vnd: fees * exchangeRate,
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
                commission_program: 0,
                general_status_id: generalStatusId,
                customer_status_id: customerStatusId,
                factory_status_id: factoryStatusId,
                delivery_status_id: deliveryStatusId,
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
            unit_price_usd: ORDER_DEFAULT_VALUES.ITEM_PRICE_USD,
            unit_price_vnd: ORDER_DEFAULT_VALUES.ITEM_PRICE_VND,
        }]);
        setSelectedProducts([null]);
        setExchangeRate(ORDER_DEFAULT_VALUES.EXCHANGE_RATE);
        setDiscount(ORDER_DEFAULT_VALUES.DISCOUNT);
        setTax(ORDER_DEFAULT_VALUES.TAX);
        setFees(ORDER_DEFAULT_VALUES.FEES);
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
                {/* Header */}
                <div className="mb-6">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={orderId ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M12 4v16m8-8H4"} />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    {orderId ? 'Chỉnh sửa đơn hàng' : 'Tạo đơn hàng mới'}
                                </h1>
                                <p className="text-gray-600 mt-1 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {orderId ? 'Cập nhật thông tin đơn hàng' : 'Điền thông tin để tạo đơn hàng mới'}
                                </p>
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

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Tab Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Order Info Tab */}
                            {activeTab === 'order-info' && (
                                <>
                                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-shadow duration-300">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <h2 className="text-xl font-bold text-gray-900">Thông tin đơn hàng</h2>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                label="Cửa hàng"
                                                name="shop_code"
                                                value={selectedShop?.name || 'Chưa chọn cửa hàng'}
                                                onChange={handleChange}
                                                required
                                                disabled
                                                error={errors.shop_code}
                                            />

                                            <FormField
                                                label="Mã đơn hàng"
                                                name="order_id"
                                                value={formData.order_id}
                                                onChange={handleChange}
                                                placeholder="ORD-2024-001"
                                                required
                                                error={errors.order_id}
                                            />

                                            <FormField
                                                label="Ngày đặt hàng"
                                                name="order_date"
                                                type="date"
                                                value={formData.order_date}
                                                onChange={handleChange}
                                                required
                                                error={errors.order_date}
                                            />

                                            <FormField
                                                label="Ngày giao dự kiến"
                                                name="scheduled_ship_date"
                                                type="date"
                                                value={formData.scheduled_ship_date}
                                                onChange={handleChange}
                                            />

                                            <FormField
                                                label="Mã nghệ sĩ"
                                                name="artist_code"
                                                value={formData.artist_code}
                                                onChange={handleChange}
                                                placeholder="ARTIST001"
                                                className="md:col-span-2"
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-shadow duration-300">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <h2 className="text-xl font-bold text-gray-900">Trạng thái đơn hàng</h2>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <StatusSelect
                                                label="Trạng thái tổng quan"
                                                value={generalStatusId}
                                                onChange={setGeneralStatusId}
                                                options={generalStatuses}
                                            />

                                            <StatusSelect
                                                label="Trạng thái khách hàng"
                                                value={customerStatusId}
                                                onChange={setCustomerStatusId}
                                                options={customerStatuses}
                                            />

                                            <StatusSelect
                                                label="Trạng thái nhà máy"
                                                value={factoryStatusId}
                                                onChange={setFactoryStatusId}
                                                options={factoryStatuses}
                                            />

                                            <StatusSelect
                                                label="Trạng thái giao hàng"
                                                value={deliveryStatusId}
                                                onChange={setDeliveryStatusId}
                                                options={deliveryStatuses}
                                            />
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
                                    <div className="space-y-4">
                                        <FormField
                                            label="Tên khách hàng"
                                            name="customer_name"
                                            value={formData.customer_name}
                                            onChange={handleChange}
                                            placeholder="Nguyễn Văn A"
                                            required
                                            error={errors.customer_name}
                                        />

                                        <TextAreaField
                                            label="Địa chỉ"
                                            name="customer_address"
                                            value={formData.customer_address}
                                            onChange={handleChange}
                                            placeholder="123 Đường ABC, Phường XYZ, Quận 1, TP.HCM"
                                            required
                                            error={errors.customer_address}
                                        />

                                        <FormField
                                            label="Số điện thoại"
                                            name="customer_phone"
                                            type="tel"
                                            value={formData.customer_phone}
                                            onChange={handleChange}
                                            placeholder="0901234567"
                                        />

                                        <TextAreaField
                                            label="Ghi chú"
                                            name="customer_notes"
                                            value={formData.customer_notes}
                                            onChange={handleChange}
                                            placeholder="Ghi chú từ khách hàng..."
                                            rows={4}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Products Tab */}
                            {activeTab === 'products' && (
                                <FormSection title="Sản phẩm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex-1">
                                            {errors.items && (
                                                <p className="text-sm text-red-600">{errors.items}</p>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleAddItem}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            Thêm sản phẩm
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {items.map((item, index) => (
                                            <OrderItem
                                                key={index}
                                                item={item}
                                                index={index}
                                                selectedProduct={selectedProducts[index]}
                                                canRemove={items.length > 1}
                                                errors={errors}
                                                onChange={handleItemChange}
                                                onRemove={handleRemoveItem}
                                                onProductSelect={handleProductSelect}
                                            />
                                        ))}
                                    </div>
                                </FormSection>
                            )}

                            {/* Financial Tab */}
                            {activeTab === 'financial' && (
                                <FormSection title="Thông tin tài chính">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Tỷ giá (1 USD = ? VND)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={exchangeRate}
                                                onChange={(e) => handleExchangeRateChange(parseFloat(e.target.value) || 0)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-medium"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Giảm giá (USD)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={discount}
                                                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Thuế (USD)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={tax}
                                                onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Phí (USD)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={fees}
                                                onChange={(e) => setFees(parseFloat(e.target.value) || 0)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    {/* Financial Summary Cards */}
                                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-blue-600 rounded-lg">
                                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                                    </svg>
                                                </div>
                                                <h3 className="font-semibold text-gray-900">Tổng đơn hàng</h3>
                                            </div>
                                            <p className="text-2xl font-bold text-blue-600">${orderTotal.toFixed(2)}</p>
                                            <p className="text-sm text-gray-600">{orderTotalVND.toLocaleString('vi-VN')} ₫</p>
                                        </div>

                                        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-green-600 rounded-lg">
                                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <h3 className="font-semibold text-gray-900">Thu nhập</h3>
                                            </div>
                                            <p className="text-2xl font-bold text-green-600">${orderEarnings.toFixed(2)}</p>
                                            <p className="text-sm text-gray-600">{orderEarningsVND.toLocaleString('vi-VN')} ₫</p>
                                        </div>
                                    </div>
                                </FormSection>
                            )}
                        </div>

                        {/* Right Column - Summary (Always Visible) */}
                        <div className="lg:col-span-1">
                            <OrderSummary
                                itemTotal={itemTotal}
                                itemTotalVND={itemTotalVND}
                                discount={discount}
                                subtotal={subtotal}
                                subtotalVND={subtotalVND}
                                tax={tax}
                                orderTotal={orderTotal}
                                orderTotalVND={orderTotalVND}
                                fees={fees}
                                orderEarnings={orderEarnings}
                                orderEarningsVND={orderEarningsVND}
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="inline-flex items-center gap-2 px-5 py-2.5 text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Đặt lại
                            </button>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Đang lưu...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {orderId ? 'Cập nhật' : 'Tạo đơn hàng'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};