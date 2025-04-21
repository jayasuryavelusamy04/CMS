import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { AxiosError } from 'axios';

import {
    AttendanceRequest,
    AttendanceRecord,
    QRAttendanceData
} from '../../features/attendance/types/attendance.types';

interface AttendanceStats {
    total_classes: number;
    present: number;
    absent: number;
    late: number;
    on_leave: number;
    percentage: number;
}

interface StudentAttendanceReport {
    student_id: number;
    total_stats: AttendanceStats;
    daily_records: Array<{
        date: string;
        status: string;
    }>;
}

interface ClassAttendanceReport {
    class_id: number;
    subject_id?: number;
    total_stats: AttendanceStats;
    student_stats: StudentAttendanceReport[];
}

interface AttendanceState {
    records: AttendanceRecord[];
    loading: boolean;
    error: string | null;
    syncing: boolean;
    syncError: string | null;
    studentStats: StudentAttendanceReport | null;
    classStats: ClassAttendanceReport | null;
}

const initialState: AttendanceState = {
    records: [],
    loading: false,
    error: null,
    syncing: false,
    syncError: null,
    studentStats: null,
    classStats: null
};

// Thunks

export const markAttendance = createAsyncThunk(
    'attendance/markAttendance',
    async (data: AttendanceRequest[], { rejectWithValue }) => {
        try {
            const response = await api.post('/attendance/', data);
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                return rejectWithValue(error.response?.data?.detail || 'Failed to mark attendance');
            }
            return rejectWithValue('Failed to mark attendance');
        }
    }
);

export const markQRAttendance = createAsyncThunk(
    'attendance/markQRAttendance',
    async (data: QRAttendanceData, { rejectWithValue }) => {
        try {
            const response = await api.post('/attendance/qr', data);
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                return rejectWithValue(error.response?.data?.detail || 'Failed to mark QR attendance');
            }
            return rejectWithValue('Failed to mark QR attendance');
        }
    }
);

export const syncOfflineAttendance = createAsyncThunk(
    'attendance/syncOfflineAttendance',
    async (data: { device_id: string; sync_data: any[] }, { rejectWithValue }) => {
        try {
            const response = await api.post('/attendance/sync', data);
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                return rejectWithValue(error.response?.data?.detail || 'Failed to sync attendance');
            }
            return rejectWithValue('Failed to sync attendance');
        }
    }
);

export const fetchStudentStats = createAsyncThunk(
    'attendance/fetchStudentStats',
    async (request: {
        student_id: number;
        start_date?: string;
        end_date?: string;
        subject_id?: number;
    }, { rejectWithValue }) => {
        try {
            const response = await api.post('/attendance-stats/student', request);
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                return rejectWithValue(error.response?.data?.detail || 'Failed to fetch student statistics');
            }
            return rejectWithValue('Failed to fetch student statistics');
        }
    }
);

export const fetchClassStats = createAsyncThunk(
    'attendance/fetchClassStats',
    async (request: {
        class_id: number;
        start_date: string;
        end_date: string;
        subject_id?: number;
    }, { rejectWithValue }) => {
        try {
            const response = await api.post('/attendance-stats/class', request);
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                return rejectWithValue(error.response?.data?.detail || 'Failed to fetch class statistics');
            }
            return rejectWithValue('Failed to fetch class statistics');
        }
    }
);

export const fetchAttendanceRecords = createAsyncThunk(
    'attendance/fetchStudentAttendance',
    async ({
        student_id,
        start_date,
        end_date
    }: {
        student_id: number;
        start_date?: string;
        end_date?: string;
    }, { rejectWithValue }) => {
        try {
            const params = new URLSearchParams();
            if (start_date) params.append('start_date', start_date);
            if (end_date) params.append('end_date', end_date);

            const response = await api.get(`/attendance/student/${student_id}?${params}`);
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                return rejectWithValue(error.response?.data?.detail || 'Failed to fetch attendance');
            }
            return rejectWithValue('Failed to fetch attendance');
        }
    }
);

// Slice
const attendanceSlice = createSlice({
    name: 'attendance',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSyncError: (state) => {
            state.syncError = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Mark Attendance
            .addCase(markAttendance.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(markAttendance.fulfilled, (state, action) => {
                state.loading = false;
                state.records = [...state.records, ...action.payload];
            })
            .addCase(markAttendance.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // QR Attendance
            .addCase(markQRAttendance.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(markQRAttendance.fulfilled, (state, action) => {
                state.loading = false;
                state.records.push(action.payload);
            })
            .addCase(markQRAttendance.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Sync Offline Attendance
            .addCase(syncOfflineAttendance.pending, (state) => {
                state.syncing = true;
                state.syncError = null;
            })
            .addCase(syncOfflineAttendance.fulfilled, (state, action) => {
                state.syncing = false;
                state.records = [...state.records, ...action.payload];
            })
            .addCase(syncOfflineAttendance.rejected, (state, action) => {
                state.syncing = false;
                state.syncError = action.payload as string;
            })
            // Fetch Student Stats
            .addCase(fetchStudentStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStudentStats.fulfilled, (state, action) => {
                state.loading = false;
                state.studentStats = action.payload;
            })
            .addCase(fetchStudentStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch Class Stats
            .addCase(fetchClassStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchClassStats.fulfilled, (state, action) => {
                state.loading = false;
                state.classStats = action.payload;
            })
            .addCase(fetchClassStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch Attendance Records
            .addCase(fetchAttendanceRecords.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAttendanceRecords.fulfilled, (state, action) => {
                state.loading = false;
                state.records = action.payload;
            })
            .addCase(fetchAttendanceRecords.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
});

export const { clearError, clearSyncError } = attendanceSlice.actions;
export default attendanceSlice.reducer;
