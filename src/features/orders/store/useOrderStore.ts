// src/features/orders/store/useOrderStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Order, OrderFormData, OrderItem, OrderItemFormData } from '../../../types/order';
import { orderServiceApi } from '../services/order.service.api';

interface OrderStore {
    orders: Order[];
    orderItems: Record<number, OrderItem[]>; // orderId -> items
    isLoading: boolean;
    error: string | null;

    // selected order
    selectedOrder: Order | null;
    setSelectedOrder: (order: Order | null) => void;

    // Actions
    fetchOrders: () => Promise<void>;
    getOrderById: (id: string | number) => Order | undefined;
    getOrderItems: (orderId: number) => Promise<OrderItem[]>;
    createOrder: (formData: OrderFormData, items: OrderItemFormData[], financialData: Partial<Order>) => Promise<Order>;
    updateOrder: (id: string, formData: Partial<OrderFormData>, financialData?: Partial<Order>) => Promise<Order>;
    updateOrderItems: (orderId: number, items: OrderItemFormData[]) => Promise<void>;
    deleteOrder: (id: string) => Promise<void>;
    updateOrderStatus: (id: string, statusType: 'general' | 'customer' | 'factory' | 'delivery', statusId: number | null) => Promise<void>;
    updateShippingInfo: (id: string, shippingData: any) => Promise<void>;
    searchOrders: (query: string) => Promise<void>;
    filterOrdersByDateRange: (startDate: string, endDate: string) => Promise<void>;
    getOrdersByShop: (shopCode: string) => Promise<void>;
    getOrdersByArtist: (artistCode: string) => Promise<void>;
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

            fetchOrders: async () => {
                set({ isLoading: true, error: null });
                try {
                    const orders = await orderServiceApi.getOrders();
                    set({ orders, isLoading: false });
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch orders';
                    set({ error: errorMessage, isLoading: false });
                }
            },

            getOrderById: (id: string | number) => {
                const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
                return get().orders.find(o => o.id === numericId);
            },

            getOrderItems: async (orderId: number) => {
                // Check cache first
                const cached = get().orderItems[orderId];
                if (cached) return cached;

                set({ isLoading: true, error: null });
                try {
                    const items = await orderServiceApi.getOrderItems(orderId);
                    set(state => ({
                        orderItems: {
                            ...state.orderItems,
                            [orderId]: items,
                        },
                        isLoading: false,
                    }));
                    return items;
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch order items';
                    set({ error: errorMessage, isLoading: false });
                    throw error;
                }
            },

            createOrder: async (formData: OrderFormData, items: OrderItemFormData[], financialData: Partial<Order>) => {
                set({ isLoading: true, error: null });
                try {
                    const newOrder = await orderServiceApi.createOrder(formData, items, financialData);

                    set(state => ({
                        orders: [newOrder, ...state.orders],
                        selectedOrder: newOrder,
                        isLoading: false,
                    }));

                    return newOrder;
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
                    set({ error: errorMessage, isLoading: false });
                    throw error;
                }
            },

            updateOrder: async (id: string, formData: Partial<OrderFormData>, financialData?: Partial<Order>) => {
                set({ isLoading: true, error: null });
                try {
                    const updatedOrder = await orderServiceApi.updateOrder(id, formData, financialData);
                    const numericId = parseInt(id, 10);

                    set(state => ({
                        orders: state.orders.map(o =>
                            o.id === numericId ? updatedOrder : o
                        ),
                        isLoading: false,
                    }));

                    // Update selected order if it's the one being updated
                    if (get().selectedOrder?.id === numericId) {
                        set({ selectedOrder: updatedOrder });
                    }

                    return updatedOrder;
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to update order';
                    set({ error: errorMessage, isLoading: false });
                    throw error;
                }
            },

            updateOrderItems: async (orderId: number, items: OrderItemFormData[]) => {
                set({ isLoading: true, error: null });
                try {
                    await orderServiceApi.updateOrderItems(orderId, items);

                    // Clear cached items to force refresh
                    set(state => {
                        const newOrderItems = { ...state.orderItems };
                        delete newOrderItems[orderId];
                        return { orderItems: newOrderItems, isLoading: false };
                    });
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to update order items';
                    set({ error: errorMessage, isLoading: false });
                    throw error;
                }
            },

