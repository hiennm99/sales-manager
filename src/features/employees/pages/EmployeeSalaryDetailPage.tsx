// src/features/employees/pages/EmployeeSalaryDetailPage.tsx

import { Select } from "@/components/ui/Select";
import { YEAR_OPTIONS } from "@/constants";
import { IoArrowBack } from "react-icons/io5";
import { FiCalendar, FiChevronDown, FiChevronUp, FiDollarSign, FiTrendingDown, FiTrendingUp } from "react-icons/fi";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { EmployeeSalaryPeriod } from "../../../types/employee";
import { employeeSalaryServiceApi } from "../services";
import { useEmployeeStore } from "../store/useEmployeeStore";

export const EmployeeSalaryDetailPage: React.FC = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [monthlyData, setMonthlyData] = useState<EmployeeSalaryPeriod[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const { employees, fetchEmployees } = useEmployeeStore();
  const employee = employees.find((e) => e.id === parseInt(employeeId || "0"));

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    if (employeeId) {
      loadYearlyBreakdown();
    }
  }, [employeeId, selectedYear]);

  const loadYearlyBreakdown = async () => {
    if (!employeeId) return;

    setIsLoading(true);
    try {
      const data = await employeeSalaryServiceApi.getYearlySalaryBreakdown(
        parseInt(employeeId),
        selectedYear,
      );
      setMonthlyData(data);
    } catch (error) {
      console.error("Error loading salary breakdown:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatMonth = (dateString: string) => {
    const date = new Date(dateString);
    return `Tháng ${date.getMonth() + 1}`;
  };

  const getTotalSalary = () => {
    return monthlyData.reduce((sum, item) => sum + item.total_salary, 0);
  };

  const getTotalCommission = () => {
    return monthlyData.reduce((sum, item) => sum + (item.commission ?? 0), 0);
  };

  const getTotalOrders = () => {
    return monthlyData.reduce((sum, item) => sum + item.orders_count, 0);
  };

  const getTotalProfit = () => {
    return monthlyData.reduce(
      (sum, item) => sum + (item.total_profit_vnd || 0),
      0,
    );
  };

  const getTotalArtistProfit = () => {
    return monthlyData.reduce(
      (sum, item) => sum + (item.artist_profit_vnd || 0),
      0,
    );
  };

  const getTotalSellerProfit = () => {
    return monthlyData.reduce(
      (sum, item) => sum + (item.seller_profit_vnd || 0),
      0,
    );
  };

  const toggleRowExpansion = (index: number) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(index)) {
      newExpandedRows.delete(index);
    } else {
      newExpandedRows.add(index);
    }
    setExpandedRows(newExpandedRows);
  };

  if (!employee) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Không tìm thấy nhân viên</p>
          <button
            onClick={() => navigate("/employee-salary")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/employee-salary")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <IoArrowBack className="w-5 h-5" />
            Quay lại
          </button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {employee.avatar ? (
                <img
                  src={employee.avatar}
                  alt={employee.name}
                  className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {employee.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {employee.name}
                </h1>
                <p className="text-gray-600 mt-1">
                  {employee.code} • {employee.role}
                </p>
              </div>
            </div>

            {/* Year Selector */}
            <div className="mb-4">
              <label
                htmlFor="year-select"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Chọn năm
              </label>
              <Select
                value={selectedYear}
                onChange={(value) => setSelectedYear(Number(value))}
                options={YEAR_OPTIONS}
              />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Tổng Lương Năm
              </span>
              <FiDollarSign className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              TB: {(getTotalOrders() / 12).toFixed(1)} đơn/tháng
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Lương Cơ Bản
              </span>
              <FiCalendar className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(employee.base_salary)}
            </p>
            <p className="text-xs text-gray-500 mt-1">VND/tháng</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Tổng Lợi Nhuận
              </span>
              <FiTrendingDown className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(getTotalProfit())}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {getTotalOrders() > 0
                ? `TB: ${formatCurrency(getTotalProfit() / getTotalOrders())}/đơn`
                : "Chưa có đơn hàng"}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                LN Bán Hàng
              </span>
              <FiTrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-700">
              {formatCurrency(getTotalSellerProfit())}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {monthlyData.reduce(
                (sum, item) => sum + item.seller_orders_count,
                0,
              )}{" "}
              đơn seller
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">LN Vẽ</span>
              <FiTrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-2xl font-bold text-indigo-700">
              {formatCurrency(getTotalArtistProfit())}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {monthlyData.reduce(
                (sum, item) => sum + item.artist_orders_count,
                0,
              )}{" "}
              đơn artist
            </p>
          </div>
        </div>

        {/* Monthly Breakdown Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <p className="text-sm text-gray-600 mt-1">
              Bảng phân tích lương chi tiết từng tháng trong năm {selectedYear}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-8"></th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Tháng
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Lương CB
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Hoa Hồng
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
                    Số Đơn
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Lợi Nhuận
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
                ) : (
                  monthlyData.map((item, index) => (
                    <React.Fragment key={index}>
                      <tr
                        className={`hover:bg-gray-50 transition-colors ${
                          item.orders_count > 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleRowExpansion(index)}
                            className="text-gray-600 hover:text-gray-900 transition-colors"
                          >
                            {expandedRows.has(index) ? (
                              <FiChevronUp className="w-5 h-5" />
                            ) : (
                              <FiChevronDown className="w-5 h-5" />
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {formatMonth(
                              item.period_start ||
                                `${selectedYear}-${String(item.salary_period_month).padStart(2, "0")}-01`,
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.period_start && item.period_end
                              ? `${new Date(item.period_start).toLocaleDateString("vi-VN")} - ${new Date(item.period_end).toLocaleDateString("vi-VN")}`
                              : `Tháng ${item.salary_period_month}/${selectedYear}`}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-gray-900">
                          {formatCurrency(item.base_salary)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span
                            className={
                              item.commission ||
                              item.artist_commission_total +
                                item.seller_commission_total >
                                0
                                ? "text-green-600 font-medium"
                                : "text-gray-400"
                            }
                          >
                            {formatCurrency(
                              item.commission ||
                                item.artist_commission_total +
                                  item.seller_commission_total,
                            )}
                          </span>
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
                          {item.orders_count > 0 ? (
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                              {item.orders_count}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">0</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-700">
                          {formatCurrency(item.total_profit_vnd)}
                        </td>
                      </tr>
                      {expandedRows.has(index) && (
                        <tr className="bg-blue-50">
                          <td colSpan={9} className="px-6 py-4">
                            <div className="grid grid-cols-2 gap-6 ml-8">
                              {/* Artist Breakdown */}
                              <div className="bg-white rounded-lg p-4 border border-blue-200">
                                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                                  HH Bán Hàng:{" "}
                                  {formatCurrency(item.seller_commission_total)}
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Khấu trừ:
                                    </span>
                                    <span className="font-medium text-gray-900">
                                      {formatCurrency(item.deduction || 0)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Số đơn bán hàng:
                                    </span>
                                    <span className="font-medium text-gray-900">
                                      {item.seller_orders_count}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Chi phí khác:
                                    </span>
                                    <span className="font-medium text-gray-900">
                                      {formatCurrency(item.other_costs || 0)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between pt-2 border-t border-gray-200">
                                    <span className="text-gray-600 font-semibold">
                                      Lợi nhuận (Seller):
                                    </span>
                                    <span className="font-bold text-emerald-600">
                                      {formatCurrency(
                                        item.seller_profit_vnd || 0,
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Thưởng:
                                    </span>
                                    <span className="font-medium text-gray-900">
                                      {formatCurrency(item.bonus || 0)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Seller Breakdown */}
                              <div className="bg-white rounded-lg p-4 border border-blue-200">
                                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                  <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                                  HH Vẽ:{" "}
                                  {formatCurrency(item.artist_commission_total)}
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Số đơn vẽ:
                                    </span>
                                    <span className="font-medium text-gray-900">
                                      {item.artist_orders_count}
                                    </span>
                                  </div>
                                  <div className="flex justify-between pt-2 border-t border-gray-200">
                                    <span className="text-gray-600 font-semibold">
                                      Lợi nhuận (Artist):
                                    </span>
                                    <span className="font-bold text-emerald-600">
                                      {formatCurrency(
                                        item.artist_profit_vnd || 0,
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
              <tfoot className="bg-gradient-to-r from-blue-50 to-indigo-50 border-t-2 border-blue-200">
                <tr>
                  <td className="px-6 py-4"></td>
                  <td className="px-6 py-4 font-bold text-gray-900">
                    TỔNG NĂM {selectedYear}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">
                    {formatCurrency(
                      monthlyData.reduce(
                        (sum, item) => sum + item.base_salary,
                        0,
                      ),
                    )}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-green-600">
                    {formatCurrency(getTotalCommission())}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-blue-600">
                    {formatCurrency(
                      monthlyData.reduce((sum, item) => sum + item.bonus, 0),
                    )}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-red-600">
                    {formatCurrency(
                      monthlyData.reduce(
                        (sum, item) => sum + item.other_costs,
                        0,
                      ),
                    )}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900 text-lg">
                    {formatCurrency(getTotalSalary())}
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-gray-900">
                    {getTotalOrders()}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">
                    {formatCurrency(
                      monthlyData.reduce(
                        (sum, item) => sum + item.total_profit_vnd,
                        0,
                      ),
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
