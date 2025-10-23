// src/constants/select-options.ts
/**
 * Common Select Options
 * Reusable options for Select components
 */

import type { SelectOption } from "../components/ui/Select";
import { CURRENCY } from "./app-constants";

/**
 * Currency Options (USD, VND)
 */
export const CURRENCY_OPTIONS: SelectOption[] = (["USD", "VND"] as const).map(
  (key) => ({
    value: key,
    label: `${CURRENCY[key].SYMBOL} ${CURRENCY[key].CODE}`,
  }),
);

/**
 * Simple Currency Options (without symbols)
 */
export const CURRENCY_OPTIONS_SIMPLE: SelectOption[] = (
  ["USD", "VND"] as const
).map((key) => ({
  value: key,
  label: CURRENCY[key].CODE,
}));

/**
 * Year Options (last 10 years)
 */
export const YEAR_OPTIONS: SelectOption[] = Array.from(
  { length: 10 },
  (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: year, label: year.toString() };
  },
);

/**
 * Month Options (1-12)
 */
export const MONTH_OPTIONS: SelectOption[] = Array.from(
  { length: 12 },
  (_, i) => ({
    value: i + 1,
    label: `Tháng ${i + 1}`,
  }),
);

/**
 * Status Options (for reports)
 */
export const REPORT_STATUS_OPTIONS: SelectOption[] = [
  { value: "draft", label: "Nháp" },
  { value: "pending", label: "Chờ xử lý" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Từ chối" },
];

/**
 * Active/Inactive Status Options
 */
export const ACTIVE_STATUS_OPTIONS: SelectOption[] = [
  { value: "all", label: "Tất cả" },
  { value: "active", label: "Đang hoạt động" },
  { value: "inactive", label: "Ngưng hoạt động" },
];

/**
 * Expense Category Options
 */
export const EXPENSE_CATEGORY_OPTIONS: SelectOption[] = [
  { value: "Marketing", label: "Marketing" },
  { value: "Advertising", label: "Advertising" },
  { value: "Shipping", label: "Shipping" },
  { value: "Materials", label: "Materials" },
  { value: "Software", label: "Software" },
  { value: "Fees", label: "Fees" },
  { value: "Salary", label: "Salary" },
  { value: "Other", label: "Other" },
];

/**
 * Money Type Options
 */
export const MONEY_TYPE_OPTIONS: SelectOption[] = [
  { value: "sale", label: "Sale" },
  { value: "refund", label: "Refund" },
  { value: "adjustment", label: "Adjustment" },
];

/**
 * Incoming Money Status Options
 */
export const INCOMING_MONEY_STATUS_OPTIONS: SelectOption[] = [
  { value: "pending", label: "Chờ xử lý" },
  { value: "processing", label: "Đang xử lý" },
  { value: "received", label: "Đã nhận" },
];

/**
 * Generate year options with custom range
 */
export function generateYearOptions(
  yearsBack: number = 10,
  yearsFuture: number = 0,
): SelectOption[] {
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - yearsBack;
  const endYear = currentYear + yearsFuture;
  const years: SelectOption[] = [];

  for (let year = endYear; year >= startYear; year--) {
    years.push({ value: year, label: year.toString() });
  }

  return years;
}

/**
 * Generate month options with custom locale
 */
export function generateMonthOptions(
  locale: "vi" | "en" = "vi",
): SelectOption[] {
  if (locale === "en") {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return months.map((month, i) => ({
      value: i + 1,
      label: month,
    }));
  }

  return MONTH_OPTIONS;
}

/**
 * Convert array to select options
 */
export function arrayToOptions<T extends string | number>(
  items: T[],
  labelFormatter?: (item: T) => string,
): SelectOption[] {
  return items.map((item) => ({
    value: item,
    label: labelFormatter ? labelFormatter(item) : String(item),
  }));
}

/**
 * Convert object array to select options
 */
export function objectsToOptions<T extends Record<string, any>>(
  items: T[],
  valueKey: keyof T,
  labelKey: keyof T,
): SelectOption[] {
  return items.map((item) => ({
    value: item[valueKey],
    label: String(item[labelKey]),
  }));
}
