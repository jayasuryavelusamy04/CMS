export interface StudentProfile {
    id: number;
    student_id: number;
    rollnumber: string;
    academic_year: string;
    is_active: boolean;
    created_at: string;
    updated_at?: string;
    student?: any;  // Will be expanded with student type
}

export interface Attendance {
    id: number;
    student_profile_id: number;
    subject_id: number;
    status: 'present' | 'absent' | 'late';
    date: string;
    period: number;
    comment?: string;
    marked_by: number;
    created_at: string;
    updated_at?: string;
}

export interface Mark {
    id: number;
    student_profile_id: number;
    subject_id: number;
    exam_type: 'periodic_test' | 'midterm' | 'final' | 'assignment';
    marks_obtained: number;
    max_marks: number;
    weightage: number;
    exam_date: string;
    remarks?: string;
    marked_by: number;
    created_at: string;
    updated_at?: string;
}

export interface StudentProfileFilters {
    academic_year?: string;
    page: number;
    pageSize: number;
}

export interface AttendanceFilters {
    start_date: string;
    end_date: string;
    subject_id?: number;
}

export interface MarkFilters {
    subject_id: number;
    exam_type?: string;
}

export interface AttendanceStats {
    attendance_percentage: number;
}

export interface SubjectStats {
    subject_average: number;
}

export interface StudentProfileResponse {
    total: number;
    items: StudentProfile[];
}

export interface AttendanceResponse {
    total: number;
    items: Attendance[];
}

export interface MarkResponse {
    total: number;
    items: Mark[];
}
