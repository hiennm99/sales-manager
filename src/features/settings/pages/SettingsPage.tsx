// src/features/settings/pages/SettingsPage.tsx

import { EmployeeList } from "@/features/employees";
import { ShopListAdmin } from "@/features/shops";
import { StatusList } from "@/features/statuses";
import { FiSettings } from "react-icons/fi";
import { AiOutlineShop } from "react-icons/ai";
import { BiUserCircle } from "react-icons/bi";
import { BiTag } from "react-icons/bi";
import React, { useState } from "react";

type SettingsTab = "shops" | "employees" | "statuses";

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("shops");

  const tabs = [
    { id: "shops" as SettingsTab, label: "Cửa Hàng", icon: AiOutlineShop },
    { id: "employees" as SettingsTab, label: "Nhân Viên", icon: BiUserCircle },
    { id: "statuses" as SettingsTab, label: "Trạng Thái", icon: BiTag },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
              <FiSettings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Cài Đặt</h1>
              <p className="text-gray-600 mt-1">Quản lý cấu hình hệ thống</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all
                    ${
                      activeTab === tab.id
                        ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === "shops" && <ShopListAdmin />}
            {activeTab === "employees" && <EmployeeList />}
            {activeTab === "statuses" && <StatusList />}
          </div>
        </div>
      </div>
    </div>
  );
};
