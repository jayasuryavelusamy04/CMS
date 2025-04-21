export interface Student {
    id?: number;
    first_name: string;
    middle_name?: string;
    last_name: string;
    date_of_birth: string;
    gender: 'male' | 'female' | 'other';
    contact_number: string;
    email?: string;
    nationality: string;
    permanent_address: string;
    temporary_address?: string;
    admission_date?: string;
    admission_status?: 'admitted' | 'pending' | 'rejected';
    guardians: Guardian[];
    class_section_id?: number;
    class_section?: ClassSection;
}

export interface Guardian {
    id?: number;
    full_name: string;
    relationship: string;
    contact_number: string;
    email?: string;
    occupation?: string;
    address?: string;
}

export interface ClassSection {
    id: number;
    class_name: string;
    section: string;
    subjects: string[];
    academic_year: string;
}

export interface StudentListResponse {
    total: number;
    items: Student[];
}

export interface StudentDocument {
    id: number;
    student_id: number;
    document_type: string;
    file_name: string;
    file_path: string;
    mime_type: string;
    file_size: number;
    description?: string;
}

export interface AdmissionFilters {
    search?: string;
    admission_status?: 'admitted' | 'pending' | 'rejected';
    page: number;
    pageSize: number;
}
