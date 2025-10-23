// components/auth/ProtectedRoute.tsx

import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../features/auth/store/useAuthStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, initialized, initialize } = useAuthStore();

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  // Show loading state while checking authentication
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <AiOutlineLoading3Quarters className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Render protected content if authenticated
  return <>{children}</>;
};
