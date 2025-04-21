export interface Staff {
    id: number;
    employee_id: string;
    first_name: string;
    last_name: string;
    email: string;
    contact_number: string;
    address: string;
    role: 'teacher' | 'admin' | 'non_teaching';
    joining_date: string;
    qualifications?: string;
    is_active: boolean;
    created_at: string;
    updated_at?: string;
}

export interface TeacherSubject {
    id: number;
    teacher_id: number;
    subject_id: number;
    is_primary: boolean;
}

export interface StaffAvailability {
    id: number;
    staff_id: number;
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_available: boolean;
    reason?: string;
}

export interface StaffResponse {
    total: number;
    items: Staff[];
}
