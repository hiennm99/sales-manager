// src/components/common/EmployeeAutocomplete.tsx

import { useEmployeeStore } from "@features/auth";
import { type Employee } from "@types";
import React, { useEffect, useRef, useState } from "react";

interface EmployeeAutocompleteProps {
  value: string; // Display value (employee name)
  onChange: (value: string, employeeId?: number) => void; // Pass both name and ID
  onSelect?: (employee: Employee) => void;
  placeholder?: string;
  className?: string;
  error?: string;
}

export const EmployeeAutocomplete: React.FC<EmployeeAutocompleteProps> = ({
                                                                            value,
                                                                            onChange,
                                                                            onSelect,
                                                                            placeholder = "Nhập mã hoặc tên nhân viên...",
                                                                            className = "",
                                                                            error
                                                                          }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [isEmployeeSelected, setIsEmployeeSelected] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { employees, fetchEmployees } = useEmployeeStore();

  // Load employees on mount
  useEffect(() => {
    if (employees.length === 0) {
      fetchEmployees();
    }
  }, [employees.length, fetchEmployees]);

  // When value is pre-populated (e.g., loading existing order), mark as selected
  useEffect(() => {
    if (value.trim() !== "" && employees.length > 0) {
      // Check if the value matches an existing employee name
      const matchingEmployee = employees.find(
        (emp) => emp.name === value.trim()
      );
      if (matchingEmployee) {
        setIsEmployeeSelected(true);
      }
    }
  }, [value, employees]);

  // Filter employees based on input
  useEffect(() => {
    if (value.trim() === "" || isEmployeeSelected) {
      setFilteredEmployees([]);
      setIsOpen(false);
      return;
    }

    const searchTerm = value.toLowerCase();
    const filtered = employees
      .filter(
        (employee) =>
          employee.is_active &&
          (employee.code.toLowerCase().includes(searchTerm) ||
            employee.name.toLowerCase().includes(searchTerm))
      )
      .slice(0, 10); // Limit to 10 results

    setFilteredEmployees(filtered);
    // Don't auto-open dropdown here, let handleInputChange control it
    setHighlightedIndex(0);
  }, [value, employees, isEmployeeSelected]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsEmployeeSelected(false); // Reset selection state when user types
    onChange(e.target.value);
    // Open dropdown when user starts typing
    if (e.target.value.trim() !== "") {
      setIsOpen(true);
    }
  };

  const handleSelectEmployee = (employee: Employee) => {
    // Pass name for display and ID for database storage
    onChange(employee.name, employee.id);
    setIsOpen(false);
    setIsEmployeeSelected(true); // Mark that an employee has been selected
    if (onSelect) {
      onSelect(employee);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || filteredEmployees.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredEmployees.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredEmployees[highlightedIndex]) {
          handleSelectEmployee(filteredEmployees[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          // Don't auto-open dropdown on focus, only when user types
          // This prevents dropdown from showing when clicking on an order with existing employee
        }}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />

      {/* Dropdown */}
      {isOpen && filteredEmployees.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto"
        >
          {filteredEmployees.map((employee, index) => (
            <div
              key={employee.id}
              onClick={() => handleSelectEmployee(employee)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`
                                flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors
                                ${
                index === highlightedIndex
                  ? "bg-blue-50 border-l-4 border-blue-500"
                  : "hover:bg-gray-50 border-l-4 border-transparent"
              }
                                ${index !== filteredEmployees.length - 1 ? "border-b border-gray-100" : ""}
                            `}
            >
              {/* Employee Avatar */}
              <div
                className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full overflow-hidden flex items-center justify-center">
                {employee.avatar ? (
                  <img
                    src={employee.avatar}
                    alt={employee.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      target.nextElementSibling?.classList.remove("hidden");
                    }}
                  />
                ) : null}
                <div
                  className={`w-full h-full flex items-center justify-center text-white font-semibold text-sm ${employee.avatar ? "hidden" : ""}`}
                >
                  {employee.name
                    .split(" ")
                    .map((word) => word[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
              </div>

              {/* Employee Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900 text-sm truncate">
                    {employee.name}
                  </span>
                  <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">
                    Active
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                    {employee.code}
                  </span>
                  {employee.role && (
                    <span className="text-xs text-gray-500">
                      {employee.role}
                    </span>
                  )}
                </div>
              </div>

              {/* Selection Indicator */}
              {index === highlightedIndex && (
                <svg
                  className="w-5 h-5 text-blue-500 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
            </div>
          ))}

          {/* Footer hint */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
            <div className="flex items-center justify-between">
              <span>Sử dụng ↑↓ để di chuyển, Enter để chọn</span>
              <span>{filteredEmployees.length} kết quả</span>
            </div>
          </div>
        </div>
      )}

      {/* No results message */}
      {value.trim() !== "" &&
        !isOpen &&
        filteredEmployees.length === 0 &&
        !isEmployeeSelected && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
            <div className="flex items-center gap-3 text-gray-500">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span className="text-sm">Không tìm thấy nhân viên phù hợp</span>
            </div>
          </div>
        )}

      {/* Error message */}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};
