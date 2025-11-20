// src/features/orders/pages/OrderDetail.tsx

import { OrderForm, orderService, useOrderStore } from "@features/orders";
import type { Order, OrderItem } from "@types";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FiAlertTriangle, FiFileText } from "react-icons/fi";
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

  const orders = useOrderStore((state) => state.orders);
  const isLoading = useOrderStore((state) => state.isLoading);
  const initializeDraftForEdit = useOrderStore((state) => state.initializeDraftForEdit);
  const updateOrder = useOrderStore((state) => state.updateOrder);
  const deleteOrder = useOrderStore((state) => state.deleteOrder);

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
      
      // Refresh order data from database to ensure UI is in sync
      const refreshedOrder = await orderService.getOrderById(Number(orderId));
      setDbOrder(refreshedOrder);
      initializeRef.current = false; // Reset ref to re-initialize draft with fresh data
    } catch (error) {
      console.error("Failed to update order:", error);
      throw error; // Let OrderForm handle the error display
    }
  };

  const handleDelete = useCallback(async () => {
    console.log("🗑️ OrderDetail: Deleting order with ID:", orderId);
    if (!orderId) {
      console.error("🗑️ OrderDetail: Order ID is missing");
      return;
    }

    try {
      console.log("🗑️ OrderDetail: Starting delete operation for order:", orderId);
      await deleteOrder(orderId);
      console.log("🗑️ OrderDetail: Delete successful, navigating to /orders");
      navigate("/orders");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Không thể xóa đơn hàng";
      console.error("🗑️ OrderDetail: Failed to delete order:", error);
      // Show error to user
      alert(`Lỗi xóa đơn hàng: ${errorMessage}`);
    }
  }, [orderId, deleteOrder, navigate]);

  // Loading state
  if ((isLoading && !order) || (dbLoading && !order)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (dbError && !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md text-center">
          <FiAlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Không thể tải đơn hàng
          </h2>
          <p className="text-red-600 text-sm mb-6">{dbError}</p>
          <button
            onClick={() => navigate("/orders")}
            className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:ring-4 focus:ring-blue-200"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  // Order not found
  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md text-center">
          <FiFileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Không tìm thấy đơn hàng
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            Đơn hàng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
          <button
            onClick={() => navigate("/orders")}
            className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:ring-4 focus:ring-blue-200"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <OrderForm mode="edit" onSubmit={handleSubmit} onDelete={handleDelete} orderId={order.id}>
    </OrderForm>
  );
};
