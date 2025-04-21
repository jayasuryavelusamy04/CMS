import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import {
    Period, TimetableSlot, Attendance, TimetableConfig,
    PeriodList, TimetableSlotList, AttendanceList,
    TimetableConfigList, AttendanceReport, AttendanceReportParams,
    PeriodFormData, TimetableSlotFormData, AttendanceFormData,
    TimetableConfigFormData, TimetableValidationResult
} from '../../features/timetable/types/timetable.types';

interface TimetableState {
    periods: Period[];
    timetableSlots: TimetableSlot[];
    attendance: Attendance[];
    configs: TimetableConfig[];
    reports: AttendanceReport[];
    totalPeriods: number;
    totalSlots: number;
    totalAttendance: number;
    selectedPeriod: Period | null;
    selectedSlot: TimetableSlot | null;
    loading: boolean;
    error: string | null;
    validationResult: TimetableValidationResult | null;
}

const initialState: TimetableState = {
    periods: [],
    timetableSlots: [],
    attendance: [],
    configs: [],
    reports: [],
    totalPeriods: 0,
    totalSlots: 0,
    totalAttendance: 0,
    selectedPeriod: null,
    selectedSlot: null,
    loading: false,
    error: null,
    validationResult: null
};

// Periods
export const fetchPeriods = createAsyncThunk(
    'timetable/fetchPeriods',
    async (classSectionId: number) => {
        const response = await api.get<PeriodList>(`/timetable/periods/?class_section_id=${classSectionId}`);
        return response.data;
    }
);

export const createPeriod = createAsyncThunk(
    'timetable/createPeriod',
    async (data: PeriodFormData) => {
        const response = await api.post<Period>('/timetable/periods/', data);
        return response.data;
    }
);

// Timetable Slots
export const fetchTimetableSlots = createAsyncThunk(
    'timetable/fetchTimetableSlots',
    async (classSectionId: number) => {
        const response = await api.get<TimetableSlotList>(`/timetable/slots/?class_section_id=${classSectionId}`);
        return response.data;
    }
);

export const createTimetableSlot = createAsyncThunk(
    'timetable/createTimetableSlot',
    async (data: TimetableSlotFormData) => {
        const response = await api.post<TimetableSlot>('/timetable/slots/', data);
        return response.data;
    }
);

export const updateTimetableSlot = createAsyncThunk(
    'timetable/updateTimetableSlot',
    async ({ id, data }: { id: number; data: TimetableSlotFormData }) => {
        const response = await api.put<TimetableSlot>(`/timetable/slots/${id}`, data);
        return response.data;
    }
);

export const deleteTimetableSlot = createAsyncThunk(
    'timetable/deleteTimetableSlot',
    async (id: number) => {
        await api.delete(`/timetable/slots/${id}`);
        return id;
    }
);

// Attendance
export const fetchAttendance = createAsyncThunk(
    'timetable/fetchAttendance',
    async ({ studentId, startDate, endDate }: { studentId: number; startDate: string; endDate: string }) => {
        const response = await api.get<AttendanceList>(
            `/timetable/attendance/?student_id=${studentId}&start_date=${startDate}&end_date=${endDate}`
        );
        return response.data;
    }
);

export const markAttendance = createAsyncThunk(
    'timetable/markAttendance',
    async (data: AttendanceFormData) => {
        const response = await api.post<Attendance>('/timetable/attendance/', data);
        return response.data;
    }
);

export const markBulkAttendance = createAsyncThunk(
    'timetable/markBulkAttendance',
    async (data: AttendanceFormData[]) => {
        const response = await api.post<Attendance[]>('/timetable/attendance/bulk/', data);
        return response.data;
    }
);

// Reports
export const generateAttendanceReport = createAsyncThunk(
    'timetable/generateReport',
    async (params: AttendanceReportParams) => {
        const response = await api.post<AttendanceReport[]>('/timetable/attendance/report/', params);
        return response.data;
    }
);

// Validation
export const validateTimetable = createAsyncThunk(
    'timetable/validate',
    async (classSectionId: number) => {
        const response = await api.get<TimetableValidationResult>(
            `/timetable/timetable/validate/?class_section_id=${classSectionId}`
        );
        return response.data;
    }
);

const timetableSlice = createSlice({
    name: 'timetable',
    initialState,
    reducers: {
        clearSelectedPeriod: (state) => {
            state.selectedPeriod = null;
        },
        clearSelectedSlot: (state) => {
            state.selectedSlot = null;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Periods
            .addCase(fetchPeriods.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPeriods.fulfilled, (state, action) => {
                state.loading = false;
                state.periods = action.payload.items;
                state.totalPeriods = action.payload.total;
            })
            .addCase(fetchPeriods.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch periods';
            })
            // Create Period
            .addCase(createPeriod.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createPeriod.fulfilled, (state, action) => {
                state.loading = false;
                state.periods.push(action.payload);
                state.totalPeriods += 1;
            })
            .addCase(createPeriod.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to create period';
            })
            // Fetch Timetable Slots
            .addCase(fetchTimetableSlots.fulfilled, (state, action) => {
                state.loading = false;
                state.timetableSlots = action.payload.items;
                state.totalSlots = action.payload.total;
            })
            // Create Timetable Slot
            .addCase(createTimetableSlot.fulfilled, (state, action) => {
                state.loading = false;
                state.timetableSlots.push(action.payload);
                state.totalSlots += 1;
            })
            // Update Timetable Slot
            .addCase(updateTimetableSlot.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.timetableSlots.findIndex((slot: TimetableSlot) => slot.id === action.payload.id);
                if (index !== -1) {
                    state.timetableSlots[index] = action.payload;
                }
            })
            // Delete Timetable Slot
            .addCase(deleteTimetableSlot.fulfilled, (state, action) => {
                state.loading = false;
                state.timetableSlots = state.timetableSlots.filter((slot: TimetableSlot) => slot.id !== action.payload);
                state.totalSlots -= 1;
            })
            // Fetch Attendance
            .addCase(fetchAttendance.fulfilled, (state, action) => {
                state.loading = false;
                state.attendance = action.payload.items;
                state.totalAttendance = action.payload.total;
            })
            // Mark Attendance
            .addCase(markAttendance.fulfilled, (state, action) => {
                state.loading = false;
                state.attendance.push(action.payload);
                state.totalAttendance += 1;
            })
            // Bulk Mark Attendance
            .addCase(markBulkAttendance.fulfilled, (state, action) => {
                state.loading = false;
                state.attendance.push(...action.payload);
                state.totalAttendance += action.payload.length;
            })
            // Generate Report
            .addCase(generateAttendanceReport.fulfilled, (state, action) => {
                state.loading = false;
                state.reports = action.payload;
            })
            // Validate Timetable
            .addCase(validateTimetable.fulfilled, (state, action) => {
                state.loading = false;
                state.validationResult = action.payload;
            });
    }
});

export const { clearSelectedPeriod, clearSelectedSlot, clearError } = timetableSlice.actions;
export default timetableSlice.reducer;
