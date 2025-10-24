// features/auth/components/SignUpWithEmployee.tsx

import { FiAlertCircle, FiMail, FiLock, FiUsers } from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { employeeService } from "../../employees/services/employeeService.ts";
import type { Employee } from "../../../types/employee";
import { useAuthStore } from "../store/useAuthStore";

export const SignUpWithEmployee = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(
    null,
  );
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const navigate = useNavigate();

  const { signUp, loading, error, clearError } = useAuthStore();

  // Load employees on mount
  useEffect(() => {
    const loadEmployees = async () => {
      setLoadingEmployees(true);
      try {
        const data = await employeeService.getAll();
        // Filter employees that don't have user_id yet
        const availableEmployees = data.filter((emp) => !emp.user_id);
        setEmployees(availableEmployees);
      } catch (err) {
        console.error("Error loading employees:", err);
      } finally {
        setLoadingEmployees(false);
      }
    };

    loadEmployees();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!selectedEmployeeId) {
      alert("Please select an employee");
      return;
    }

    try {
      // Sign up user
      await signUp(email, password);
      // Note: linkUserToEmployee will be called after user verifies email
      // For now, we'll link it immediately after signup
      // In production, you might want to wait for email verification
      alert(
        "Account created! Please check your email to verify your account.",
      );
      navigate("/login");
    } catch (err) {
      console.error("Auth error:", err);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FiUsers className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Create Account
          </h2>
          <p className="text-gray-600">Sign up and link to your employee profile</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Employee Selection */}
          <div>
            <label
              htmlFor="employee"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Select Employee Profile
            </label>
            <div className="relative">
              <FiUsers className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <select
                id="employee"
                value={selectedEmployeeId || ""}
                onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
                disabled={loadingEmployees}
                required
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {loadingEmployees ? "Loading employees..." : "Choose an employee"}
                </option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.code}) - {emp.role}
                  </option>
                ))}
              </select>
            </div>
            {employees.length === 0 && !loadingEmployees && (
              <p className="text-sm text-gray-500 mt-2">
                No available employees. Please contact admin.
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || loadingEmployees || !selectedEmployeeId}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <>
                <AiOutlineLoading3Quarters className="w-5 h-5 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <FiUsers className="w-5 h-5" />
                <span>Sign Up & Link Employee</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer Note */}
      <p className="text-center text-sm text-gray-500 mt-6">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
};
