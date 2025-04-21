import { Dayjs } from 'dayjs';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'ON_LEAVE';

export interface DeviceInfo {
    userAgent: string;
    timestamp: string;
    location?: {
        latitude: number;
        longitude: number;
        accuracy: number;
    };
}

export interface QRCodeData {
    id: string;
    classId: number;
    subjectId: number;
    teacherId: number;
    date: string;
    period: number;
    timestamp: string;
}

export interface QRAttendanceData {
    student_id: number;
    class_id: number;
    subject_id: number;
    teacher_id: number;
    date: string;
    period: number;
    qr_code: string;
    device_info: DeviceInfo;
}

export interface AttendanceRecord {
    id: number;
    student_id: number;
    class_section_id: number;
    subject_id: number;
    teacher_id: number;
    date: string;
    period: number;
    status: AttendanceStatus;
    marked_by: number;
    marked_at: string;
    device_info?: DeviceInfo;
    sync_status?: 'PENDING' | 'SYNCED' | 'FAILED';
}

export interface AttendanceRequest {
    student_id: number;
    status: AttendanceStatus;
}

export interface AttendanceStats {
    total_classes: number;
    present: number;
    absent: number;
    late: number;
    on_leave: number;
    percentage: number;
}

export interface DailyRecord {
    date: string;
    status: AttendanceStatus;
}

export interface StudentAttendanceReport {
    student_id: number;
    total_stats: AttendanceStats;
    daily_records: DailyRecord[];
}

export interface ClassAttendanceReport {
    class_id: number;
    subject_id?: number;
    total_stats: AttendanceStats;
    student_stats: StudentAttendanceReport[];
}

export interface AttendanceFilterParams {
    startDate?: string | Dayjs;
    endDate?: string | Dayjs;
    classId?: number;
    subjectId?: number;
    studentId?: number;
    status?: AttendanceStatus;
}

export interface SyncData {
    device_id: string;
    sync_data: QRAttendanceData[];
}

export interface OfflineAttendanceRecord {
    id?: number;
    data: QRAttendanceData;
    timestamp: string;
    syncStatus: 'PENDING' | 'SYNCED' | 'FAILED';
    error?: string;
}

export interface PermissionStatus {
    camera: boolean;
    geolocation: boolean;
}

// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}

// Component Props Types
export interface QRScannerProps {
    studentId: number;
    onSuccess?: (data: QRAttendanceData) => Promise<void>;
    onError?: (error: string) => void;
}

export interface AttendanceTableProps {
    classId: number;
    date: string;
    period: number;
    subjectId: number;
    onSubmit: (records: AttendanceRequest[]) => Promise<void>;
}

export interface AttendanceStatsProps {
    studentId?: number;
    classId?: number;
    subjectId?: number;
}

// Redux State Types
export interface AttendanceState {
    records: AttendanceRecord[];
    loading: boolean;
    error: string | null;
    syncing: boolean;
    syncError: string | null;
    studentStats: StudentAttendanceReport | null;
    classStats: ClassAttendanceReport | null;
}
