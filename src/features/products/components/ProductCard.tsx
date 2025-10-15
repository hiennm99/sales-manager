// src/features/products/components/ProductCard.tsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../../../lib/utils';
import type { Product } from '../../../types/product';
import { useProductStore } from '../store/useProductStore';

interface ProductCardProps {
    product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const navigate = useNavigate();
    const [ showMenu, setShowMenu ] = useState(false);
    const [ imageError, setImageError ] = useState(false);
    const { toggleProductStatus, deleteProduct } = useProductStore();

    const handleToggleStatus = async (e: React.MouseEvent) => {
        e.preventDefault();
        try {
            await toggleProductStatus(product.id.toString());
        } catch (error) {
            console.error('Failed to toggle status:', error);
            alert('Không thể thay đổi trạng thái. Vui lòng thử lại!');
        }
        setShowMenu(false);
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.preventDefault();
        navigate(`/products/${product.id}/edit`);
        setShowMenu(false);
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (window.confirm(`Bạn có chắc muốn xóa "${product.title}"?`)) {
            try {
                await deleteProduct(product.id.toString());
            } catch (error) {
                console.error('Failed to delete product:', error);
                alert('Không thể xóa sản phẩm. Vui lòng thử lại!');
            }
        }
        setShowMenu(false);
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            <Link to={`/products/${product.id}`} className="block">
                {/* Image */}
                <div className="relative aspect-square bg-gray-100">
                    {!imageError ? (
                        <img
                            src={product.image_url}
                            alt={product.title}
                            className="w-full h-full object-cover"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-2 left-2">
                        <span
                            className={cn(
                                'px-2 py-1 text-xs font-medium rounded-full',
                                product.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                            )}
                        >
                            {product.status === 'active' ? 'Hoạt động' : 'Tạm ngưng'}
                        </span>
                    </div>

                    {/* Quick Actions */}
                    <div className="absolute top-2 right-2">
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    setShowMenu(!showMenu);
                                }}
                                className="p-1.5 bg-white rounded-full shadow-md hover:bg-gray-50"
                            >
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                            </button>

                            {showMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setShowMenu(false);
                                        }}
                                    />
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                                        <button
                                            onClick={handleEdit}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Chỉnh sửa
                                        </button>
                                        <button
                                            onClick={handleToggleStatus}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                            </svg>
                                            {product.status === 'active' ? 'Tạm ngưng' : 'Kích hoạt'}
                                        </button>
                                        <hr className="my-1" />
                                        <button
                                            onClick={handleDelete}
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
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    <div className="text-xs text-gray-500 mb-1">SKU: {product.sku}</div>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 h-12">
                        {product.title}
                    </h3>

                    {/* Etsy Link */}
                    <a
                        href={product.etsy_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                        <span>Xem trên Etsy</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                </div>
            </Link>
        </div>
    );
};