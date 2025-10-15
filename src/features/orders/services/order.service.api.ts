// src/features/orders/services/order.service.api.ts

import { handleSupabaseError, supabase, cleanInsertData } from '../../../lib/supabase';
import type { Order, OrderFormData, OrderItem, OrderItemFormData } from '../../../types/order';
import type { Database } from '../../../types/supabase.ts';

/**
 * Helper function to map database row to Order type
 */
const mapToOrderRow = (data: Database['public']['Tables']['orders']['Row']): Order => {
    return {
        id: data.id,
        shop_code: data.shop_code,
        order_id: data.order_id,
        order_date: data.order_date,
        scheduled_ship_date: data.scheduled_ship_date,
        customer_name: data.customer_name,
        customer_address: data.customer_address,
        customer_phone: data.customer_phone,
        customer_notes: data.customer_notes,
        item_total_usd: data.item_total_usd,
        discount_usd: data.discount_usd,
        subtotal_usd: data.subtotal_usd,
        tax_usd: data.tax_usd,
        order_total_usd: data.order_total_usd,
        fees_usd: data.fees_usd,
        order_earnings_usd: data.order_earnings_usd,
        exchange_rate: data.exchange_rate,
        item_total_vnd: data.item_total_vnd,
        discount_vnd: data.discount_vnd,
        subtotal_vnd: data.subtotal_vnd,
        tax_vnd: data.tax_vnd,
        order_total_vnd: data.order_total_vnd,
        fees_vnd: data.fees_vnd,
        order_earnings_vnd: data.order_earnings_vnd,
        carrier_notes: data.carrier_notes,
        internal_tracking_number: data.internal_tracking_number,
        carrier_unit: data.carrier_unit,
        tracking_number: data.tracking_number,
        actual_ship_date: data.actual_ship_date,
        shipping_fee_usd: data.shipping_fee_usd,
        shipping_exchange_rate: data.shipping_exchange_rate,
        shipping_fee_vnd: data.shipping_fee_vnd,
        refund_fee_usd: data.refund_fee_usd,
        refund_fee_exchange_rate: data.refund_fee_exchange_rate,
        refund_fee_vnd: data.refund_fee_vnd,
        refund_fee_notes: data.refund_fee_notes,
        other_fee_usd: data.other_fee_usd,
        other_fee_exchange_rate: data.other_fee_exchange_rate,
        other_fee_vnd: data.other_fee_vnd,
        other_fee_notes: data.other_fee_notes,
        profit_usd: data.profit_usd,
        profit_vnd: data.profit_vnd,
        commission_program: data.commission_program,
        artist_code: data.artist_code,
        general_status_id: data.general_status_id,
        customer_status_id: data.customer_status_id,
        factory_status_id: data.factory_status_id,
        delivery_status_id: data.delivery_status_id,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
    };
};

/**
 * Helper function to map database row to OrderItem type
 */
const mapToOrderItemRow = (data: Database['public']['Tables']['order_items']['Row']): OrderItem => {
    return {
        id: data.id,
        order_id: data.order_id,
        sku: data.sku,
        size: data.size,
        type: data.type,
        quantity: data.quantity,
        unit_price_usd: data.unit_price_usd,
        unit_price_vnd: data.unit_price_vnd,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
    };
};

/**
 * Order Supabase Service
 * Handles all database operations related to orders using Supabase
 */
