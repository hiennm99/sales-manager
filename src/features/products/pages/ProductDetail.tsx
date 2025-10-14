// src/features/products/pages/ProductDetail.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cn } from '../../../lib/utils';
import { useProductStore } from '../store/useProductStore';
import { Breadcrumbs } from "../../../components/layout/Breadcrumbs.tsx";
import { getProductStatusLabel } from '../../../types/product';

export const ProductDetail: React.FC = () => {
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();
    const { getProductById, toggleProductStatus, deleteProduct, selectedProduct, setSelectedProduct } = useProductStore();

    const [product, setProduct] = useState(productId ? getProductById(productId) : undefined);
    const [imageError, setImageError] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        if (productId) {
            const foundProduct = getProductById(productId);
            if (foundProduct) {
                setSelectedProduct(foundProduct);
                setProduct(foundProduct);
            }
        }
    }, [productId, getProductById, setSelectedProduct]);

    if (!productId || !product) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Không tìm thấy sản phẩm
                    </h3>
                    <p className="text-gray-600 mb-4">
                        Sản phẩm không tồn tại hoặc đã bị xóa
                    </p>
                    <button
                        onClick={() => navigate('/products')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }

    const handleToggleStatus = async () => {
        if (!productId) return;
        try {
            await toggleProductStatus(productId);
            const updatedProduct = getProductById(productId);
            if (updatedProduct) {
                setProduct(updatedProduct);
            }
        } catch (error) {
            console.error('Failed to toggle status:', error);
            alert('Không thể thay đổi trạng thái. Vui lòng thử lại!');
        }
    };

    const handleDelete = async () => {
        if (!productId) return;
        try {
            await deleteProduct(productId);
            setShowDeleteModal(false);
            navigate('/products');
        } catch (error) {
            console.error('Failed to delete product:', error);
            alert('Không thể xóa sản phẩm. Vui lòng thử lại!');
        }
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Breadcrumbs
                items={[
                    { label: 'Trang chủ', path: '/dashboard' },
                    { label: 'Sản phẩm', path: '/products' },
                    { label: selectedProduct?.sku }
                ]}
            />
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <button
                        onClick={() => navigate('/products')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-900">Chi tiết sản phẩm</h1>
                        <p className="text-gray-600 mt-1">Xem thông tin chi tiết sản phẩm</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleToggleStatus}
                            className={cn(
                                'px-4 py-2 rounded-lg font-medium transition-colors',
                                product.is_active
                                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                            )}
                        >
                            {product.is_active ? 'Tạm ngưng' : 'Kích hoạt'}
                        </button>
                        <button
                            onClick={() => navigate(`/products/${productId}/edit`)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Chỉnh sửa
                        </button>
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Xóa
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Image */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden sticky top-4">
                        <div className="aspect-square bg-gray-100">
                            {!imageError ? (
                                <img
                                    src={product.image_url}
                                    alt={product.title}
                                    className="w-full h-full object-cover"
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        <div className="p-4">
                            <a
                                href={product.etsy_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                            >
                                <span>Xem trên Etsy</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Right Column - Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Thông tin cơ bản
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-start">
                                <div className="w-32 text-sm font-medium text-gray-500">SKU</div>
                                <div className="flex-1">
                                    <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-md font-mono text-sm">
                                        {product.sku}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="w-32 text-sm font-medium text-gray-500">Tên sản phẩm</div>
                                <div className="flex-1">
                                    <p className="text-gray-900 font-medium">{product.title}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="w-32 text-sm font-medium text-gray-500">Trạng thái</div>
                                <div className="flex-1">
                                    <span
                                        className={cn(
                                            'inline-flex items-center px-3 py-1 text-sm font-medium rounded-full',
                                            product.is_active
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                        )}
                                    >
                                        <span className={cn(
                                            'w-2 h-2 rounded-full mr-2',
                                            product.is_active ? 'bg-green-500' : 'bg-gray-500'
                                        )}></span>
                                        {getProductStatusLabel(product.is_active)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="w-32 text-sm font-medium text-gray-500">Link Etsy</div>
                                <div className="flex-1">
                                    <a
                                        href={product.etsy_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-700 hover:underline break-all"
                                    >
                                        {product.etsy_url}
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="w-32 text-sm font-medium text-gray-500">Link hình ảnh</div>
                                <div className="flex-1">
                                    <a
                                        href={product.image_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-700 hover:underline break-all"
                                    >
                                        {product.image_url}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timestamps */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Thông tin khác
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-center">
                                <div className="w-32 text-sm font-medium text-gray-500">Ngày tạo</div>
                                <div className="flex-1 text-gray-900">
                                    {formatDate(product.created_at)}
                                </div>
                            </div>

                            <div className="flex items-center">
                                <div className="w-32 text-sm font-medium text-gray-500">Cập nhật lần cuối</div>
                                <div className="flex-1 text-gray-900">
                                    {formatDate(product.updated_at)}
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Activity Log */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Lịch sử hoạt động
                        </h2>

                        <div className="space-y-3">
                            <div className="flex gap-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">Cập nhật sản phẩm</p>
                                    <p className="text-sm text-gray-500">{formatDate(product.updated_at)}</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">Tạo sản phẩm</p>
                                    <p className="text-sm text-gray-500">{formatDate(product.created_at)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Xác nhận xóa</h3>
                                <p className="text-sm text-gray-600">Hành động này không thể hoàn tác</p>
                            </div>
                        </div>

                        <p className="text-gray-700 mb-6">
                            Bạn có chắc chắn muốn xóa sản phẩm <strong>"{product.title}"</strong>? Tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn.
                        </p>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Xóa sản phẩm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};