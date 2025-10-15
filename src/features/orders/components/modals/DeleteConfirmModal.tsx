// src/features/orders/components/modals/DeleteConfirmModal.tsx

import React from 'react';

interface DeleteConfirmModalProps {
    isOpen: boolean;
    orderCode: string;
    isLoading: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
                                                                          isOpen,
                                                                          orderCode,
                                                                          isLoading,
                                                                          onConfirm,
                                                                          onCancel
                                                                      }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-red-100 rounded-full">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Xác nhận xóa</h3>
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                    Bạn có chắc chắn muốn xóa đơn hàng <strong className="text-gray-900">{orderCode}</strong>? Hành động này không thể hoàn tác.
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-5 py-2.5 text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                    >
                        {isLoading ? 'Đang xóa...' : 'Xóa đơn hàng'}
                    </button>
                </div>
            </div>
        </div>
    );
};