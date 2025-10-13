// layouts/MainLayout.tsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../lib/utils';

export const MainLayout: React.FC = () => {
    const { isSidebarCollapsed } = useAppStore();

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <Navbar />

            <main
                className={cn(
                    'pt-16 transition-all duration-300',
                    isSidebarCollapsed ? 'ml-20' : 'ml-64'
                )}
            >
                <div className="p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};