// src/features/orders/pages/OrderDetail.tsx

import { OrderDetailTabs, OrderForm, orderService, useOrderStore } from "@features/orders";
import type { Order, OrderItem } from "@types";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

/**
 * Component for viewing and editing an existing order
 * Loads order data and initializes draft state for editing
 */
export const OrderDetail: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const initializeRef = useRef(false);
  const [dbOrder, setDbOrder] = useState<Order | null>(null);
  const [dbLoading, setDbLoading] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  const {
    orders,
    isLoading,
    initializeDraftForEdit,
    updateOrder,
    deleteOrder
  } = useOrderStore();

  // Find order by ID with proper validation
  let order = orderId
    ? orders.find((o) => o.id === Number(orderId))
    : undefined;

  // If order not in stores, try to fetch from database
  useEffect(() => {
    if (!order && orderId && !dbOrder && !dbLoading) {
      const fetchOrder = async () => {
        setDbLoading(true);
        setDbError(null);
        try {
          const fetchedOrder = await orderService.getOrderById(Number(orderId));
          setDbOrder(fetchedOrder);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to fetch order";
          setDbError(errorMessage);
        } finally {
          setDbLoading(false);
        }
      };
      fetchOrder();
    }
  }, [orderId, order, dbOrder, dbLoading]);

  // Use database order if local stores doesn't have it
  if (!order && dbOrder) {
    order = dbOrder;
  }

  // Initialize draft state once when order is loaded
  useEffect(() => {
    if (order && !initializeRef.current) {
      initializeDraftForEdit(order);
      initializeRef.current = true;
    }

    // Reset ref when orderId changes (navigating to different order)
    return () => {
      if (orderId) {
        initializeRef.current = false;
      }
    };
  }, [order, orderId, initializeDraftForEdit]);

  const handleSubmit = async (
    updatedOrder: Partial<Order>,
    updatedOrderItems: OrderItem[]
  ) => {
    if (!orderId) {
      console.error("Order ID is missing");
      return;
    }

    try {
      await updateOrder(orderId, updatedOrder, updatedOrderItems);
    } catch (error) {
      console.error("Failed to update order:", error);
      throw error; // Let OrderForm handle the error display
    }
  };

  const handleDelete = async () => {
    if (!orderId) {
      console.error("Order ID is missing");
      return;
    }

    // Confirm deletion
    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn xóa đơn hàng này? Hành động này không thể hoàn tác."
    );

    if (!confirmed) return;

    try {
      await deleteOrder(orderId);
      navigate("/orders");
    } catch (error) {
      console.error("Failed to delete order:", error);
      throw error; // Let OrderForm handle the error display
    }
  };

  // Loading state
  if ((isLoading && !order) || (dbLoading && !order)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (dbError && !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{dbError}</p>
          <button
            onClick={() => navigate("/orders")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Quay lại danh sách đơn hàng
          </button>
        </div>
      </div>
    );
  }

  // Order not found
  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Không tìm thấy đơn hàng</p>
          <button
            onClick={() => navigate("/orders")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Quay lại danh sách đơn hàng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <OrderForm mode="edit" onSubmit={handleSubmit} onDelete={handleDelete} />
      <OrderDetailTabs
        orderId={order.id}
        employeeId={order.artist_employee_id || undefined}
      />
    </div>
  );
};
