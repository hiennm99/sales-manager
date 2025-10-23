// src/features/employees/pages/EmployeeDetail.tsx

import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EmployeeCard } from "../components/EmployeeCard";
import { useEmployeeStore } from "../store/useEmployeeStore";

export const EmployeeDetail: React.FC = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const { fetchEmployeeById, deleteEmployee, isLoading } = useEmployeeStore();
  const [employee, setEmployee] = React.useState(
    fetchEmployeeById(Number(employeeId)) || null,
  );

  useEffect(() => {
    if (employeeId) {
      const foundEmployee = fetchEmployeeById(Number(employeeId));
      setEmployee(foundEmployee || null);
    }
  }, [employeeId, fetchEmployeeById]);

  const handleEdit = () => {
    navigate(`/employees/${employeeId}/edit`);
  };

  const handleDelete = async () => {
    if (!employee) return;

    if (window.confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) {
      try {
        await deleteEmployee(Number(employeeId));
        navigate("/employees");
      } catch (error) {
        console.error("Failed to delete employee:", error);
      }
    }
  };

  const handleBack = () => {
    navigate("/employees");
  };

  if (!employee) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-600">Không tìm thấy nhân viên</p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Chi tiết nhân viên
          </h1>
          <p className="text-gray-600 mt-1">
            Xem và quản lý thông tin nhân viên
          </p>
        </div>
        <button
          onClick={handleBack}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          ← Quay lại
        </button>
      </div>

      {/* Employee Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <EmployeeCard employee={employee} />
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex gap-3">
          <button
            onClick={handleEdit}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Chỉnh sửa
          </button>
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};
