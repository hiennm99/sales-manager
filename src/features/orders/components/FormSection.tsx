// src/features/orders/components/FormSection.tsx

import React from 'react';

interface FormSectionProps {
    title: string;
    children: React.ReactNode;
    className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
    title,
    children,
    className = '',
}) => {
    return (
        <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {title}
            </h2>
            {children}
        </div>
    );
};
