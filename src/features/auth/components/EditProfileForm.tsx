// src/features/auth/components/EditProfileForm.tsx

import { useEmployeeStore } from "@features/auth";
import { supabase } from "@lib";
import type { Employee } from "@types";
import { useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FiAlertCircle, FiSave, FiX } from "react-icons/fi";

interface EditProfileFormProps {
  employee: Employee;
  onCancel: () => void;
  onSuccess: () => void;
}

export const EditProfileForm = ({
                                  employee,
                                  onCancel,
                                  onSuccess
                                }: EditProfileFormProps) => {
  const { loading: storeLoading } = useEmployeeStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: employee.name,
    email: employee.email,
    role: employee.role,
    avatar: employee.avatar,
    base_salary: employee.base_salary || 0,
    sales_commission_rate: employee.sales_commission_rate || 3.0
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "base_salary" || name === "sales_commission_rate"
          ? parseFloat(value) || 0
          : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Update employee record
      const { error: updateError } = await supabase
        .from("employees")
        .update({
          name: formData.name,
          role: formData.role,
          avatar: formData.avatar,
          base_salary: formData.base_salary,
          sales_commission_rate: formData.sales_commission_rate,
          updated_at: new Date().toISOString()
        })
        .eq("id", employee.id);

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Cập nhật hồ sơ thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Chỉnh sửa hồ sơ
      </h2>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <div
            className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">
            ✓
          </div>
          <p className="text-sm text-green-800">Cập nhật hồ sơ thành công!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tên đầy đủ
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Email (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">
            Email không thể thay đổi
          </p>
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vai trò
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="employee">Nhân viên</option>
            <option value="seller">Bán hàng</option>
            <option value="artist">Nghệ sĩ</option>
            <option value="manager">Quản lý</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Avatar URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL ảnh đại diện
          </label>
          <input
            type="url"
            name="avatar"
            value={formData.avatar}
            onChange={handleChange}
            placeholder="https://..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {formData.avatar && (
            <img
              src={formData.avatar}
              alt="Preview"
              className="mt-2 w-20 h-20 rounded-lg object-cover"
            />
          )}
        </div>

        {/* Base Salary */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lương cơ bản (VNĐ)
          </label>
          <input
            type="number"
            name="base_salary"
            value={formData.base_salary}
            onChange={handleChange}
            min="0"
            step="100000"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Commission Rate */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tỷ lệ hoa hồng (%)
          </label>
          <input
            type="number"
            name="sales_commission_rate"
            value={formData.sales_commission_rate}
            onChange={handleChange}
            min="0"
            max="100"
            step="0.1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading || storeLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <FiX className="w-4 h-4" />
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading || storeLoading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading || storeLoading ? (
              <>
                <AiOutlineLoading3Quarters className="w-4 h-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <FiSave className="w-4 h-4" />
                Lưu thay đổi
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
