// features/auth/pages/ProfilePage.tsx

import { IoArrowBack } from "react-icons/io5";
import { FiEdit2 } from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useEmployeeStore } from "../store/useEmployeeStore";
import { EditProfileForm } from "../components/EditProfileForm";

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, initialized } = useAuthStore();
  const { employee, loading } = useEmployeeStore();
  const [isEditing, setIsEditing] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (initialized && !user) {
      navigate("/login");
    }
  }, [user, initialized, navigate]);

  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <AiOutlineLoading3Quarters className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Không tìm thấy hồ sơ
          </h2>
          <p className="text-gray-600 mb-6">
            Không thể tải thông tin hồ sơ của bạn. Vui lòng thử lại.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Quay lại Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-20 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <IoArrowBack className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
        </div>

        {isEditing ? (
          <EditProfileForm
            employee={employee}
            onCancel={() => setIsEditing(false)}
            onSuccess={() => setIsEditing(false)}
          />
        ) : (
          // View Mode
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Cover */}
            <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600" />

            {/* Profile Content */}
            <div className="px-8 pb-8">
              {/* Avatar & Basic Info */}
              <div className="flex flex-col md:flex-row gap-6 -mt-16 mb-8">
                <div className="flex-shrink-0">
                  {employee.avatar ? (
                    <img
                      src={employee.avatar}
                      alt={employee.name}
                      className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <span className="text-4xl font-bold text-white">
                        {employee.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 pt-4">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {employee.name}
                  </h2>
                  <p className="text-lg text-gray-600 mb-4">{employee.email}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {employee.role}
                    </span>
                    {employee.is_admin && (
                      <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                        Admin
                      </span>
                    )}
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-medium ${
                        employee.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {employee.is_active ? "Đang hoạt động" : "Không hoạt động"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditing(true)}
                  className="self-start md:self-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <FiEdit2 className="w-4 h-4" />
                  Chỉnh sửa
                </button>
              </div>

              {/* Info Grid */}
              <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-gray-200">
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                      Mã nhân viên
                    </label>
                    <p className="text-lg text-gray-900 mt-1 font-mono">
                      {employee.code}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                      Email
                    </label>
                    <p className="text-lg text-gray-900 mt-1">
                      {employee.email}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                      Vai trò
                    </label>
                    <p className="text-lg text-gray-900 mt-1">
                      {employee.role}
                    </p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                      Lương cơ bản (VNĐ)
                    </label>
                    <p className="text-lg text-gray-900 mt-1 font-semibold">
                      {employee.base_salary?.toLocaleString("vi-VN") || "0"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                      Tỷ lệ hoa hồng (%)
                    </label>
                    <p className="text-lg text-gray-900 mt-1">
                      {employee.sales_commission_rate}%
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                      Ngày tạo
                    </label>
                    <p className="text-lg text-gray-900 mt-1">
                      {new Date(employee.created_at).toLocaleDateString(
                        "vi-VN",
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
