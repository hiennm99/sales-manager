// src/features/orders/store/useOrderStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Order,
  OrderFormData,
  OrderItem,
  OrderItemFormData,
} from "../../../types/order";
import { orderToFormData } from "../../../types/order";
import {
  INITIAL_ORDER,
  INITIAL_ORDER_ITEM,
  INITIAL_STATUS_VALUES,
} from "../constants/orderDefaults";
import { orderServiceApi } from "../services/order.service.api";

type ShippingData = {
  carrier_unit?: string;
  carrier_notes?: string;
  internal_tracking_number?: string;
  tracking_number?: string;
  actual_ship_date?: string;
  shipping_fee_usd?: number;
  shipping_exchange_rate?: number;
  shipping_fee_vnd?: number;
};

interface OrderStore {
  orders: Order[];
  orderItems: Record<number, OrderItem[]>; // orderId -> items
  isLoading: boolean;
  error: string | null;

  // selected order
  selectedOrder: Order | null;
  setSelectedOrder: (order: Order | null) => void;

  // Draft state for creating/editing orders
  draftOrder: OrderFormData;
  draftItems: OrderItemFormData[];
  draftStatusValues: {
    general: number;
    customer: number;
    factory: number;
    delivery: number;
  };

  // Draft actions
  initializeDraftForCreate: (shopId?: number) => void;
  initializeDraftForEdit: (order: Order) => Promise<void>;
  updateDraftOrder: (updates: Partial<OrderFormData>) => void;
  updateDraftItems: (items: OrderItemFormData[]) => void;
  updateDraftStatus: (
    type: "general" | "customer" | "factory" | "delivery",
    value: number,
  ) => void;
  resetDraft: () => void;

  // Actions
  fetchOrders: () => Promise<void>;
  getOrderById: (id: string | number) => Order | undefined;
  getOrderItems: (orderId: number) => Promise<OrderItem[]>;
  createOrder: (
    formData: OrderFormData,
    items: OrderItemFormData[],
    financialData: Partial<Order>,
  ) => Promise<Order>;
  updateOrderItems: (
    orderId: number,
    updatedItems: OrderItem[],
  ) => Promise<OrderItem[]>;

  // ĐỊNH NGHĨA updateOrder THEO YÊU CẦU: Nhận 3 tham số
  updateOrder: (
    id: string,
    updatedOrder: Partial<Order>,
    updatedOrderItems: OrderItem[],
  ) => Promise<Order>;
  updateOrderStatus: (
    id: string,
    statusType: "general" | "customer" | "factory" | "delivery",
    statusId: number | null,
  ) => Promise<void>;
  updateShippingInfo: (id: string, shippingData: ShippingData) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  searchOrders: (query: string) => Promise<void>;
  filterOrdersByDateRange: (
    startDate: string,
    endDate: string,
  ) => Promise<void>;
  getOrdersByShop: (shopId: number) => Promise<void>;
  getOrdersByEmployee: (employeeId: number) => Promise<void>;
  bulkDeleteOrders: (ids: number[]) => Promise<void>;
  exportOrders: () => Promise<void>;
  clearError: () => void;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: [],
      orderItems: {},
      isLoading: false,
      error: null,

      // selected order
      selectedOrder: null,
      setSelectedOrder: (order) => set({ selectedOrder: order }),

      // Draft state
      draftOrder: { ...INITIAL_ORDER },
      draftItems: [{ ...INITIAL_ORDER_ITEM }],
      draftStatusValues: { ...INITIAL_STATUS_VALUES },

      // Initialize draft for creating new order
      initializeDraftForCreate: (shopId?: number) => {
        set({
          draftOrder: {
            ...INITIAL_ORDER,
            shopId: shopId || 0,
            orderDate: new Date().toISOString().split("T")[0],
          },
          draftItems: [{ ...INITIAL_ORDER_ITEM }],
          draftStatusValues: { ...INITIAL_STATUS_VALUES },
        });
      },

      // Initialize draft for editing existing order
      // NOTE: We load DB values but calculations will use real-time draft state
      initializeDraftForEdit: async (order: Order) => {
        try {
          const items = await get().getOrderItems(order.id);

          // Use the helper function to convert Order to OrderFormData
          const formData = orderToFormData(order);

          set({
            draftOrder: formData,
            draftItems: items.map((item) => ({
              sku: item.sku,
              size: item.size,
              type: item.type,
              quantity: item.quantity,
              unit_price_usd: item.unit_price_usd,
            })),
            draftStatusValues: {
              general: order.general_status_id || INITIAL_STATUS_VALUES.general,
              customer:
                order.customer_status_id || INITIAL_STATUS_VALUES.customer,
              factory: order.factory_status_id || INITIAL_STATUS_VALUES.factory,
              delivery:
                order.delivery_status_id || INITIAL_STATUS_VALUES.delivery,
            },
          });
        } catch (error) {
          console.error("Failed to initialize draft for edit:", error);
          throw error;
        }
      },

