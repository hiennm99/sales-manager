// features/employees/components/EmployeeCard.tsx

import { Button } from "@/components/ui/Button";
import { useEmployeeStore } from "../store/useEmployeeStore";
import { cn } from "@/lib/utils";
import { type Employee, getEmployeeInitials } from "@/types/employee";
import React from "react";
import { Link } from "react-router-dom";

interface EmployeeCardProps {
  employee: Employee;
  onSelect?: (employee: Employee) => void;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  onSelect,
}) => {
  const { selectedEmployee, setSelectedEmployee } = useEmployeeStore();
  const isSelected = selectedEmployee?.id === employee.id;

  const handleSelect = () => {
    setSelectedEmployee(employee);
    onSelect?.(employee);
  };

  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden",
        isSelected && "ring-2 ring-blue-500",
      )}
    >
      {/* Header với avatar */}
      <div className="relative h-32 bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
        {employee.avatar ? (
          <img
            src={employee.avatar}
            alt={employee.name}
            className="w-20 h-20 rounded-full border-4 border-white object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-2xl font-bold text-purple-600">
            {getEmployeeInitials(employee.name)}
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <span
            className={cn(
              "px-2 py-1 rounded-full text-xs font-semibold",
              employee.is_active === true
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700",
            )}
          >
            {employee.is_active === true ? "Hoạt động" : "Tạm ngưng"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {employee.name}
            </h3>
            <p className="text-sm text-gray-600 mb-1">{employee.role}</p>
            <p className="text-sm text-gray-500">Mã: {employee.code}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant={isSelected ? "primary" : "outline"}
            size="sm"
            className="flex-1"
            onClick={handleSelect}
          >
            {isSelected ? "Đang chọn" : "Chọn"}
          </Button>
          <Link to={`/employees/${employee.id}`} className="flex-1">
            <Button variant="ghost" size="sm" className="w-full">
              Chi tiết
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
