// src/features/orders/pages/OrderList.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Banknote, DollarSign, Package } from "lucide-react";
import { useOrderStore } from '../store/useOrderStore';
import { useShopStore } from '../../shops/store/useShopStore';
import { useStatusStore } from '../../statuses/store/useStatusStore';
import { getStatusColorClasses } from '../../../types/status';
import {formatUSD, formatVND} from "../../../lib/utils.ts";
import { FilterBar } from '../../../components/ui/FilterBar';
import { SearchInput } from '../../../components/ui/SearchInput';
import { SelectFilter } from '../../../components/ui/SelectFilter';
import { StatGrid, StatCard } from "../../../components/ui/StatCard";
import { ConfirmModal } from "../../../components/modals";
import { OrderTable } from "../components";

export const OrderList: React.FC = () => {
    const navigate = useNavigate();
    const { orders, deleteOrder, fetchOrders } = useOrderStore();
    const { selectedShop } = useShopStore();
    const [ isDeleting ] = useState(false);
    const { 
        generalStatuses, 
        customerStatuses, 
        factoryStatuses, 
        deliveryStatuses,
        getGeneralStatusById,
        fetchAllStatuses 
    } = useStatusStore();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterGeneralStatus, setFilterGeneralStatus] = useState<number | 'all'>('all');
    const [filterCustomerStatus, setFilterCustomerStatus] = useState<number | 'all'>('all');
    const [filterFactoryStatus, setFilterFactoryStatus] = useState<number | 'all'>('all');
    const [filterDeliveryStatus, setFilterDeliveryStatus] = useState<number | 'all'>('all');
    const [sortBy, setSortBy] = useState('date-desc');
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

    useEffect(() => {
        fetchAllStatuses();
    }, [fetchAllStatuses]);

    useEffect(() => {
        if (selectedShop) {
            fetchOrders();
        }
    }, [selectedShop, fetchOrders]);

    // Filter and sort orders
    const filteredOrders = useMemo(() => {
        let filtered = orders;

        // Filter by shop
        if (selectedShop) {
            filtered = filtered.filter(order => order.shop_code === selectedShop.code);
        }

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(order =>
                order.order_id.toLowerCase().includes(term) ||
                order.customer_name.toLowerCase().includes(term) ||
                (order.customer_phone && order.customer_phone.toLowerCase().includes(term))
            );
        }

        // Filter by general status
        if (filterGeneralStatus !== 'all') {
            filtered = filtered.filter(order => order.general_status_id === filterGeneralStatus);
        }

        // Filter by customer status
        if (filterCustomerStatus !== 'all') {
            filtered = filtered.filter(order => order.customer_status_id === filterCustomerStatus);
        }

        // Filter by factory status
        if (filterFactoryStatus !== 'all') {
            filtered = filtered.filter(order => order.factory_status_id === filterFactoryStatus);
        }

        // Filter by delivery status
        if (filterDeliveryStatus !== 'all') {
            filtered = filtered.filter(order => order.delivery_status_id === filterDeliveryStatus);
        }

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'date-desc':
                    return new Date(b.order_date).getTime() - new Date(a.order_date).getTime();
                case 'date-asc':
                    return new Date(a.order_date).getTime() - new Date(b.order_date).getTime();
                case 'total-desc':
                    return (b.order_earnings_usd || 0) - (a.order_earnings_usd || 0);
                case 'total-asc':
                    return (a.order_earnings_usd || 0) - (b.order_earnings_usd || 0);
                case 'earnings-desc':
                    return (b.order_earnings_usd || 0) - (a.order_earnings_usd || 0);
                default:
                    return 0;
            }
        });

        return filtered;
    }, [orders, searchTerm, filterGeneralStatus, filterCustomerStatus, filterFactoryStatus, filterDeliveryStatus, sortBy, selectedShop]);

    const sortOptions = [
        { value: 'date-desc', label: 'Mới nhất' },
        { value: 'date-asc', label: 'Cũ nhất' },
        { value: 'total-desc', label: 'Doanh thu cao' },
        { value: 'total-asc', label: 'Doanh thu thấp' },
        { value: 'earnings-desc', label: 'Thu nhập cao' }
    ];

    // Calculate totals
    const totals = useMemo(() => {
        return {
            orders: filteredOrders.length,
            earnings_usd: filteredOrders.reduce((sum, o) => sum + (o.order_earnings_usd || 0), 0),
            earnings_vnd: filteredOrders.reduce((sum, o) => sum + (o.order_earnings_vnd || 0), 0),
        };
    }, [filteredOrders]);

    const handleSelectOrder = (orderId: string) => {
        setSelectedOrders(prev =>
            prev.includes(orderId)
                ? prev.filter(id => id !== orderId)
                : [...prev, orderId]
        );
    };

    const handleSelectAll = () => {
        if (selectedOrders.length === filteredOrders.length) {
            setSelectedOrders([]);
        } else {
            setSelectedOrders(filteredOrders.map(o => o.id.toString()));
        }
    };

    const handleDeleteOrder = async (orderId: string) => {
        setDeleteTarget(orderId);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (deleteTarget) {
            try {
                await deleteOrder(deleteTarget);
                setSelectedOrders(prev => prev.filter(id => id !== deleteTarget));
                setShowDeleteConfirm(false);
                setDeleteTarget(null);
            } catch (error) {
                console.error('Failed to delete order:', error);
                alert('Có lỗi xảy ra khi xóa đơn hàng!');
            }
        }
    };

    const getStatusBadge = (statusId: number | null | undefined) => {
        const status = getGeneralStatusById(statusId || null);
        if (!status) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Không xác định
                </span>
            );
        }

        const colors = getStatusColorClasses(status.color);
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                {status.name_vi}
            </span>
        );
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
        setDeleteTarget(null);
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Danh sách đơn hàng</h1>
                    <p className="text-gray-600 mt-1">
                        {selectedShop ? `Cửa hàng: ${selectedShop.name}` : 'Vui lòng chọn cửa hàng'}
                    </p>
                </div>
                <button
                    onClick={() => navigate('/orders/create')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Tạo đơn hàng
                </button>
            </div>

            {/* Stats Cards */}
            <StatGrid>
                <StatCard
                    title="Tổng đơn hàng"
                    value={totals.orders}
                    icon={<Package />}
                />
                <StatCard
                    title="Tổng thu nhập (USD)"
                    value={formatUSD(totals.earnings_usd)}
                    icon={<DollarSign />}
                    className="text-green-600"
                />
                <StatCard
                    title="Tổng thu nhập (VND)"
                    value={formatVND(totals.earnings_vnd)}
                    icon={< Banknote />}
                    className="text-green-600 text-2xl"
                />
            </StatGrid>

            {/* Filters and Search */}
            <FilterBar>
                <SearchInput
                    placeholder="Tìm kiếm theo mã đơn, tên khách, SĐT..."
                    value={searchTerm}
                    onChange={setSearchTerm}
                    className="lg:col-span-3"
                />

                <SelectFilter
                    label="Trạng thái tổng quan"
                    value={filterGeneralStatus}
                    onChange={(val) => setFilterGeneralStatus(val === 'all' ? 'all' : parseInt(val as string))}
                    options={generalStatuses.map(s => ({ value: s.id, label: s.name_vi }))}
                />

                <SelectFilter
                    label="Trạng thái khách hàng"
                    value={filterCustomerStatus}
                    onChange={(val) => setFilterCustomerStatus(val === 'all' ? 'all' : parseInt(val as string))}
                    options={customerStatuses.map(s => ({ value: s.id, label: s.name_vi }))}
                />

                <SelectFilter
                    label="Trạng thái nhà máy"
                    value={filterFactoryStatus}
                    onChange={(val) => setFilterFactoryStatus(val === 'all' ? 'all' : parseInt(val as string))}
                    options={factoryStatuses.map(s => ({ value: s.id, label: s.name_vi }))}
                />

                <SelectFilter
                    label="Trạng thái giao hàng"
                    value={filterDeliveryStatus}
                    onChange={(val) => setFilterDeliveryStatus(val === 'all' ? 'all' : parseInt(val as string))}
                    options={deliveryStatuses.map(s => ({ value: s.id, label: s.name_vi }))}
                />

                <SelectFilter
                    label="Sắp xếp"
                    value={sortBy}
                    onChange={(val) => setSortBy(val as string)}
                    options={sortOptions}
                />
            </FilterBar>

            {/* 2. Sử dụng OrderTable và truyền props */}
            <OrderTable
                orders={filteredOrders}
                selectedOrders={selectedOrders}
                onSelectOrder={handleSelectOrder}
                onSelectAll={handleSelectAll}
                onDeleteOrder={handleDeleteOrder}
                getStatusBadge={getStatusBadge}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={showDeleteConfirm}
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
                isLoading={isDeleting}
                variant="delete"
                title="Xác nhận xóa đơn hàng"
                message="Bạn có chắc chắn muốn xóa đơn hàng này? Hành động này không thể hoàn tác."
                confirmText="Xóa"
                cancelText="Hủy"
            />
        </div>
    );
};
