// src/features/reports/components/ReportFilters.tsx

import { Select } from "@/components/ui/Select";
import {
  MONTH_OPTIONS,
  REPORT_STATUS_OPTIONS,
  YEAR_OPTIONS,
  objectsToOptions,
} from "@/constants";
import type { FinancialReportFilters } from "@/types/financialReport";
import type { Shop } from "@/types/shop";
import { FiFilter, FiX } from "react-icons/fi";
import React from "react";

interface ReportFiltersProps {
  filters: FinancialReportFilters;
  onFiltersChange: (filters: FinancialReportFilters) => void;
  shops: Shop[];
}

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  filters,
  onFiltersChange,
  shops,
}) => {
  const shopOptions = objectsToOptions(shops, "id", "name");

  const handleClearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters =
    filters.shopId || filters.year || filters.month || filters.status;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FiFilter className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">Bộ Lọc</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="w-4 h-4" />
            Xóa Lọc
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Shop Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cửa Hàng
          </label>
          <Select
            value={filters.shopId || ""}
            onChange={(value) =>
              onFiltersChange({
                ...filters,
                shopId: value ? Number(value) : undefined,
              })
            }
            options={shopOptions}
            showEmpty
            emptyLabel="Tất cả"
          />
        </div>

        {/* Year Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Năm
          </label>
          <Select
            value={filters.year || ""}
            onChange={(value) =>
              onFiltersChange({
                ...filters,
                year: value ? Number(value) : undefined,
              })
            }
            options={YEAR_OPTIONS}
            showEmpty
            emptyLabel="Tất cả"
          />
        </div>

        {/* Month Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tháng
          </label>
          <Select
            value={filters.month || ""}
            onChange={(value) =>
              onFiltersChange({
                ...filters,
                month: value ? Number(value) : undefined,
              })
            }
            options={MONTH_OPTIONS}
            showEmpty
            emptyLabel="Tất cả"
          />
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trạng Thái
          </label>
          <Select
            value={filters.status || ""}
            onChange={(value) =>
              onFiltersChange({ ...filters, status: value as any })
            }
            options={REPORT_STATUS_OPTIONS}
            showEmpty
            emptyLabel="Tất cả"
          />
        </div>
      </div>
    </div>
  );
};
