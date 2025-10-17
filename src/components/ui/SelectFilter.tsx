// src/components/ui/SelectFilter.tsx

import React from 'react';

// Định nghĩa cấu trúc cho mỗi option trong select
export interface SelectOption {
    value: string | number;
    label: string;
}

interface SelectFilterProps {
    label: string;
    value: string | number;
    onChange: (value: string | number) => void;
    options: SelectOption[];
    defaultOptionLabel?: string; // Ví dụ: "Tất cả"
    defaultOptionValue?: string | number; // Ví dụ: "all"
}

export const SelectFilter: React.FC<SelectFilterProps> = ({
                                                              label,
                                                              value,
                                                              onChange,
                                                              options,
                                                              defaultOptionLabel = 'Tất cả',
                                                              defaultOptionValue = 'all'
                                                          }) => {
    return (
        <div>
            <label className="block text-xs text-gray-600 mb-1">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
                <option value={defaultOptionValue}>{defaultOptionLabel}</option>
                {options.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};