// src/features/orders/components/OrderHistoryTree.tsx

import type { OrderHistory } from "@types";
import React, { useState } from "react";
import {
    FiAlertCircle,
    FiCalendar,
    FiCheckCircle,
    FiChevronDown,
    FiChevronRight,
    FiDollarSign,
    FiEdit3,
    FiFileText,
    FiImage,
    FiMapPin,
    FiPackage,
    FiPlus,
    FiTrash2,
    FiTruck,
    FiUpload,
    FiUser
} from "react-icons/fi";

interface OrderHistoryTreeProps {
  history: OrderHistory[];
  employeeNames?: Record<number, string>;
}

interface HistoryGroup {
  id: string;
  type: "single" | "group";
  title: string;
  icon: React.ReactNode;
  color: string;
  timestamp: Date;
  employee?: string;
  items: OrderHistory[];
  children?: HistoryGroup[];
}

const getActionIcon = (actionType: string, fieldName?: string) => {
  // More specific icons based on field names
  if (fieldName) {
    if (
      fieldName.toLowerCase().includes("picture") ||
      fieldName.toLowerCase().includes("image")
    ) {
      return actionType === "updated" && fieldName.includes("deleted") ? (
        <FiTrash2 className="w-4 h-4" />
      ) : (
        <FiUpload className="w-4 h-4" />
      );
    }
    if (
      fieldName.toLowerCase().includes("employee") ||
      fieldName.toLowerCase().includes("user")
    ) {
      return <FiUser className="w-4 h-4" />;
    }
    if (
      fieldName.toLowerCase().includes("total") ||
      fieldName.toLowerCase().includes("price") ||
      fieldName.toLowerCase().includes("fee") ||
      fieldName.toLowerCase().includes("profit")
    ) {
      return <FiDollarSign className="w-4 h-4" />;
    }
    if (
      fieldName.toLowerCase().includes("item") ||
      fieldName.toLowerCase().includes("sku")
    ) {
      return <FiPackage className="w-4 h-4" />;
    }
    if (
      fieldName.toLowerCase().includes("date") ||
      fieldName.toLowerCase().includes("schedule")
    ) {
      return <FiCalendar className="w-4 h-4" />;
    }
    if (
      fieldName.toLowerCase().includes("address") ||
      fieldName.toLowerCase().includes("carrier") ||
      fieldName.toLowerCase().includes("tracking")
    ) {
      return <FiMapPin className="w-4 h-4" />;
    }
  }

  // Default icons by action type
  switch (actionType) {
    case "created":
      return <FiPlus className="w-4 h-4" />;
    case "picture_added":
      return <FiImage className="w-4 h-4" />;
    case "shipped":
      return <FiTruck className="w-4 h-4" />;
    case "delivered":
      return <FiCheckCircle className="w-4 h-4" />;
    case "status_changed":
      return <FiAlertCircle className="w-4 h-4" />;
    case "updated":
      return <FiEdit3 className="w-4 h-4" />;
    default:
      return <FiFileText className="w-4 h-4" />;
  }
};

