// src/features/statuses/pages/StatusCreate.tsx
/**
 * StatusCreate - Create/Edit Status Form
 * Modern form interface for managing order statuses
 */

import { OptionBox, TextBox } from "@components/common";
import { Breadcrumbs } from "@components/layout";
import { useStatusStore } from "@features/statuses";
import React, { useEffect, useState } from "react";
import { FiSave, FiTag, FiX } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

interface StatusFormData {
  name_vi: string;
  name_en: string;
  description: string;
  color: string;
  category: "general" | "customer" | "factory" | "delivery";
}

const CATEGORIES = [
  { value: "general", label: "Trạng thái chung" },
  { value: "customer", label: "Trạng thái khách hàng" },
  { value: "factory", label: "Trạng thái nhà máy" },
  { value: "delivery", label: "Trạng thái giao hàng" }
];

const DEFAULT_COLORS = [
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#F59E0B",
  "#10B981",
  "#EF4444",
  "#6366F1",
  "#14B8A6",
  "#F97316",
  "#84CC16"
];

export const StatusCreate: React.FC = () => {
  const navigate = useNavigate();
  const { statusId } = useParams();
  const isEditMode = !!statusId;

  const generalStatuses = useStatusStore((state) => state.generalStatuses);
  const customerStatuses = useStatusStore((state) => state.customerStatuses);
  const factoryStatuses = useStatusStore((state) => state.factoryStatuses);
  const deliveryStatuses = useStatusStore((state) => state.deliveryStatuses);
  const fetchAllStatuses = useStatusStore((state) => state.fetchAllStatuses);

  const [formData, setFormData] = useState<StatusFormData>({
    name_vi: "",
    name_en: "",
    description: "",
    color: "#3B82F6",
    category: "general"
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load statuses on mount
  useEffect(() => {
    fetchAllStatuses();
  }, [fetchAllStatuses]);

  // Load status data if editing
  useEffect(() => {
    if (isEditMode && statusId) {
      const allStatuses = [
        ...generalStatuses.map((s) => ({ ...s, category: "general" as const })),
        ...customerStatuses.map((s) => ({
          ...s,
          category: "customer" as const
        })),
        ...factoryStatuses.map((s) => ({ ...s, category: "factory" as const })),
        ...deliveryStatuses.map((s) => ({
          ...s,
          category: "delivery" as const
        }))
      ];

      const status = allStatuses.find((s) => s.id === parseInt(statusId));
      if (status) {
        setFormData({
          name_vi: status.name_vi,
          name_en: status.name || "",
          description: status.description || "",
          color: status.color || "#3B82F6",
          category: status.category
        });
      }
    }
  }, [
    isEditMode,
    statusId,
    generalStatuses,
    customerStatuses,
    factoryStatuses,
    deliveryStatuses
  ]);

  const handleChange = (
    name: string,
    value: string | number | React.ReactNode | undefined
  ) => {
    setFormData((prev) => ({ ...prev, [name]: value as string }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name_vi.trim()) {
      newErrors.name_vi = "Tên tiếng Việt là bắt buộc";
    }

    if (!formData.name_en.trim()) {
      newErrors.name_en = "Tên tiếng Anh là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // TODO: Implement create/update status API
      console.log("Save status:", formData);
      alert("Chức năng lưu trạng thái sẽ được cập nhật sau");
      navigate("/statuses");
    } catch (error) {
      console.error("Failed to save status:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <Breadcrumbs
        items={[
          { label: "Trang chủ", path: "/dashboard" },
          { label: "Trạng thái", path: "/statuses" },
          { label: isEditMode ? "Chỉnh sửa" : "Tạo mới" }
        ]}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <FiTag className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                {isEditMode ? "Chỉnh sửa trạng thái" : "Tạo trạng thái mới"}
              </h1>
              <p className="text-gray-600 mt-1">
                {isEditMode
                  ? "Cập nhật thông tin trạng thái"
                  : "Thêm trạng thái mới vào hệ thống"}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
            <div className="p-8 space-y-6">
              <OptionBox
                label="Danh mục"
                name="category"
                value={formData.category}
                options={CATEGORIES}
                editable={true}
                onChange={handleChange}
                icon={<FiTag className="w-5 h-5" />}
              />

              <TextBox
                label="Mã trạng thái"
                name="name_en"
                value={formData.name_en}
                editable={true}
                placeholder="Enter status name..."
                required
                error={errors.name_en}
                onChange={handleChange}
              />

              <TextBox
                label="Mô tả"
                name="description"
                type="textarea"
                value={formData.description}
                editable={true}
                placeholder="Mô tả về trạng thái này..."
                onChange={handleChange}
              />

              {/* Color Picker */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Màu sắc
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    name="color"
                    value={formData.color}
                    onChange={(e) => handleChange("color", e.target.value)}
                    className="w-20 h-12 rounded-lg border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={(e) => handleChange("color", e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-mono"
                    placeholder="#3B82F6"
                  />
                </div>

                {/* Color Presets */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {DEFAULT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, color }))
                      }
                      className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-all"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/statuses")}
                className="inline-flex items-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                <FiX size={18} />
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSave size={18} />
                {isSubmitting
                  ? "Đang lưu..."
                  : isEditMode
                    ? "Cập nhật"
                    : "Tạo mới"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
