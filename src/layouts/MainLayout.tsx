// layouts/MainLayout.tsx

import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import { Sidebar } from "../components/layout/Sidebar";
import { THEME } from "../constants/theme";
import { cn } from "../lib/utils";
import { useAppStore } from "../store/useAppStore";

export const MainLayout: React.FC = () => {
  const { isSidebarCollapsed } = useAppStore();

  return (
    <div className={cn("min-h-screen", THEME.BACKGROUNDS.MAIN)}>
      <Sidebar />
      <Navbar />

      <main
        className={cn(
          "pt-16 transition-all duration-300",
          isSidebarCollapsed ? "ml-20" : "ml-64",
        )}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
