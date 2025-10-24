// src/features/orders/services/order.service.api.ts

import {
  cleanInsertData,
  handleSupabaseError,
  supabase,
} from "../../../lib/supabase";
import { databaseService } from "../../../services";
import { notificationService } from "../../../services/notification.service";
import { getCurrentUserForService } from "../../../store/useUserStore";
import type {
  Order,
  OrderFormData,
  OrderItem,
  OrderItemFormData,
} from "../../../types/order";
import type { Database } from "../../../types/supabase.ts";
import {
  trackOrderChanges,
  trackOrderCreated,
  trackOrderItemsUpdate,
  trackStatusChange,
} from "../utils/orderHistoryHelper";
import {
  detectOrderChanges,
  formatChangesForNotification,
} from "../../../utils/changeTracker";

/**
 * Helper function to convert camelCase to snake_case for database fields
 */
const convertToSnakeCase = (
  data: Record<string, unknown>,
): Record<string, unknown> => {
  const camelToSnakeMap: Record<string, string> = {
    itemTotalUsd: "item_total_usd",
    discountRate: "discount_rate",
    buyerPaidUsd: "buyer_paid_usd",
    orderEarningsUsd: "order_earnings_usd",
    exchangeRate: "exchange_rate",
    itemTotalVnd: "item_total_vnd",
    buyerPaidVnd: "buyer_paid_vnd",
    orderEarningsVnd: "order_earnings_vnd",
    shippingFeeUsd: "shipping_fee_usd",
    shippingExchangeRate: "shipping_exchange_rate",
    shippingFeeVnd: "shipping_fee_vnd",
    refundFeeUsd: "refund_fee_usd",
    refundFeeExchangeRate: "refund_fee_exchange_rate",
    refundFeeVnd: "refund_fee_vnd",
    refundFeeNotes: "refund_fee_notes",
    otherFeeUsd: "other_fee_usd",
    otherFeeExchangeRate: "other_fee_exchange_rate",
    otherFeeVnd: "other_fee_vnd",
    otherFeeNotes: "other_fee_notes",
    profitUsd: "profit_usd",
    profitVnd: "profit_vnd",
    artistCommissionRate: "artist_commission_rate",
  };

  const snakeCaseData: Record<string, unknown> = {};

  Object.entries(data).forEach(([key, value]) => {
    const snakeKey = camelToSnakeMap[key] || key;
    snakeCaseData[snakeKey] = value;
  });

  return snakeCaseData;
};

/**
 * Helper function to map database row to Order type
 */
const mapToOrderRow = (
  data: Database["public"]["Tables"]["orders"]["Row"],
): Order => {
  return {
    customer_email: data.customer_email,
    other_bonus_exchange_rate: data.other_bonus_exchange_rate || 0,
    other_bonus_notes: data.other_bonus_notes,
    other_bonus_usd: data.other_bonus_usd || 0,
    other_bonus_vnd: data.other_bonus_vnd || 0,
    id: data.id,
    shop_id: data.shop_id,
    order_id: data.order_id,
    order_date: data.order_date,
    scheduled_ship_date: data.scheduled_ship_date,
    customer_name: data.customer_name,
    customer_address: data.customer_address,
    customer_phone: data.customer_phone,
    customer_notes: data.customer_notes,
    item_total_usd: data.item_total_usd,
    discount_rate: data.discount_rate,
    buyer_paid_usd: data.buyer_paid_usd,
    order_earnings_usd: data.order_earnings_usd,
    exchange_rate: data.exchange_rate,
    item_total_vnd: data.item_total_vnd,
    buyer_paid_vnd: data.buyer_paid_vnd,
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
    artist_commission_rate: data.artist_commission_rate,
    artist_employee_id: data.artist_employee_id,
    seller_employee_id: data.seller_employee_id,
    general_status_id: data.general_status_id,
    customer_status_id: data.customer_status_id,
    factory_status_id: data.factory_status_id,
    delivery_status_id: data.delivery_status_id,
    created_at: new Date(data.created_at),
    updated_at: new Date(data.updated_at),
  };
};

/**
 * Helper function to map database row to OrderItemInput type
 */
