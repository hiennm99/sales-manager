// components/layout/Sidebar.tsx

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Store, Package, ClipboardList, Users } from "lucide-react";
import { cn } from '../../lib/utils';
import { useAppStore } from '../../store/useAppStore';
import { ShopSelector } from './ShopSelector';

interface MenuItem {
    icon: React.ReactNode;
    label: string;
    path: string;
    badge?: number;
}

const menuItems: MenuItem[] = [
    {
        icon: (
            <LayoutDashboard size={20}/>
        ),
        label: 'Dashboard',
        path: '/dashboard',
    },
    {
        icon: (
            <Store size={20}/>
        ),
        label: 'Cửa hàng',
        path: '/shops',
    },
    {
        icon: (
            <Package size={20}/>
        ),
        label: 'Sản phẩm',
        path: '/products',
    },
    {
        icon: (
            <ClipboardList size={20}/>
        ),
        label: 'Đơn hàng',
        path: '/orders',
    },
    {
        icon: (
            <Users size={20}/>
        ),
        label: 'Nhân viên',
        path: '/employees',
    },
];

export const Sidebar: React.FC = () => {
    const location = useLocation();
    const { isSidebarCollapsed } = useAppStore();

    return (
        <aside
            className={cn(
                'fixed left-0 top-0 h-screen bg-gray-900 text-white transition-all duration-300 z-40',
                isSidebarCollapsed ? 'w-20' : 'w-64'
            )}
        >
            {/* Logo */}
            <div className="h-16 flex items-center justify-center border-b border-gray-800">
                {isSidebarCollapsed ? (
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl">
                        S
                    </div>
                ) : (
                    <h1 className="text-xl font-bold">Shop Manager</h1>
                )}
            </div>

            {/* Shop Selector - THAY THẾ Current Shop Info cũ */}
            <ShopSelector />

            {/* Navigation */}
            <nav className="p-4 space-y-2">
                {menuItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.path);

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                                'hover:bg-gray-800',
                                isActive ? 'bg-blue-600 text-white' : 'text-gray-300',
                                isSidebarCollapsed && 'justify-center'
                            )}
                            title={isSidebarCollapsed ? item.label : undefined}
                        >
                            {item.icon}
                            {!isSidebarCollapsed && (
                                <span className="flex-1">{item.label}</span>
                            )}
                            {!isSidebarCollapsed && item.badge && (
                                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
};