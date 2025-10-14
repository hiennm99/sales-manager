// src/features/orders/pages/OrderCreate.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { OrderFormData, OrderItemFormData, Order } from '../../../types/order';
import { useOrderStore } from '../store/useOrderStore';
import { useShopStore } from "../../shops/store/useShopStore";

export const OrderCreate: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const { getOrderById, getOrderItems, createOrder, updateOrder, updateOrderItems, isLoading } = useOrderStore();
    const { selectedShop } = useShopStore();
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
        quantity: 1,
        unit_price_usd: 0,
        unit_price_vnd: 0,
    }]);

    const [exchangeRate, setExchangeRate] = useState<number>(25000);
    const [discount, setDiscount] = useState<number>(0);
    const [tax, setTax] = useState<number>(0);
    const [fees, setFees] = useState<number>(0);

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

                // Load order items
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

    // Calculate totals
    const itemTotal = items.reduce((sum, item) => sum + (item.unit_price_usd * item.quantity), 0);
    const subtotal = itemTotal - discount;
    const orderTotal = subtotal + tax;
    const orderEarnings = orderTotal - fees;

    const itemTotalVND = itemTotal * exchangeRate;
    const subtotalVND = subtotal * exchangeRate;
    const orderTotalVND = orderTotal * exchangeRate;
    const orderEarningsVND = orderEarnings * exchangeRate;

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.shop_code) {
            newErrors.shop_code = 'Vui lòng chọn cửa hàng';
        }

        if (!formData.order_id.trim()) {
            newErrors.order_id = 'Mã đơn hàng là bắt buộc';
        }

        if (!formData.order_date) {
            newErrors.order_date = 'Ngày đặt hàng là bắt buộc';
        }

        if (!formData.customer_name.trim()) {
            newErrors.customer_name = 'Tên khách hàng là bắt buộc';
        }

        if (!formData.customer_address.trim()) {
            newErrors.customer_address = 'Địa chỉ khách hàng là bắt buộc';
        }

        if (items.length === 0) {
            newErrors.items = 'Phải có ít nhất 1 sản phẩm';
        }

        items.forEach((item, index) => {
            if (!item.sku.trim()) {
                newErrors[`item_sku_${index}`] = 'SKU là bắt buộc';
            }
            if (item.quantity <= 0) {
                newErrors[`item_quantity_${index}`] = 'Số lượng phải lớn hơn 0';
            }
            if (item.unit_price_usd <= 0) {
                newErrors[`item_price_${index}`] = 'Giá phải lớn hơn 0';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleItemChange = (index: number, field: keyof OrderItemFormData, value: string | number) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };

        // Auto calculate VND price when USD price changes
        if (field === 'unit_price_usd') {
            newItems[index].unit_price_vnd = Number(value) * exchangeRate;
        }

        setItems(newItems);

        if (errors[`item_${field}_${index}`]) {
            setErrors(prev => ({ ...prev, [`item_${field}_${index}`]: '' }));
        }
    };

    const handleAddItem = () => {
        setItems([...items, {
            sku: '',
            size: '',
            type: '',
            quantity: 1,
            unit_price_usd: 0,
            unit_price_vnd: 0,
        }]);
    };

    const handleRemoveItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const handleExchangeRateChange = (newRate: number) => {
        setExchangeRate(newRate);
        // Update all item VND prices
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
            quantity: 1,
            unit_price_usd: 0,
            unit_price_vnd: 0,
        }]);
        setExchangeRate(25000);
        setDiscount(0);
        setTax(0);
        setFees(0);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    {orderId ? 'Chỉnh sửa đơn hàng' : 'Tạo đơn hàng mới'}
                </h1>
                <p className="text-gray-600 mt-1">
                    {orderId ? 'Cập nhật thông tin đơn hàng' : 'Điền thông tin để tạo đơn hàng mới'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Form Fields */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Info Card */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Thông tin đơn hàng
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Shop Code */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Cửa hàng <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        value={selectedShop?.name || 'Chưa chọn cửa hàng'}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                                        disabled
                                    />
                                    {errors.shop_code && (
                                        <p className="mt-1 text-sm text-red-600">{errors.shop_code}</p>
                                    )}
                                </div>

                                {/* Order ID */}
                                <div>
                                    <label htmlFor="order_id" className="block text-sm font-medium text-gray-700 mb-1">
                                        Mã đơn hàng <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="order_id"
                                        name="order_id"
                                        value={formData.order_id}
                                        onChange={handleChange}
                                        placeholder="ORD-2024-001"
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            errors.order_id ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    {errors.order_id && (
                                        <p className="mt-1 text-sm text-red-600">{errors.order_id}</p>
                                    )}
                                </div>

                                {/* Order Date */}
                                <div>
                                    <label htmlFor="order_date" className="block text-sm font-medium text-gray-700 mb-1">
                                        Ngày đặt hàng <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        id="order_date"
                                        name="order_date"
                                        value={formData.order_date}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            errors.order_date ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    {errors.order_date && (
                                        <p className="mt-1 text-sm text-red-600">{errors.order_date}</p>
                                    )}
                                </div>

                                {/* Scheduled Ship Date */}
                                <div>
                                    <label htmlFor="scheduled_ship_date" className="block text-sm font-medium text-gray-700 mb-1">
                                        Ngày giao dự kiến
                                    </label>
                                    <input
                                        type="date"
                                        id="scheduled_ship_date"
                                        name="scheduled_ship_date"
                                        value={formData.scheduled_ship_date}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Artist Code */}
                                <div className="md:col-span-2">
                                    <label htmlFor="artist_code" className="block text-sm font-medium text-gray-700 mb-1">
                                        Mã nghệ sĩ
                                    </label>
                                    <input
                                        type="text"
                                        id="artist_code"
                                        name="artist_code"
                                        value={formData.artist_code}
                                        onChange={handleChange}
                                        placeholder="ARTIST001"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Customer Info Card */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Thông tin khách hàng
                            </h2>

                            <div className="space-y-4">
                                {/* Customer Name */}
                                <div>
                                    <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Tên khách hàng <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="customer_name"
                                        name="customer_name"
                                        value={formData.customer_name}
                                        onChange={handleChange}
                                        placeholder="Nguyễn Văn A"
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            errors.customer_name ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    {errors.customer_name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.customer_name}</p>
                                    )}
                                </div>

                                {/* Customer Address */}
                                <div>
                                    <label htmlFor="customer_address" className="block text-sm font-medium text-gray-700 mb-1">
                                        Địa chỉ <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        id="customer_address"
                                        name="customer_address"
                                        value={formData.customer_address}
                                        onChange={handleChange}
                                        rows={3}
                                        placeholder="123 Đường ABC, Phường XYZ, Quận 1, TP.HCM"
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                                            errors.customer_address ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    {errors.customer_address && (
                                        <p className="mt-1 text-sm text-red-600">{errors.customer_address}</p>
                                    )}
                                </div>

                                {/* Customer Phone */}
                                <div>
                                    <label htmlFor="customer_phone" className="block text-sm font-medium text-gray-700 mb-1">
                                        Số điện thoại
                                    </label>
                                    <input
                                        type="tel"
                                        id="customer_phone"
                                        name="customer_phone"
                                        value={formData.customer_phone}
                                        onChange={handleChange}
                                        placeholder="0901234567"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Customer Notes */}
                                <div>
                                    <label htmlFor="customer_notes" className="block text-sm font-medium text-gray-700 mb-1">
                                        Ghi chú
                                    </label>
                                    <textarea
                                        id="customer_notes"
                                        name="customer_notes"
                                        value={formData.customer_notes}
                                        onChange={handleChange}
                                        rows={2}
                                        placeholder="Ghi chú từ khách hàng..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Order Items Card */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Sản phẩm
                                </h2>
                                <button
                                    type="button"
                                    onClick={handleAddItem}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Thêm sản phẩm
                                </button>
                            </div>

                            {errors.items && (
                                <p className="mb-4 text-sm text-red-600">{errors.items}</p>
                            )}

                            <div className="space-y-4">
                                {items.map((item, index) => (
                                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-medium text-gray-900">Sản phẩm #{index + 1}</h3>
                                            {items.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItem(index)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            <div className="col-span-2">
                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                    SKU <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={item.sku}
                                                    onChange={(e) => handleItemChange(index, 'sku', e.target.value)}
                                                    placeholder="PROD001"
                                                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                        errors[`item_sku_${index}`] ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                />
                                                {errors[`item_sku_${index}`] && (
                                                    <p className="mt-1 text-xs text-red-600">{errors[`item_sku_${index}`]}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Size</label>
                                                <input
                                                    type="text"
                                                    value={item.size}
                                                    onChange={(e) => handleItemChange(index, 'size', e.target.value)}
                                                    placeholder="M"
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Loại</label>
                                                <input
                                                    type="text"
                                                    value={item.type}
                                                    onChange={(e) => handleItemChange(index, 'type', e.target.value)}
                                                    placeholder="T-Shirt"
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                    Số lượng <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                                                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                        errors[`item_quantity_${index}`] ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                />
                                                {errors[`item_quantity_${index}`] && (
                                                    <p className="mt-1 text-xs text-red-600">{errors[`item_quantity_${index}`]}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                    Giá USD <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.unit_price_usd}
                                                    onChange={(e) => handleItemChange(index, 'unit_price_usd', parseFloat(e.target.value) || 0)}
                                                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                        errors[`item_price_${index}`] ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                />
                                                {errors[`item_price_${index}`] && (
                                                    <p className="mt-1 text-xs text-red-600">{errors[`item_price_${index}`]}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Giá VND</label>
                                                <input
                                                    type="number"
                                                    value={item.unit_price_vnd}
                                                    readOnly
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                                                />
                                            </div>

                                            <div className="col-span-2">
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Tổng</label>
                                                <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg font-medium">
                                                    ${(item.unit_price_usd * item.quantity).toFixed(2)} / {(item.unit_price_vnd * item.quantity).toLocaleString('vi-VN')} ₫
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Financial Details Card */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Thông tin tài chính
                            </h2>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Exchange Rate */}
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tỷ giá (1 USD = ? VND)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={exchangeRate}
                                        onChange={(e) => handleExchangeRateChange(parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Discount */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Giảm giá (USD)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={discount}
                                        onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Tax */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Thuế (USD)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={tax}
                                        onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Fees */}
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phí (USD)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={fees}
                                        onChange={(e) => setFees(parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-4">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Tổng quan đơn hàng
                            </h2>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Tổng sản phẩm:</span>
                                    <span className="font-medium text-gray-900">${itemTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">VND:</span>
                                    <span className="font-medium text-gray-900">{itemTotalVND.toLocaleString('vi-VN')} ₫</span>
                                </div>

                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Giảm giá:</span>
                                        <span className="font-medium text-red-600">-${discount.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Sau giảm giá:</span>
                                    <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">VND:</span>
                                    <span className="font-medium text-gray-900">{subtotalVND.toLocaleString('vi-VN')} ₫</span>
                                </div>

                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Thuế:</span>
                                        <span className="font-medium text-gray-900">+${tax.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex justify-between text-base font-semibold">
                                        <span className="text-gray-900">Tổng đơn hàng:</span>
                                        <span className="text-blue-600">${orderTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm mt-1">
                                        <span className="text-gray-600">VND:</span>
                                        <span className="font-medium text-blue-600">{orderTotalVND.toLocaleString('vi-VN')} ₫</span>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Phí:</span>
                                        <span className="font-medium text-red-600">-${fees.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex justify-between text-base font-semibold">
                                        <span className="text-gray-900">Thu nhập:</span>
                                        <span className="text-green-600">${orderEarnings.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm mt-1">
                                        <span className="text-gray-600">VND:</span>
                                        <span className="font-medium text-green-600">{orderEarningsVND.toLocaleString('vi-VN')} ₫</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div className="text-sm text-blue-800">
                                        <p className="font-medium mb-1">Lưu ý</p>
                                        <p className="text-xs">Giá VND được tính tự động theo tỷ giá. Lợi nhuận = Thu nhập - Chi phí vận chuyển - Hoàn tiền - Chi phí khác.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Đặt lại
                        </button>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
    );
};