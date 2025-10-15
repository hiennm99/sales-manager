// src/features/orders/components/sections/ProductsListSection.tsx

import React from 'react';
import { SectionCard } from '../shared/SectionCard';
import { OrderItem } from '../OrderItem';
import type { OrderItemFormData } from '../../../../types/order';
import type { Product } from '../../../../types/product';

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

export const ProductsListSection: React.FC<ProductsListSectionProps> = ({
                                                                            mode,
                                                                            items,
                                                                            selectedProducts = [],
                                                                            errors = {},
                                                                            onChange,
                                                                            onAdd,
                                                                            onRemove,
                                                                            onProductSelect
                                                                        }) => {
    if (mode === 'view') {
        return (
            <SectionCard
                title={`Sản phẩm (${items.length})`}
                icon={ProductIcon}
                iconGradient="from-teal-500 to-cyan-600"
            >
                <div className="space-y-4">
                    {items.map((item, index) => (
                        <div key={index} className="p-5 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all duration-200">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {item.sku}
                                        {item.size && <span className="text-blue-600"> • Size: {item.size}</span>}
                                        {item.type && <span className="text-purple-600"> • {item.type}</span>}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                        </svg>
                                        Số lượng: <strong>{item.quantity}</strong>
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-3 bg-purple-50 rounded-lg">
                                    <p className="text-xs text-gray-600 mb-1 font-medium">Giá VND</p>
                                    <p className="text-base font-bold text-gray-900">{item.unit_price_vnd.toLocaleString('vi-VN')} ₫</p>
                                </div>
                                <div className="p-3 bg-emerald-50 rounded-lg">
                                    <p className="text-xs text-gray-600 mb-1 font-medium">Tổng VND</p>
                                    <p className="text-base font-bold text-green-600">
                                        {(item.unit_price_vnd * item.quantity).toLocaleString('vi-VN')} ₫
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </SectionCard>
        );
    }

    return (
        <SectionCard
            title="Sản phẩm"
            icon={ProductIcon}
            iconGradient="from-teal-500 to-cyan-600"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                    {errors.items && (
                        <p className="text-sm text-red-600">{errors.items}</p>
                    )}
                </div>
                {onAdd && (
                    <button
                        type="button"
                        onClick={onAdd}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
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
                    <OrderItem
                        key={index}
                        item={item}
                        index={index}
                        selectedProduct={selectedProducts[index]}
                        canRemove={items.length > 1}
                        errors={errors}
                        onChange={onChange!}
                        onRemove={onRemove!}
                        onProductSelect={onProductSelect!}
                    />
                ))}
            </div>
        </SectionCard>
    );
};