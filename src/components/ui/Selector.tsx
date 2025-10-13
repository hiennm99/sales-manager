// components/ui/Selector.tsx

import React from 'react';
import { cn } from '../../lib/utils';
import type { SelectOption } from '../../types/common';

interface SelectorProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
    label?: string;
    error?: string;
    helperText?: string;
    options: SelectOption[];
    placeholder?: string;
    onChange?: (value: string) => void;
}

export const Selector = React.forwardRef<HTMLSelectElement, SelectorProps>(
    ({ label, error, helperText, options, placeholder, onChange, className, ...props }, ref) => {
        const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
            onChange?.(e.target.value);
        };

        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}

                <select
                    ref={ref}
                    onChange={handleChange}
                    className={cn(
                        'w-full px-3 py-2 border rounded-lg transition-colors appearance-none bg-white',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                        'disabled:bg-gray-100 disabled:cursor-not-allowed',
                        'bg-[length:16px_16px] bg-[right_0.75rem_center] bg-no-repeat',
                        error ? 'border-red-500' : 'border-gray-300',
                        className
                    )}
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`
                    }}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                {(error || helperText) && (
                    <p className={cn(
                        'mt-1 text-sm',
                        error ? 'text-red-500' : 'text-gray-500'
                    )}>
                        {error || helperText}
                    </p>
                )}
            </div>
        );
    }
);

Selector.displayName = 'Selector';