// src/features/employees/pages/EmployeeSalaryPage.tsx

import { employeeSalaryService, useEmployeeStore } from "@features/employees";
import type { EmployeeSalaryPeriod } from "@types";
import React, { useEffect, useState } from "react";
import { FiCalendar, FiDollarSign, FiEye, FiTrendingUp, FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export const EmployeeSalaryPage: React.FC = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState<number | undefined>(currentMonth);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<
    number | undefined
  >();
  const [salaryData, setSalaryData] = useState<EmployeeSalaryPeriod[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"monthly" | "yearly">("monthly");

  const { employees, fetchEmployees } = useEmployeeStore();

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    loadSalaryData();
  }, [year, month, selectedEmployeeId, viewMode]);

  const loadSalaryData = async () => {
    setIsLoading(true);
    try {
      const data = await employeeSalaryService.calculateEmployeeSalary({
        employee_id: selectedEmployeeId,
        year,
        month: viewMode === "monthly" ? month : undefined
      });
      setSalaryData(data);
    } catch (error) {
      console.error("Error loading salary data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND"
    }).format(amount);
  };

  const getTotalSalary = () => {
    return salaryData.reduce((sum, item) => sum + item.total_salary, 0);
  };

  const getTotalArtistCommission = () => {
    return salaryData.reduce(
      (sum, item) => sum + item.artist_commission_total,
      0
    );
  };

  const getTotalSalesCommission = () => {
    return salaryData.reduce(
      (sum, item) => sum + item.seller_commission_total,
      0
    );
  };

  const getTotalOrders = () => {
    return salaryData.reduce(
      (sum, item) =>
        sum + (item.artist_orders_count + item.seller_orders_count),
      0
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
              <FiDollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Quản Lý Lương Nhân Viên
              </h1>
              <p className="text-gray-600 mt-1">
                Tính toán lương theo hoa hồng và doanh thu
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* View Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chế độ xem
              </label>
              <select
                value={viewMode}
                onChange={(e) => {
                  setViewMode(e.target.value as "monthly" | "yearly");
                  if (e.target.value === "yearly") {
                    setMonth(undefined);
                  } else {
                    setMonth(currentMonth);
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="monthly">Theo tháng</option>
                <option value="yearly">Theo năm</option>
              </select>
            </div>

            {/* Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Năm
              </label>
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 5 }, (_, i) => currentYear - i).map(
                  (y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Month (only for monthly view) */}
            {viewMode === "monthly" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tháng
                </label>
                <select
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      Tháng {m}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Employee Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nhân viên
              </label>
              <select
                value={selectedEmployeeId || ""}
                onChange={(e) =>
                  setSelectedEmployeeId(
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả nhân viên</option>
                {employees
                  .filter((e) => e.is_active)
                  .map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.code})
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Tổng Lương
              </span>
              <FiDollarSign className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(getTotalSalary())}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                HH Họa Sĩ
              </span>
              <FiTrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(getTotalArtistCommission())}
            </p>
            <p className="text-xs text-gray-500 mt-1">Từ vẽ đơn</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                HH Bán Hàng
              </span>
              <FiTrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(getTotalSalesCommission())}
            </p>
            <p className="text-xs text-gray-500 mt-1">Từ doanh số</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Số Đơn Hàng
              </span>
              <FiCalendar className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {getTotalOrders()}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Số Nhân Viên
              </span>
              <FiUsers className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {salaryData.length}
            </p>
          </div>
        </div>

        {/* Salary Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Nhân Viên
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Lương CB
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  HH Họa Sĩ
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  HH Bán Hàng
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Thưởng
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Chi Phí
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Tổng Lương
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Đơn Vẽ/Bán
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Chi Tiết
                </th>
              </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3">Đang tải...</span>
                    </div>
                  </td>
                </tr>
              ) : salaryData.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Không có dữ liệu lương cho kỳ này
                  </td>
                </tr>
              ) : (
                salaryData.map((item) => (
                  <tr
                    key={item.employee_id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {item.employee_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.employee_code}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900">
                      {formatCurrency(item.base_salary)}
                    </td>
                    <td className="px-6 py-4 text-right">
                        <span
                          className={
                            item.artist_commission_total > 0
                              ? "text-blue-600 font-medium"
                              : "text-gray-400"
                          }
                        >
                          {formatCurrency(item.artist_commission_total)}
                        </span>
                      {item.artist_orders_count > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {item.artist_orders_count} đơn
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                        <span
                          className={
                            item.seller_commission_total > 0
                              ? "text-purple-600 font-medium"
                              : "text-gray-400"
                          }
                        >
                          {formatCurrency(item.seller_commission_total)}
                        </span>
                      {item.seller_orders_count > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {item.seller_orders_count} đơn
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-blue-600">
                      {formatCurrency(item.bonus)}
                    </td>
                    <td className="px-6 py-4 text-right">
                        <span
                          className={
                            item.other_costs > 0
                              ? "text-red-600"
                              : "text-gray-400"
                          }
                        >
                          {formatCurrency(item.other_costs)}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                      {formatCurrency(item.total_salary)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col gap-1">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            Vẽ: {item.artist_orders_count}
                          </span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                            Bán: {item.seller_orders_count}
                          </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() =>
                          navigate(`/employee-salary/${item.employee_id}`)
                        }
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <FiEye className="w-4 h-4" />
                        Xem
                      </button>
                    </td>
                  </tr>
                ))
              )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
