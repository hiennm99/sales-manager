/**
 * FormAutocomplete - Generic autocomplete component
 * Consolidates EmployeeAutocomplete and ProductAutocomplete
 * Reusable for any entity with search functionality
 */

import React, { useEffect, useRef, useState } from "react";
import { cn } from "../../../lib/utils";
import { theme } from "../../../styles/theme";

export interface AutocompleteOption {
  id: string | number;
  label: string;
  code?: string;
  avatar?: string;
  icon?: React.ReactNode;
}

interface FormAutocompleteProps {
  label: string;
  value: string | number;
  name: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  icon?: React.ReactNode;
  fetchOptions: (query: string) => Promise<AutocompleteOption[]>;
  displayFormat?: (option: AutocompleteOption) => React.ReactNode;
  getInitialLabel?: (value: string | number) => Promise<string>;
  onChange?: (
    name: string,
    value: string | number,
    option?: AutocompleteOption,
  ) => void;
  onBlur?: () => void;
  maxResults?: number;
}

/**
 * FormAutocomplete Component
 *
 * Features:
 * - Real-time filtering as user types
 * - Keyboard navigation (↑↓ arrows, Enter to select, Esc to close)
 * - Click outside to close dropdown
 * - Customizable display format
 * - Avatar support with fallback to initials
 * - Loading state
 */
export const FormAutocomplete: React.FC<FormAutocompleteProps> = ({
  label,
  value,
  name,
  placeholder = "Tìm kiếm...",
  required = false,
  disabled = false,
  error,
  helperText,
  className = "",
  icon,
  fetchOptions,
  displayFormat,
  getInitialLabel,
  onChange,
  onBlur,
  maxResults = 10,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<AutocompleteOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [displayLabel, setDisplayLabel] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Load initial label when value changes
  useEffect(() => {
    if (value && getInitialLabel) {
      getInitialLabel(value)
        .then(setDisplayLabel)
        .catch(() => setDisplayLabel(""));
    }
  }, [value, getInitialLabel]);

  // Handle search with debounce
  const handleSearch = async (query: string) => {
    setInputValue(query);
    setSelectedIndex(-1);

    if (!query.trim()) {
      setOptions([]);
      setIsOpen(false);
      return;
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await fetchOptions(query);
        setOptions(results.slice(0, maxResults));
        setIsOpen(true);
      } catch (error) {
        console.error("Error fetching options:", error);
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  // Handle option selection
  const handleSelectOption = (option: AutocompleteOption) => {
    setInputValue("");
    setDisplayLabel(option.label);
    setIsOpen(false);
    setOptions([]);

    if (onChange) {
      onChange(name, option.id, option);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < options.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && options[selectedIndex]) {
          handleSelectOption(options[selectedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get avatar initials
  const getInitials = (label: string): string => {
    return label
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={className}>
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
        {icon && <span className="text-gray-400">{icon}</span>}
        <span>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </span>
      </label>

      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}

          <input
            ref={inputRef}
            type="text"
            value={inputValue || displayLabel}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => inputValue && setIsOpen(true)}
            onBlur={onBlur}
            disabled={disabled}
            placeholder={placeholder}
            className={cn(
              theme.components.input.base,
              icon && "pl-10",
              error
                ? theme.components.input.error
                : theme.components.input.border,
            )}
          />

          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg
                className="animate-spin h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          )}
        </div>

        {/* Dropdown */}
        {isOpen && options.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
            <ul className="max-h-64 overflow-y-auto">
              {options.map((option, index) => (
                <li
                  key={option.id}
                  onClick={() => handleSelectOption(option)}
                  className={cn(
                    "px-4 py-2.5 cursor-pointer flex items-center gap-3 transition-colors",
                    index === selectedIndex
                      ? "bg-blue-100 text-blue-900"
                      : "hover:bg-gray-50 text-gray-900",
                  )}
                >
                  {/* Avatar or Icon */}
                  {option.avatar ? (
                    <img
                      src={option.avatar}
                      alt={option.label}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : option.icon ? (
                    <div className="w-8 h-8 flex items-center justify-center">
                      {option.icon}
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-600">
                      {getInitials(option.label)}
                    </div>
                  )}

                  {/* Label and Code */}
                  <div className="flex-1 min-w-0">
                    {displayFormat ? (
                      displayFormat(option)
                    ) : (
                      <>
                        <div className="font-medium truncate">
                          {option.label}
                        </div>
                        {option.code && (
                          <div className="text-xs text-gray-500 truncate">
                            {option.code}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* No results message */}
        {isOpen && !isLoading && inputValue && options.length === 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
            Không tìm thấy kết quả
          </div>
        )}
      </div>

      {(error || helperText) && (
        <p
          className={cn(
            "mt-1 text-sm flex items-center gap-1",
            error ? "text-red-600" : "text-gray-500",
          )}
        >
          {error && (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {error || helperText}
        </p>
      )}
    </div>
  );
};
