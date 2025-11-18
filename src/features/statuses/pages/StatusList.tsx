// src/features/statuses/pages/StatusList.tsx
/**
 * StatusList - Admin Table View
 * Modern admin interface for managing order statuses
 */

import { useStatusStore } from "@features/statuses";
import React, { useEffect, useState } from "react";
import { FiEdit2, FiPlus, FiSearch, FiTag, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const STATUS_CATEGORIES = [
  { value: "general", label: "Trạng thái chung", color: "blue" },
  { value: "customer", label: "Trạng thái khách hàng", color: "purple" },
  { value: "factory", label: "Trạng thái nhà máy", color: "orange" },
  { value: "delivery", label: "Trạng thái giao hàng", color: "green" }
];

export const StatusList: React.FC = () => {
  const navigate = useNavigate();
  const generalStatuses = useStatusStore((state) => state.generalStatuses);
  const customerStatuses = useStatusStore((state) => state.customerStatuses);
  const factoryStatuses = useStatusStore((state) => state.factoryStatuses);
  const deliveryStatuses = useStatusStore((state) => state.deliveryStatuses);
  const fetchAllStatuses = useStatusStore((state) => state.fetchAllStatuses);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<
    "all" | "general" | "customer" | "factory" | "delivery"
  >("all");

  useEffect(() => {
    fetchAllStatuses();
  }, [fetchAllStatuses]);

  // Combine all statuses with category info
  const allStatuses = [
    ...generalStatuses.map((s) => ({ ...s, category: "general" })),
    ...customerStatuses.map((s) => ({ ...s, category: "customer" })),
    ...factoryStatuses.map((s) => ({ ...s, category: "factory" })),
    ...deliveryStatuses.map((s) => ({ ...s, category: "delivery" }))
  ];

  // Filter statuses
  const filteredStatuses = allStatuses.filter((status) => {
    const matchesSearch = status.name_vi
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || status.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Stats
  const stats = {
    total: allStatuses.length,
    general: generalStatuses.length,
    customer: customerStatuses.length,
    factory: factoryStatuses.length,
    delivery: deliveryStatuses.length
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      general: "blue",
      customer: "purple",
      factory: "orange",
      delivery: "green"
    };
    return colors[category] || "gray";
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      general: "Trạng thái chung",
      customer: "Khách hàng",
      factory: "Nhà máy",
      delivery: "Giao hàng"
    };
    return labels[category] || category;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Quản lý trạng thái đơn hàng
              </h1>
              <p className="text-gray-600 mt-2">
                Quản lý tất cả trạng thái của hệ thống
              </p>
            </div>
            <button
              onClick={() => navigate("/statuses/create")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-semibold"
            >
              <FiPlus size={20} />
              Thêm trạng thái
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-5 gap-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200/50 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Tổng trạng thái
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.total}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <FiTag size={24} className="text-gray-600" />
                </div>
              </div>
            </div>

            {STATUS_CATEGORIES.map((cat) => (
              <div
                key={cat.value}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200/50 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium truncate">
                      {cat.label}
                    </p>
                    <p
                      className={`text-3xl font-bold mt-2 text-${cat.color}-600`}
                    >
                      {stats[cat.value as keyof typeof stats]}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-full bg-${cat.color}-100 flex items-center justify-center`}
                  >
                    <FiTag size={24} className={`text-${cat.color}-600`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên trạng thái..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="all">Tất cả danh mục</option>
            <option value="general">Trạng thái chung</option>
            <option value="customer">Khách hàng</option>
            <option value="factory">Nhà máy</option>
            <option value="delivery">Giao hàng</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-emerald-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Tên trạng thái
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Danh mục
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Mô tả
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Màu sắc
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
              {filteredStatuses.map((status, index) => {
                const colorClass = getCategoryColor(status.category);
                return (
                  <tr
                    key={status.id}
                    className="hover:bg-emerald-50/50 transition-colors duration-150"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">
                        {status.name_vi}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 bg-${colorClass}-100 text-${colorClass}-700 text-xs font-bold rounded-full`}
                        >
                          {getCategoryLabel(status.category)}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-600 text-sm">
                        {status.description || "-"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full border-2 border-gray-300"
                          style={{
                            backgroundColor: status.color || "#6B7280"
                          }}
                        ></div>
                        <span className="text-sm text-gray-600">
                            {status.color || "#6B7280"}
                          </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() =>
                            navigate(`/statuses/${status.id}/edit`)
                          }
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `Bạn có chắc muốn xóa trạng thái "${status.name_vi}"?`
                              )
                            ) {
                            }
                          }}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>

          {filteredStatuses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                Không tìm thấy trạng thái nào
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Hiển thị{" "}
          <span className="font-semibold">{filteredStatuses.length}</span> /{" "}
          <span className="font-semibold">{allStatuses.length}</span> trạng thái
        </div>
      </div>
    </div>
  );
};