const getActionColor = (actionType: string, fieldName?: string): string => {
  // Special colors for specific field types
  if (fieldName) {
    if (
      fieldName.toLowerCase().includes("picture") ||
      fieldName.toLowerCase().includes("image")
    ) {
      return actionType === "updated" && fieldName.includes("deleted")
        ? "bg-red-100 text-red-700"
        : "bg-purple-100 text-purple-700";
    }
    if (fieldName.toLowerCase().includes("employee")) {
      return "bg-indigo-100 text-indigo-700";
    }
    if (
      fieldName.toLowerCase().includes("total") ||
      fieldName.toLowerCase().includes("price") ||
      fieldName.toLowerCase().includes("fee") ||
      fieldName.toLowerCase().includes("profit")
    ) {
      return "bg-emerald-100 text-emerald-700";
    }
  }

  // Default colors by action type
  switch (actionType) {
    case "created":
      return "bg-blue-100 text-blue-700";
    case "picture_added":
      return "bg-purple-100 text-purple-700";
    case "shipped":
      return "bg-orange-100 text-orange-700";
    case "delivered":
      return "bg-green-100 text-green-700";
    case "status_changed":
      return "bg-yellow-100 text-yellow-700";
    case "updated":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const groupHistoryRecords = (
  history: OrderHistory[],
  employeeNames: Record<number, string>
): HistoryGroup[] => {
  const groups: HistoryGroup[] = [];
  const processedIds = new Set<number>();

  // Sort by timestamp (newest first)
  const sortedHistory = [...history].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  for (const record of sortedHistory) {
    if (processedIds.has(record.id)) continue;

    const employeeName = record.changed_by_employee_id
      ? employeeNames[record.changed_by_employee_id]
      : undefined;

    // Check if this is a group-worthy action (multiple related changes in short time)
    const relatedRecords = sortedHistory.filter(
      (r) =>
        !processedIds.has(r.id) &&
        r.changed_by_employee_id === record.changed_by_employee_id &&
        Math.abs(
          new Date(r.created_at).getTime() -
          new Date(record.created_at).getTime()
        ) < 60000 && // Within 1 minute
        // Group financial updates
        (((record.field_name?.includes("usd") ||
              record.field_name?.includes("vnd") ||
              record.field_name?.includes("rate")) &&
            (r.field_name?.includes("usd") ||
              r.field_name?.includes("vnd") ||
              r.field_name?.includes("rate"))) ||
          // Group customer info updates
          (record.field_name?.includes("Customer") &&
            r.field_name?.includes("Customer")) ||
          // Group shipping updates
          ((record.field_name?.includes("carrier") ||
              record.field_name?.includes("tracking") ||
              record.field_name?.includes("shipping")) &&
            (r.field_name?.includes("carrier") ||
              r.field_name?.includes("tracking") ||
              r.field_name?.includes("shipping"))) ||
          // Group status changes
          (record.field_name?.includes("Status") &&
            r.field_name?.includes("Status")))
    );

    if (relatedRecords.length > 1) {
      // Create a group
      const groupType =
        record.field_name?.includes("usd") || record.field_name?.includes("vnd")
          ? "Financial"
          : record.field_name?.includes("Customer")
            ? "Customer Info"
            : record.field_name?.includes("carrier") ||
            record.field_name?.includes("tracking")
              ? "Shipping"
              : record.field_name?.includes("Status")
                ? "Status"
                : "Multiple";

      const group: HistoryGroup = {
        id: `group-${record.id}`,
        type: "group",
        title: `${groupType} Updates`,
        icon:
          groupType === "Financial" ? (
            <FiDollarSign className="w-4 h-4" />
          ) : groupType === "Customer Info" ? (
            <FiUser className="w-4 h-4" />
          ) : groupType === "Shipping" ? (
            <FiTruck className="w-4 h-4" />
          ) : groupType === "Status" ? (
            <FiAlertCircle className="w-4 h-4" />
          ) : (
            <FiEdit3 className="w-4 h-4" />
          ),
        color:
          groupType === "Financial"
            ? "bg-emerald-100 text-emerald-700"
            : groupType === "Customer Info"
              ? "bg-indigo-100 text-indigo-700"
              : groupType === "Shipping"
                ? "bg-orange-100 text-orange-700"
                : groupType === "Status"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-100 text-gray-700",
        timestamp: new Date(record.created_at),
        employee: employeeName,
        items: relatedRecords
      };

      groups.push(group);
      relatedRecords.forEach((r) => processedIds.add(r.id));
    } else {
      // Create a single item
      const singleGroup: HistoryGroup = {
        id: `single-${record.id}`,
        type: "single",
        title:
          record.description ||
          `${record.action_type} ${record.field_name || ""}`.trim(),
        icon: getActionIcon(record.action_type, record.field_name || undefined),
        color: getActionColor(
          record.action_type,
          record.field_name || undefined
        ),
        timestamp: new Date(record.created_at),
        employee: employeeName,
        items: [record]
      };

      groups.push(singleGroup);
      processedIds.add(record.id);
    }
  }

  return groups;
};

const TreeNode: React.FC<{
  group: HistoryGroup;
  isLast: boolean;
  level: number;
}> = ({ group, isLast, level }) => {
  const [isExpanded, setIsExpanded] = useState(group.type === "single");

  const toggleExpanded = () => {
    if (group.type === "group") {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className="relative">
      {/* Tree lines */}
      {level > 0 && (
        <>
          <div className="absolute left-4 top-0 w-0.5 h-6 bg-gray-200" />
          <div className="absolute left-4 top-6 w-4 h-0.5 bg-gray-200" />
        </>
      )}

      {/* Main node */}
      <div className="flex gap-3 items-start p-3 rounded-lg hover:bg-gray-50 transition-colors">
        {/* Expand/collapse button for groups */}
        <div className="flex items-center">
          {group.type === "group" ? (
            <button
              onClick={toggleExpanded}
              className="w-6 h-6 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-blue-50 hover:border-blue-400 transition-all"
            >
              {isExpanded ? (
                <FiChevronDown className="w-3 h-3 text-blue-600" />
              ) : (
                <FiChevronRight className="w-3 h-3 text-gray-600" />
              )}
            </button>
          ) : (
            <div className="w-6 h-6 rounded-full bg-white border border-gray-300 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-gray-400" />
            </div>
          )}
        </div>

        {/* Icon */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${group.color} flex-shrink-0 shadow-sm`}
        >
          {group.icon}
        </div>

        {/* Content */}
        <div className="flex-1 pt-1">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold ${group.color}`}
                >
                  {group.title}
                </span>
                {group.employee && (
                  <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    👤 {group.employee}
                  </span>
                )}
                {group.type === "group" && (
                  <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                    {group.items.length} thay đổi
                  </span>
                )}
              </div>

              {/* Timestamp */}
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <FiCalendar className="w-3 h-3" />
                {group.timestamp.toLocaleString("vi-VN")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded content for groups */}
      {group.type === "group" && isExpanded && (
        <div className="ml-9 mt-2 space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
          {group.items.map((item) => (
            <div key={item.id} className="flex gap-3 items-start">
              <div className="w-6 h-6 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              </div>

              <div className="flex-1">
                <div className="text-sm text-gray-700">
                  {item.field_name && (
                    <span className="font-semibold text-gray-900">
                      {item.field_name}
                    </span>
                  )}
                  {item.description && (
                    <span className="text-gray-600">
                      {item.field_name ? ": " : ""}{item.description}
                    </span>
                  )}
                </div>

                {/* Field change details */}
                {item.old_value && item.new_value && (
                  <div className="mt-2 p-2 bg-white rounded border border-gray-200 text-xs font-mono space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-red-600 font-bold">−</span>
                      <span className="text-red-600 line-through">{item.old_value}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 font-bold">+</span>
                      <span className="text-green-600 font-semibold">{item.new_value}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Single item details */}
      {group.type === "single" && group.items[0] && (
        <div className="ml-11 mt-2">
          {group.items[0].field_name &&
            group.items[0].old_value &&
            group.items[0].new_value && (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs font-mono space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-red-600 font-bold">−</span>
                  <span className="text-red-600 line-through">{group.items[0].old_value}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">+</span>
                  <span className="text-green-600 font-semibold">{group.items[0].new_value}</span>
                </div>
              </div>
            )}
        </div>
      )}

      {/* Connecting line to next item */}
      {!isLast && (
        <div className="absolute left-7 top-12 w-0.5 h-8 bg-gray-200" />
      )}
    </div>
  );
};

export const OrderHistoryTree: React.FC<OrderHistoryTreeProps> = ({
                                                                    history,
                                                                    employeeNames = {}
                                                                  }) => {
  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <FiFileText className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-sm">No history records yet</p>
        <p className="text-xs text-gray-400 mt-1">
          Changes will appear here as they happen
        </p>
      </div>
    );
  }

  const groups = groupHistoryRecords(history, employeeNames);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-600" />
          <span className="text-sm font-medium text-gray-700">
            <span className="font-bold text-blue-600">{history.length}</span> thay đổi
          </span>
        </div>
        <span className="text-gray-300">|</span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-600" />
          <span className="text-sm font-medium text-gray-700">
            <span className="font-bold text-indigo-600">{groups.length}</span> sự kiện
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {groups.map((group, index) => (
          <TreeNode
            key={group.id}
            group={group}
            isLast={index === groups.length - 1}
            level={0}
          />
        ))}
      </div>
    </div>
  );
};
