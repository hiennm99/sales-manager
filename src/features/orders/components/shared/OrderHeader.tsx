// src/features/orders/components/shared/OrderHeader.tsx

import React from 'react';

interface OrderHeaderProps {
    title: string;
    subtitle: string;
    isEdit?: boolean;
    showBackButton?: boolean;
    onBack?: () => void;
    actions?: React.ReactNode;
}

export const OrderHeader: React.FC<OrderHeaderProps> = ({
                                                            title,
                                                            subtitle,
                                                            isEdit = false,
                                                            showBackButton = false,
                                                            onBack,
                                                            actions
                                                        }) => {
    const iconPath = isEdit
        ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        : "M12 4v16m8-8H4";

    return (
        <div className="mb-6">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        {showBackButton && onBack && (
                            <button
                                onClick={onBack}
                                className="text-blue-600 hover:text-blue-700 mb-3 flex items-center gap-1 text-sm font-medium"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Quay lại
                            </button>
                        )}
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    {title}
                                </h1>
                                <p className="text-gray-600 mt-1 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {subtitle}
                                </p>
                            </div>
                        </div>
                    </div>
                    {actions}
                </div>
            </div>
        </div>
    );
};