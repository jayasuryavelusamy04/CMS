import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import {
    StudentProfile,
    StudentProfileResponse,
    StudentProfileFilters,
    Attendance,
    AttendanceResponse,
    AttendanceFilters,
    Mark,
    MarkResponse,
    MarkFilters,
    AttendanceStats,
    SubjectStats
} from '../../features/students/types/student-profile.types';

interface StudentProfileState {
    profiles: StudentProfile[];
    totalProfiles: number;
    selectedProfile: StudentProfile | null;
    attendances: Attendance[];
    totalAttendances: number;
    marks: Mark[];
    totalMarks: number;
    loading: boolean;
    error: string | null;
}

const initialState: StudentProfileState = {
    profiles: [],
    totalProfiles: 0,
    selectedProfile: null,
    attendances: [],
    totalAttendances: 0,
    marks: [],
    totalMarks: 0,
    loading: false,
    error: null
};

export const fetchStudentProfiles = createAsyncThunk(
    'studentProfile/fetchProfiles',
    async (filters: StudentProfileFilters) => {
        const { page, pageSize, academic_year } = filters;
        const params = new URLSearchParams({
            skip: (page * pageSize).toString(),
            limit: pageSize.toString(),
            ...(academic_year && { academic_year })
        });
        const response = await api.get<StudentProfileResponse>(`/profiles/?${params}`);
        return response.data;
    }
);

export const fetchStudentAttendance = createAsyncThunk(
    'studentProfile/fetchAttendance',
    async ({ profileId, filters }: { profileId: number; filters: AttendanceFilters }) => {
        const { start_date, end_date, subject_id } = filters;
        const params = new URLSearchParams({
            start_date,
            end_date,
            ...(subject_id && { subject_id: subject_id.toString() })
        });
        const response = await api.get<AttendanceResponse>(
            `/profiles/${profileId}/attendance/?${params}`
        );
        return response.data;
    }
);

export const fetchStudentMarks = createAsyncThunk(
    'studentProfile/fetchMarks',
    async ({ profileId, filters }: { profileId: number; filters: MarkFilters }) => {
        const response = await api.get<MarkResponse>(
            `/profiles/${profileId}/marks/${filters.subject_id}`
        );
        return response.data;
    }
);

export const createAttendance = createAsyncThunk(
    'studentProfile/createAttendance',
    async (attendance: Partial<Attendance>) => {
        const response = await api.post<Attendance>('/attendance/', attendance);
        return response.data;
    }
);

export const createMark = createAsyncThunk(
    'studentProfile/createMark',
    async (mark: Partial<Mark>) => {
        const response = await api.post<Mark>('/marks/', mark);
        return response.data;
    }
);

export const getAttendanceStats = createAsyncThunk(
    'studentProfile/getAttendanceStats',
    async ({ profileId, subjectId }: { profileId: number; subjectId?: number }) => {
        const params = new URLSearchParams(
            subjectId ? { subject_id: subjectId.toString() } : {}
        );
        const response = await api.get<AttendanceStats>(
            `/profiles/${profileId}/attendance-percentage/?${params}`
        );
        return response.data;
    }
);

export const getSubjectAverage = createAsyncThunk(
    'studentProfile/getSubjectAverage',
    async ({ profileId, subjectId }: { profileId: number; subjectId: number }) => {
        const response = await api.get<SubjectStats>(
            `/profiles/${profileId}/subject-average/${subjectId}`
        );
        return response.data;
    }
);

const studentProfileSlice = createSlice({
    name: 'studentProfile',
    initialState,
    reducers: {
        clearSelectedProfile: (state) => {
            state.selectedProfile = null;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Profiles
            .addCase(fetchStudentProfiles.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStudentProfiles.fulfilled, (state, action) => {
                state.loading = false;
                state.profiles = action.payload.items;
                state.totalProfiles = action.payload.total;
            })
            .addCase(fetchStudentProfiles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch profiles';
            })
            // Fetch Attendance
            .addCase(fetchStudentAttendance.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStudentAttendance.fulfilled, (state, action) => {
                state.loading = false;
                state.attendances = action.payload.items;
                state.totalAttendances = action.payload.total;
            })
            .addCase(fetchStudentAttendance.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch attendance';
            })
            // Fetch Marks
            .addCase(fetchStudentMarks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStudentMarks.fulfilled, (state, action) => {
                state.loading = false;
                state.marks = action.payload.items;
                state.totalMarks = action.payload.total;
            })
            .addCase(fetchStudentMarks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch marks';
            });
    }
});

export const { clearSelectedProfile, clearError } = studentProfileSlice.actions;
export default studentProfileSlice.reducer;
