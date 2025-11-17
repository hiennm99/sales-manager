// src/types/employee.ts

import type { BaseEntity } from "./common.ts";

export interface Employee extends BaseEntity {
  name: string;
  code: string;
  avatar: string;
  is_active: boolean;
  role: string;
  base_salary: number; // Monthly base salary in VND
  sales_commission_rate: number; // Monthly sales commission rate (%) - default 3%
  email: string;
  user_id?: string | null; // Linked Supabase Auth user ID
  is_admin?: boolean;
}

export interface EmployeeFormData {
  name: string;
  code: string;
  avatar: string;
  email: string;
  role: string;
  base_salary?: number;
  sales_commission_rate?: number;
}

// Employee Commission Record (from employee_commission table)
export interface EmployeeCommission extends BaseEntity {
  order_id: number;
  order_date: string;
  actual_ship_date: string;

  // Artist commission
  artist_employee_id: number | null;
  artist_commission_rate: number | null;
  artist_commission_amount_vnd: number | null;

  // Seller commission
  seller_employee_id: number | null;
  seller_commission_rate: number | null;
  seller_commission_amount_vnd: number | null;

  // Financial snapshot
  profit_vnd: number | null;
  order_earnings_vnd: number | null;
}

// Employee Salary Record (from employee_salary table)
export interface EmployeeSalary extends BaseEntity {
  employee_id: number;
  salary_period_year: number;
  salary_period_month: number | null; // null for yearly

  // Salary components (all in VND)
  base_salary: number;
  artist_commission_total: number;
  seller_commission_total: number;
  other_costs: number;
  bonus: number;
  deduction: number;
  total_salary: number;

  // Profit breakdown (calculated from employee_commission table)
  artist_profit_vnd?: number; // Sum of profit_vnd where artist
  seller_profit_vnd?: number; // Sum of profit_vnd where seller
  artist_orders_count?: number; // Count of orders as artist
  seller_orders_count?: number; // Count of orders as seller

  // Metadata
  status: "draft" | "approved" | "paid";
  approved_by: number | null;
  approved_at: Date | null;
  paid_at: Date | null;
  notes: string | null;
}

export interface EmployeeSalaryFormData {
  employee_id: number;
  salary_period_year: number;
  salary_period_month?: number; // undefined for yearly
  base_salary: number;
  artist_commission_total: number;
  seller_commission_total: number;
  other_costs?: number;
  bonus?: number;
  deduction?: number;
  status?: "draft" | "approved" | "paid";
  notes?: string;
  approved_by?: number;
}

// Employee Salary Calculation Types (for display/calculation)
export interface EmployeeSalaryPeriod {
  employee_id: number;
  employee_name: string;
  employee_code: string;
  salary_period_year: number;
  salary_period_month: number | null;
  base_salary: number;
  artist_commission_total: number; // Sum of artist_commission_amount_vnd
  seller_commission_total: number; // Sum of seller_commission_amount_vnd
  other_costs: number; // From employee_monthly_cost
  bonus: number;
  deduction: number;
  total_salary: number; // base_salary + artist_commission + seller_commission + bonus - other_costs - deduction
  artist_orders_count: number; // Count of orders as artist
  seller_orders_count: number; // Count of orders as seller
  orders_count: number; // Total count of orders (artist + seller)
  total_profit_vnd: number; // Sum of profit_vnd where artist
  total_order_earnings_vnd: number; // Sum of order_earnings_vnd where seller
  artist_profit_vnd: number; // Sum of profit_vnd where artist (same as total_profit_vnd)
  seller_profit_vnd: number; // Sum of profit_vnd where seller
  period_start?: string; // Period start date
  period_end?: string; // Period end date
  commission?: number; // Total commission (artist + seller)
}

export interface EmployeeSalaryFilters {
  employee_id?: number;
  year: number;
  month?: number; // If provided, calculate for specific month, otherwise yearly
  status?: "draft" | "approved" | "paid";
}

// Helper function to get status string from is_active
export const getEmployeeStatus = (
  is_active: boolean
): "active" | "inactive" => {
  return is_active ? "active" : "inactive";
};

// Helper function to get status label in Vietnamese
export const getEmployeeStatusLabel = (is_active: boolean): string => {
  return is_active ? "Hoạt động" : "Tạm ngưng";
};

// Helper function to get employee initials for avatar fallback
export const getEmployeeInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Helper function to format employee display name with code
export const formatEmployeeDisplay = (employee: Employee): string => {
  return `${employee.name} (${employee.code})`;
};
