// Common Types
export type ApiResponse<T> = {
    data: T;
    message: string;
    success: boolean;
};

export type ApiError = {
    message: string;
    code: string;
    details?: Record<string, string[]>;
};

export type PaginatedResponse<T> = {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
};

export type LoadingState = {
    list: boolean;
    save: boolean;
    delete: boolean;
    [key: string]: boolean;
};

// Staff Types
export type StaffRole = 'teacher' | 'admin' | 'non_teaching';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';

export interface AuditLog {
    id: number;
    action: AuditAction;
    details: string;
    performed_by: number;
    created_at: string;
}

// Course Types
export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface TimeSlot {
    start_time: string;
    end_time: string;
}

export interface TimeConflict {
    slotId: number;
    teacherId: number;
    timeSlot: TimeSlot;
    reason: string;
}

// Validation Types
export interface ValidationRule {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: RegExp;
    message?: string;
}

export interface ValidationRules {
    [key: string]: ValidationRule[];
}

// Error Handling Types
export interface ErrorState {
    message: string | null;
    code: string | null;
    field?: string;
}

// Form Types
export interface FormState {
    loading: boolean;
    error: ErrorState | null;
    success: boolean;
}

// Common Interfaces
export interface BaseEntity {
    id: number;
    created_at: string;
    updated_at?: string;
}

export interface Auditable extends BaseEntity {
    created_by: number;
    updated_by?: number;
}

// Security Types
export interface UserPermission {
    resource: string;
    actions: string[];
}

export interface UserRole {
    id: number;
    name: string;
    permissions: UserPermission[];
}

// Constants
export const VALIDATION_PATTERNS = {
    EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    PHONE: /^\+?[1-9]\d{9,14}$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
    USERNAME: /^[a-zA-Z0-9_-]{3,20}$/
};

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500
};

// Utility Types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncState<T> = {
    data: Nullable<T>;
    loading: boolean;
    error: Nullable<ErrorState>;
};
