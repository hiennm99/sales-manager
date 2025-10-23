// components/DataTableTab.tsx

import { formatCurrency } from "@/types/financialReport";
import { FiFileText, FiTrash2, FiTrendingUp } from "react-icons/fi";
import React from "react";

interface DataRow {
  id: number;
  date: string;
  description: string;
  amount: number;
  currency: string;
  [key: string]: any;
}

interface DataTableTabProps {
  title: string;
  data: DataRow[];
  columns: Array<{
    key: string;
    label: string;
    render?: (value: any, row: DataRow) => React.ReactNode;
  }>;
  emptyMessage?: string;
  onDelete?: (id: number) => Promise<void>;
}

export const DataTableTab: React.FC<DataTableTabProps> = ({
  title,
  data,
  columns,
  emptyMessage = "Chưa có dữ liệu",
  onDelete,
}) => {
  const [deleting, setDeleting] = React.useState<number | null>(null);
  const totalAmount = data.reduce((sum, row) => sum + (row.amount || 0), 0);

  const handleDelete = async (id: number) => {
    if (!onDelete) return;
    if (!confirm("Bạn có chắc chắn muốn xóa mục này?")) return;

    setDeleting(id);
    try {
      await onDelete(id);
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Lỗi khi xóa mục");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-indigo-900 mb-1">
              {title}
            </h3>
            <p className="text-2xl font-bold text-indigo-900">
              {formatCurrency(totalAmount, data[0]?.currency || "USD")}
            </p>
          </div>
          <div className="p-3 bg-indigo-600 rounded-lg">
            <FiTrendingUp className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4 text-sm text-indigo-700">
          <div className="flex items-center gap-1">
            <FiFileText className="w-4 h-4" />
            <span>{data.length} giao dịch</span>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          {data.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <FiFileText className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600">{emptyMessage}</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                    >
                      {column.label}
                    </th>
                  ))}
                  {onDelete && (
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Hành động
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.map((row, index) => (
                  <tr
                    key={row.id || index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className="px-6 py-4 text-sm text-gray-900"
                      >
                        {column.render
                          ? column.render(row[column.key], row)
                          : row[column.key]}
                      </td>
                    ))}
                    {onDelete && (
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleDelete(row.id)}
                          disabled={deleting === row.id}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FiTrash2 className="w-4 h-4" />
                          <span className="text-xs font-medium">
                            {deleting === row.id ? "Đang xóa..." : "Xóa"}
                          </span>
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gradient-to-r from-indigo-50 to-purple-50 border-t-2 border-indigo-200">
                <tr>
                  <td
                    colSpan={columns.length - 1 + (onDelete ? 1 : 0)}
                    className="px-6 py-4 text-sm font-bold text-gray-900"
                  >
                    Tổng cộng
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-indigo-600 text-right">
                    {formatCurrency(totalAmount, data[0]?.currency || "USD")}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
