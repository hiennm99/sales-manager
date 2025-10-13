// types/common.ts

export interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface PaginationParams {
    page: number;
    limit: number;
}

export interface PaginationResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface SelectOption {
    value: string;
    label: string;
}

export type Status = 'active' | 'inactive' | 'pending';

export interface BreadcrumbItem {
    label: string;
    path?: string;
}