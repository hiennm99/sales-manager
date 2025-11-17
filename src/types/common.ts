// src/types/common.ts

export interface BaseEntity {
  id: number;
  created_at: Date;
  updated_at: Date;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface BreadcrumbItem {
  label?: string;
  path?: string;
}
