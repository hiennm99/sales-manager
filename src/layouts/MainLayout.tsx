// src/layouts/MainLayout.tsx
// layouts/MainLayout.tsx

import { Navbar, Sidebar } from "@components/layout";
import { THEME } from "@constants";
import { cn } from "@lib";
import { useAppStore } from "@stores";
import React from "react";
import { Outlet } from "react-router-dom";

export const MainLayout: React.FC = () => {
  const { isSidebarCollapsed } = useAppStore();

  return (
    <div className={cn("min-h-screen", THEME.BACKGROUNDS.MAIN)}>
      <Sidebar />
      <Navbar />

      <main
        className={cn(
          "pt-16 transition-all duration-300",
          isSidebarCollapsed ? "ml-20" : "ml-64"
        )}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
