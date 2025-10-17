// src/features/orders/components/OrderItemInput.tsx
/**
 * OrderItemInput - Component for individual product item in order
 * Refactored to use common TextBox and OptionBox components
 */

import React from 'react';
import type { OrderItemFormData } from '../../../../types/order.ts';
import type { Product } from '../../../../types/product.ts';
import { ProductAutocomplete } from '../../../../components/common';
import { TextBox, OptionBox, type Option } from '../../../../components/common';
import { ITEM_TYPES } from '../../constants/orderDefaults.ts';

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

export const OrderItemInput: React.FC<OrderItemProps> = ({
    item,
    index,
    selectedProduct,
    canRemove,
    errors,
    onChange,
    onRemove,
    onProductSelect,
}) => {
    // Convert ITEM_TYPES to Option format
    const typeOptions: Option[] = [
        { value: '', label: 'Chọn loại' },
        ...ITEM_TYPES.map(type => ({
            value: type.value,
            label: type.label
        }))
    ];

    // Handler wrapper for TextBox/OptionBox
    const handleChange = (field: keyof OrderItemFormData) => (_name:string, value: string | number) => {
        onChange(index, field, value);
    };

    // Get safe value for unit_price_usd (handle undefined)
    const unitPriceValue = typeof item.unit_price_usd === 'number' ? item.unit_price_usd : 0;

    return (
        <div className="p-5 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-all duration-200 bg-gradient-to-br from-white to-gray-50">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    Sản phẩm #{index + 1}
                </h3>
                {canRemove && (
                    <button
                        type="button"
                        onClick={() => onRemove(index)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                        title="Xóa sản phẩm"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                )}
            </div>

            {/* SKU và Hình ảnh sản phẩm */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKU <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                    {/* Product Image */}
                    {selectedProduct && selectedProduct.image_url && (
                        <div className="flex-shrink-0">
                            <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden border-2 border-blue-200 shadow-sm">
                                <img
                                    src={selectedProduct.image_url}
                                    alt={selectedProduct.title}
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
                            className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                                errors[`item_sku_${index}`] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                            error={errors[`item_sku_${index}`]}
                        />
                        {/* Product Title */}
                        {selectedProduct && (
                            <div className="mt-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
                                <div className="flex items-center gap-1.5">
                                    <p className="text-xs text-blue-800 font-medium break-words" title={selectedProduct.title}>
                                        {selectedProduct.title}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Size, Loại, Số lượng và Giá */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <TextBox
                    label="Size"
                    name={`size_${index}`}
                    value={item.size}
                    editable={true}
                    required
                    placeholder="51x102cm"
                    onChange={handleChange('size')}
                />

                <OptionBox
                    label="Loại"
                    name={`type_${index}`}
                    value={item.type}
                    options={typeOptions}
                    editable={true}
                    required
                    onChange={handleChange('type')}
                />

                <TextBox
                    label="Số lượng"
                    name={`quantity_${index}`}
                    type="number"
                    value={item.quantity}
                    editable={true}
                    required
                    min={1}
                    error={errors[`item_quantity_${index}`]}
                    onChange={handleChange('quantity')}
                />

                <TextBox
                    label="Giá đơn vị (USD)"
                    name={`unit_price_usd_${index}`}
                    type="number"
                    value={unitPriceValue}
                    editable={true}
                    placeholder="Nhập giá..."
                    min={0}
                    error={errors[`item_unit_price_${index}`]}
                    onChange={handleChange('unit_price_usd')}
                />
            </div>
        </div>
    );
};
