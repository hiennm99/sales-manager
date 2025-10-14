// src/features/products/pages/ProductCreate.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // ✅ Import useParams
import type { ProductFormData } from '../../../types/product';
import { useProductStore } from '../store/useProductStore';
import { useShopStore } from "../../shops/store/useShopStore.ts";

export const ProductCreate: React.FC = () => {
    const { productId } = useParams<{ productId: string }>(); // ✅ Lấy productId từ URL
    const navigate = useNavigate();
    const { getProductById, createProduct, updateProduct, isLoading } = useProductStore();
    const { selectedShop } = useShopStore();
    const [imagePreview, setImagePreview] = useState<string>('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState<ProductFormData>({
        shop_code: '',
        sku: '',
        title: '',
        etsy_url: '',
        image_url: '',
    });

    useEffect(() => {
        if (productId) {
            const product = getProductById(productId);
            if (product) {
                setFormData({
                    shop_code: product.shop_code,
                    sku: product.sku,
                    title: product.title,
                    etsy_url: product.etsy_url,
                    image_url: product.image_url,
                });
                setImagePreview(product.image_url);
            }
        }
    }, [productId, getProductById]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.sku.trim()) {
            newErrors.sku = 'SKU là bắt buộc';
        }

        if (!formData.title.trim()) {
            newErrors.title = 'Tên sản phẩm là bắt buộc';
        } else if (formData.title.length < 3) {
            newErrors.title = 'Tên sản phẩm phải có ít nhất 3 ký tự';
        }

        if (!formData.etsy_url.trim()) {
            newErrors.etsy_url = 'Link Etsy là bắt buộc';
        } else if (!formData.etsy_url.startsWith('http')) {
            newErrors.etsy_url = 'Link Etsy không hợp lệ';
        }

        if (!formData.image_url.trim()) {
            newErrors.image_url = 'Link hình ảnh là bắt buộc';
        } else if (!formData.image_url.startsWith('http')) {
            newErrors.image_url = 'Link hình ảnh không hợp lệ';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

        // Update image preview
        if (name === 'image_url' && value.startsWith('http')) {
            setImagePreview(value);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            if (productId) {
                await updateProduct(productId, formData);
                navigate(`/products/${productId}`); // ✅ Redirect về detail page
            } else {
                const newProduct = await createProduct(formData);
                navigate(`/products/${newProduct.id}`); // ✅ Redirect về detail page
            }
        } catch (error) {
            console.error('Failed to save product:', error);
            alert('Có lỗi xảy ra. Vui lòng thử lại!');
        }
    };

    const handleReset = () => {
        setFormData({
            'shop_code': '',
            sku: '',
            title: '',
            etsy_url: '',
            image_url: '',
        });
        setImagePreview('');
        setErrors({});
    };

    const handleCancel = () => {
        if (productId) {
            navigate(`/products/${productId}`);
        } else {
            navigate('/products');
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    {productId ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                </h1>
                <p className="text-gray-600 mt-1">
                    {productId ? 'Cập nhật thông tin sản phẩm' : 'Điền thông tin để tạo sản phẩm mới'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Form Fields */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Info Card */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Thông tin cơ bản
                            </h2>

                            {/* Shop Code */}
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                    Cửa hàng <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="title"
                                    name="title"
                                    value={selectedShop?.name}
                                    placeholder="Classic Black T-Shirt - Premium Cotton"
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                                        errors.title ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    disabled
                                />
                            </div>

                            {/* SKU */}
                            <div className="mb-4">
                                <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">
                                    SKU <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="sku"
                                    name="sku"
                                    value={formData.sku}
                                    onChange={handleChange}
                                    placeholder="TSH-BLK-001"
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        errors.sku ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.sku && (
                                    <p className="mt-1 text-sm text-red-600">{errors.sku}</p>
                                )}
                            </div>

                            {/* Title */}
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên sản phẩm <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Classic Black T-Shirt - Premium Cotton"
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                                        errors.title ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.title && (
                                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                                )}
                                <p className="mt-1 text-sm text-gray-500">
                                    {formData.title.length} ký tự
                                </p>
                            </div>

                            {/* Etsy URL */}
                            <div>
                                <label htmlFor="etsy_url" className="block text-sm font-medium text-gray-700 mb-1">
                                    Link Etsy <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="url"
                                    id="etsy_url"
                                    name="etsy_url"
                                    value={formData.etsy_url}
                                    onChange={handleChange}
                                    placeholder="https://www.etsy.com/listing/..."
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        errors.etsy_url ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.etsy_url && (
                                    <p className="mt-1 text-sm text-red-600">{errors.etsy_url}</p>
                                )}
                            </div>
                        </div>

                        {/* Image Card */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Hình ảnh sản phẩm
                            </h2>

                            <div>
                                <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">
                                    Link hình ảnh <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="url"
                                    id="image_url"
                                    name="image_url"
                                    value={formData.image_url}
                                    onChange={handleChange}
                                    placeholder="https://images.unsplash.com/..."
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        errors.image_url ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.image_url && (
                                    <p className="mt-1 text-sm text-red-600">{errors.image_url}</p>
                                )}
                                <p className="mt-1 text-sm text-gray-500">
                                    Nhập URL hình ảnh từ Unsplash, Imgur hoặc nguồn khác
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Preview */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-4">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Xem trước
                            </h2>

                            {/* Image Preview */}
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Product Info Preview */}
                            <div className="space-y-2">
                                <div className="text-xs text-gray-500">
                                    SKU: {formData.sku || '---'}
                                </div>
                                <h3 className="font-semibold text-gray-900 line-clamp-2">
                                    {formData.title || 'Tên sản phẩm'}
                                </h3>
                                {formData.etsy_url && (
                                    <a
                                        href={formData.etsy_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                                    >
                                        <span>Xem trên Etsy</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                )}
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
                                        {productId ? 'Cập nhật' : 'Tạo sản phẩm'}
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