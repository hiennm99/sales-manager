// src/features/shops/pages/ShopListAdmin.tsx
/**
 * ShopList - Admin Table View
 * Modern admin interface for managing shops
 */

import { useShopStore } from "@features/shops";
import React, { useEffect, useState } from "react";
import { FiEdit2, FiPlus, FiSearch, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export const ShopListAdmin: React.FC = () => {
  const navigate = useNavigate();
  const { shops, fetchShops } = useShopStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  // Filter shops
  const filteredShops = shops.filter((shop) => {
    const matchesSearch =
      shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && shop.is_active) ||
      (statusFilter === "inactive" && !shop.is_active);

    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: shops.length,
    active: shops.filter((s) => s.is_active).length,
    inactive: shops.filter((s) => !s.is_active).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Quản lý cửa hàng
              </h1>
              <p className="text-gray-600 mt-2">
                Quản lý tất cả cửa hàng của bạn
              </p>
            </div>
            <button
              onClick={() => navigate("/shops/create")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-semibold"
            >
              <FiPlus size={20} />
              Thêm cửa hàng
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200/50 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Tổng cửa hàng
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.total}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-2xl">🏪</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200/50 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Hoạt động</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {stats.active}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200/50 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Tạm ngưng</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">
                    {stats.inactive}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-2xl">⏸️</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc mã..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Tạm ngưng</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Mã cửa hàng
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Tên cửa hàng
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
              {filteredShops.map((shop, index) => (
                <tr
                  key={shop.id}
                  className="hover:bg-blue-50/50 transition-colors duration-150"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-6 py-4">
                      <span
                        className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                        {shop.code}
                      </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">{shop.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    {shop.is_active ? (
                      <span
                        className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                          <span className="w-2 h-2 rounded-full bg-green-600"></span>
                          Hoạt động
                        </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                          <span className="w-2 h-2 rounded-full bg-red-600"></span>
                          Tạm ngưng
                        </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => navigate(`/shops/${shop.id}/edit`)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              `Bạn có chắc muốn xóa cửa hàng "${shop.name}"?`
                            )
                          ) {
                            // TODO: Implement delete
                            console.log("Delete shop:", shop.id);
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
              ))}
              </tbody>
            </table>
          </div>

          {filteredShops.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                Không tìm thấy cửa hàng nào
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Hiển thị <span className="font-semibold">{filteredShops.length}</span>{" "}
          / <span className="font-semibold">{shops.length}</span> cửa hàng
        </div>
      </div>
    </div>
  );
};
