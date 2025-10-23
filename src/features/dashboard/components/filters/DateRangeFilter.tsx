// src/features/dashboard/components/filters/DateRangeFilter.tsx

import { FiCalendar, FiChevronDown } from "react-icons/fi";
import React, { useState } from "react";
import type { QuickDateRange, TimePeriod } from "../../../../types/dashboard";

interface DateRangeFilterProps {
  selectedRange: TimePeriod | null;
  quickRanges: QuickDateRange[];
  customStartDate?: string;
  customEndDate?: string;
  onQuickRangeSelect: (range: TimePeriod) => void;
  onCustomRangeSelect: (startDate: string, endDate: string) => void;
  className?: string;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  selectedRange,
  quickRanges,
  customStartDate,
  customEndDate,
  onQuickRangeSelect,
  onCustomRangeSelect,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(customStartDate || "");
  const [tempEndDate, setTempEndDate] = useState(customEndDate || "");

  const selectedRangeLabel =
    quickRanges.find((r) => r.value === selectedRange)?.label || "Tùy chỉnh";

  const handleQuickRangeClick = (range: TimePeriod) => {
    onQuickRangeSelect(range);
    setIsOpen(false);
    setShowCustom(false);
  };

  const handleCustomRangeApply = () => {
    if (tempStartDate && tempEndDate) {
      onCustomRangeSelect(tempStartDate, tempEndDate);
      setIsOpen(false);
      setShowCustom(false);
    }
  };

  const handleCustomRangeCancel = () => {
    setTempStartDate(customStartDate || "");
    setTempEndDate(customEndDate || "");
    setShowCustom(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
      >
        <FiCalendar className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">
          {selectedRangeLabel}
        </span>
        <FiChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {!showCustom ? (
            <>
              {/* Quick Ranges */}
              <div className="p-2">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 px-2">
                  Khoảng thời gian nhanh
                </div>
                <div className="space-y-1">
                  {quickRanges.map((range) => (
                    <button
                      key={range.value}
                      onClick={() => handleQuickRangeClick(range.value)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                        selectedRange === range.value
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200">
                <button
                  onClick={() => setShowCustom(true)}
                  className="w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Tùy chỉnh khoảng thời gian...
                </button>
              </div>
            </>
          ) : (
            /* Custom Range Picker */
            <div className="p-4">
              <div className="text-sm font-medium text-gray-900 mb-4">
                Chọn khoảng thời gian tùy chỉnh
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Từ ngày
                  </label>
                  <input
                    type="date"
                    value={tempStartDate}
                    onChange={(e) => setTempStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Đến ngày
                  </label>
                  <input
                    type="date"
                    value={tempEndDate}
                    onChange={(e) => setTempEndDate(e.target.value)}
                    min={tempStartDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={handleCustomRangeCancel}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCustomRangeApply}
                  disabled={!tempStartDate || !tempEndDate}
                  className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Áp dụng
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsOpen(false);
            setShowCustom(false);
            setTempStartDate(customStartDate || "");
            setTempEndDate(customEndDate || "");
          }}
        />
      )}
    </div>
  );
};
