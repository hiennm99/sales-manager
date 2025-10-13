// features/shops/pages/ShopDetail.tsx

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShopStore } from '../store/useShopStore';
import { useAppStore } from '../../../store/useAppStore';
import { Breadcrumbs } from '../../../components/layout/Breadcrumbs';
import { Button } from '../../../components/ui/Button';
import { cn, formatDateTime } from '../../../lib/utils';

export const ShopDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { selectedShop, isLoading, error, fetchShopById } = useShopStore();
    const { currentShop, setCurrentShop } = useAppStore();

    useEffect(() => {
        if (id) {
            fetchShopById(id);
        }
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-600">Đang tải thông tin cửa hàng...</p>
                </div>
            </div>
        );
    }

    if (error || !selectedShop) {
        return (
            <div className="text-center py-12">
                <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Không tìm thấy cửa hàng
                </h3>
                <Button onClick={() => navigate('/shops')}>
                    Quay lại danh sách
                </Button>
            </div>
        );
    }

    const isCurrentShop = currentShop?.id === selectedShop.id;

    return (
        <div>
            <Breadcrumbs
                items={[
                    { label: 'Trang chủ', path: '/dashboard' },
                    { label: 'Cửa hàng', path: '/shops' },
                    { label: 'Sản phẩm', path: '/products' },
                    { label: 'Đơn hàng', path: '/orders' },
                    { label: 'Nhân viên', path: '/employees' },
                    { label: selectedShop.name },
                ]}
            />

            {/* Header */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-start gap-6">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        {selectedShop.logo ? (
                            <img
                                src={selectedShop.logo}
                                alt={selectedShop.name}
                                className="w-24 h-24 rounded-lg border-2 border-gray-200"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white">
                                {selectedShop.name.charAt(0)}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                                    {selectedShop.name}
                                </h1>
                                <p className="text-gray-600">Mã: {selectedShop.code}</p>
                            </div>
                            <span
                                className={cn(
                                    'px-3 py-1 rounded-full text-sm font-semibold',
                                    selectedShop.status === 'active'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-700'
                                )}
                            >
                {selectedShop.status === 'active' ? 'Hoạt động' : 'Tạm ngưng'}
              </span>
                        </div>
                        {/* Actions */}
                        <div className="flex gap-3">
                            <Button
                                variant={isCurrentShop ? 'primary' : 'outline'}
                                onClick={() => setCurrentShop(selectedShop)}
                                leftIcon={
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                }
                            >
                                {isCurrentShop ? 'Cửa hàng hiện tại' : 'Chọn cửa hàng này'}
                            </Button>
                            <Button variant="outline">
                                Chỉnh sửa
                            </Button>
                            <Button variant="danger">
                                Xóa
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detail Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Thông tin hệ thống */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Thông tin hệ thống</h2>
                    <div className="space-y-4">
                        <div>
                            <div className="text-sm text-gray-600 mb-1">Ngày tạo</div>
                            <div className="text-gray-900">{formatDateTime(selectedShop.createdAt)}</div>
                        </div>

                        <div>
                            <div className="text-sm text-gray-600 mb-1">Cập nhật lần cuối</div>
                            <div className="text-gray-900">{formatDateTime(selectedShop.updatedAt)}</div>
                        </div>

                        <div>
                            <div className="text-sm text-gray-600 mb-1">ID</div>
                            <div className="text-gray-900 font-mono text-sm">{selectedShop.id}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};