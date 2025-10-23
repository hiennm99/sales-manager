// components/ExpenseForm.tsx

import { DatePicker } from "@/components/ui/DatePicker";
import { Select } from "@/components/ui/Select";
import { CURRENCY_OPTIONS_SIMPLE, EXPENSE_CATEGORY_OPTIONS } from "@/constants";
import type { Expense } from "@/types/financialReport";
import { Image as ImageIcon, Plus, Receipt, X } from "lucide-react";
import React, { useState } from "react";
import { ImageUpload } from "./ImageUpload";

interface ExpenseFormProps {
  reportPeriodId: number;
  shopId: number;
  year: number;
  month: number;
  onAdd: (item: Partial<Expense>) => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  reportPeriodId,
  shopId,
  year,
  month,
  onAdd,
}) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    category: "Marketing",
    description: "",
    amount: 0,
    currency: "VND",
    payment_method: "",
    receipt_url: null as string | null,
  });

  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onAdd({
      report_period_id: reportPeriodId,
      date: formData.date,
      category: formData.category,
      description: formData.description,
      amount: formData.amount,
      currency: formData.currency,
      payment_method: formData.payment_method || null,
      receipt_url: formData.receipt_url,
    });

    // Reset form
    setFormData({
      date: new Date().toISOString().split("T")[0],
      category: "Marketing",
      description: "",
      amount: 0,
      currency: "USD",
      payment_method: "",
      receipt_url: null,
    });
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Chi Phí</span>
        </button>
      ) : (
        <div className="bg-white border-2 border-red-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-red-600" />
              Thêm Chi Phí
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
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

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Danh mục
              </label>
              <Select
                value={formData.category}
                onChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
                options={EXPENSE_CATEGORY_OPTIONS}
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
                      amount: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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

            {/* Receipt Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <ImageIcon className="w-4 h-4 inline mr-1" />
                Hóa đơn / Chứng từ (tùy chọn)
              </label>
              <ImageUpload
                label=""
                description="Tải lên hóa đơn hoặc chứng từ thanh toán"
                currentImageUrl={formData.receipt_url}
                onUploadSuccess={(url) =>
                  setFormData({ ...formData, receipt_url: url })
                }
                onDelete={() => setFormData({ ...formData, receipt_url: null })}
                bucket="financial-documents"
                pathPrefix={`expenses/${shopId}/${year}/${month}`}
                maxSize={10}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Thêm Chi Phí
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
