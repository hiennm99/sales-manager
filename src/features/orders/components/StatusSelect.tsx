// src/features/orders/components/StatusSelect.tsx

import React from 'react';
import type { Status } from '../../../types/status';

interface StatusSelectProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    options: Status[];
    className?: string;
}

export const StatusSelect: React.FC<StatusSelectProps> = ({
    label,
    value,
    onChange,
    options,
    className = '',
}) => {
    return (
        <div className={className}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <select
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
                {options.map(status => (
                    <option key={status.id} value={status.id}>
                        {status.name_vi}
                    </option>
                ))}
            </select>
        </div>
    );
};
