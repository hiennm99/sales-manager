// src/features/orders/components/OrderItem.tsx

import React from 'react';
import type { OrderItemFormData } from '../../../types/order';
import type { Product } from '../../../types/product';
import { ProductAutocomplete } from '../../../components/common/ProductAutocomplete';
import { ITEM_TYPES } from '../constants/orderDefaults';

interface OrderItemProps {
    item: OrderItemFormData;
    index: number;
    selectedProduct: Product | null;
    canRemove: boolean;
    errors: Record<string, string>;
    onChange: (index: number, field: keyof OrderItemFormData, value: string | number) => void;
    onRemove: (index: number) => void;
    onProductSelect: (index: number, product: Product | null) => void;
}

export const OrderItem: React.FC<OrderItemProps> = ({
                                                        item,
                                                        index,
                                                        selectedProduct,
                                                        canRemove,
                                                        errors,
                                                        onChange,
                                                        onRemove,
                                                        onProductSelect,
                                                    }) => {
    return (
        <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">Sản phẩm #{index + 1}</h3>
                {canRemove && (
                    <button
                        type="button"
                        onClick={() => onRemove(index)}
                        className="text-red-600 hover:text-red-700"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                )}
            </div>

            {/* SKU và Hình ảnh sản phẩm */}
            <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                    SKU <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                    {/* Product Image */}
                    {selectedProduct && (
                        <div className="flex-shrink-0">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border-2 border-blue-200">
                                {selectedProduct.image_url ? (
                                    <img
                                        src={selectedProduct.image_url}
                                        alt={selectedProduct.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Autocomplete Input */}
                    <div className="flex-1">
                        <ProductAutocomplete
                            value={item.sku}
                            onChange={(value, product) => {
                                onChange(index, 'sku', value);
                                if (!product) {
                                    onProductSelect(index, null);
                                }
                            }}
                            onSelect={(product: Product) => {
                                onChange(index, 'sku', product.sku);
                                onProductSelect(index, product);
                            }}
                            placeholder="Nhập SKU hoặc tên sản phẩm..."
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors[`item_sku_${index}`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                            error={errors[`item_sku_${index}`]}
                        />
                        {/* Product Title */}
                        {selectedProduct && (
                            <p className="mt-1 text-xs text-gray-600 truncate" title={selectedProduct.title}>
                                {selectedProduct.title}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Size, Loại và Số lượng trên cùng 1 hàng */}
            <div className="grid grid-cols-3 gap-3">
                {/* Size */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Size <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={item.size}
                        onChange={(e) => onChange(index, 'size', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Type */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Loại <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={item.type}
                        onChange={(e) => onChange(index, 'type', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Chọn loại</option>
                        {ITEM_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Quantity */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Số lượng <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => onChange(index, 'quantity', parseInt(e.target.value) || 0)}
                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors[`item_quantity_${index}`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors[`item_quantity_${index}`] && (
                        <p className="mt-1 text-xs text-red-600">{errors[`item_quantity_${index}`]}</p>
                    )}
                </div>
            </div>
        </div>
    );
};