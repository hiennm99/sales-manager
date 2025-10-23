// components/TransferredMoneyForm.tsx

import { DatePicker } from "@/components/ui/DatePicker";
import { Select } from "@/components/ui/Select";
import { CURRENCY_OPTIONS_SIMPLE } from "@/constants";
import type { TransferredMoney } from "@/types/financialReport";
import { FiPlus, FiSend, FiX } from "react-icons/fi";
import React, { useState } from "react";
import { ImageUpload } from "./ImageUpload";

interface TransferredMoneyFormProps {
  reportPeriodId: number;
  shopId: number;
  year: number;
  month: number;
  onAdd: (item: Partial<TransferredMoney>) => void;
}

export const TransferredMoneyForm: React.FC<TransferredMoneyFormProps> = ({
  reportPeriodId,
  shopId,
  year,
  month,
  onAdd,
}) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    amount: 0,
    currency: "VND",
    transfer_date: new Date().toISOString().split("T")[0],
    bank_account: "",
    reference_number: "",
    screenshot_url: null as string | null,
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
      transfer_date: formData.transfer_date,
      bank_account: formData.bank_account || null,
      reference_number: formData.reference_number || null,
    });

    // Reset form
    setFormData({
      date: new Date().toISOString().split("T")[0],
      description: "",
      amount: 0,
      currency: "USD",
      transfer_date: new Date().toISOString().split("T")[0],
      bank_account: "",
      reference_number: "",
      screenshot_url: null,
    });
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          <span>Thêm Tiền Đã CK</span>
        </button>
      ) : (
        <div className="bg-white border-2 border-purple-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FiSend className="w-5 h-5 text-purple-600" />
              Thêm Tiền Đã Chuyển Khoản
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày
                </label>
                <DatePicker
                  value={formData.date}
                  onChange={(value) =>
                    setFormData({ ...formData, date: value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày chuyển khoản
                </label>
                <DatePicker
                  value={formData.transfer_date}
                  onChange={(value) =>
                    setFormData({ ...formData, transfer_date: value })
                  }
                  required
                />
              </div>
            </div>

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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={2}
                placeholder="VD: Chuyển khoản lương tháng 10"
              />
            </div>

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
                pathPrefix={`transferred-money/${shopId}/${year}/${month}`}
                maxSize={10}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
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
