// components/ReceivedMoneyForm.tsx

import { DatePicker } from "@/components/ui/DatePicker";
import { Select } from "@/components/ui/Select";
import { CURRENCY_OPTIONS_SIMPLE } from "@/constants";
import type { ReceivedMoney } from "@/types/financialReport";
import { FiCheckCircle, FiPlus, FiX } from "react-icons/fi";
import React, { useState } from "react";
import { ImageUpload } from "./ImageUpload";

interface ReceivedMoneyFormProps {
  reportPeriodId: number;
  shopId: number;
  year: number;
  month: number;
  onAdd: (item: Partial<ReceivedMoney>) => void;
}

export const ReceivedMoneyForm: React.FC<ReceivedMoneyFormProps> = ({
  reportPeriodId,
  shopId,
  year,
  month,
  onAdd,
}) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    order_id: "",
    description: "",
    amount: 0,
    currency: "VND",
    received_date: new Date().toISOString().split("T")[0],
    payment_method: "",
    screenshot_url: null as string | null,
  });

  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onAdd({
      report_period_id: reportPeriodId,
      date: formData.date,
      order_id: formData.order_id || null,
      description: formData.description,
      amount: formData.amount,
      currency: formData.currency,
      received_date: formData.received_date,
      payment_method: formData.payment_method || null,
    });

    // Reset form
    setFormData({
      date: new Date().toISOString().split("T")[0],
      order_id: "",
      description: "",
      amount: 0,
      currency: "USD",
      received_date: new Date().toISOString().split("T")[0],
      payment_method: "",
      screenshot_url: null,
    });
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          <span>Thêm Tiền Đã Về</span>
        </button>
      ) : (
        <div className="bg-white border-2 border-green-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FiCheckCircle className="w-5 h-5 text-green-600" />
              Thêm Tiền Đã Về
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

            {/* Received Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày nhận tiền
              </label>
              <input
                type="date"
                value={formData.received_date}
                onChange={(e) =>
                  setFormData({ ...formData, received_date: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={2}
                placeholder="VD: Tiền từ đơn hàng #12345"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                <ImageIcon className="w-4 h-4 inline mr-1" />
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
                pathPrefix={`received-money/${shopId}/${year}/${month}`}
                maxSize={10}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
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
