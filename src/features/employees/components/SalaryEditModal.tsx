// src/features/employees/components/SalaryEditModal.tsx

import type { EmployeeSalary } from "@types";
import { useEffect, useState } from "react";
import { FiSave, FiX } from "react-icons/fi";

interface SalaryEditModalProps {
  salary: EmployeeSalary;
  employeeName: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<EmployeeSalary>) => Promise<void>;
}

export const SalaryEditModal = ({
                                  salary,
                                  employeeName,
                                  isOpen,
                                  onClose,
                                  onSave
                                }: SalaryEditModalProps) => {
  const [formData, setFormData] = useState({
    base_salary: salary.base_salary,
    bonus: salary.bonus,
    other_costs: salary.other_costs,
    deduction: salary.deduction,
    notes: salary.notes || ""
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        base_salary: salary.base_salary,
        bonus: salary.bonus,
        other_costs: salary.other_costs,
        deduction: salary.deduction,
        notes: salary.notes || ""
      });
    }
  }, [isOpen, salary]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND"
    }).format(amount);
  };

  const totalSalary =
    formData.base_salary +
    salary.artist_commission_total +
    salary.seller_commission_total +
    formData.bonus -
    formData.other_costs -
    formData.deduction;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Chỉnh sửa lương
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {employeeName} - Tháng {salary.salary_period_month}/
              {salary.salary_period_year}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Read-only fields */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-900 mb-3">
              Thông tin tự động tính
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">HH Vẽ:</span>
                <span className="ml-2 font-medium text-green-600">
                  {formatCurrency(salary.artist_commission_total)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">HH Bán hàng:</span>
                <span className="ml-2 font-medium text-blue-600">
                  {formatCurrency(salary.seller_commission_total)}
                </span>
              </div>
            </div>
          </div>

          {/* Editable fields */}
          <div className="space-y-4">
            {/* Base Salary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lương cơ bản (VND)
              </label>
              <input
                type="number"
                value={formData.base_salary}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    base_salary: Number(e.target.value)
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                step="1000"
              />
            </div>

            {/* Bonus */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thưởng (VND)
              </label>
              <input
                type="number"
                value={formData.bonus}
                onChange={(e) =>
                  setFormData({ ...formData, bonus: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                step="1000"
              />
            </div>

            {/* Other Costs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chi phí khác (VND)
              </label>
              <input
                type="number"
                value={formData.other_costs}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    other_costs: Number(e.target.value)
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                step="1000"
              />
            </div>

            {/* Deduction */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Khấu trừ (VND)
              </label>
              <input
                type="number"
                value={formData.deduction}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    deduction: Number(e.target.value)
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                step="1000"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ghi chú
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Nhập ghi chú..."
              />
            </div>
          </div>

          {/* Total Preview */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900">
                Tổng lương dự kiến:
              </span>
              <span className="text-2xl font-bold text-blue-600">
                {formatCurrency(totalSalary)}
              </span>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              = Lương cơ bản ({formatCurrency(formData.base_salary)}) + HH Vẽ (
              {formatCurrency(salary.artist_commission_total)}) + HH Bán (
              {formatCurrency(salary.seller_commission_total)}) + Thưởng (
              {formatCurrency(formData.bonus)}) - Chi phí khác (
              {formatCurrency(formData.other_costs)}) - Khấu trừ (
              {formatCurrency(formData.deduction)})
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <FiSave className="w-4 h-4" />
              {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
