// src/features/orders/components/shared/InfoRow.tsx

import React from 'react';

interface InfoRowProps {
    label: string;
    value: string | number | React.ReactNode;
    icon?: React.ReactNode;
    valueClassName?: string;
}

export const InfoRow: React.FC<InfoRowProps> = ({ label, value, icon, valueClassName = 'text-lg font-semibold text-gray-900' }) => {
    return (
        <div>
            <p className="text-sm text-gray-600 mb-1 font-medium flex items-center gap-2">
                {icon}
                {label}
            </p>
            <p className={valueClassName}>{value}</p>
        </div>
    );
};