      // Update draft order fields
      updateDraftOrder: (updates) => {
        set((state) => ({
          draftOrder: { ...state.draftOrder, ...updates },
        }));
      },

      // Update draft items
      updateDraftItems: (items) => {
        set({ draftItems: items });
      },

      // Update draft status
      updateDraftStatus: (type, value) => {
        set((state) => ({
          draftStatusValues: { ...state.draftStatusValues, [type]: value },
        }));
      },

      // Reset draft to initial state
      resetDraft: () => {
        set({
          draftOrder: { ...INITIAL_ORDER },
          draftItems: [{ ...INITIAL_ORDER_ITEM }],
          draftStatusValues: { ...INITIAL_STATUS_VALUES },
        });
      },

      fetchOrders: async () => {
        set({ isLoading: true, error: null });
        try {
          const orders = await orderServiceApi.getOrders();
          set({ orders, isLoading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch orders";
          set({ error: errorMessage, isLoading: false });
        }
      },

      getOrderById: (id: string | number) => {
        const numericId = typeof id === "string" ? parseInt(id, 10) : id;
        return get().orders.find((o) => o.id === numericId);
      },

      getOrderItems: async (orderId: number) => {
        // Check cache first
        const cached = get().orderItems[orderId];
        if (cached) return cached;

        set({ isLoading: true, error: null });
        try {
          const items = await orderServiceApi.getOrderItems(orderId);
          set((state) => ({
            orderItems: {
              ...state.orderItems,
              [orderId]: items,
            },
            isLoading: false,
          }));
          return items;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch order items";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      createOrder: async (
        formData: OrderFormData,
        items: OrderItemFormData[],
        financialData: Partial<Order>,
      ) => {
        set({ isLoading: true, error: null });
        try {
          const newOrder = await orderServiceApi.createOrder(
            formData,
            items,
            financialData,
          );

          set((state) => ({
            orders: [newOrder, ...state.orders],
            selectedOrder: newOrder,
            isLoading: false,
          }));

          return newOrder;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to create order";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      updateOrderItems: async (orderId: number, updatedItems: OrderItem[]) => {
        set({ isLoading: true, error: null });
        try {
          // GỌI API: Giả định có service API để cập nhật danh sách items cho một order
          const updatedItemsFromApi = await orderServiceApi.updateOrderItems(
            orderId,
            updatedItems,
          );

          // Cập nhật state orderItems cục bộ
          set((state) => ({
            orderItems: {
              ...state.orderItems,
              [orderId]: updatedItemsFromApi || updatedItems,
            },
            isLoading: false,
          }));

          return updatedItemsFromApi;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to update order items";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // Định nghĩa hàm updateOrder theo yêu cầu: nhận 3 tham số
      updateOrder: async (
        id: string,
        updatedOrder: Partial<Order>,
        updatedOrderItems: OrderItem[],
      ) => {
        set({ isLoading: true, error: null });
        const numericId = parseInt(id, 10);
        try {
          // Convert Partial<Order> to Partial<OrderFormData>
          // Use only the fields that are being updated
          const formData: Partial<OrderFormData> = {};
          const financialData: Partial<Order> = {};

          // Map snake_case Order fields to camelCase OrderFormData fields
          if (updatedOrder.shop_id !== undefined)
            formData.shopId = updatedOrder.shop_id;
          if (updatedOrder.order_id !== undefined)
            formData.orderId = updatedOrder.order_id;
          if (updatedOrder.order_date !== undefined)
            formData.orderDate = updatedOrder.order_date;
          if (updatedOrder.scheduled_ship_date !== undefined)
            formData.scheduledShipDate =
              updatedOrder.scheduled_ship_date ?? undefined;
          if (updatedOrder.customer_name !== undefined)
            formData.customerName = updatedOrder.customer_name;
          if (updatedOrder.customer_address !== undefined)
            formData.customerAddress = updatedOrder.customer_address;
          if (updatedOrder.customer_phone !== undefined)
            formData.customerPhone = updatedOrder.customer_phone ?? undefined;
          if (updatedOrder.customer_email !== undefined)
            formData.customerEmail = updatedOrder.customer_email ?? undefined;
          if (updatedOrder.customer_notes !== undefined)
            formData.customerNotes = updatedOrder.customer_notes ?? undefined;
          if (updatedOrder.artist_employee_id !== undefined)
            formData.employeeId = updatedOrder.artist_employee_id ?? undefined;
          if (updatedOrder.seller_employee_id !== undefined)
            formData.sellerEmployeeId =
              updatedOrder.seller_employee_id ?? undefined;
          if (updatedOrder.artist_commission_rate !== undefined)
            formData.artistCommissionRate = updatedOrder.artist_commission_rate ?? undefined;

          // Shipping info
          if (updatedOrder.actual_ship_date !== undefined)
            formData.actualShipDate =
              updatedOrder.actual_ship_date ?? undefined;
          if (updatedOrder.carrier_unit !== undefined)
            formData.carrierUnit = updatedOrder.carrier_unit ?? undefined;
          if (updatedOrder.carrier_notes !== undefined)
            formData.carrierNotes = updatedOrder.carrier_notes ?? undefined;
          if (updatedOrder.tracking_number !== undefined)
            formData.trackingNumber = updatedOrder.tracking_number ?? undefined;
          if (updatedOrder.internal_tracking_number !== undefined)
            formData.internalTrackingNumber =
              updatedOrder.internal_tracking_number ?? undefined;
          if (updatedOrder.shipping_fee_usd !== undefined)
            formData.shippingFeeUsd = updatedOrder.shipping_fee_usd;
          if (updatedOrder.shipping_exchange_rate !== undefined)
            formData.shippingExchangeRate = updatedOrder.shipping_exchange_rate;

          // Financial data stays as-is (snake_case)
          if (updatedOrder.item_total_usd !== undefined)
            financialData.item_total_usd = updatedOrder.item_total_usd;
          if (updatedOrder.discount_rate !== undefined)
            financialData.discount_rate = updatedOrder.discount_rate;
          if (updatedOrder.buyer_paid_usd !== undefined)
            financialData.buyer_paid_usd = updatedOrder.buyer_paid_usd;
          if (updatedOrder.order_earnings_usd !== undefined)
            financialData.order_earnings_usd = updatedOrder.order_earnings_usd;
          if (updatedOrder.exchange_rate !== undefined)
            financialData.exchange_rate = updatedOrder.exchange_rate;

          // Fees and bonuses
          if (updatedOrder.refund_fee_usd !== undefined)
            financialData.refund_fee_usd = updatedOrder.refund_fee_usd;
          if (updatedOrder.refund_fee_exchange_rate !== undefined)
            financialData.refund_fee_exchange_rate =
              updatedOrder.refund_fee_exchange_rate;
          if (updatedOrder.refund_fee_notes !== undefined)
            financialData.refund_fee_notes = updatedOrder.refund_fee_notes;
          if (updatedOrder.other_fee_usd !== undefined)
            financialData.other_fee_usd = updatedOrder.other_fee_usd;
          if (updatedOrder.other_fee_exchange_rate !== undefined)
            financialData.other_fee_exchange_rate =
              updatedOrder.other_fee_exchange_rate;
          if (updatedOrder.other_fee_notes !== undefined)
            financialData.other_fee_notes = updatedOrder.other_fee_notes;
          if (updatedOrder.other_bonus_usd !== undefined)
            financialData.other_bonus_usd = updatedOrder.other_bonus_usd;
          if (updatedOrder.other_bonus_exchange_rate !== undefined)
            financialData.other_bonus_exchange_rate =
              updatedOrder.other_bonus_exchange_rate;
          if (updatedOrder.other_bonus_notes !== undefined)
            financialData.other_bonus_notes = updatedOrder.other_bonus_notes;

          // Status fields
          if (updatedOrder.general_status_id !== undefined)
            financialData.general_status_id = updatedOrder.general_status_id;
          if (updatedOrder.customer_status_id !== undefined)
            financialData.customer_status_id = updatedOrder.customer_status_id;
          if (updatedOrder.factory_status_id !== undefined)
            financialData.factory_status_id = updatedOrder.factory_status_id;
          if (updatedOrder.delivery_status_id !== undefined)
            financialData.delivery_status_id = updatedOrder.delivery_status_id;

          // 1. Cập nhật thông tin Order chính
          const updatedOrderFromApi = await orderServiceApi.updateOrder(
            id,
            formData,
            financialData,
          );

          // 2. Cập nhật Order Items
          await get().updateOrderItems(numericId, updatedOrderItems);

          // 3. Cập nhật state Orders (thông tin chính)
          set((state) => ({
            orders: state.orders.map((o) =>
              o.id === numericId ? updatedOrderFromApi : o,
            ),
            isLoading: false,
          }));

          if (get().selectedOrder?.id === numericId) {
            set({ selectedOrder: updatedOrderFromApi });
          }

          return updatedOrderFromApi;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to update order";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      deleteOrder: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await orderServiceApi.deleteOrder(id);
          const numericId = parseInt(id, 10);

          set((state) => {
            const newOrderItems = { ...state.orderItems };
            delete newOrderItems[numericId];

            return {
              orders: state.orders.filter((o) => o.id !== numericId),
              orderItems: newOrderItems,
              selectedOrder:
                state.selectedOrder?.id === numericId
                  ? null
                  : state.selectedOrder,
              isLoading: false,
            };
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to delete order";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      updateOrderStatus: async (
        id: string,
        statusType: "general" | "customer" | "factory" | "delivery",
        statusId: number | null,
      ) => {
        set({ isLoading: true, error: null });
        try {
          const updatedOrder = await orderServiceApi.updateOrderStatus(
            id,
            statusType,
            statusId,
          );
          const numericId = parseInt(id, 10);

          set((state) => ({
            orders: state.orders.map((o) =>
              o.id === numericId ? updatedOrder : o,
            ),
            isLoading: false,
          }));

          // Update selected order if it's the one being updated
          if (get().selectedOrder?.id === numericId) {
            set({ selectedOrder: updatedOrder });
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to update order status";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      updateShippingInfo: async (id: string, shippingData: ShippingData) => {
        set({ isLoading: true, error: null });
        try {
          const updatedOrder = await orderServiceApi.updateShippingInfo(
            id,
            shippingData,
          );
          const numericId = parseInt(id, 10);

          set((state) => ({
            orders: state.orders.map((o) =>
              o.id === numericId ? updatedOrder : o,
            ),
            isLoading: false,
          }));

          // Update selected order if it's the one being updated
          if (get().selectedOrder?.id === numericId) {
            set({ selectedOrder: updatedOrder });
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to update shipping info";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      searchOrders: async (query: string) => {
        set({ isLoading: true, error: null });
        try {
          if (query.trim() === "") {
            await get().fetchOrders();
            return;
          }

          const orders = await orderServiceApi.searchOrders(query);
          set({ orders, isLoading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to search orders";
          set({ error: errorMessage, isLoading: false });
        }
      },

      filterOrdersByDateRange: async (startDate: string, endDate: string) => {
        set({ isLoading: true, error: null });
        try {
          const orders = await orderServiceApi.filterOrdersByDateRange(
            startDate,
            endDate,
          );
          set({ orders, isLoading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to filter orders";
          set({ error: errorMessage, isLoading: false });
        }
      },

      getOrdersByShop: async (shopId: number) => {
        set({ isLoading: true, error: null });
        try {
          const orders = await orderServiceApi.getOrdersByShop(shopId);
          set({ orders, isLoading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch orders by shop";
          set({ error: errorMessage, isLoading: false });
        }
      },

      getOrdersByEmployee: async (employeeId: number) => {
        set({ isLoading: true, error: null });
        try {
          const orders = await orderServiceApi.getOrdersByEmployee(employeeId);
          set({ orders, isLoading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch orders by employee";
          set({ error: errorMessage, isLoading: false });
        }
      },

      bulkDeleteOrders: async (ids: number[]) => {
        set({ isLoading: true, error: null });
        try {
          await orderServiceApi.bulkDeleteOrders(ids);

          set((state) => {
            const newOrderItems = { ...state.orderItems };
            ids.forEach((id) => delete newOrderItems[id]);

            return {
              orders: state.orders.filter((o) => !ids.includes(o.id)),
              orderItems: newOrderItems,
              selectedOrder: ids.includes(state.selectedOrder?.id ?? -1)
                ? null
                : state.selectedOrder,
              isLoading: false,
            };
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to delete orders";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      exportOrders: async () => {
        set({ isLoading: true, error: null });
        try {
          await orderServiceApi.exportOrders();
          set({ isLoading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to export orders";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "order-storage",
      partialize: (state) => ({
        selectedOrder: state.selectedOrder,
      }),
    },
  ),
);
