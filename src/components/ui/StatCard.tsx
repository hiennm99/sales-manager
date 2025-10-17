// src/components/ui/StatCard.tsx

import React from 'react';

// Định nghĩa props cho component
interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    className?: string;
}

// Component hiển thị MỘT thẻ stat duy nhất
export const StatCard: React.FC<StatCardProps> = ({
                                                        title,
                                                        value,
                                                        icon,
                                                        className = 'text-gray-900' // Mặc định là màu đen
                                                    }) => {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-600 text-sm">{title}</p>
                    <p className={`text-3xl font-bold mt-2 ${className}`}>{value}</p>
                </div>
                {icon}
            </div>
        </div>
    );
};

// Component layout Grid để chứa các thẻ StatCard
interface StatGridProps {
    children: React.ReactNode;
}

export const StatGrid: React.FC<StatGridProps> = ({ children }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {children}
        </div>
    );
};