            deleteOrder: async (id: string) => {
                set({ isLoading: true, error: null });
                try {
                    await orderServiceApi.deleteOrder(id);
                    const numericId = parseInt(id, 10);

                    set(state => {
                        const newOrderItems = { ...state.orderItems };
                        delete newOrderItems[numericId];

                        return {
                            orders: state.orders.filter(o => o.id !== numericId),
                            orderItems: newOrderItems,
                            selectedOrder: state.selectedOrder?.id === numericId ? null : state.selectedOrder,
                            isLoading: false,
                        };
                    });
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to delete order';
                    set({ error: errorMessage, isLoading: false });
                    throw error;
                }
            },

            updateOrderStatus: async (id: string, statusType: 'general' | 'customer' | 'factory' | 'delivery', statusId: number | null) => {
                set({ isLoading: true, error: null });
                try {
                    const updatedOrder = await orderServiceApi.updateOrderStatus(id, statusType, statusId);
                    const numericId = parseInt(id, 10);

                    set(state => ({
                        orders: state.orders.map(o =>
                            o.id === numericId ? updatedOrder : o
                        ),
                        isLoading: false,
                    }));

                    // Update selected order if it's the one being updated
                    if (get().selectedOrder?.id === numericId) {
                        set({ selectedOrder: updatedOrder });
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to update order status';
                    set({ error: errorMessage, isLoading: false });
                    throw error;
                }
            },

            updateShippingInfo: async (id: string, shippingData: any) => {
                set({ isLoading: true, error: null });
                try {
                    const updatedOrder = await orderServiceApi.updateShippingInfo(id, shippingData);
                    const numericId = parseInt(id, 10);

                    set(state => ({
                        orders: state.orders.map(o =>
                            o.id === numericId ? updatedOrder : o
                        ),
                        isLoading: false,
                    }));

                    // Update selected order if it's the one being updated
                    if (get().selectedOrder?.id === numericId) {
                        set({ selectedOrder: updatedOrder });
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to update shipping info';
                    set({ error: errorMessage, isLoading: false });
                    throw error;
                }
            },

            searchOrders: async (query: string) => {
                set({ isLoading: true, error: null });
                try {
                    if (query.trim() === '') {
                        await get().fetchOrders();
                        return;
                    }

                    const orders = await orderServiceApi.searchOrders(query);
                    set({ orders, isLoading: false });
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to search orders';
                    set({ error: errorMessage, isLoading: false });
                }
            },

            filterOrdersByDateRange: async (startDate: string, endDate: string) => {
                set({ isLoading: true, error: null });
                try {
                    const orders = await orderServiceApi.filterOrdersByDateRange(startDate, endDate);
                    set({ orders, isLoading: false });
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to filter orders';
                    set({ error: errorMessage, isLoading: false });
                }
            },

            getOrdersByShop: async (shopCode: string) => {
                set({ isLoading: true, error: null });
                try {
                    const orders = await orderServiceApi.getOrdersByShop(shopCode);
                    set({ orders, isLoading: false });
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch orders by shop';
                    set({ error: errorMessage, isLoading: false });
                }
            },

            getOrdersByArtist: async (artistCode: string) => {
                set({ isLoading: true, error: null });
                try {
                    const orders = await orderServiceApi.getOrdersByArtist(artistCode);
                    set({ orders, isLoading: false });
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch orders by artist';
                    set({ error: errorMessage, isLoading: false });
                }
            },

            bulkDeleteOrders: async (ids: number[]) => {
                set({ isLoading: true, error: null });
                try {
                    await orderServiceApi.bulkDeleteOrders(ids);

                    set(state => {
                        const newOrderItems = { ...state.orderItems };
                        ids.forEach(id => delete newOrderItems[id]);

                        return {
                            orders: state.orders.filter(o => !ids.includes(o.id)),
                            orderItems: newOrderItems,
                            selectedOrder: ids.includes(state.selectedOrder?.id ?? -1) ? null : state.selectedOrder,
                            isLoading: false,
                        };
                    });
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to delete orders';
                    set({ error: errorMessage, isLoading: false });
                    throw error;
                }
            },

            exportOrders: async () => {
                set({ isLoading: true, error: null });
                try {
                    await orderServiceApi.downloadOrdersCSV();
                    set({ isLoading: false });
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to export orders';
                    set({ error: errorMessage, isLoading: false });
                    throw error;
                }
            },

            clearError: () => set({ error: null }),
        }),
        {
            name: 'order-storage',
            partialize: (state) => ({
                selectedOrder: state.selectedOrder,
            }),
        }
    )
);