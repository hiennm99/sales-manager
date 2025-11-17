// src/features/employees/pages/EmployeeSalaryList.tsx

import { SalaryEditModal, useEmployeeSalaryStore, useEmployeeStore } from "@features/employees";
import type { EmployeeSalary } from "@types";
import React, { useEffect, useState } from "react";
import {
  FiCalendar,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiDollarSign,
  FiEdit2,
  FiFilter,
  FiPercent,
  FiXCircle
} from "react-icons/fi";

export const EmployeeSalaryList = () => {
  const {
    salaries,
    isLoading,
    error,
    setFilters,
    fetchSalaryRecords,
    calculateAndSaveAll,
    approveSalary,
    markAsPaid,
    updateSalary
  } = useEmployeeSalaryStore();

  const { employees, fetchEmployees } = useEmployeeStore();

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(
    new Date().getMonth() + 1
  );
  const [selectedStatus, setSelectedStatus] = useState<
    "draft" | "approved" | "paid" | undefined
  >();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<
    number | undefined
  >();
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [editingSalary, setEditingSalary] = useState<EmployeeSalary | null>(
    null
  );

  // Load employees and salaries on mount
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    const newFilters = {
      year: selectedYear,
      month: selectedMonth,
      status: selectedStatus,
      employee_id: selectedEmployeeId
    };
    setFilters(newFilters);
    fetchSalaryRecords(newFilters);
  }, [
    selectedYear,
    selectedMonth,
    selectedStatus,
    selectedEmployeeId,
    setFilters,
    fetchSalaryRecords
  ]);

  const handleCalculateAll = async () => {
    if (!selectedMonth) {
      alert("Vui lòng chọn tháng để tính lương");
      return;
    }

    if (
      confirm(
        `Tính lương cho tất cả nhân viên tháng ${selectedMonth}/${selectedYear}?`
      )
    ) {
      try {
        await calculateAndSaveAll(selectedYear, selectedMonth, 1); // TODO: Get current user ID
        alert("Đã tính lương thành công!");
      } catch (error) {
        alert(
          "Lỗi khi tính lương: " +
          (error instanceof Error ? error.message : "Unknown error")
        );
      }
    }
  };

  const handleApprove = async (
    employee_id: number,
    year: number,
    month: number
  ) => {
    if (confirm("Duyệt lương cho nhân viên này?")) {
      try {
        await approveSalary(employee_id, year, month, 1); // TODO: Get current user ID
        alert("Đã duyệt lương thành công!");
      } catch (error) {
        alert(
          "Lỗi khi duyệt lương: " +
          (error instanceof Error ? error.message : "Unknown error")
        );
      }
    }
  };

  const handleMarkPaid = async (
    employee_id: number,
    year: number,
    month: number
  ) => {
    if (!confirm("Đánh dấu đã thanh toán lương cho nhân viên này?")) {
      return;
    }

    try {
      await markAsPaid(employee_id, year, month);
      alert("Đã đánh dấu đã thanh toán!");
    } catch (error) {
      alert(
        "Lỗi: " + (error instanceof Error ? error.message : "Unknown error")
      );
    }
  };

  const toggleRowExpand = (salaryId: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(salaryId)) {
      newExpanded.delete(salaryId);
    } else {
      newExpanded.add(salaryId);
    }
    setExpandedRows(newExpanded);
  };

  const handleEditSalary = (salary: EmployeeSalary) => {
    setEditingSalary(salary);
  };

  const handleSaveEdit = async (updates: Partial<EmployeeSalary>) => {
    if (!editingSalary) return;

    // Validate that salary_period_month is not null
    if (editingSalary.salary_period_month === null) {
      alert("Không thể cập nhật lương cho kỳ lương năm (chưa hỗ trợ)");
      return;
    }

    try {
      await updateSalary(
        editingSalary.employee_id,
        editingSalary.salary_period_year,
        editingSalary.salary_period_month,
        updates
      );
      alert("Đã cập nhật lương thành công!");
    } catch (error) {
      alert(
        "Lỗi khi cập nhật: " +
        (error instanceof Error ? error.message : "Unknown error")
      );
      throw error;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <span
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            <FiClock className="w-3 h-3" />
            Nháp
          </span>
        );
      case "approved":
        return (
          <span
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            <FiCheckCircle className="w-3 h-3" />
            Đã duyệt
          </span>
        );
      case "paid":
        return (
          <span
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <FiDollarSign className="w-3 h-3" />
            Đã thanh toán
          </span>
        );
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND"
    }).format(amount);
  };

  const getEmployeeName = (employeeId: number) => {
    const employee = employees.find((e) => e.id === employeeId);
    return employee
      ? `${employee.name} (${employee.code})`
      : `ID: ${employeeId}`;
  };

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Quản lý lương nhân viên
          </h1>
          <p className="text-gray-600 mt-1">
            Tính toán, duyệt và thanh toán lương
          </p>
        </div>
        <button
          onClick={handleCalculateAll}
          disabled={!selectedMonth || isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
        >
          <FiPercent className="w-5 h-5" />
          Tính lương tất cả
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center gap-2 mb-4">
          <FiFilter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Bộ lọc</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Năm
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Month */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tháng
            </label>
            <select
              value={selectedMonth ?? ""}
              onChange={(e) =>
                setSelectedMonth(
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả</option>
              {months.map((month) => (
                <option key={month} value={month}>
                  Tháng {month}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              value={selectedStatus ?? ""}
              onChange={(e) =>
                setSelectedStatus((e.target.value as any) || undefined)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả</option>
              <option value="draft">Nháp</option>
              <option value="approved">Đã duyệt</option>
              <option value="paid">Đã thanh toán</option>
            </select>
          </div>

          {/* Employee */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nhân viên
            </label>
            <select
              value={selectedEmployeeId ?? ""}
              onChange={(e) =>
                setSelectedEmployeeId(
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả</option>
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

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
          <FiXCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-2">Đang tải...</p>
        </div>
      )}

      {/* Salary Table */}
      {!isLoading && salaries.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Nhân viên
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Kỳ lương
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Lương cơ bản
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  HH Vẽ
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  HH Bán hàng
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Tổng lương
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Hành động
                </th>
                <th className="px-4 py-3"></th>
              </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
              {salaries.map((salary) => (
                <React.Fragment key={salary.id}>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {getEmployeeName(salary.employee_id)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <FiCalendar className="w-4 h-4" />
                        {salary.salary_period_month}/
                        {salary.salary_period_year}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {formatCurrency(salary.base_salary)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">
                      {formatCurrency(salary.artist_commission_total)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-blue-600 font-medium">
                      {formatCurrency(salary.seller_commission_total)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">
                      {formatCurrency(salary.total_salary)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {getStatusBadge(salary.status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditSalary(salary)}
                          className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors flex items-center gap-1"
                          title="Chỉnh sửa"
                        >
                          <FiEdit2 className="w-3 h-3" />
                          Sửa
                        </button>
                        {salary.status === "draft" &&
                          salary.salary_period_month !== null && (
                            <button
                              onClick={() =>
                                handleApprove(
                                  salary.employee_id,
                                  salary.salary_period_year,
                                  salary.salary_period_month!
                                )
                              }
                              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              Duyệt
                            </button>
                          )}
                        {salary.status === "approved" &&
                          salary.salary_period_month !== null && (
                            <button
                              onClick={() =>
                                handleMarkPaid(
                                  salary.employee_id,
                                  salary.salary_period_year,
                                  salary.salary_period_month!
                                )
                              }
                              className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                            >
                              Đã trả
                            </button>
                          )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleRowExpand(salary.id)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        {expandedRows.has(salary.id) ? (
                          <FiChevronUp className="w-5 h-5" />
                        ) : (
                          <FiChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Details */}
                  {expandedRows.has(salary.id) && (
                    <tr>
                      <td colSpan={9} className="px-4 py-4 bg-gray-50">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                              <span className="text-gray-600">
                                Hoa hồng Vẽ:
                              </span>
                            <span className="ml-2 font-medium text-green-600">
                                {formatCurrency(salary.artist_commission_total)}
                              </span>
                          </div>
                          <div>
                              <span className="text-gray-600">
                                Lợi nhuận Vẽ:
                              </span>
                            <span className="ml-2 font-medium text-green-600">
                                {formatCurrency(salary.artist_profit_vnd || 0)}
                              </span>
                          </div>
                          <div>
                              <span className="text-gray-600">
                                Hoa hồng Bán hàng:
                              </span>
                            <span className="ml-2 font-medium text-purple-600">
                                {formatCurrency(salary.seller_commission_total)}
                              </span>
                          </div>
                          <div>
                              <span className="text-gray-600">
                                Lợi nhuận Bán hàng:
                              </span>
                            <span className="ml-2 font-medium text-purple-600">
                                {formatCurrency(salary.seller_profit_vnd || 0)}
                              </span>
                          </div>
                          <div>
                              <span className="text-gray-600">
                                Chi phí khác:
                              </span>
                            <span className="ml-2 font-medium text-orange-600">
                                {formatCurrency(salary.other_costs)}
                              </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Khấu trừ:</span>
                            <span className="ml-2 font-medium text-red-600">
                                {formatCurrency(salary.deduction)}
                              </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Thưởng:</span>
                            <span className="ml-2 font-medium text-green-600">
                                {formatCurrency(salary.bonus)}
                              </span>
                          </div>
                          {salary.approved_by && (
                            <div>
                                <span className="text-gray-600">
                                  Người duyệt:
                                </span>
                              <span className="ml-2 font-medium">
                                  ID: {salary.approved_by}
                                </span>
                            </div>
                          )}
                          {salary.paid_at && (
                            <div>
                              <span className="text-gray-600">Ngày trả:</span>
                              <span className="ml-2 font-medium">
                                  {new Date(salary.paid_at).toLocaleDateString(
                                    "vi-VN"
                                  )}
                                </span>
                            </div>
                          )}
                        </div>
                        {salary.notes && (
                          <div className="mt-3 text-sm">
                            <span className="text-gray-600">Ghi chú:</span>
                            <p className="mt-1 text-gray-900">
                              {salary.notes}
                            </p>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && salaries.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FiDollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Chưa có dữ liệu lương
          </h3>
          <p className="text-gray-600 mb-4">
            Chọn tháng và nhấn "Tính lương tất cả" để bắt đầu
          </p>
        </div>
      )}

      {/* Edit Modal */}
      {editingSalary && (
        <SalaryEditModal
          salary={editingSalary}
          employeeName={getEmployeeName(editingSalary.employee_id)}
          isOpen={!!editingSalary}
          onClose={() => setEditingSalary(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};
