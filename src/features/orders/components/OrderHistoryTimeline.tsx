// src/features/orders/components/OrderHistoryTimeline.tsx

import { FiAlertCircle, FiCheckCircle, FiEdit, FiFileText, FiImage, FiPlus, FiTruck } from "react-icons/fi";
import React from "react";
import type { OrderHistory } from "../../../types/orderHistory";

interface OrderHistoryTimelineProps {
  history: OrderHistory[];
  employeeNames?: Record<number, string>;
}

const getActionIcon = (actionType: string) => {
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
      return <FiEdit className="w-4 h-4" />;
    default:
      return <FiFileText className="w-4 h-4" />;
  }
};

const getActionColor = (actionType: string): string => {
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

const getActionLabel = (actionType: string): string => {
  return actionType
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const OrderHistoryTimeline: React.FC<OrderHistoryTimelineProps> = ({
  history,
  employeeNames = {},
}) => {
  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">No history records yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((record, index) => (
        <div key={record.id} className="flex gap-4">
          {/* Timeline line and dot */}
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${getActionColor(record.action_type)} flex-shrink-0`}
            >
              {getActionIcon(record.action_type)}
            </div>
            {index < history.length - 1 && (
              <div className="w-0.5 h-12 bg-gray-200 my-2" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 pt-1">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${getActionColor(record.action_type)}`}
                  >
                    {getActionLabel(record.action_type)}
                  </span>
                  {record.changed_by_employee_id &&
                    employeeNames[record.changed_by_employee_id] && (
                      <span className="text-xs text-gray-600">
                        by {employeeNames[record.changed_by_employee_id]}
                      </span>
                    )}
                </div>

                {/* Description */}
                {record.description && (
                  <p className="text-sm text-gray-700 mt-2">
                    {record.description}
                  </p>
                )}

                {/* Field change details */}
                {record.field_name && record.old_value && record.new_value && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600 font-mono">
                    <div className="text-red-600">- {record.old_value}</div>
                    <div className="text-green-600">+ {record.new_value}</div>
                  </div>
                )}

                {/* Timestamp */}
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(record.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
