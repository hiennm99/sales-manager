// src/features/orders/components/sections/OrderItemsSection.tsx

import React from 'react';
import { SectionCard } from '../../../../components/common';
import { OrderItemInput } from './OrderItemInput.tsx';
import type { OrderItemFormData } from '../../../../types/order';
import type { Product } from '../../../../types/product';
import { ITEM_TYPES } from '../../constants/orderDefaults';

interface ProductsListSectionProps {
    mode: 'view' | 'edit';
    items: OrderItemFormData[];
    selectedProducts?: (Product | null)[];
    errors?: Record<string, string>;
    onChange?: (index: number, field: keyof OrderItemFormData, value: string | number) => void;
    onAdd?: () => void;
    onRemove?: (index: number) => void;
    onProductSelect?: (index: number, product: Product | null) => void;
}

const ProductIcon = (
    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
);

export const OrderItemsSection: React.FC<ProductsListSectionProps> = ({
    mode,
    items,
    selectedProducts = [],
    errors = {},
    onChange,
    onAdd,
    onRemove,
    onProductSelect
}) => {
    // Helper function to get type label
    const getTypeLabel = (value: string): string => {
        const type = ITEM_TYPES.find(t => t.value === value);
        return type ? type.label : value;
    };

    if (mode === 'view') {
        // Tính tổng số lượng
        const totalQuantity = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

        return (
            <SectionCard
                title="Danh sách sản phẩm"
                icon={ProductIcon}
                iconGradient="from-teal-500 to-cyan-600"
            >
                {/* Header thống kê */}
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                                <span className="text-sm font-medium text-gray-700">Tổng số SKU:</span>
                                <span className="text-lg font-bold text-blue-600">{items.length}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                <span className="text-sm font-medium text-gray-700">Tổng số lượng:</span>
                                <span className="text-lg font-bold text-indigo-600">{totalQuantity}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Danh sách sản phẩm - layout giống edit mode */}
                <div className="space-y-4">
                    {items.map((item, index) => {
                        const product = selectedProducts[index];
                        
                        return (
                            <div 
                                key={index} 
                                className="p-5 border-2 border-gray-200 rounded-xl bg-gradient-to-br from-white to-gray-50"
                            >
                                {/* Header giống edit mode */}
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                        Sản phẩm #{index + 1}
                                    </h3>
                                </div>

                                {/* SKU và Hình ảnh - layout giống edit mode */}
                                <div className="mb-4">
                                    <div className="flex gap-3">
                                        {/* Product Image */}
                                        {product?.image_url && (
                                            <div className="flex-shrink-0">
                                                <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden border-2 border-blue-200 shadow-sm">
                                                    <img
                                                        src={product.image_url}
                                                        alt={product.title || item.sku}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.style.display = 'none';
                                                            const parent = target.parentElement;
                                                            if (parent) {
                                                                parent.innerHTML = `
                                                                    <div class="w-full h-full flex items-center justify-center bg-gray-100">
                                                                        <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                        </svg>
                                                                    </div>
                                                                `;
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* SKU và Title */}
                                        <div className="flex-1">
                                            <div className="px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-gray-50">
                                                {item.sku}
                                            </div>
                                            {product && (
                                                <div className="mt-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                                                    <div className="flex items-center gap-1.5">
                                                        <p className="text-xs text-blue-800 font-medium break-words" title={product.title}>
                                                            {product.title}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Size, Loại và Số lượng - layout giống edit mode */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Size */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                            </svg>
                                            Size
                                        </label>
                                        <div className="px-4 py-2.5 text-sm border border-blue-200 rounded-xl bg-blue-50 text-blue-900 font-semibold">
                                            {item.size || '-'}
                                        </div>
                                    </div>

                                    {/* Loại */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                            Loại
                                        </label>
                                        <div className="px-4 py-2.5 text-sm border border-purple-200 rounded-xl bg-purple-50 text-purple-900 font-semibold">
                                            {getTypeLabel(item.type) || '-'}
                                        </div>
                                    </div>

                                    {/* Số lượng */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                            </svg>
                                            Số lượng
                                        </label>
                                        <div className="px-4 py-2.5 text-base border border-green-200 rounded-xl bg-green-50 text-green-900 font-bold text-center">
                                            {item.quantity}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Empty state */}
                {items.length === 0 && (
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <p className="text-gray-500 font-medium">Chưa có sản phẩm nào</p>
                    </div>
                )}
            </SectionCard>
        );
    }

    // Edit mode
    return (
        <SectionCard
            title="Danh sách sản phẩm"
            icon={ProductIcon}
            iconGradient="from-teal-500 to-cyan-600"
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex-1">
                    {errors.items && (
                        <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-medium">{errors.items}</span>
                        </div>
                    )}
                </div>
                {onAdd && (
                    <button
                        type="button"
                        onClick={onAdd}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Thêm sản phẩm
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {items.map((item, index) => (
                    <OrderItemInput
                        key={index}
                        item={item}
                        index={index}
                        selectedProduct={selectedProducts[index] || null}
                        canRemove={items.length > 1}
                        errors={errors}
                        onChange={onChange || (() => {})}
                        onRemove={onRemove || (() => {})}
                        onProductSelect={onProductSelect || (() => {})}
                    />
                ))}
            </div>

            {/* Empty state trong edit mode */}
            {items.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p className="text-gray-500 font-medium mb-4">Chưa có sản phẩm nào</p>
                    {onAdd && (
                        <button
                            type="button"
                            onClick={onAdd}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Thêm sản phẩm đầu tiên
                        </button>
                    )}
                </div>
            )}
        </SectionCard>
    );
};
