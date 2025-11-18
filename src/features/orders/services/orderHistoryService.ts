// src/features/orders/services/orderHistoryService.ts

import { handleSupabaseError, supabase } from "@lib";
import type { Database, OrderHistory, OrderHistoryActionType } from "@types";

/**
 * Helper function to map database row to OrderHistory type
 */
const mapToOrderHistoryRow = (
  data: Database["public"]["Tables"]["order_history"]["Row"]
): OrderHistory => {
  return {
    id: data.id,
    order_id: data.order_id,
    action_type: data.action_type as OrderHistoryActionType,
    field_name: data.field_name,
    old_value: data.old_value,
    new_value: data.new_value,
    changed_by_employee_id: data.changed_by_employee_id,
    description: data.description,
    created_at: new Date(data.created_at),
    updated_at: new Date(data.created_at) // Use created_at since order_history table doesn't track updates
  };
};

/**
 * Order History Supabase Service
 * Handles all database operations related to order history tracking
 */
export const orderHistoryService = {
  /**
   * Create a new history record
   */
  async createHistoryRecord(
    orderId: number,
    actionType: OrderHistoryActionType,
    options?: {
      fieldName?: string;
      oldValue?: string;
      newValue?: string;
      changedByEmployeeId?: number;
      description?: string;
    }
  ): Promise<OrderHistory> {
    const insertData = {
      order_id: orderId,
      action_type: actionType,
      field_name: options?.fieldName || null,
      old_value: options?.oldValue || null,
      new_value: options?.newValue || null,
      changed_by_employee_id: options?.changedByEmployeeId || null,
      description: options?.description || null
    };
    const { data, error } = await supabase
      .from("order_history")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("❌ Error creating history record:", error);
      throw new Error(handleSupabaseError(error));
    }

    if (!data) throw new Error("Failed to create history record");

    return mapToOrderHistoryRow(data);
  },

  /**
   * Get all history records for an order
   */
  async getOrderHistory(orderId: number): Promise<OrderHistory[]> {
    const { data, error } = await supabase
      .from("order_history")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching order history:", error);
      throw new Error(handleSupabaseError(error));
    }

    if (!data || data.length === 0) return [];

    return data.map(mapToOrderHistoryRow);
  },

  /**
   * Get history records for an order with pagination
   */
  async getOrderHistoryPaginated(
    orderId: number,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ data: OrderHistory[]; total: number }> {
    // Get total count
    const { count, error: countError } = await supabase
      .from("order_history")
      .select("*", { count: "exact", head: true })
      .eq("order_id", orderId);

    if (countError) {
      console.error("Error counting history records:", countError);
      throw new Error(handleSupabaseError(countError));
    }

    // Get paginated data
    const { data, error } = await supabase
      .from("order_history")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching order history:", error);
      throw new Error(handleSupabaseError(error));
    }

    return {
      data: (data || []).map(mapToOrderHistoryRow),
      total: count || 0
    };
  },

  /**
   * Get a single history record by ID
   */
  async getHistoryRecordById(id: number): Promise<OrderHistory> {
    const { data, error } = await supabase
      .from("order_history")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching history record:", error);
      if (error.code === "PGRST116") {
        throw new Error("History record not found");
      }
      throw new Error(handleSupabaseError(error));
    }

    if (!data) throw new Error("History record not found");

    return mapToOrderHistoryRow(data);
  },

  /**
   * Get history records by action type
   */
  async getHistoryByActionType(
    orderId: number,
    actionType: OrderHistoryActionType
  ): Promise<OrderHistory[]> {
    const { data, error } = await supabase
      .from("order_history")
      .select("*")
      .eq("order_id", orderId)
      .eq("action_type", actionType)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching history by action type:", error);
      throw new Error(handleSupabaseError(error));
    }

    if (!data || data.length === 0) return [];

    return data.map(mapToOrderHistoryRow);
  },

  /**
   * Get history records by employee
   */
  async getHistoryByEmployee(
    orderId: number,
    employeeId: number
  ): Promise<OrderHistory[]> {
    const { data, error } = await supabase
      .from("order_history")
      .select("*")
      .eq("order_id", orderId)
      .eq("changed_by_employee_id", employeeId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching history by employee:", error);
      throw new Error(handleSupabaseError(error));
    }

    if (!data || data.length === 0) return [];

    return data.map(mapToOrderHistoryRow);
  },

  /**
   * Get history records within a date range
   */
  async getHistoryByDateRange(
    orderId: number,
    startDate: string,
    endDate: string
  ): Promise<OrderHistory[]> {
    const { data, error } = await supabase
      .from("order_history")
      .select("*")
      .eq("order_id", orderId)
      .gte("created_at", startDate)
      .lte("created_at", endDate)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching history by date range:", error);
      throw new Error(handleSupabaseError(error));
    }

    if (!data || data.length === 0) return [];

    return data.map(mapToOrderHistoryRow);
  },

  /**
   * Delete a history record
   */
  async deleteHistoryRecord(id: number): Promise<void> {
    const { error } = await supabase
      .from("order_history")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting history record:", error);
      throw new Error(handleSupabaseError(error));
    }
  },

  /**
   * Bulk delete history records for an order
   */
  async deleteOrderHistory(orderId: number): Promise<void> {
    const { error } = await supabase
      .from("order_history")
      .delete()
      .eq("order_id", orderId);

    if (error) {
      console.error("Error deleting order history:", error);
      throw new Error(handleSupabaseError(error));
    }
  },

  /**
   * Export order history as JSON
   */
  async exportOrderHistory(orderId: number): Promise<OrderHistory[]> {
    return this.getOrderHistory(orderId);
  }
};
