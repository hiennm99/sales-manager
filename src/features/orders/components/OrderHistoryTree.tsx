// src/features/orders/components/OrderHistoryTree.tsx

import type { OrderHistory } from "@types";
import React from "react";
import {
  FiAlertCircle,
  FiCalendar,
  FiCheckCircle,
  FiDollarSign,
  FiEdit3,
  FiFileText,
  FiImage,
  FiPackage,
  FiPlus,
  FiTruck,
  FiUser
} from "react-icons/fi";

interface OrderHistoryTreeProps {
  history: OrderHistory[];
  employeeNames?: Record<number, string>;
}

interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  color: string;
  timestamp: Date;
  employee?: string;
  details: OrderHistory[];
}

const getActionIcon = (actionType: string, fieldName?: string) => {
  const iconClass = "w-4 h-4";
  
  // Specific icons based on field names (priority)
  if (fieldName) {
    const field = fieldName.toLowerCase();
    
    // Picture/Image
    if (field.includes("picture") || field.includes("image")) {
      return <FiImage className={iconClass} />;
    }
    
    // Employee/User
    if (field.includes("employee") || field.includes("user")) {
      return <FiUser className={iconClass} />;
    }
    
    // Financial fields
    if (field.includes("total") || field.includes("price") || 
        field.includes("fee") || field.includes("profit") || 
        field.includes("earnings") || field.includes("paid")) {
      return <FiDollarSign className={iconClass} />;
    }
    
    // Item/Product
    if (field.includes("item") || field.includes("sku") || 
        field.includes("quantity") || field.includes("qty")) {
      return <FiPackage className={iconClass} />;
    }
    
    // Date/Schedule
    if (field.includes("date") || field.includes("schedule") || 
        field.includes("ship")) {
      return <FiCalendar className={iconClass} />;
    }
    
    // Shipping/Address
    if (field.includes("address") || field.includes("carrier") || 
        field.includes("tracking") || field.includes("shipping")) {
      return <FiTruck className={iconClass} />;
    }
    
    // Status
    if (field.includes("status")) {
      return <FiAlertCircle className={iconClass} />;
    }
  }

  // Default icons by action type
  switch (actionType) {
    case "created":
      return <FiPlus className={iconClass} />;
    case "picture_added":
      return <FiImage className={iconClass} />;
    case "shipped":
      return <FiTruck className={iconClass} />;
    case "delivered":
      return <FiCheckCircle className={iconClass} />;
    case "status_changed":
      return <FiAlertCircle className={iconClass} />;
    case "updated":
      return <FiEdit3 className={iconClass} />;
    default:
      return <FiFileText className={iconClass} />;
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

const buildTimelineItems = (
  history: OrderHistory[],
  employeeNames: Record<number, string>
): TimelineItem[] => {
  // Sort by timestamp (newest first)
  const sortedHistory = [...history].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return sortedHistory.map((record) => {
    const employeeName = record.changed_by_employee_id
      ? employeeNames[record.changed_by_employee_id]
      : undefined;

    return {
      id: `item-${record.id}`,
      title:
        record.description ||
        `${record.action_type} ${record.field_name || ""}`.trim(),
      description: record.field_name
        ? `${record.field_name}: ${record.old_value} → ${record.new_value}`
        : undefined,
      icon: getActionIcon(record.action_type, record.field_name || undefined),
      color: getActionColor(
        record.action_type,
        record.field_name || undefined
      ),
      timestamp: new Date(record.created_at),
      employee: employeeName,
      details: [record]
    };
  });
};

// Helper to parse item details from summary string
const parseItemDetails = (summary: string) => {
  // Format: "SKU (size, type) xquantity"
  const match = summary.match(/^(.+?)\s*\((.+?),\s*(.+?)\)\s*x(\d+)$/);
  if (match) {
    return {
      sku: match[1],
      size: match[2],
      type: match[3],
      quantity: match[4]
    };
  }
  return null;
};

const TimelineItemComponent: React.FC<{
  item: TimelineItem;
  isLast: boolean;
}> = ({ item, isLast }) => {
  // Extract old and new values from details
  const detail = item.details[0];
  const hasValueChange = detail?.old_value && detail?.new_value;
  
  // Check if this is an Order Items change
  const isOrderItemsChange = detail?.field_name === "Order Items";
  const oldItemDetails = isOrderItemsChange ? parseItemDetails(detail.old_value || "") : null;
  const newItemDetails = isOrderItemsChange ? parseItemDetails(detail.new_value || "") : null;

  return (
    <div className="flex gap-4 pb-6 relative">
      {/* Timeline dot and line */}
      <div className="flex flex-col items-center">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${item.color} flex-shrink-0 shadow-md`}
        >
          {item.icon}
        </div>
        {!isLast && (
          <div className="w-0.5 h-12 bg-gray-300 mt-2" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pt-1">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {/* Title */}
            <h4 className="font-semibold text-gray-900 text-sm">
              {item.title}
            </h4>

            {/* Field name and value change */}
            {detail?.field_name && hasValueChange && (
              <div className="mt-2 text-xs space-y-2">
                {/* Show field name only for Order Items */}
                {isOrderItemsChange && (
                  <p className="text-gray-700 font-medium">{detail.field_name}:</p>
                )}
                
                {/* Special formatting for Order Items */}
                {isOrderItemsChange && oldItemDetails && newItemDetails ? (
                  <div className="space-y-2 pl-3 border-l-2 border-gray-300">
                    {/* Old value */}
                    <div className="space-y-1">
                      <div className="text-gray-600">
                        <span className="text-red-600 font-semibold">Cũ:</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-gray-600 line-through">
                        <div><span className="text-gray-500 text-xs">SKU:</span> {oldItemDetails.sku}</div>
                        <div><span className="text-gray-500 text-xs">Size:</span> {oldItemDetails.size}</div>
                        <div><span className="text-gray-500 text-xs">Type:</span> {oldItemDetails.type}</div>
                        <div><span className="text-gray-500 text-xs">Qty:</span> {oldItemDetails.quantity}</div>
                      </div>
                    </div>
                    
                    {/* Arrow */}
                    <div className="flex items-center">
                      <span className="text-gray-400 font-semibold">↓</span>
                    </div>
                    
                    {/* New value */}
                    <div className="space-y-1">
                      <div className="text-green-700">
                        <span className="text-green-600 font-semibold">Mới:</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-green-700 font-semibold">
                        <div><span className="text-gray-500 text-xs font-normal">SKU:</span> {newItemDetails.sku}</div>
                        <div><span className="text-gray-500 text-xs font-normal">Size:</span> {newItemDetails.size}</div>
                        <div><span className="text-gray-500 text-xs font-normal">Type:</span> {newItemDetails.type}</div>
                        <div><span className="text-gray-500 text-xs font-normal">Qty:</span> {newItemDetails.quantity}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Default formatting for other fields */
                  <div className="space-y-1 pl-2 border-l-2 border-gray-300">
                    <div className="flex items-center gap-2">
                      <span className="text-red-600 line-through">{detail.old_value}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 font-semibold">→</span>
                      <span className="text-green-600 font-semibold">{detail.new_value}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            {item.description && !hasValueChange && (
              <p className="text-xs text-gray-600 mt-1">{item.description}</p>
            )}
          </div>

          {/* Employee and timestamp - right side */}
          <div className="flex flex-col items-end gap-1 text-xs text-gray-500 flex-shrink-0">
            {item.employee && (
              <span>👤 {item.employee}</span>
            )}
            <span>
              {item.timestamp.toLocaleTimeString("vi-VN")} {item.timestamp.toLocaleDateString("vi-VN")}
            </span>
          </div>
        </div>
      </div>
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

  const items = buildTimelineItems(history, employeeNames);

  return (
    <div className="space-y-6">
      {/* Timeline */}
      <div className="relative">
        {items.map((item, index) => (
          <TimelineItemComponent
            key={item.id}
            item={item}
            isLast={index === items.length - 1}
          />
        ))}
      </div>
    </div>
  );
};
