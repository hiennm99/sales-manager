// features/shops/pages/ShopList.tsx

import React, { useEffect, useState } from 'react';
import { useShopStore } from '../store/useShopStore';
import { ShopCard } from '../components/ShopCard';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Breadcrumbs } from '../../../components/layout/Breadcrumbs';
import { Selector } from '../../../components/ui/Selector';

export const ShopList: React.FC = () => {
    const { shops, isLoading, error, fetchShops } = useShopStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        fetchShops();
    }, []);

    // Filter shops
    const filteredShops = shops.filter(shop => {
        const matchesSearch =
            shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            shop.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            shop.address.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || shop.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div>
            <Breadcrumbs
                items={[
                    { label: 'Trang chủ', path: '/dashboard' },
                    { label: 'Cửa hàng' },
                ]}
            />

            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Quản lý cửa hàng</h1>
                        <p className="text-gray-600 mt-1">
                            Tổng số: <span className="font-semibold">{filteredShops.length}</span> cửa hàng
                        </p>
                    </div>
                    <Button
                        leftIcon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        }
                    >
                        Thêm cửa hàng
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex gap-4">
                    <div className="flex-1 max-w-md">
                        <Input
                            placeholder="Tìm kiếm theo tên, mã hoặc địa chỉ..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            leftIcon={
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            }
                        />
                    </div>
                    <div className="w-48">
                        <Selector
                            value={statusFilter}
                            onChange={setStatusFilter}
                            options={[
                                { value: 'all', label: 'Tất cả trạng thái' },
                                { value: 'active', label: 'Hoạt động' },
                                { value: 'inactive', label: 'Tạm ngưng' },
                            ]}
                        />
                    </div>
                </div>
            </div>

            {/* Error message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                </div>
            )}

            {/* Loading state */}
            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-gray-600">Đang tải danh sách cửa hàng...</p>
                    </div>
                </div>
            ) : filteredShops.length === 0 ? (
                <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Không tìm thấy cửa hàng
                    </h3>
                    <p className="text-gray-600">
                        {searchQuery || statusFilter !== 'all'
                            ? 'Thử thay đổi bộ lọc để xem thêm kết quả'
                            : 'Hãy thêm cửa hàng đầu tiên của bạn'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredShops.map(shop => (
                        <ShopCard key={shop.id} shop={shop} />
                    ))}
                </div>
            )}
        </div>
    );
};