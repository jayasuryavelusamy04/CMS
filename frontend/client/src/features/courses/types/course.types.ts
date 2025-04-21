export interface Course {
    id: number;
    name: string;
    code: string;
    description?: string;
    class_section_id: number;
    subject_id: number;
    start_date: string;
    end_date: string;
    created_at: string;
    updated_at?: string;
    subject?: {
        id: number;
        name: string;
    };
    class_section?: {
        id: number;
        class_name: string;
        section: string;
    };
}

export interface TimetableSlot {
    id: number;
    course_id: number;
    teacher_id: number;
    day_of_week: number;
    start_time: string;
    end_time: string;
    room?: string;
    created_at: string;
    updated_at?: string;
    course?: Course;
    teacher?: {
        id: number;
        first_name: string;
        last_name: string;
    };
}

export interface CourseFilters {
    search?: string;
    class_section_id?: number;
    subject_id?: number;
    page: number;
    pageSize: number;
}

export interface CourseResponse {
    total: number;
    items: Course[];
}

export interface TimetableSlotResponse {
    total: number;
    items: TimetableSlot[];
}

export interface TimeConflict {
    slotId: number;
    teacherId: number;
    startTime: string;
    endTime: string;
    reason: string;
}
