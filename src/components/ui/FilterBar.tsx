// src/components/ui/FilterBar.tsx

import React from 'react';

interface FilterBarProps {
    children: React.ReactNode;
}

export const FilterBar: React.FC<FilterBarProps> = ({ children }) => {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {children}
            </div>
        </div>
    );
};