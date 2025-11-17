// src/router/index.tsx

import { lazyLoad } from "@utils";
import { createBrowserRouter, Navigate } from "react-router-dom";

// Lazy load (code-split) - loaded only when route is accessed
const ProtectedRoute = lazyLoad(() =>
  import("@components/auth").then((m) => ({ default: m.ProtectedRoute }))
);
const LoginPage = lazyLoad(() =>
  import("@features/auth").then((m) => ({ default: m.LoginPage }))
);
const SignUpPage = lazyLoad(() =>
  import("@features/auth").then((m) => ({ default: m.SignUpPage }))
);
const NotificationSettingsPage = lazyLoad(() =>
  import("@features/auth").then((m) => ({ default: m.NotificationSettingsPage }))
);
const ProfilePage = lazyLoad(() =>
  import("@features/auth").then((m) => ({ default: m.ProfilePage }))
);
const MainLayout = lazyLoad(() =>
  import("@layout").then((m) => ({ default: m.MainLayout }))
);
const ShopCreate = lazyLoad(() =>
  import("@features/shops").then((m) => ({ default: m.ShopCreate }))
);
const ShopListAdmin = lazyLoad(() =>
  import("@features/shops").then((m) => ({ default: m.ShopListAdmin }))
);
const DashboardPage = lazyLoad(() =>
  import("@features/dashboard").then((m) => ({ default: m.DashboardPage }))
);
const ProductList = lazyLoad(() =>
  import("@features/products").then((m) => ({ default: m.ProductList }))
);
const ProductDetail = lazyLoad(() =>
  import("@features/products").then((m) => ({ default: m.ProductDetail }))
);
const ProductCreate = lazyLoad(() =>
  import("@features/products").then((m) => ({ default: m.ProductCreate }))
);
const OrderList = lazyLoad(() =>
  import("@features/orders").then((m) => ({ default: m.OrderList }))
);
const OrderDetail = lazyLoad(() =>
  import("@features/orders").then((m) => ({ default: m.OrderDetail }))
);
const OrderCreate = lazyLoad(() =>
  import("@features/orders").then((m) => ({ default: m.OrderCreate }))
);
const EmployeeListAdmin = lazyLoad(() =>
  import("@features/employees").then((m) => ({ default: m.EmployeeList }))
);
const EmployeeCreate = lazyLoad(() =>
  import("@features/employees").then((m) => ({ default: m.EmployeeCreate }))
);
const EmployeeDetail = lazyLoad(() =>
  import("@features/employees").then((m) => ({ default: m.EmployeeDetail }))
);
const EmployeeSalaryList = lazyLoad(() =>
  import("@features/employees").then((m) => ({ default: m.EmployeeSalaryList }))
);
const StatusList = lazyLoad(() =>
  import("@features/statuses").then((m) => ({ default: m.StatusList }))
);
const StatusCreate = lazyLoad(() =>
  import("@features/statuses").then((m) => ({ default: m.StatusCreate }))
);
const SettingsPage = lazyLoad(() =>
  import("@features/settings/").then((m) => ({ default: m.SettingsPage }))
);
const FinancialReportsPage = lazyLoad(() =>
  import("@features/reports").then((m) => ({ default: m.FinancialReportsPage }))
);

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/signup",
    element: <SignUpPage />
  },
  {
    path: "/profile",
    element: <ProtectedRoute><ProfilePage /></ProtectedRoute>
  },
  {
    path: "/notification-settings",
    element: <ProtectedRoute><NotificationSettingsPage /></ProtectedRoute>
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: "dashboard",
        element: <DashboardPage />
      },
      {
        path: "shops",
        children: [
          {
            index: true,
            element: <ShopListAdmin />
          },
          {
            path: "create",
            element: <ShopCreate />
          },
          {
            path: ":shopId/edit",
            element: <ShopCreate />
          }
        ]
      },
      {
        path: "products",
        children: [
          {
            index: true,
            element: <ProductList />
          },
          {
            path: "create",
            element: <ProductCreate />
          },
          {
            path: ":productId",
            element: <ProductDetail />
          },
          {
            path: ":productId/edit",
            element: <ProductCreate />
          }
        ]
      },
      {
        path: "orders",
        children: [
          {
            index: true,
            element: <OrderList />
          },
          {
            path: "create",
            element: <OrderCreate />
          },
          {
            path: ":orderId",
            element: <OrderDetail />
          },
          {
            path: ":orderId/edit",
            element: <OrderDetail />
          }
        ]
      },
      {
        path: "employees",
        children: [
          {
            index: true,
            element: <EmployeeListAdmin />
          },
          {
            path: "create",
            element: <EmployeeCreate />
          },
          {
            path: ":employeeId",
            element: <EmployeeDetail />
          },
          {
            path: ":employeeId/edit",
            element: <EmployeeCreate />
          }
        ]
      },
      {
        path: "statuses",
        children: [
          {
            index: true,
            element: <StatusList />
          },
          {
            path: "create",
            element: <StatusCreate />
          },
          {
            path: ":statusId/edit",
            element: <StatusCreate />
          }
        ]
      },
      {
        path: "settings",
        element: <SettingsPage />
      },
      {
        path: "salaries",
        children: [
          {
            index: true,
            element: <EmployeeSalaryList />
          }
        ]
      },
      {
        path: "financial-reports",
        element: <FinancialReportsPage />
      }
    ]
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />
  }
]);
