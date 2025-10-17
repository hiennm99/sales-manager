// src/components/common/SectionCard.tsx
/**
 * SectionCard - Reusable card component for sections
 * Provides consistent styling with icon, title, and optional actions
 */

import React from 'react';

interface SectionCardProps {
    title: string;
    icon: React.ReactNode;
    iconGradient?: string;
    children: React.ReactNode;
    className?: string;
    actions?: React.ReactNode;
}

export const SectionCard: React.FC<SectionCardProps> = ({
    title,
    icon,
    iconGradient = 'from-blue-500 to-indigo-600',
    children,
    className = '',
    actions
}) => {
    return (
        <div className={`bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-shadow duration-300 ${className}`}>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={`p-2 bg-gradient-to-br ${iconGradient} rounded-xl`}>
                        {icon}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                </div>
                {actions}
            </div>
            {children}
        </div>
    );
};
