// src/features/reports/components/MoneyOnEtsyForm.tsx

import { DatePicker, Select } from "@components/ui";
import { CURRENCY_OPTIONS_SIMPLE } from "@constants";
import { ImageUpload } from "@features/reports";
import type { MoneyOnEtsy } from "@types";
import React, { useState } from "react";
import { FiImage, FiPlus, FiX } from "react-icons/fi";

interface MoneyOnEtsyFormProps {
  reportPeriodId: number;
  shopId: number;
  year: number;
  month: number;
  onAdd: (item: Partial<MoneyOnEtsy>) => void;
}

export const MoneyOnEtsyForm: React.FC<MoneyOnEtsyFormProps> = ({
                                                                  reportPeriodId,
                                                                  shopId,
                                                                  year,
                                                                  month,
                                                                  onAdd
                                                                }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    amount: 0,
    currency: "VND",
    type: "balance" as "balance" | "pending" | "available",
    screenshot_url: null as string | null
  });

  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onAdd({
      report_period_id: reportPeriodId,
      date: formData.date,
      description: formData.description,
      amount: formData.amount,
      currency: formData.currency,
      type: formData.type
    });

    // Reset form
    setFormData({
      date: new Date().toISOString().split("T")[0],
      description: "",
      amount: 0,
      currency: "USD",
      type: "balance",
      screenshot_url: null
    });
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          <span>Thêm Tiền Trên Etsy</span>
        </button>
      ) : (
        <div className="bg-white border-2 border-indigo-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Thêm Tiền Còn Trên Etsy
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày
              </label>
              <DatePicker
                value={formData.date}
                onChange={(value) => setFormData({ ...formData, date: value })}
                required
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại
              </label>
              <Select
                value={formData.type}
                onChange={(value) =>
                  setFormData({ ...formData, type: value as any })
                }
                options={[
                  { value: "balance", label: "Balance (Số dư)" },
                  { value: "pending", label: "Pending (Đang chờ)" },
                  { value: "available", label: "Available (Có sẵn)" }
                ]}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả{" "}
                <span className="text-gray-500 font-normal">(tùy chọn)</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={3}
                placeholder="VD: Số dư tài khoản Etsy cuối tháng"
              />
            </div>

            {/* Amount & Currency */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số tiền
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      amount: parseFloat(e.target.value)
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiền tệ
                </label>
                <Select
                  value={formData.currency}
                  disabled
                  onChange={(value) =>
                    setFormData({ ...formData, currency: value })
                  }
                  options={CURRENCY_OPTIONS_SIMPLE}
                />
              </div>
            </div>

            {/* Screenshot Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiImage className="w-4 h-4 inline mr-1" />
                Screenshot / Ảnh chứng từ (tùy chọn)
              </label>
              <ImageUpload
                label=""
                description="Tải lên ảnh chụp màn hình hoặc chứng từ"
                currentImageUrl={formData.screenshot_url}
                onUploadSuccess={(url) =>
                  setFormData({ ...formData, screenshot_url: url })
                }
                onDelete={() =>
                  setFormData({ ...formData, screenshot_url: null })
                }
                bucket="financial-documents"
                pathPrefix={`money-on-etsy/${shopId}/${year}/${month}`}
                maxSize={10}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Thêm
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
