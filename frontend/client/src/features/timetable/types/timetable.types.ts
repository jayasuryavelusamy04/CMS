export interface Period {
    id: number;
    name: string;
    start_time: string;
    end_time: string;
    class_section_id: number;
}

export interface TimetableSlot {
    id: number;
    period_id: number;
    subject_id: number;
    teacher_id: number;
    day_of_week: number;
    class_section_id: number;
}

export interface Attendance {
    id: number;
    student_id: number;
    timetable_slot_id: number;
    date: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE';
    notes?: string;
}

export interface TimetableConfig {
    id: number;
    class_section_id: number;
    academic_year: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
}

export interface PeriodList {
    items: Period[];
    total: number;
}

export interface TimetableSlotList {
    items: TimetableSlot[];
    total: number;
}

export interface AttendanceList {
    items: Attendance[];
    total: number;
}

export interface TimetableConfigList {
    items: TimetableConfig[];
    total: number;
}

export interface AttendanceReport {
    student_id: number;
    student_name: string;
    present_count: number;
    absent_count: number;
    late_count: number;
    attendance_percentage: number;
    period_details: {
        period_id: number;
        period_name: string;
        present_count: number;
        absent_count: number;
        late_count: number;
    }[];
}

export interface AttendanceReportParams {
    class_section_id: number;
    start_date: string;
    end_date: string;
    student_ids?: number[];
}

export interface PeriodFormData {
    name: string;
    start_time: string;
    end_time: string;
    class_section_id: number;
}

export interface TimetableSlotFormData {
    period_id: number;
    subject_id: number;
    teacher_id: number;
    day_of_week: number;
    class_section_id: number;
}

export interface AttendanceFormData {
    student_id: number;
    timetable_slot_id: number;
    date: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE';
    notes?: string;
}

export interface TimetableConfigFormData {
    class_section_id: number;
    academic_year: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
}

export interface TimetableValidationResult {
    is_valid: boolean;
    errors: {
        error_type: string;
        message: string;
        details: {
            [key: string]: any;
        };
    }[];
}
