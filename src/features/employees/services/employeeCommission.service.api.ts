// src/features/employees/services/employeeCommission.service.api.ts

import { endOfMonth, format } from "date-fns";
import { handleSupabaseError, supabase } from "../../../lib/supabase";
import type { EmployeeCommission } from "../../../types/employee";

/**
 * Employee Commission Service API
 * Handles reading commission records from employee_commission table
 * Note: This table is auto-populated by trigger, so no create/update/delete methods
 */
export const employeeCommissionServiceApi = {
  /**
   * Get all commissions for a specific employee
   */
  async getCommissionsByEmployee(
    employee_id: number,
    options?: {
      as_artist?: boolean; // Filter by artist_employee_id
      as_seller?: boolean; // Filter by seller_employee_id
      start_date?: string;
      end_date?: string;
    },
  ): Promise<EmployeeCommission[]> {
    let query = supabase.from("employee_commission").select("*");

    // Filter by role
    if (options?.as_artist) {
      query = query.eq("artist_employee_id", employee_id);
    } else if (options?.as_seller) {
      query = query.eq("seller_employee_id", employee_id);
    } else {
      // Both roles
      query = query.or(
        `artist_employee_id.eq.${employee_id},seller_employee_id.eq.${employee_id}`,
      );
    }

    // Date range filter
    if (options?.start_date) {
      query = query.gte("actual_ship_date", options.start_date);
    }
    if (options?.end_date) {
      query = query.lte("actual_ship_date", options.end_date);
    }

    query = query.order("actual_ship_date", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching employee commissions:", error);
      throw new Error(handleSupabaseError(error));
    }

    if (!data || data.length === 0) return [];

    return data.map((row) => ({
      id: row.id,
      order_id: row.order_id,
      order_date: row.order_date,
      actual_ship_date: row.actual_ship_date,
      artist_employee_id: row.artist_employee_id,
      artist_commission_rate: row.artist_commission_rate,
      artist_commission_amount_vnd: row.artist_commission_amount_vnd,
      seller_employee_id: row.seller_employee_id,
      seller_commission_rate: row.seller_commission_rate,
      seller_commission_amount_vnd: row.seller_commission_amount_vnd,
      profit_vnd: row.profit_vnd,
      order_earnings_vnd: row.order_earnings_vnd,
      created_at: row.created_at ? new Date(row.created_at) : new Date(),
      updated_at: row.updated_at ? new Date(row.updated_at) : (row.created_at ? new Date(row.created_at) : new Date())
    }));
  },

  /**
   * Get commission for a specific order
   */
  async getCommissionByOrder(
    order_id: number,
  ): Promise<EmployeeCommission | null> {
    const { data, error } = await supabase
      .from("employee_commission")
      .select("*")
      .eq("order_id", order_id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // No commission record found
      }
      console.error("Error fetching commission by order:", error);
      throw new Error(handleSupabaseError(error));
    }

    if (!data) return null;

    return {
      id: data.id,
      order_id: data.order_id,
      order_date: data.order_date,
      actual_ship_date: data.actual_ship_date,
      artist_employee_id: data.artist_employee_id,
      artist_commission_rate: data.artist_commission_rate,
      artist_commission_amount_vnd: data.artist_commission_amount_vnd,
      seller_employee_id: data.seller_employee_id,
      seller_commission_rate: data.seller_commission_rate,
      seller_commission_amount_vnd: data.seller_commission_amount_vnd,
      profit_vnd: data.profit_vnd,
      order_earnings_vnd: data.order_earnings_vnd,
      created_at: data.created_at ? new Date(data.created_at) : new Date(),
      updated_at: data.updated_at ? new Date(data.updated_at) : (data.created_at ? new Date(data.created_at) : new Date()),
    };
  },

  /**
   * Get commissions for a specific period
   */
  async getCommissionsByPeriod(
    year: number,
    month?: number,
    employee_id?: number,
  ): Promise<EmployeeCommission[]> {
    let query = supabase.from("employee_commission").select("*");

    // Build date filter
    let start_date: string;
    let end_date: string;

    if (month !== undefined) {
      // Monthly filter
      const date = new Date(year, month - 1, 1);
      start_date = format(date, "yyyy-MM-dd");
      end_date = format(endOfMonth(date), "yyyy-MM-dd");
    } else {
      // Yearly filter
      start_date = `${year}-01-01`;
      end_date = `${year}-12-31`;
    }

    query = query
      .gte("actual_ship_date", start_date)
      .lte("actual_ship_date", end_date);

    // Filter by employee if provided
    if (employee_id) {
      query = query.or(
        `artist_employee_id.eq.${employee_id},seller_employee_id.eq.${employee_id}`,
      );
    }

    query = query.order("actual_ship_date", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching commissions by period:", error);
      throw new Error(handleSupabaseError(error));
    }

    if (!data || data.length === 0) return [];

    return data.map((row) => ({
      id: row.id,
      order_id: row.order_id,
      order_date: row.order_date,
      actual_ship_date: row.actual_ship_date,
      artist_employee_id: row.artist_employee_id,
      artist_commission_rate: row.artist_commission_rate,
      artist_commission_amount_vnd: row.artist_commission_amount_vnd,
      seller_employee_id: row.seller_employee_id,
      seller_commission_rate: row.seller_commission_rate,
      seller_commission_amount_vnd: row.seller_commission_amount_vnd,
      profit_vnd: row.profit_vnd,
      order_earnings_vnd: row.order_earnings_vnd,
      created_at: row.created_at ? new Date(row.created_at) : new Date(),
      updated_at: row.updated_at ? new Date(row.updated_at) : (row.created_at ? new Date(row.created_at) : new Date()),
    }));
  },

  /**
   * Get commission summary for an employee
   */
  async getCommissionSummary(
    employee_id: number,
    year: number,
    month?: number,
  ): Promise<{
    artist_total: number;
    artist_count: number;
    seller_total: number;
    seller_count: number;
    total_profit_vnd: number;
    total_order_earnings_vnd: number;
  }> {
    const commissions = await this.getCommissionsByPeriod(
      year,
      month,
      employee_id,
    );

    const artistCommissions = commissions.filter(
      (c) => c.artist_employee_id === employee_id,
    );
    const sellerCommissions = commissions.filter(
      (c) => c.seller_employee_id === employee_id,
    );

    return {
      artist_total: artistCommissions.reduce(
        (sum, c) => sum + (c.artist_commission_amount_vnd ?? 0),
        0,
      ),
      artist_count: artistCommissions.length,
      seller_total: sellerCommissions.reduce(
        (sum, c) => sum + (c.seller_commission_amount_vnd ?? 0),
        0,
      ),
      seller_count: sellerCommissions.length,
      total_profit_vnd: artistCommissions.reduce(
        (sum, c) => sum + (c.profit_vnd ?? 0),
        0,
      ),
      total_order_earnings_vnd: sellerCommissions.reduce(
        (sum, c) => sum + (c.order_earnings_vnd ?? 0),
        0,
      ),
    };
  },
};
