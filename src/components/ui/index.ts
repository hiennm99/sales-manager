/**
 * UI Components Index
 * Centralized exports for all reusable UI components
 *
 * NOTE: Input, Selector, and Checkbox have been removed.
 * Use unified Form components (FormInput, FormSelect) instead.
 */

// Form Components (Primary - use these!)
export * from "./forms";
export { FormAutocomplete } from "./forms/FormAutocomplete";
export { FormInput } from "./forms/FormInput";
export { FormSelect } from "./forms/FormSelect";

// Button Components
export { Button } from "./Button";

// Select Components
export { Select, SelectField } from "./Select";
export type { SelectFieldProps, SelectOption, SelectProps } from "./Select";

// DatePicker Components
export { DateField, DatePicker, DateRangePicker } from "./DatePicker";
export type {
  DateFieldProps,
  DatePickerProps,
  DateRangePickerProps,
} from "./DatePicker";

// Card Components
export { SectionCard } from "../common/SectionCard";
export { StatCard } from "./StatCard";

// Filter Components
export { FilterBar } from "./FilterBar";
export { SearchInput } from "./SearchInput";
export { SelectFilter } from "./SelectFilter";
