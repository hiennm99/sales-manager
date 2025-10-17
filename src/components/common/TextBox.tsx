// src/components/common/TextBox.tsx
/**
 * TextBox - Reusable text input component
 * Supports both view and edit modes with inline editing
 */

import React, {useState, useEffect} from 'react';

interface TextBoxProps {
    label: string,
    value: string | number | undefined,
    displayValue?: React.ReactNode, // Custom element for view mode display
    name: string,
    type?: 'text' | 'date' | 'number' | 'email' | 'tel' | 'textarea',
    editable?: boolean,
    placeholder?: string,
    required?: boolean,
    disabled?: boolean,
    error?: string,
    className?: string,
    min?: number,
    max?: number,
    onChange?: (name: string, value: string | number) => void,
    onBlur?: () => void,
    icon?: React.JSX.Element
}

export const TextBox: React.FC<TextBoxProps> = ({
                                                    label,
                                                    value,
                                                    name,
                                                    type = 'text',
                                                    editable = false,
                                                    placeholder = 'Chưa có thông tin',
                                                    required = false,
                                                    disabled = false,
                                                    error,
                                                    className = '',
                                                    min,
                                                    max,
                                                    displayValue,
                                                    onChange,
                                                    onBlur,
                                                    icon
                                                }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const rawValue = e.target.value;
        // Convert to number for number inputs, keep as string for others
        const newValue = type === 'number' && rawValue !== '' ? Number(rawValue) : rawValue;
        setLocalValue(newValue);
        if (onChange) {
            onChange(name, newValue);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && type !== 'textarea') {
            setIsEditing(false);
            if (onBlur) onBlur();
        }
        if (e.key === 'Escape') {
            setLocalValue(value);
            setIsEditing(false);
        }
    };

    // Priority: displayValue > value > placeholder
    let finalDisplayValue = displayValue;
    if (!finalDisplayValue) {
        if (value) {
            finalDisplayValue = value.toString();
        } else {
            finalDisplayValue = placeholder;
        }
    }

    // View mode - not editable or editable with inline edit
    if (!editable || (!isEditing && editable)) {
        return (
            <div className={className}>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                    {icon && <span className="text-gray-400">{icon}</span>}
                    <span>{label} {required && <span className="text-red-500">*</span>}</span>
                </label>
                {editable ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="w-full text-left text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200 group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50"
                    >
                        <span className="flex-1">{finalDisplayValue}</span>
                        <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none"
                             stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                        </svg>
                    </button>
                ) : (
                    <p className="text-lg font-semibold text-gray-900 px-3 py-2">
                        {finalDisplayValue}
                    </p>
                )}
            </div>
        );
    }

    // Edit mode
    const inputClassName = `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
        disabled ? 'bg-gray-50 cursor-not-allowed' : ''
    } ${error ? 'border-red-500' : 'border-gray-300'}`;

    return (
        <div className={className}>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                {icon && <span className="text-gray-400">{icon}</span>}
                <span>{label} {required && <span className="text-red-500">*</span>}</span>
            </label>
            {type === 'textarea' ? (
                <textarea
                    name={name}
                    value={localValue}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onBlur={() => {
                        setIsEditing(false);
                        if (onBlur) onBlur();
                    }}
                    disabled={disabled}
                    placeholder={placeholder}
                    className={inputClassName}
                    rows={3}
                    autoFocus={isEditing}
                />
            ) : (
                <input
                    type={type}
                    name={name}
                    value={localValue}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onBlur={() => {
                        setIsEditing(false);
                        if (onBlur) onBlur();
                    }}
                    disabled={disabled}
                    placeholder={placeholder}
                    className={inputClassName}
                    autoFocus={isEditing}
                    min={min}
                    max={max}
                />
            )}
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
};
