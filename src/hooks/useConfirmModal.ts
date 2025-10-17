// src/hooks/useConfirmModal.ts
/**
 * useConfirmModal - Custom hook for managing confirmation modals
 * Provides easy-to-use interface for showing confirmation dialogs
 */

import { useState, useCallback } from 'react';
import type { ConfirmModalVariant } from '../components/modals/ConfirmModal';

interface ConfirmModalConfig {
    title: string;
    message: string | React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    variant?: ConfirmModalVariant;
}

interface UseConfirmModalReturn {
    isOpen: boolean;
    isLoading: boolean;
    modalConfig: ConfirmModalConfig | null;
    showConfirm: (config: ConfirmModalConfig, onConfirm: () => void | Promise<void>) => void;
    closeModal: () => void;
    handleConfirm: () => Promise<void>;
}

export const useConfirmModal = (): UseConfirmModalReturn => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [modalConfig, setModalConfig] = useState<ConfirmModalConfig | null>(null);
    const [onConfirmCallback, setOnConfirmCallback] = useState<(() => void | Promise<void>) | null>(null);

    const showConfirm = useCallback((config: ConfirmModalConfig, onConfirm: () => void | Promise<void>) => {
        setModalConfig(config);
        setOnConfirmCallback(() => onConfirm);
        setIsOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsOpen(false);
        setIsLoading(false);
        setModalConfig(null);
        setOnConfirmCallback(null);
    }, []);

    const handleConfirm = useCallback(async () => {
        if (!onConfirmCallback) return;

        try {
            setIsLoading(true);
            await onConfirmCallback();
            closeModal();
        } catch (error) {
            console.error('Confirm action failed:', error);
            setIsLoading(false);
        }
    }, [onConfirmCallback, closeModal]);

    return {
        isOpen,
        isLoading,
        modalConfig,
        showConfirm,
        closeModal,
        handleConfirm,
    };
};
