// features/shops/pages/ShopCreate.tsx
/**
 * ShopCreate - Create/Edit Shop Form
 * Modern form interface for managing shops
 */

import { FiSave, FiShoppingBag, FiX } from "react-icons/fi";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TextBox } from "../../../components/common";
import { Breadcrumbs } from "../../../components/layout/Breadcrumbs";
import type { ShopFormData } from "../../../types/shop";
import { useShopStore } from "../store/useShopStore";

export const ShopCreate: React.FC = () => {
  const navigate = useNavigate();
  const { shopId } = useParams();
  const isEditMode = !!shopId;

  const { shops, createShop, updateShop } = useShopStore();
  const [formData, setFormData] = useState<ShopFormData>({
    name: "",
    code: "",
    logo: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load shop data if editing
  useEffect(() => {
    if (isEditMode && shopId) {
      const shop = shops.find((s) => s.id === parseInt(shopId));
      if (shop) {
        setFormData({
          name: shop.name,
          code: shop.code,
          logo: shop.logo || "",
        });
      }
    }
  }, [isEditMode, shopId, shops]);

  const handleChange = (
    name: string,
    value: string | number | React.ReactNode | undefined,
  ) => {
    setFormData((prev) => ({ ...prev, [name]: value as string }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên cửa hàng là bắt buộc";
    }

    if (!formData.code.trim()) {
      newErrors.code = "Mã cửa hàng là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (isEditMode && shopId) {
        await updateShop(parseInt(shopId), formData);
      } else {
        await createShop(formData);
      }
      navigate("/shops");
    } catch (error) {
      console.error("Failed to save shop:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Breadcrumbs
        items={[
          { label: "Trang chủ", path: "/dashboard" },
          { label: "Cửa hàng", path: "/shops" },
          { label: isEditMode ? "Chỉnh sửa" : "Tạo mới" },
        ]}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <FiShoppingBag className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                {isEditMode ? "Chỉnh sửa cửa hàng" : "Tạo cửa hàng mới"}
              </h1>
              <p className="text-gray-600 mt-1">
                {isEditMode
                  ? "Cập nhật thông tin cửa hàng"
                  : "Thêm cửa hàng mới vào hệ thống"}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
            <div className="p-8 space-y-6">
              <TextBox
                label="Tên cửa hàng"
                name="name"
                value={formData.name}
                editable={true}
                placeholder="Nhập tên cửa hàng..."
                required
                error={errors.name}
                onChange={handleChange}
                icon={<FiShoppingBag className="w-5 h-5" />}
              />

              <TextBox
                label="Mã cửa hàng"
                name="code"
                value={formData.code}
                editable={true}
                placeholder="VD: SHOP001"
                required
                error={errors.code}
                onChange={handleChange}
              />

              <TextBox
                label="Logo URL"
                name="logo"
                value={formData.logo}
                editable={true}
                placeholder="https://example.com/logo.png"
                onChange={handleChange}
              />
              <p className="text-xs text-gray-500 italic -mt-4 ml-2">
                💡 URL của logo cửa hàng (tùy chọn)
              </p>
            </div>

            {/* Actions */}
            <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/shops")}
                className="inline-flex items-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                <FiX size={18} />
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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
