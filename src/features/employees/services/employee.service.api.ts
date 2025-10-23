// src/features/employees/services/employee.service.api.ts

import { DEFAULTS } from "../../../constants";
import { handleSupabaseError, supabase } from "../../../lib/supabase";
import type { Employee, EmployeeFormData } from "../../../types/employee";
import type { Database } from "../../../types/supabase.ts";

/**
 * Table reference for reusability
 */
const employeesTable = () => supabase.from("employees");

/**
 * Helper function to map database row to Employee type
 */
const mapToRow = (
  data: Database["public"]["Tables"]["employees"]["Row"],
): Employee => {
  return {
    id: data.id,
    name: data.name,
    code: data.code,
    avatar: data.avatar,
    is_active: data.is_active,
    role: data.role,
    base_salary: data.base_salary || 0,
    sales_commission_rate:
      data.sales_commission_rate || DEFAULTS.COMMISSION_RATE,
    created_at: new Date(data.created_at),
    updated_at: new Date(data.updated_at),
  };
};

/**
 * Employee Supabase Service
 * Handles all database operations related to employees using Supabase
 */
export const employeeServiceApi = {
  /**
   * Get all employees
   */
  async getAll(): Promise<Employee[]> {
    const { data, error } = await employeesTable()
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching employees:", error);
      throw new Error(handleSupabaseError(error));
    }

    if (!data) return [];

    return data.map(mapToRow);
  },

  /**
   * Get employee by ID
   */
  async getById(id: number): Promise<Employee | undefined> {
    const { data, error } = await employeesTable()
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return undefined;
      }
      console.error("Error fetching employee:", error);
      throw new Error(handleSupabaseError(error));
    }

    if (!data) return undefined;

    return mapToRow(data);
  },

  /**
   * Create a new employee
   */
  async create(formData: EmployeeFormData): Promise<Employee> {
    const insertData = {
      name: formData.name,
      code: formData.code,
      avatar: formData.avatar,
      role: formData.role,
      base_salary: formData.base_salary || 0,
      sales_commission_rate:
        formData.sales_commission_rate || DEFAULTS.COMMISSION_RATE,
    };

    const { data, error } = await employeesTable()
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Error creating employee:", error);
      throw new Error(handleSupabaseError(error));
    }

    if (!data) throw new Error("Failed to create employee");

    return mapToRow(data);
  },

  /**
   * Update an existing employee
   */
  async update(
    id: number,
    formData: Partial<EmployeeFormData>,
  ): Promise<Employee | undefined> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (formData.name !== undefined) updateData.name = formData.name;
    if (formData.code !== undefined) updateData.code = formData.code;
    if (formData.avatar !== undefined) updateData.avatar = formData.avatar;
    if (formData.role !== undefined) updateData.role = formData.role;
    if (formData.base_salary !== undefined)
      updateData.base_salary = formData.base_salary;
    if (formData.sales_commission_rate !== undefined)
      updateData.sales_commission_rate = formData.sales_commission_rate;

    const { data, error } = await employeesTable()
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return undefined;
      }
      console.error("Error updating employee:", error);
      throw new Error(handleSupabaseError(error));
    }

    if (!data) return undefined;

    return mapToRow(data);
  },

  /**
   * Delete an employee
   */
  async delete(id: number): Promise<boolean> {
    const { error } = await employeesTable().delete().eq("id", id);

    if (error) {
      console.error("Error deleting employee:", error);
      return false;
    }

    return true;
  },

  /**
   * Toggle employee status
   */
  async toggleStatus(id: number): Promise<Employee | undefined> {
    // Get current employee
    const { data: currentEmployee, error: fetchError } = await employeesTable()
      .select("is_active")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Error toggling employee status:", fetchError);
      throw new Error(handleSupabaseError(fetchError));
    }

    if (!currentEmployee) return undefined;

    // Toggle status
    const newStatus = !currentEmployee.is_active;

    const { data, error } = await employeesTable()
      .update({
        is_active: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error toggling employee status:", error);
      throw new Error(handleSupabaseError(error));
    }

    if (!data) return undefined;

    return mapToRow(data);
  },

  /**
   * Search employees
   */
  async search(query: string): Promise<Employee[]> {
    const { data, error } = await employeesTable()
      .select("*")
      .or(`name.ilike.%${query}%,code.ilike.%${query}%`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error searching employees:", error);
      throw new Error(handleSupabaseError(error));
    }

    if (!data) return [];

    return data.map(mapToRow);
  },

  /**
   * Bulk delete employees
   */
  async bulkDelete(ids: number[]): Promise<void> {
    if (!ids || ids.length === 0) return;

    const { error } = await employeesTable().delete().in("id", ids);

    if (error) {
      console.error("Error bulk deleting employees:", error);
      throw new Error(handleSupabaseError(error));
    }
  },

  /**
   * Bulk update employee status
   */
  async bulkUpdateStatus(ids: number[], is_active: boolean): Promise<void> {
    if (!ids || ids.length === 0) return;

    const { error } = await employeesTable()
      .update({
        is_active,
        updated_at: new Date().toISOString(),
      })
      .in("id", ids);

    if (error) {
      console.error("Error bulk updating status:", error);
      throw new Error(handleSupabaseError(error));
    }
  },
};
