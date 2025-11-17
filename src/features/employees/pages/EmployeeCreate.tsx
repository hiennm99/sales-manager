// src/features/employees/pages/EmployeeCreate.tsx

import { EmployeeForm, useEmployeeStore } from "@features/employees";
import type { EmployeeFormData } from "@types";
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export const EmployeeCreate: React.FC = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const {
    employees,
    fetchEmployeeById,
    createEmployee,
    updateEmployee,
    isLoading
  } = useEmployeeStore();
  const [employee, setEmployee] = React.useState(
    employees.find((a) => a.id === Number(employeeId)) || null
  );

  useEffect(() => {
    if (employeeId) {
      const foundEmployee = fetchEmployeeById(Number(employeeId));
      setEmployee(foundEmployee || null);
    }
  }, [employeeId, fetchEmployeeById]);

  const handleSubmit = async (data: EmployeeFormData) => {
    try {
      if (employeeId && employee) {
        await updateEmployee(Number(employeeId), data);
        navigate(`/employees/${employeeId}`);
      } else {
        const newEmployee = await createEmployee(data);
        navigate(`/employees/${newEmployee.id}`);
      }
    } catch (error) {
      console.error("Failed to save employee:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {employeeId ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
        </h1>
        <p className="text-gray-600 mt-1">
          {employeeId
            ? "Cập nhật thông tin nhân viên"
            : "Điền thông tin để tạo nhân viên mới"}
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <EmployeeForm
          employee={employee || undefined}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
