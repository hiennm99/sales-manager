// src/features/reports/components/CreateReportModal.tsx

import { Select } from "@components/ui";
import { MONTH_OPTIONS, objectsToOptions, YEAR_OPTIONS } from "@constants";
import type { Shop } from "@types";
import { Building2, Calendar } from "lucide-react";
import React, { useState } from "react";
import { FiX } from "react-icons/fi";

interface CreateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (shopId: number, year: number, month: number) => void;
  shops: Shop[];
}

export const CreateReportModal: React.FC<CreateReportModalProps> = ({
                                                                      isOpen,
                                                                      onClose,
                                                                      onConfirm,
                                                                      shops
                                                                    }) => {
  const currentDate = new Date();
  const [shopId, setShopId] = useState<number>(shops[0]?.id || 1);
  const [year, setYear] = useState<number>(currentDate.getFullYear());
  const [month, setMonth] = useState<number>(currentDate.getMonth() + 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(shopId, year, month);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Tạo Báo Cáo Mới</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Shop Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Cửa Hàng
              </div>
            </label>
            <Select
              value={shopId}
              onChange={(value) => setShopId(Number(value))}
              options={objectsToOptions(shops, "id", "name")}
              showEmpty
              emptyLabel="Chọn cửa hàng"
            />
          </div>

          {/* Year Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Năm
            </label>
            <Select
              value={year}
              onChange={(value) => setYear(Number(value))}
              options={YEAR_OPTIONS}
              showEmpty
              emptyLabel="Chọn năm"
            />
          </div>

          {/* Month Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tháng
            </label>
            <Select
              value={month}
              onChange={(value) => setMonth(Number(value))}
              options={MONTH_OPTIONS}
              showEmpty
              emptyLabel="Chọn tháng"
            />
          </div>

          {/* Period Info */}
          <div className="bg-indigo-50 rounded-lg p-4">
            <p className="text-sm text-indigo-900">
              <span className="font-semibold">Kỳ báo cáo:</span>{" "}
              {new Date(year, month - 1, 1).toLocaleDateString("vi-VN")} -{" "}
              {new Date(year, month, 0).toLocaleDateString("vi-VN")}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
            >
              Tạo Báo Cáo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
