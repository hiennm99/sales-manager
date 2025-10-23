// src/features/employees/services/employeeSalary.service.api.ts

import { endOfMonth, endOfYear, format } from "date-fns";
import { handleSupabaseError, supabase } from "../../../lib/supabase";
import type {
  EmployeeSalary,
  EmployeeSalaryFilters,
  EmployeeSalaryFormData,
  EmployeeSalaryPeriod,
} from "../../../types/employee";

/**
 * Table references for reusability
 */
const employeesTable = () => supabase.from("employees");
const employeeCommissionTable = () => supabase.from("employee_commission");
const employeeSalaryTable = () => supabase.from("employee_salary");

/**
 * Employee Salary Service API
 * Handles salary calculations, storage, and management
 */
export const employeeSalaryServiceApi = {
  /**
   * Calculate employee salary for a specific period using employee_commission table
   * - Artist commission: Sum of artist_commission_amount_vnd
   * - Seller commission: Sum of seller_commission_amount_vnd
   */
  async calculateEmployeeSalary(
    filters: EmployeeSalaryFilters,
  ): Promise<EmployeeSalaryPeriod[]> {
    const { employee_id, year, month } = filters;

    console.log("📊 Calculating salary for:", { employee_id, year, month });

    // Fetch ALL active employees (or specific employee if filtered)
    let employeeQuery = employeesTable()
      .select("id, name, code, base_salary, sales_commission_rate, is_active")
      .eq("is_active", true);

    if (employee_id) {
      employeeQuery = employeeQuery.eq("id", employee_id);
    }

    const { data: employees, error: employeesError } = await employeeQuery;

    if (employeesError) {
      console.error("Error fetching employees:", employeesError);
      throw new Error(handleSupabaseError(employeesError));
    }

    if (!employees || employees.length === 0) {
      console.log("📊 No employees found");
      return [];
    }

    console.log("📊 Found employees:", employees.length);

    // Build date filter for commissions
    let commissionQuery = employeeCommissionTable().select("*");

    if (month !== undefined) {
      // Monthly: filter by year and month
      const startDate = format(new Date(year, month - 1, 1), "yyyy-MM-dd");
      const endDate = format(
        endOfMonth(new Date(year, month - 1, 1)),
        "yyyy-MM-dd",
      );
      commissionQuery = commissionQuery
        .gte("actual_ship_date", startDate)
        .lte("actual_ship_date", endDate);
    } else {
      // Yearly: filter by year only
      const startDate = format(new Date(year, 0, 1), "yyyy-MM-dd");
      const endDate = format(endOfYear(new Date(year, 0, 1)), "yyyy-MM-dd");
      commissionQuery = commissionQuery
        .gte("actual_ship_date", startDate)
        .lte("actual_ship_date", endDate);
    }

    const { data: commissions, error: commissionsError } =
      await commissionQuery;

    if (commissionsError) {
      console.error("Error fetching commissions:", commissionsError);
      throw new Error(handleSupabaseError(commissionsError));
    }

    console.log("📊 Found commissions:", commissions?.length || 0);

    // Calculate salary for each employee
    const salaryData: EmployeeSalaryPeriod[] = [];

    for (const employee of employees) {
      // Filter commissions for this employee
      const artistCommissions =
        commissions?.filter((c) => c.artist_employee_id === employee.id) || [];
      const sellerCommissions =
        commissions?.filter((c) => c.seller_employee_id === employee.id) || [];

      // Sum up commissions
      const artist_commission_total = artistCommissions.reduce(
        (sum, c) => sum + (c.artist_commission_amount_vnd || 0),
        0,
      );
      const seller_commission_total = sellerCommissions.reduce(
        (sum, c) => sum + (c.seller_commission_amount_vnd || 0),
        0,
      );

      // Count orders
      const artist_orders_count = artistCommissions.length;
      const seller_orders_count = sellerCommissions.length;

      // Sum financial data
      const artist_profit_vnd = artistCommissions.reduce(
        (sum, c) => sum + (c.profit_vnd || 0),
        0,
      );
      const seller_profit_vnd = sellerCommissions.reduce(
        (sum, c) => sum + (c.profit_vnd || 0),
        0,
      );
      const total_profit_vnd = artist_profit_vnd + seller_profit_vnd;
      const total_order_earnings_vnd = sellerCommissions.reduce(
        (sum, c) => sum + (c.order_earnings_vnd || 0),
        0,
      );

      // Base salary calculation
      let base_salary = employee.base_salary || 0;

      if (month === undefined) {
        // Yearly: multiply base salary by 12
        base_salary = base_salary * 12;
      }

      // Other costs, bonus, and deduction will be manually entered when saving
      const other_costs = 0;
      const bonus = 0;
      const deduction = 0;

      const total_salary =
        base_salary +
        artist_commission_total +
        seller_commission_total +
        bonus -
        other_costs -
        deduction;

      console.log(`📊 Employee ${employee.name}:`, {
        artist_commission_total,
        seller_commission_total,
        artist_orders_count,
        seller_orders_count,
        total_salary,
      });

      salaryData.push({
        employee_id: employee.id,
        employee_name: employee.name,
        employee_code: employee.code,
        salary_period_year: year,
        salary_period_month: month !== undefined ? month : null,
        base_salary,
        artist_commission_total,
        seller_commission_total,
        other_costs,
        bonus,
        deduction,
        total_salary,
        artist_orders_count,
        seller_orders_count,
        orders_count: artist_orders_count + seller_orders_count,
        total_profit_vnd,
        total_order_earnings_vnd,
        artist_profit_vnd,
        seller_profit_vnd,
      });
    }

    return salaryData.sort((a, b) => b.total_salary - a.total_salary);
  },

  /**
   * Get monthly salary breakdown for an employee for the entire year
   */
  async getYearlySalaryBreakdown(
    employee_id: number,
    year: number,
  ): Promise<EmployeeSalaryPeriod[]> {
    const monthlyData: EmployeeSalaryPeriod[] = [];

    // Fetch employee data once
    const { data: employee } = await employeesTable()
      .select("id, name, code, base_salary")
      .eq("id", employee_id)
      .single();

    if (!employee) {
      throw new Error("Employee not found");
    }

    for (let month = 1; month <= 12; month++) {
      const data = await this.calculateEmployeeSalary({
        employee_id,
        year,
        month,
      });
      if (data.length > 0) {
        monthlyData.push(data[0]);
      } else {
        // Add empty month data
        const base_salary = employee.base_salary || 0;
        monthlyData.push({
          employee_id: employee.id,
          employee_name: employee.name,
          employee_code: employee.code,
          salary_period_year: year,
          salary_period_month: month,
          base_salary,
          artist_commission_total: 0,
          seller_commission_total: 0,
          bonus: 0,
          other_costs: 0,
          deduction: 0,
          total_salary: base_salary,
          artist_orders_count: 0,
          seller_orders_count: 0,
          orders_count: 0,
          total_profit_vnd: 0,
          total_order_earnings_vnd: 0,
          artist_profit_vnd: 0,
          seller_profit_vnd: 0,
        });
      }
    }

    return monthlyData;
  },

  /**
   * Get saved salary record for a specific employee and period
   */
  async getSalaryRecord(
    employee_id: number,
    year: number,
    month?: number,
  ): Promise<EmployeeSalary | null> {
    let query = employeeSalaryTable()
      .select("*")
      .eq("employee_id", employee_id)
      .eq("salary_period_year", year);

    if (month !== undefined) {
      query = query.eq("salary_period_month", month);
    } else {
      query = query.is("salary_period_month", null);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // No record found
      }
      console.error("Error fetching salary record:", error);
      throw new Error(handleSupabaseError(error));
    }

    if (!data) return null;

    return {
      id: data.id,
      employee_id: data.employee_id,
      salary_period_year: data.salary_period_year,
      salary_period_month: data.salary_period_month,
      base_salary: data.base_salary ?? 0,
      artist_commission_total: data.artist_commission_total ?? 0,
      seller_commission_total: data.seller_commission_total ?? 0,
      other_costs: data.other_costs ?? 0,
      bonus: data.bonus ?? 0,
      deduction: data.deduction ?? 0,
      total_salary: data.total_salary ?? 0,
      status: (data.status as "draft" | "approved" | "paid") || "draft",
      approved_by: data.approved_by,
      approved_at: data.approved_at ? new Date(data.approved_at) : null,
      paid_at: data.paid_at ? new Date(data.paid_at) : null,
      notes: data.notes,
      created_at: new Date(),
      updated_at: new Date(),
    };
  },

  /**
   * Get all salary records for a specific period
   */
  async getSalaryRecords(
    filters: EmployeeSalaryFilters,
  ): Promise<EmployeeSalary[]> {
    let query = employeeSalaryTable()
      .select("*")
      .eq("salary_period_year", filters.year);

    if (filters.month !== undefined) {
      query = query.eq("salary_period_month", filters.month);
    }

    if (filters.employee_id) {
      query = query.eq("employee_id", filters.employee_id);
    }

    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    query = query.order("salary_period_month", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching salary records:", error);
      throw new Error(handleSupabaseError(error));
    }

    if (!data || data.length === 0) return [];

    // Fetch commission data to calculate profit breakdown
    const startDate = format(
      new Date(filters.year, (filters.month || 1) - 1, 1),
      "yyyy-MM-dd",
    );
    const endDate = filters.month
      ? format(
          endOfMonth(new Date(filters.year, filters.month - 1, 1)),
          "yyyy-MM-dd",
        )
      : format(endOfYear(new Date(filters.year, 0, 1)), "yyyy-MM-dd");

    const { data: commissions } = await employeeCommissionTable()
      .select("*")
      .gte("actual_ship_date", startDate)
      .lte("actual_ship_date", endDate);

    return data.map((row) => {
      // Calculate profit breakdown for this employee
      const artistCommissions =
        commissions?.filter((c) => c.artist_employee_id === row.employee_id) ||
        [];
      const sellerCommissions =
        commissions?.filter((c) => c.seller_employee_id === row.employee_id) ||
        [];

      const artist_profit_vnd = artistCommissions.reduce(
        (sum, c) => sum + (c.profit_vnd || 0),
        0,
      );
      const seller_profit_vnd = sellerCommissions.reduce(
        (sum, c) => sum + (c.profit_vnd || 0),
        0,
      );
      const artist_orders_count = artistCommissions.length;
      const seller_orders_count = sellerCommissions.length;

      return {
        id: row.id,
        employee_id: row.employee_id,
        salary_period_year: row.salary_period_year,
        salary_period_month: row.salary_period_month,
        base_salary: row.base_salary ?? 0,
        artist_commission_total: row.artist_commission_total ?? 0,
        seller_commission_total: row.seller_commission_total ?? 0,
        other_costs: row.other_costs ?? 0,
        bonus: row.bonus ?? 0,
        deduction: row.deduction ?? 0,
        total_salary: row.total_salary ?? 0,
        artist_profit_vnd,
        seller_profit_vnd,
        artist_orders_count,
        seller_orders_count,
        status: (row.status as "draft" | "approved" | "paid") || "draft",
        approved_by: row.approved_by,
        approved_at: row.approved_at ? new Date(row.approved_at) : null,
        paid_at: row.paid_at ? new Date(row.paid_at) : null,
        notes: row.notes,
        created_at: row.created_at ? new Date(row.created_at) : new Date(),
        updated_at: row.updated_at ? new Date(row.updated_at) : new Date(),
      };
    });
  },

  /**
   * Save/update salary record (upsert)
   */
  async saveSalaryRecord(
    formData: EmployeeSalaryFormData,
  ): Promise<EmployeeSalary> {
    // Validate required fields
    if (!formData.employee_id) {
      throw new Error("employee_id is required");
    }
    if (!formData.salary_period_year) {
      throw new Error("salary_period_year is required");
    }

    const total_salary =
      formData.base_salary +
      formData.artist_commission_total +
      formData.seller_commission_total +
      (formData.bonus || 0) -
      (formData.other_costs || 0) -
      (formData.deduction || 0);

    const insertData = {
      employee_id: formData.employee_id,
      salary_period_year: formData.salary_period_year,
      salary_period_month: formData.salary_period_month ?? null,
      base_salary: formData.base_salary,
      artist_commission_total: formData.artist_commission_total,
      seller_commission_total: formData.seller_commission_total,
      other_costs: formData.other_costs || 0,
      bonus: formData.bonus || 0,
      deduction: formData.deduction || 0,
      total_salary,
      status: formData.status || "draft",
      notes: formData.notes || null,
      approved_by: formData.approved_by || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await employeeSalaryTable()
      .upsert(insertData, {
        onConflict: "employee_id,salary_period_year,salary_period_month",
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving salary record:", error);
      throw new Error(handleSupabaseError(error));
    }

    if (!data) throw new Error("Failed to save salary record");

    return {
      id: data.id,
      employee_id: data.employee_id,
      salary_period_year: data.salary_period_year,
      salary_period_month: data.salary_period_month,
      base_salary: data.base_salary ?? 0,
      artist_commission_total: data.artist_commission_total ?? 0,
      seller_commission_total: data.seller_commission_total ?? 0,
      other_costs: data.other_costs ?? 0,
      bonus: data.bonus ?? 0,
      deduction: data.deduction ?? 0,
      total_salary: data.total_salary ?? 0,
      status: (data.status as "draft" | "approved" | "paid") || "draft",
      approved_by: data.approved_by,
      approved_at: data.approved_at ? new Date(data.approved_at) : null,
      paid_at: data.paid_at ? new Date(data.paid_at) : null,
      notes: data.notes,
      created_at: new Date(),
      updated_at: new Date(),
    };
  },

  /**
   * Calculate and save salary record for a specific employee and month
   */
  async calculateAndSave(
    employee_id: number,
    year: number,
    month: number,
  ): Promise<EmployeeSalary> {
    // Calculate salary
    const calculated = await this.calculateEmployeeSalary({
      employee_id,
      year,
      month,
    });

    if (calculated.length === 0) {
      throw new Error("No salary data to save for this period");
    }

    const salaryData = calculated[0];

    // Prepare form data
    const formData: EmployeeSalaryFormData = {
      employee_id: salaryData.employee_id,
      salary_period_year: year,
      salary_period_month: month,
      base_salary: salaryData.base_salary,
      artist_commission_total: salaryData.artist_commission_total,
      seller_commission_total: salaryData.seller_commission_total,
      other_costs: salaryData.other_costs,
      bonus: salaryData.bonus,
      deduction: salaryData.deduction,
    };

    return this.saveSalaryRecord(formData);
  },

  /**
   * Approve salary record
   */
  async approveSalary(
    employee_id: number,
    year: number,
    month: number,
    approved_by: number,
  ): Promise<EmployeeSalary | null> {
    const { data, error } = await employeeSalaryTable()
      .update({
        status: "approved",
        approved_at: new Date().toISOString(),
        approved_by,
        updated_at: new Date().toISOString(),
      })
      .eq("employee_id", employee_id)
      .eq("salary_period_year", year)
      .eq("salary_period_month", month)
      .select()
      .single();

    if (error) {
      console.error("Error approving salary:", error);
      throw new Error(handleSupabaseError(error));
    }

    if (!data) return null;

    return this.getSalaryRecord(employee_id, year, month);
  },

  /**
   * Mark salary as paid
   */
  async markAsPaid(
    employee_id: number,
    year: number,
    month: number,
  ): Promise<EmployeeSalary | null> {
    const { data, error } = await employeeSalaryTable()
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("employee_id", employee_id)
      .eq("salary_period_year", year)
      .eq("salary_period_month", month)
      .select()
      .single();

    if (error) {
      console.error("Error marking salary as paid:", error);
      throw new Error(handleSupabaseError(error));
    }

    if (!data) return null;

    return this.getSalaryRecord(employee_id, year, month);
  },

  /**
   * Delete salary record
   */
  async deleteSalaryRecord(
    employee_id: number,
    year: number,
    month: number,
  ): Promise<void> {
    const { error } = await employeeSalaryTable()
      .delete()
      .eq("employee_id", employee_id)
      .eq("salary_period_year", year)
      .eq("salary_period_month", month);

    if (error) {
      console.error("Error deleting salary record:", error);
      throw new Error(handleSupabaseError(error));
    }
  },
};
