// src/features/orders/pages/OrderList.tsx
/**
 * OrderList - Refactored with Zustand selectors
 * Optimized to reduce unnecessary re-renders
 */

import { ConfirmModal } from "@components";
import { FilterBar, SearchInput, StatCard, StatGrid } from "@components/ui";
import { SelectFilter } from "@components/ui/SelectFilter";
import { getStatusColorClasses } from "@types";
import React, { useEffect, useMemo, useState } from "react";
import { FiDollarSign, FiPackage } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { formatUSD, formatVND } from "../../../lib/utils.ts";
import { useShopStore } from "../../shops/store/useShopStore";
import { useStatusSelectors, useStatusStore } from "../../statuses/store/useStatusStore";
import { OrderCardView, OrderTable } from "../components";
import { useOrderStore } from "../store/useOrderStore";

export const OrderList: React.FC = () => {
  const navigate = useNavigate();

  // ✅ OPTIMIZED: Use selective subscriptions instead of whole stores
  // Old: const { orders, deleteOrder, fetchOrders, initializeDraftForCreate } = useOrderStore();
  const orders = useOrderStore((state) => state.orders);
  const deleteOrder = useOrderStore((state) => state.deleteOrder);
  const fetchOrders = useOrderStore((state) => state.fetchOrders);
  const initializeDraftForCreate = useOrderStore(
    (state) => state.initializeDraftForCreate
  );

  // ✅ OPTIMIZED: Only subscribe to selectedShop
  const selectedShop = useShopStore((state) => state.selectedShop);

  const [isDeleting] = useState(false);

  // ✅ OPTIMIZED: Use predefined selectors to avoid re-renders
  const generalStatuses = useStatusSelectors.useGeneralStatuses();
  const customerStatuses = useStatusSelectors.useCustomerStatuses();
  const factoryStatuses = useStatusSelectors.useFactoryStatuses();
  const deliveryStatuses = useStatusSelectors.useDeliveryStatuses();
  const getGeneralStatusById = useStatusStore(
    (state) => state.getGeneralStatusById
  );
  const fetchAllStatuses = useStatusStore((state) => state.fetchAllStatuses);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterGeneralStatus, setFilterGeneralStatus] = useState<
    number | "all"
  >("all");
  const [filterCustomerStatus, setFilterCustomerStatus] = useState<
    number | "all"
  >("all");
  const [filterFactoryStatus, setFilterFactoryStatus] = useState<
    number | "all"
  >("all");
  const [filterDeliveryStatus, setFilterDeliveryStatus] = useState<
    number | "all"
  >("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [viewMode] = useState<"table" | "card">("table");

  useEffect(() => {
    fetchAllStatuses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // fetchAllStatuses is stable from Zustand stores

  useEffect(() => {
    if (selectedShop) {
      fetchOrders();
      // Always initialize draft state when entering /orders page
      initializeDraftForCreate(selectedShop.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedShop]); // fetchOrders and initializeDraftForCreate are stable from Zustand stores

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Filter by shop
    if (selectedShop) {
      filtered = filtered.filter((order) => order.shop_id === selectedShop.id);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.order_id.toLowerCase().includes(term) ||
          order.customer_name.toLowerCase().includes(term) ||
          (order.customer_phone &&
            order.customer_phone.toLowerCase().includes(term))
      );
    }

    // Filter by general status
    if (filterGeneralStatus !== "all") {
      filtered = filtered.filter(
        (order) => order.general_status_id === filterGeneralStatus
      );
    }

    // Filter by customer status
    if (filterCustomerStatus !== "all") {
      filtered = filtered.filter(
        (order) => order.customer_status_id === filterCustomerStatus
      );
    }

    // Filter by factory status
    if (filterFactoryStatus !== "all") {
      filtered = filtered.filter(
        (order) => order.factory_status_id === filterFactoryStatus
      );
    }

    // Filter by delivery status
    if (filterDeliveryStatus !== "all") {
      filtered = filtered.filter(
        (order) => order.delivery_status_id === filterDeliveryStatus
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return (
            new Date(b.order_date).getTime() - new Date(a.order_date).getTime()
          );
        case "date-asc":
          return (
            new Date(a.order_date).getTime() - new Date(b.order_date).getTime()
          );
        case "total-desc":
          return (b.order_earnings_usd || 0) - (a.order_earnings_usd || 0);
        case "total-asc":
          return (a.order_earnings_usd || 0) - (b.order_earnings_usd || 0);
        case "earnings-desc":
          return (b.order_earnings_usd || 0) - (a.order_earnings_usd || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [
    orders,
    searchTerm,
    filterGeneralStatus,
    filterCustomerStatus,
    filterFactoryStatus,
    filterDeliveryStatus,
    sortBy,
    selectedShop
  ]);

  const sortOptions = [
    { value: "date-desc", label: "Mới nhất" },
    { value: "date-asc", label: "Cũ nhất" },
    { value: "total-desc", label: "Doanh thu cao" },
    { value: "total-asc", label: "Doanh thu thấp" },
    { value: "earnings-desc", label: "Thu nhập cao" }
  ];

  // Calculate totals
  const totals = useMemo(() => {
    return {
      orders: filteredOrders.length,
      earnings_usd: filteredOrders.reduce(
        (sum, o) => sum + (o.order_earnings_usd || 0),
        0
      ),
      earnings_vnd: filteredOrders.reduce(
        (sum, o) => sum + (o.order_earnings_vnd || 0),
        0
      )
    };
  }, [filteredOrders]);

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map((o) => o.id.toString()));
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    setDeleteTarget(orderId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      try {
        if (deleteTarget === "bulk") {
          // Handle bulk delete
          for (const orderId of selectedOrders) {
            await deleteOrder(orderId);
          }
          setSelectedOrders([]);
        } else {
          // Handle single delete
          await deleteOrder(deleteTarget);
          setSelectedOrders((prev) => prev.filter((id) => id !== deleteTarget));
        }
        setShowDeleteConfirm(false);
        setDeleteTarget(null);
      } catch (error) {
        console.error("Failed to delete order:", error);
        alert("Có lỗi xảy ra khi xóa đơn hàng!");
      }
    }
  };

  const getStatusBadge = (statusId: number | null | undefined) => {
    const status = getGeneralStatusById(statusId || null);
    if (!status) {
      return (
        <span
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Không xác định
        </span>
      );
    }

    const colors = getStatusColorClasses(status.color);
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
      >
        {status.name_vi}
      </span>
    );
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
  };

  return (
    <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Danh sách đơn hàng
          </h1>
        </div>
        <button
          onClick={() => navigate("/orders/create")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Tạo đơn hàng
        </button>
      </div>

      {/* Stats Cards */}
      <StatGrid>
        <StatCard
          title="Tổng đơn hàng"
          value={totals.orders}
          icon={<FiPackage />}
        />
        <StatCard
          title="Tổng thu nhập (USD)"
          value={formatUSD(totals.earnings_usd)}
          icon={<FiDollarSign />}
          className="text-green-600"
        />
        <StatCard
          title="Tổng thu nhập (VND)"
          value={formatVND(totals.earnings_vnd)}
          icon={<FiDollarSign />}
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
          onChange={(val) =>
            setFilterGeneralStatus(
              val === "all" ? "all" : parseInt(val as string)
            )
          }
          options={generalStatuses.map((s) => ({
            value: s.id,
            label: s.name_vi
          }))}
        />

        <SelectFilter
          label="Trạng thái khách hàng"
          value={filterCustomerStatus}
          onChange={(val) =>
            setFilterCustomerStatus(
              val === "all" ? "all" : parseInt(val as string)
            )
          }
          options={customerStatuses.map((s) => ({
            value: s.id,
            label: s.name_vi
          }))}
        />

        <SelectFilter
          label="Trạng thái nhà máy"
          value={filterFactoryStatus}
          onChange={(val) =>
            setFilterFactoryStatus(
              val === "all" ? "all" : parseInt(val as string)
            )
          }
          options={factoryStatuses.map((s) => ({
            value: s.id,
            label: s.name_vi
          }))}
        />

        <SelectFilter
          label="Trạng thái giao hàng"
          value={filterDeliveryStatus}
          onChange={(val) =>
            setFilterDeliveryStatus(
              val === "all" ? "all" : parseInt(val as string)
            )
          }
          options={deliveryStatuses.map((s) => ({
            value: s.id,
            label: s.name_vi
          }))}
        />

        <SelectFilter
          label="Sắp xếp"
          value={sortBy}
          onChange={(val) => setSortBy(val as string)}
          options={sortOptions}
        />
      </FilterBar>

      {/* Order View - Table or Card */}
      {viewMode === "table" ? (
        <OrderTable
          orders={filteredOrders}
          selectedOrders={selectedOrders}
          onSelectOrder={handleSelectOrder}
          onSelectAll={handleSelectAll}
          onDeleteOrder={handleDeleteOrder}
          getStatusBadge={getStatusBadge}
        />
      ) : (
        <OrderCardView
          orders={filteredOrders}
          selectedOrders={selectedOrders}
          onSelectOrder={handleSelectOrder}
          onSelectAll={handleSelectAll}
          onDeleteOrder={handleDeleteOrder}
          getStatusBadge={getStatusBadge}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        isLoading={isDeleting}
        variant="delete"
        title={
          deleteTarget === "bulk"
            ? "Xác nhận xóa nhiều đơn hàng"
            : "Xác nhận xóa đơn hàng"
        }
        message={
          deleteTarget === "bulk"
            ? `Bạn có chắc chắn muốn xóa ${selectedOrders.length} đơn hàng đã chọn? Hành động này không thể hoàn tác.`
            : "Bạn có chắc chắn muốn xóa đơn hàng này? Hành động này không thể hoàn tác."
        }
        confirmText={
          deleteTarget === "bulk"
            ? `Xóa ${selectedOrders.length} đơn hàng`
            : "Xóa"
        }
        cancelText="Hủy"
      />
    </div>
  );
};
