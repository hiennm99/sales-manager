// src/components/common/ActionButtons.tsx
/**
 * ActionButtons - Reusable form action buttons component
 * Can be used in any form across the application
 */

import React from 'react';

interface ActionButtonsProps {
    mode: 'create' | 'edit' | 'view';
    isLoading?: boolean;
    submitLabel?: string;
    submitLoadingLabel?: string;
    showReset?: boolean;
    showCancel?: boolean;
    onSubmit?: () => void;
    onReset?: () => void;
    onCancel?: () => void;
    disabled?: boolean;
    className?: string;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
    mode,
    isLoading = false,
    submitLabel,
    submitLoadingLabel,
    showReset = false,
    showCancel = true,
    onSubmit,
    onReset,
    onCancel,
    disabled = false,
    className = ''
}) => {
    // Default labels based on mode
    const defaultSubmitLabel = mode === 'create' ? 'Tạo mới' : mode === 'edit' ? 'Cập nhật' : 'Lưu';
    const defaultLoadingLabel = mode === 'create' ? 'Đang tạo...' : mode === 'edit' ? 'Đang cập nhật...' : 'Đang lưu...';

    const finalSubmitLabel = submitLabel || defaultSubmitLabel;
    const finalLoadingLabel = submitLoadingLabel || defaultLoadingLabel;

    return (
        <div className={`bg-white rounded-2xl shadow-xl border border-gray-100 p-6 ${className}`}>
            <div className="flex items-center justify-between">
                {showReset && onReset && (
                    <button
                        type="button"
                        onClick={onReset}
                        disabled={isLoading || disabled}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Đặt lại
                    </button>
                )}

                <div className={`flex gap-3 ${!showReset ? 'w-full justify-end' : 'ml-auto'}`}>
                    {showCancel && onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isLoading || disabled}
                            className="inline-flex items-center gap-2 px-5 py-2.5 text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Hủy
                        </button>
                    )}
                    
                    {mode !== 'view' && (
                        <button
                            type="submit"
                            onClick={onSubmit}
                            disabled={isLoading || disabled}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {finalLoadingLabel}
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {finalSubmitLabel}
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
