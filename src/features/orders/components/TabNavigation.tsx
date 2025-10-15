// src/features/orders/components/TabNavigation.tsx

import React from 'react';

export interface Tab {
    id: string;
    label: string;
    icon: React.ReactNode;
}

interface TabNavigationProps {
    tabs: Tab[];
    activeTab: string;
    onChange: (tabId: string) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
                                                                tabs,
                                                                activeTab,
                                                                onChange,
                                                            }) => {
    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-2">
            <nav className="flex gap-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => onChange(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                            activeTab === tab.id
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                    >
                        <span className={activeTab === tab.id ? 'text-white' : 'text-gray-400'}>
                            {tab.icon}
                        </span>
                        <span>{tab.label}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
};