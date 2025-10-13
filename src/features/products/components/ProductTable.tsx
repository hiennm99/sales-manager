// src/features/products/components/ProductTable.tsx

import React, { useState } from 'react';
import { cn } from '../../../lib/utils';
import type { Product } from '../../../types/product';
import { useProductStore } from '../store/useProductStore';

interface ProductTableProps {
    products: Product[];
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onView: (id: string) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
                                                              products,
                                                              onEdit,
                                                              onDelete,
                                                              onView
                                                          }) => {
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [showMenuId, setShowMenuId] = useState<string | null>(null);
    const { toggleProductStatus } = useProductStore();

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedProducts(products.map(p => p.id));
        } else {
            setSelectedProducts([]);
        }
    };

    const handleSelectProduct = (id: string) => {
        setSelectedProducts(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const handleToggleStatus = async (id: string) => {
        try {
            await toggleProductStatus(id);
            setShowMenuId(null);
        } catch (error) {
            console.error('Failed to toggle status:', error);
        }
    };

    const handleDelete = (id: string, title: string) => {
        if (window.confirm(`Bạn có chắc muốn xóa "${title}"?`)) {
            onDelete(id);
        }
        setShowMenuId(null);
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).format(date);
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="w-12 px-4 py-3 text-left">
                            <input
                                type="checkbox"
                                checked={selectedProducts.length === products.length && products.length > 0}
                                onChange={handleSelectAll}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Hình ảnh
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Thông tin
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            SKU
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Trạng thái
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ngày tạo
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Thao tác
                        </th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {products.map((product) => (
                        <tr
                            key={product.id}
                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => onView(product.id)}
                        >
                            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                <input
                                    type="checkbox"
                                    checked={selectedProducts.includes(product.id)}
                                    onChange={() => handleSelectProduct(product.id)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                            </td>
                            <td className="px-4 py-3">
                                <img
                                    src={product.image_url}
                                    alt={product.title}
                                    className="w-16 h-16 object-cover rounded-lg"
                                    onError={(e) => {
                                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"%3E%3Cpath stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"%3E%3C/path%3E%3C/svg%3E';
                                    }}
                                />
                            </td>
                            <td className="px-4 py-3">
                                <div className="max-w-xs">
                                    <p className="font-medium text-gray-900 truncate">
                                        {product.title}
                                    </p>
                                    <a
                                        href={product.etsy_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                                    >
                                        <span>Xem trên Etsy</span>
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                    <span className="text-sm font-mono text-gray-600">
                                        {product.sku}
                                    </span>
                            </td>
                            <td className="px-4 py-3">
                                    <span
                                        className={cn(
                                            'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                                            product.status === 'active'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                        )}
                                    >
                                        {product.status === 'active' ? 'Hoạt động' : 'Tạm ngưng'}
                                    </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                                {formatDate(product.created_at)}
                            </td>
                            <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="relative inline-block">
                                    <button
                                        onClick={() => setShowMenuId(showMenuId === product.id ? null : product.id)}
                                        className="p-1 hover:bg-gray-100 rounded"
                                    >
                                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                        </svg>
                                    </button>

                                    {showMenuId === product.id && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setShowMenuId(null)}
                                            />
                                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                                                <button
                                                    onClick={() => onView(product.id)}
                                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    Xem chi tiết
                                                </button>
                                                <button
                                                    onClick={() => onEdit(product.id)}
                                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Chỉnh sửa
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(product.id)}
                                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                                    </svg>
                                                    {product.status === 'active' ? 'Tạm ngưng' : 'Kích hoạt'}
                                                </button>
                                                <hr className="my-1" />
                                                <button
                                                    onClick={() => handleDelete(product.id, product.title)}
                                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Xóa
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Bulk Actions */}
            {selectedProducts.length > 0 && (
                <div className="bg-blue-50 border-t border-blue-200 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-900">
                            Đã chọn {selectedProducts.length} sản phẩm
                        </span>
                        <div className="flex gap-2">
                            <button className="px-3 py-1.5 text-sm bg-white border border-blue-200 text-blue-700 rounded hover:bg-blue-50">
                                Xuất file
                            </button>
                            <button className="px-3 py-1.5 text-sm bg-white border border-blue-200 text-blue-700 rounded hover:bg-blue-50">
                                Thay đổi trạng thái
                            </button>
                            <button className="px-3 py-1.5 text-sm bg-white border border-red-200 text-red-700 rounded hover:bg-red-50">
                                Xóa tất cả
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};