const mapToOrderItemRow = (
  data: Database["public"]["Tables"]["order_items"]["Row"],
): OrderItem => {
  return {
    unit_price_usd: data.unit_price_usd || 0,
    id: data.id,
    order_id: data.order_id,
    sku: data.sku,
    size: data.size,
    type: data.type,
    quantity: data.quantity,
    created_at: new Date(data.created_at),
    updated_at: new Date(data.updated_at),
  };
};

/**
 * Table references for reusability
 */
const ordersTable = () => supabase.from("orders");
const orderItemsTable = () => supabase.from("order_items");

/**
 * Order Supabase Service
 * Handles all database operations related to orders using Supabase
 */
export const orderServiceApi = {
  /**
   * Fetch all orders
   */
  async getOrders(): Promise<Order[]> {
    const { data, error } = await ordersTable()
      .select("*")
      .order("order_date", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      throw new Error(handleSupabaseError(error));
    }

    if (!data || data.length === 0) return [];

    return data.map(mapToOrderRow);
  },

  /**
   * Fetch a single order by ID
   */
  async getOrderById(id: number): Promise<Order> {
    const { data, error } = await ordersTable()
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching order:", error);
      if (error.code === "PGRST116") {
        throw new Error("Order not found");
      }
      throw new Error(handleSupabaseError(error));
    }

    if (!data) throw new Error("Order not found");

    return mapToOrderRow(data);
  },

  /**
   * Fetch order items for a specific order
   */
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    const { data, error } = await orderItemsTable()
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching order items:", error);
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
    financialData: Partial<Order>,
  ): Promise<Order> {
    console.log("🚀 Creating order with data:", {
      formData,
      items,
      financialData,
    });

    // Convert financial data to snake_case
    const snakeCaseFinancialData = convertToSnakeCase(
      financialData as Record<string, unknown>,
    );

    // Ensure employee IDs are numbers, not strings
    const employeeIdNum = formData.employeeId
      ? typeof formData.employeeId === "string"
        ? parseInt(formData.employeeId, 10)
        : formData.employeeId
      : null;
    const sellerEmployeeIdNum = formData.sellerEmployeeId
      ? typeof formData.sellerEmployeeId === "string"
        ? parseInt(formData.sellerEmployeeId, 10)
        : formData.sellerEmployeeId
      : null;

    // Insert order
    const rawInsertData = {
      shop_id: formData.shopId,
      order_id: formData.orderId,
      order_date: formData.orderDate,
      scheduled_ship_date: formData.scheduledShipDate,
      customer_name: formData.customerName,
      customer_address: formData.customerAddress,
      customer_phone: formData.customerPhone,
      customer_email: formData.customerEmail,
      customer_notes: formData.customerNotes,
      artist_employee_id: employeeIdNum,
      seller_employee_id: sellerEmployeeIdNum,
      artist_commission_rate: formData.artistCommissionRate || 0,
      ...snakeCaseFinancialData,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const insertData = cleanInsertData(rawInsertData) as any;
    console.log("📝 Insert data after cleaning:", insertData);

    const { data: orderData, error: orderError } = await ordersTable()
      .insert(insertData)
      .select()
      .single();

    if (orderError) {
      console.error("❌ Error creating order:", orderError);
      throw new Error(handleSupabaseError(orderError));
    }

    if (!orderData) throw new Error("Failed to create order");
    console.log("✅ Order created successfully:", orderData);

    // Track order creation in history
    try {
      const currentUser = getCurrentUserForService();
      const currentEmployeeId = currentUser?.employeeId || undefined;
      await trackOrderCreated(orderData.id, currentEmployeeId);
    } catch (error) {
      console.error("Failed to track order creation:", error);
      // Don't fail the order creation if history tracking fails
    }

    // Send notification
    try {
      await notificationService.sendNotification({
        type: "order_created",
        title: "🎉 Đơn hàng mới",
        description: `Đơn hàng #${orderData.order_id} từ ${formData.customerName} vừa được tạo`,
        orderId: orderData.id,
        orderCode: orderData.order_id,
        data: {
          customer: formData.customerName,
          amount: orderData.item_total_vnd,
        },
      });
    } catch (error) {
      console.error("Failed to send notification:", error);
      // Don't fail the order creation if notification fails
    }

    // Insert order items
    if (items.length > 0) {
      const itemsData: Database["public"]["Tables"]["order_items"]["Insert"][] =
        items.map((item) => ({
          order_id: orderData.id,
          sku: item.sku,
          size: item.size,
          type: item.type,
          quantity: item.quantity,
          unit_price_usd: item.unit_price_usd || 0,
        }));

      console.log("📦 Inserting order items:", itemsData);

      const { error: itemsError } = await orderItemsTable().insert(itemsData);

      if (itemsError) {
        console.error("❌ Error creating order items:", itemsError);
        // Rollback: delete the order
        await ordersTable().delete().eq("id", orderData.id);
        throw new Error(handleSupabaseError(itemsError));
      }

      console.log("✅ Order items created successfully");
    }

    return mapToOrderRow(orderData);
  },

  /**
   * Update an existing order
   */
  async updateOrder(
    id: string,
    formData: Partial<OrderFormData>,
    financialData?: Partial<Order>,
  ): Promise<Order> {
    const numericId = parseInt(id, 10);

    // Get the current order data for history tracking
    const oldOrder = await this.getOrderById(numericId);

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // Update form data
    if (formData.shopId !== undefined) updateData.shop_id = formData.shopId;
    if (formData.orderId !== undefined) updateData.order_id = formData.orderId;
    if (formData.orderDate !== undefined)
      updateData.order_date = formData.orderDate;
    if (formData.scheduledShipDate !== undefined)
      updateData.scheduled_ship_date = formData.scheduledShipDate;
    if (formData.customerName !== undefined)
      updateData.customer_name = formData.customerName;
    if (formData.customerAddress !== undefined)
      updateData.customer_address = formData.customerAddress;
    if (formData.customerPhone !== undefined)
      updateData.customer_phone = formData.customerPhone;
    if (formData.customerEmail !== undefined)
      updateData.customer_email = formData.customerEmail;
    if (formData.customerNotes !== undefined)
      updateData.customer_notes = formData.customerNotes;
    if (formData.employeeId !== undefined) {
      // Ensure employeeId is a number, not a string
      const employeeIdNum =
        typeof formData.employeeId === "string"
          ? parseInt(formData.employeeId, 10)
          : formData.employeeId;
      updateData.artist_employee_id = employeeIdNum || null;
    }
    if (formData.sellerEmployeeId !== undefined) {
      // Ensure sellerEmployeeId is a number, not a string
      const sellerEmployeeIdNum =
        typeof formData.sellerEmployeeId === "string"
          ? parseInt(formData.sellerEmployeeId, 10)
          : formData.sellerEmployeeId;
      updateData.seller_employee_id = sellerEmployeeIdNum || null;
    }
    if (formData.artistCommissionRate !== undefined)
      updateData.artist_commission_rate = formData.artistCommissionRate;

    // Shipping info
    if (formData.actualShipDate !== undefined)
      updateData.actual_ship_date = formData.actualShipDate;
    if (formData.carrierUnit !== undefined)
      updateData.carrier_unit = formData.carrierUnit;
    if (formData.carrierNotes !== undefined)
      updateData.carrier_notes = formData.carrierNotes;
    if (formData.trackingNumber !== undefined)
      updateData.tracking_number = formData.trackingNumber;
    if (formData.internalTrackingNumber !== undefined)
      updateData.internal_tracking_number = formData.internalTrackingNumber;
    if (formData.shippingFeeUsd !== undefined)
      updateData.shipping_fee_usd = formData.shippingFeeUsd;
    if (formData.shippingExchangeRate !== undefined)
      updateData.shipping_exchange_rate = formData.shippingExchangeRate;

    // Update financial data - convert camelCase to snake_case
    if (financialData) {
      const snakeCaseFinancialData = convertToSnakeCase(
        financialData as Record<string, unknown>,
      );

      // Remove employee IDs from financial data (they're handled above in formData)
      // This prevents type conflicts if they accidentally get included
      delete snakeCaseFinancialData.artist_employee_id;
      delete snakeCaseFinancialData.seller_employee_id;

      Object.assign(updateData, snakeCaseFinancialData);
    }

    console.log("📝 Update data:", updateData);
    console.log("🔍 Employee IDs types:", {
      artist_employee_id: updateData.artist_employee_id,
      artist_type: typeof updateData.artist_employee_id,
      seller_employee_id: updateData.seller_employee_id,
      seller_type: typeof updateData.seller_employee_id,
    });

    // Ensure numeric fields are actually numbers (Supabase type casting issue workaround)
    if (
      updateData.artist_employee_id !== undefined &&
      updateData.artist_employee_id !== null
    ) {
      updateData.artist_employee_id = Number(updateData.artist_employee_id);
    }
    if (
      updateData.seller_employee_id !== undefined &&
      updateData.seller_employee_id !== null
    ) {
      updateData.seller_employee_id = Number(updateData.seller_employee_id);
    }
    if (updateData.shop_id !== undefined && updateData.shop_id !== null) {
      updateData.shop_id = Number(updateData.shop_id);
    }

    console.log("🔧 After Number() conversion:", {
      artist_employee_id: updateData.artist_employee_id,
      artist_type: typeof updateData.artist_employee_id,
      seller_employee_id: updateData.seller_employee_id,
      seller_type: typeof updateData.seller_employee_id,
    });

    // Log the full update data as JSON to see exactly what Supabase receives
    console.log(
      "📤 Full update payload (JSON):",
      JSON.stringify(updateData, null, 2),
    );

    const { data, error } = await ordersTable()
      .update(updateData)
      .eq("id", numericId)
      .select()
      .single();

    if (error) {
      console.error("Error updating order:", error);
      throw new Error(handleSupabaseError(error));
    }

    if (!data) throw new Error("Failed to update order");

    const updatedOrder = mapToOrderRow(data);

    // Track order changes in history
    try {
      const currentUser = getCurrentUserForService();
      const currentEmployeeId = currentUser?.employeeId || undefined;
      await trackOrderChanges(
        numericId,
        oldOrder,
        updatedOrder,
        currentEmployeeId,
      );
    } catch (error) {
      console.error("Failed to track order changes:", error);
      // Don't fail the order update if history tracking fails
    }

    // Send notification with change details
    try {
      const changes = orderServiceApi.getOrderChanges(oldOrder, updatedOrder);
      if (changes.length > 0) {
        // Get current logged-in user info
        const currentUser = getCurrentUserForService();
        const employeeName = currentUser?.employeeName || undefined;
        
        console.log("📢 Notification - Current User:", {
          currentUser,
          employeeName,
        });

        const changeDescription = changes.join("\n");
        await notificationService.sendNotification({
          type: "order_updated",
          title: "📝 Đơn hàng được cập nhật",
          description: `Đơn hàng #${updatedOrder.order_id}:\n${changeDescription}`,
          orderId: updatedOrder.id,
          orderCode: updatedOrder.order_id,
          data: {
            customer: updatedOrder.customer_name,
            amount: updatedOrder.item_total_vnd,
            changes: changes,
            updatedBy: employeeName,
          },
        });
      }
    } catch (error) {
      console.error("Failed to send notification:", error);
      // Don't fail the order update if notification fails
    }

    return updatedOrder;
  },

  /**
   * Update order items
   */
  async updateOrderItems(
    orderId: number,
    items: OrderItemFormData[],
  ): Promise<OrderItem[]> {
    console.log("🔄 Updating order items for order:", orderId, items);

    // Get existing items for history tracking
    const oldItems = await this.getOrderItems(orderId);

    // Delete existing items
    const { error: deleteError } = await orderItemsTable()
      .delete()
      .eq("order_id", orderId);

    if (deleteError) {
      console.error("❌ Error deleting order items:", deleteError);
      throw new Error(handleSupabaseError(deleteError));
    }

    // Insert new items
    if (items.length > 0) {
      const itemsData = items.map((item) => ({
        order_id: orderId,
        sku: item.sku,
        size: item.size,
        type: item.type,
        quantity: item.quantity,
        unit_price_usd: item.unit_price_usd || 0,
      }));

      console.log("📦 Inserting updated order items:", itemsData);

      const { data: insertedData, error: insertError } = await orderItemsTable()
        .insert(itemsData)
        .select();

      if (insertError) {
        console.error("❌ Error inserting order items:", insertError);
        throw new Error(handleSupabaseError(insertError));
      }

      console.log("✅ Order items updated successfully");
      const newItems = insertedData?.map(mapToOrderItemRow) || [];

      // Track order items changes in history
      try {
        const currentUser = getCurrentUserForService();
        const currentEmployeeId = currentUser?.employeeId || undefined;
        await trackOrderItemsUpdate(orderId, oldItems, newItems, currentEmployeeId);
      } catch (error) {
        console.error("Failed to track order items update:", error);
        // Don't fail the update if history tracking fails
      }

      return newItems;
    }

    // Track empty items update
    try {
      const currentUser = getCurrentUserForService();
      const currentEmployeeId = currentUser?.employeeId || undefined;
      await trackOrderItemsUpdate(orderId, oldItems, [], currentEmployeeId);
    } catch (error) {
      console.error("Failed to track order items update:", error);
    }

    return [];
  },

  /**
   * Delete an order (will cascade delete order items)
   */
  async deleteOrder(id: string): Promise<void> {
    const numericId = parseInt(id, 10);

    // Delete order items first
    const { error: itemsError } = await orderItemsTable()
      .delete()
      .eq("order_id", numericId);

    if (itemsError) {
      console.error("Error deleting order items:", itemsError);
      throw new Error(handleSupabaseError(itemsError));
    }

    // Then delete the order
    const { error } = await ordersTable().delete().eq("id", numericId);

    if (error) {
      console.error("Error deleting order:", error);
      throw new Error(handleSupabaseError(error));
    }
  },

  /**
   * Update order status
   */
  async updateOrderStatus(
    id: string,
    statusType: "general" | "customer" | "factory" | "delivery",
    statusId: number | null,
  ): Promise<Order> {
    const numericId = parseInt(id, 10);

    // Get old order for tracking
    const oldOrder = await this.getOrderById(numericId);
    if (!oldOrder) throw new Error("Order not found");

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    let oldStatusId: number | null = null;
    switch (statusType) {
      case "general":
        oldStatusId = oldOrder.general_status_id;
        updateData.general_status_id = statusId;
        break;
      case "customer":
        oldStatusId = oldOrder.customer_status_id;
        updateData.customer_status_id = statusId;
        break;
      case "factory":
        oldStatusId = oldOrder.factory_status_id;
        updateData.factory_status_id = statusId;
        break;
      case "delivery":
        oldStatusId = oldOrder.delivery_status_id;
        updateData.delivery_status_id = statusId;
        break;
    }

    const { data, error } = await ordersTable()
      .update(updateData)
      .eq("id", numericId)
      .select()
      .single();

    if (error) {
      console.error("Error updating order status:", error);
      throw new Error(handleSupabaseError(error));
    }

    if (!data) throw new Error("Failed to update status");

    // Track status change
    try {
      const currentUser = getCurrentUserForService();
      const currentEmployeeId = currentUser?.employeeId || undefined;
      await trackStatusChange(
        numericId,
        statusType,
        oldStatusId,
        statusId,
        currentEmployeeId,
      );
    } catch (error) {
      console.error("Failed to track status change:", error);
      // Don't fail the status update if history tracking fails
    }

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
    },
  ): Promise<Order> {
    const numericId = parseInt(id, 10);

    const updateData = {
      ...shippingData,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await ordersTable()
      .update(updateData)
      .eq("id", numericId)
      .select()
      .single();

    if (error) {
      console.error("Error updating shipping info:", error);
      throw new Error(handleSupabaseError(error));
    }

    if (!data) throw new Error("Failed to update shipping info");

    return mapToOrderRow(data);
  },

  /**
   * Search orders
   */
  async searchOrders(query: string): Promise<Order[]> {
    const { data, error } = await ordersTable()
      .select("*")
      .or(
        `order_id.like.%${query}%,customer_name.like.%${query}%,tracking_number.like.%${query}%`,
      )
      .order("order_date", { ascending: false });

    if (error) {
      console.error("Error searching orders:", error);
      throw new Error(handleSupabaseError(error));
    }

    if (!data || data.length === 0) return [];

    return data.map(mapToOrderRow);
  },

  /**
   * Filter orders by date range
   */
  async filterOrdersByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<Order[]> {
    const { data, error } = await ordersTable()
      .select("*")
      .gte("order_date", startDate)
      .lte("order_date", endDate)
      .order("order_date", { ascending: false });

    if (error) {
      console.error("Error filtering orders:", error);
      throw new Error(handleSupabaseError(error));
    }

    if (!data || data.length === 0) return [];

    return data.map(mapToOrderRow);
  },

  /**
   * Get orders by shop
   */
  async getOrdersByShop(shopId: number): Promise<Order[]> {
    const { data, error } = await ordersTable()
      .select("*")
      .eq("shop_id", shopId)
      .order("order_date", { ascending: false });

    if (error) {
      console.error("Error fetching orders by shop:", error);
      throw new Error(handleSupabaseError(error));
    }

    if (!data || data.length === 0) return [];

    return data.map(mapToOrderRow);
  },

  /**
   * Get orders by employee
   */
  async getOrdersByEmployee(employeeId: number): Promise<Order[]> {
    const { data, error } = await ordersTable()
      .select("*")
      .eq("artist_employee_id", employeeId)
      .order("order_date", { ascending: false });

    if (error) {
      console.error("Error fetching orders by employee:", error);
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

    // Delete order items first using databaseService
    await databaseService.batchDelete("order_items", ids);

    // Then delete the orders using databaseService
    await databaseService.batchDelete("orders", ids);
  },

  /**
   * Export orders to CSV (get all data for client-side export)
   */
  async exportOrders(): Promise<Order[]> {
    const { data, error } = await ordersTable()
      .select("*")
      .order("order_date", { ascending: false });

    if (error) {
      console.error("Error exporting orders:", error);
      throw new Error(handleSupabaseError(error));
    }

    if (!data || data.length === 0) return [];

    return data.map(mapToOrderRow);
  },

  /**
   * Get total order count
   */
  async getOrderCount(filter?: Record<string, unknown>): Promise<number> {
    return databaseService.getRecordCount("orders", filter);
  },

  /**
   * Check if order exists
   */
  async orderExists(id: number): Promise<boolean> {
    return databaseService.recordExists("orders", { id });
  },

  /**
   * Get latest order ID
   */
  async getLatestOrderId(): Promise<number | null> {
    return databaseService.getLatestId("orders", "id");
  },

  /**
   * Get next order ID
   */
  async getNextOrderId(): Promise<number> {
    return databaseService.getNextId("orders", "id");
  },

  /**
   * Get order item count for an order
   */
  async getOrderItemCount(orderId: number): Promise<number> {
    return databaseService.getRecordCount("order_items", { order_id: orderId });
  },

  /**
   * Bulk delete order items
   */
  async bulkDeleteOrderItems(ids: number[]): Promise<void> {
    await databaseService.batchDelete("order_items", ids);
  },

  /**
   * Check if order has significant changes worth notifying
   */
  hasSignificantChanges(oldOrder: Order, newOrder: Order): boolean {
    // Fields that trigger notification
    const significantFields = [
      "customer_name",
      "customer_phone",
      "customer_email",
      "item_total_vnd",
      "item_total_usd",
      "buyer_paid_vnd",
      "buyer_paid_usd",
      "order_earnings_vnd",
      "order_earnings_usd",
      "artist_employee_id",
      "seller_employee_id",
      "delivery_status_id",
    ] as const;

    return significantFields.some(
      (field) => oldOrder[field] !== newOrder[field],
    );
  },

  /**
   * Get detailed list of changes between old and new order
   * Uses the centralized change tracker utility
   */
  getOrderChanges(oldOrder: Order, newOrder: Order): string[] {
    const fieldChanges = detectOrderChanges(oldOrder, newOrder);
    return formatChangesForNotification(fieldChanges);
  },
};