export const orderServiceApi = {
    /**
     * Fetch all orders
     */
    async getOrders(): Promise<Order[]> {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('order_date', { ascending: false });

        if (error) {
            console.error('Error fetching orders:', error);
            throw new Error(handleSupabaseError(error));
        }

        if (!data || data.length === 0) return [];

        return data.map(mapToOrderRow);
    },

    /**
     * Fetch a single order by ID
     */
    async getOrderById(id: number): Promise<Order> {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching order:', error);
            if (error.code === 'PGRST116') {
                throw new Error('Order not found');
            }
            throw new Error(handleSupabaseError(error));
        }

        if (!data) throw new Error('Order not found');

        return mapToOrderRow(data);
    },

    /**
     * Fetch order items for a specific order
     */
    async getOrderItems(orderId: number): Promise<OrderItem[]> {
        const { data, error } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', orderId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching order items:', error);
            throw new Error(handleSupabaseError(error));
        }

        if (!data || data.length === 0) return [];

        return data.map(mapToOrderItemRow);
    },

    /**
     * Create a new order with items
     */
    async createOrder(
        formData: OrderFormData,
        items: OrderItemFormData[],
        financialData: Partial<Order>
    ): Promise<Order> {
        // Insert order
        const rawInsertData = {
            shop_code: formData.shop_code,
            order_id: formData.order_id,
            order_date: formData.order_date,
            scheduled_ship_date: formData.scheduled_ship_date,
            customer_name: formData.customer_name,
            customer_address: formData.customer_address,
            customer_phone: formData.customer_phone,
            customer_notes: formData.customer_notes,
            artist_code: formData.artist_code,
            ...financialData,
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const insertData = cleanInsertData(rawInsertData) as any;

        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert(insertData)
            .select()
            .single();

        if (orderError) {
            console.error('Error creating order:', orderError);
            throw new Error(handleSupabaseError(orderError));
        }

        if (!orderData) throw new Error('Failed to create order');

        // Insert order items
        if (items.length > 0) {
            const itemsData = items.map(item => ({
                order_id: orderData.id,
                sku: item.sku,
                size: item.size,
                type: item.type,
                quantity: item.quantity,
                unit_price_usd: item.unit_price_usd,
                unit_price_vnd: item.unit_price_vnd,
            })) as any;

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(itemsData);

            if (itemsError) {
                console.error('Error creating order items:', itemsError);
                // Rollback: delete the order
                await supabase.from('orders').delete().eq('id', orderData.id);
                throw new Error(handleSupabaseError(itemsError));
            }
        }

        return mapToOrderRow(orderData);
    },

    /**
     * Update an existing order
     */
    async updateOrder(
        id: string,
        formData: Partial<OrderFormData>,
        financialData?: Partial<Order>
    ): Promise<Order> {
        const numericId = parseInt(id, 10);

        const updateData: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
        };

        // Update form data
        if (formData.order_id !== undefined) updateData.order_id = formData.order_id;
        if (formData.order_date !== undefined) updateData.order_date = formData.order_date;
        if (formData.scheduled_ship_date !== undefined) updateData.scheduled_ship_date = formData.scheduled_ship_date;
        if (formData.customer_name !== undefined) updateData.customer_name = formData.customer_name;
        if (formData.customer_address !== undefined) updateData.customer_address = formData.customer_address;
        if (formData.customer_phone !== undefined) updateData.customer_phone = formData.customer_phone;
        if (formData.customer_notes !== undefined) updateData.customer_notes = formData.customer_notes;
        if (formData.artist_code !== undefined) updateData.artist_code = formData.artist_code;

        // Update financial data
        if (financialData) {
            Object.assign(updateData, financialData);
        }

        const { data, error } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', numericId)
            .select()
            .single();

        if (error) {
            console.error('Error updating order:', error);
            throw new Error(handleSupabaseError(error));
        }

        if (!data) throw new Error('Failed to update order');

        return mapToOrderRow(data);
    },

    /**
     * Update order items
     */
    async updateOrderItems(orderId: number, items: OrderItemFormData[]): Promise<void> {
        // Delete existing items
        const { error: deleteError } = await supabase
            .from('order_items')
            .delete()
            .eq('order_id', orderId);

        if (deleteError) {
            console.error('Error deleting order items:', deleteError);
            throw new Error(handleSupabaseError(deleteError));
        }

        // Insert new items
        if (items.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const itemsData = items.map(item => ({
                order_id: orderId,
                sku: item.sku,
                size: item.size,
                type: item.type,
                quantity: item.quantity,
                unit_price_usd: item.unit_price_usd,
                unit_price_vnd: item.unit_price_vnd,
            })) as any;

            const { error: insertError } = await supabase
                .from('order_items')
                .insert(itemsData);

            if (insertError) {
                console.error('Error inserting order items:', insertError);
                throw new Error(handleSupabaseError(insertError));
            }
        }
    },

    /**
     * Delete an order (will cascade delete order items)
     */
    async deleteOrder(id: string): Promise<void> {
        const numericId = parseInt(id, 10);

        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', numericId);

        if (error) {
            console.error('Error deleting order:', error);
            throw new Error(handleSupabaseError(error));
        }
    },

    /**
     * Update order status
     */
    async updateOrderStatus(
        id: string,
        statusType: 'general' | 'customer' | 'factory' | 'delivery',
        statusId: number | null
    ): Promise<Order> {
        const numericId = parseInt(id, 10);

        const updateData: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
        };

        switch (statusType) {
            case 'general':
                updateData.general_status_id = statusId;
                break;
            case 'customer':
                updateData.customer_status_id = statusId;
                break;
            case 'factory':
                updateData.factory_status_id = statusId;
                break;
            case 'delivery':
                updateData.delivery_status_id = statusId;
                break;
        }

        const { data, error } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', numericId)
            .select()
            .single();

        if (error) {
            console.error('Error updating order status:', error);
            throw new Error(handleSupabaseError(error));
        }

        if (!data) throw new Error('Failed to update status');

        return mapToOrderRow(data);
    },

    /**
     * Update shipping information
     */
    async updateShippingInfo(
        id: string,
        shippingData: {
            carrier_unit?: string;
            carrier_notes?: string;
            internal_tracking_number?: string;
            tracking_number?: string;
            actual_ship_date?: string;
            shipping_fee_usd?: number;
            shipping_exchange_rate?: number;
            shipping_fee_vnd?: number;
        }
    ): Promise<Order> {
        const numericId = parseInt(id, 10);

        const updateData = {
            ...shippingData,
            updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', numericId)
            .select()
            .single();

        if (error) {
            console.error('Error updating shipping info:', error);
            throw new Error(handleSupabaseError(error));
        }

        if (!data) throw new Error('Failed to update shipping info');

        return mapToOrderRow(data);
    },

    /**
     * Search orders
     */
    async searchOrders(query: string): Promise<Order[]> {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .or(`order_id.ilike.%${query}%,customer_name.ilike.%${query}%,tracking_number.ilike.%${query}%`)
            .order('order_date', { ascending: false });

        if (error) {
            console.error('Error searching orders:', error);
            throw new Error(handleSupabaseError(error));
        }

        if (!data || data.length === 0) return [];

        return data.map(mapToOrderRow);
    },

    /**
     * Filter orders by date range
     */
    async filterOrdersByDateRange(startDate: string, endDate: string): Promise<Order[]> {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .gte('order_date', startDate)
            .lte('order_date', endDate)
            .order('order_date', { ascending: false });

        if (error) {
            console.error('Error filtering orders:', error);
            throw new Error(handleSupabaseError(error));
        }

        if (!data || data.length === 0) return [];

        return data.map(mapToOrderRow);
    },

    /**
     * Get orders by shop
     */
    async getOrdersByShop(shopCode: string): Promise<Order[]> {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('shop_code', shopCode)
            .order('order_date', { ascending: false });

        if (error) {
            console.error('Error fetching orders by shop:', error);
            throw new Error(handleSupabaseError(error));
        }

        if (!data || data.length === 0) return [];

        return data.map(mapToOrderRow);
    },

    /**
     * Get orders by artist
     */
    async getOrdersByArtist(artistCode: string): Promise<Order[]> {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('artist_code', artistCode)
            .order('order_date', { ascending: false });

        if (error) {
            console.error('Error fetching orders by artist:', error);
            throw new Error(handleSupabaseError(error));
        }

        if (!data || data.length === 0) return [];

        return data.map(mapToOrderRow);
    },

    /**
     * Bulk delete orders
     */
    async bulkDeleteOrders(ids: number[]): Promise<void> {
        if (!ids || ids.length === 0) return;

        const { error } = await supabase
            .from('orders')
            .delete()
            .in('id', ids);

        if (error) {
            console.error('Error bulk deleting orders:', error);
            throw new Error(handleSupabaseError(error));
        }
    },

    /**
     * Export orders to CSV (get all data for client-side export)
     */
    async exportOrders(): Promise<Order[]> {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('order_date', { ascending: false });

        if (error) {
            console.error('Error exporting orders:', error);
            throw new Error(handleSupabaseError(error));
        }

        if (!data || data.length === 0) return [];

        return data.map(mapToOrderRow);
    },
};

/**
 * Helper function to download orders as CSV
 */
export const downloadOrdersCSV = async (): Promise<void> => {
    const orders = await orderServiceApi.exportOrders();

    if (orders.length === 0) {
        console.warn('No orders to export');
        return;
    }

    const headers = [
        'ID', 'Order ID', 'Shop Code', 'Order Date', 'Customer Name',
        'Order Total USD', 'Order Total VND', 'Profit USD', 'Profit VND',
        'Artist Code', 'Commission %', 'Status', 'Created At'
    ];

    const rows = orders.map(o => [
        o.id,
        o.order_id,
        o.shop_code,
        o.order_date,
        o.customer_name,
        o.order_total_usd,
        o.order_total_vnd,
        o.profit_usd,
        o.profit_vnd,
        o.artist_code || '',
        o.commission_program,
        o.actual_ship_date ? 'Shipped' : 'Pending',
        o.created_at.toISOString(),
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `orders-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};