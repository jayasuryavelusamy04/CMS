import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { Student, StudentListResponse, AdmissionFilters } from '../../features/admission/types/admission.types';

interface AdmissionState {
    students: Student[];
    totalStudents: number;
    selectedStudent: Student | null;
    loading: boolean;
    error: string | null;
}

const initialState: AdmissionState = {
    students: [],
    totalStudents: 0,
    selectedStudent: null,
    loading: false,
    error: null,
};

export const fetchStudents = createAsyncThunk(
    'admission/fetchStudents',
    async (filters: AdmissionFilters) => {
        const { page, pageSize, search, admission_status } = filters;
        const skip = page * pageSize;
        const params = new URLSearchParams({
            skip: skip.toString(),
            limit: pageSize.toString(),
            ...(search && { search }),
            ...(admission_status && { admission_status })
        });
        const response = await api.get<StudentListResponse>(`/students/?${params}`);
        return response.data;
    }
);

export const createStudent = createAsyncThunk(
    'admission/createStudent',
    async (student: Student) => {
        const response = await api.post<Student>('/students/', student);
        return response.data;
    }
);

export const updateStudent = createAsyncThunk(
    'admission/updateStudent',
    async ({ id, data }: { id: number; data: Partial<Student> }) => {
        const response = await api.put<Student>(`/students/${id}`, data);
        return response.data;
    }
);

export const deleteStudent = createAsyncThunk(
    'admission/deleteStudent',
    async (id: number) => {
        await api.delete(`/students/${id}`);
        return id;
    }
);

export const fetchStudentById = createAsyncThunk(
    'admission/fetchStudentById',
    async (id: number) => {
        const response = await api.get<Student>(`/students/${id}`);
        return response.data;
    }
);

const admissionSlice = createSlice({
    name: 'admission',
    initialState,
    reducers: {
        clearSelectedStudent: (state) => {
            state.selectedStudent = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchStudents.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStudents.fulfilled, (state, action) => {
                state.loading = false;
                state.students = action.payload.items;
                state.totalStudents = action.payload.total;
            })
            .addCase(fetchStudents.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch students';
            })
            .addCase(createStudent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createStudent.fulfilled, (state, action) => {
                state.loading = false;
                state.students.push(action.payload);
                state.totalStudents += 1;
            })
            .addCase(createStudent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to create student';
            })
            .addCase(updateStudent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateStudent.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.students.findIndex(s => s.id === action.payload.id);
                if (index !== -1) {
                    state.students[index] = action.payload;
                }
                if (state.selectedStudent?.id === action.payload.id) {
                    state.selectedStudent = action.payload;
                }
            })
            .addCase(updateStudent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to update student';
            })
            .addCase(deleteStudent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteStudent.fulfilled, (state, action) => {
                state.loading = false;
                state.students = state.students.filter(s => s.id !== action.payload);
                state.totalStudents -= 1;
                if (state.selectedStudent?.id === action.payload) {
                    state.selectedStudent = null;
                }
            })
            .addCase(deleteStudent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to delete student';
            })
            .addCase(fetchStudentById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStudentById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedStudent = action.payload;
            })
            .addCase(fetchStudentById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch student';
            });
    },
});

export const { clearSelectedStudent, clearError } = admissionSlice.actions;
export default admissionSlice.reducer;
