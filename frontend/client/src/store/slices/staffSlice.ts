import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { Staff, TeacherSubject, StaffAvailability, StaffResponse } from '../../features/staff/types/staff.types';

interface StaffState {
    staff: Staff[];
    totalStaff: number;
    selectedStaff: Staff | null;
    teacherSubjects: TeacherSubject[];
    availability: StaffAvailability[];
    loading: boolean;
    error: string | null;
}

const initialState: StaffState = {
    staff: [],
    totalStaff: 0,
    selectedStaff: null,
    teacherSubjects: [],
    availability: [],
    loading: false,
    error: null
};

export const fetchStaff = createAsyncThunk(
    'staff/fetchStaff',
    async ({ skip = 0, limit = 10, role, isActive }: any) => {
        const params = new URLSearchParams({
            skip: skip.toString(),
            limit: limit.toString(),
            ...(role && { role }),
            ...(isActive !== undefined && { is_active: isActive.toString() })
        });
        const response = await api.get<StaffResponse>(`/staff/?${params}`);
        return response.data;
    }
);

export const createStaff = createAsyncThunk(
    'staff/createStaff',
    async (staffData: Partial<Staff>) => {
        const response = await api.post<Staff>('/staff/', staffData);
        return response.data;
    }
);

export const updateStaff = createAsyncThunk(
    'staff/updateStaff',
    async ({ id, data }: { id: number; data: Partial<Staff> }) => {
        const response = await api.put<Staff>(`/staff/${id}`, data);
        return response.data;
    }
);

export const deleteStaff = createAsyncThunk(
    'staff/deleteStaff',
    async (id: number) => {
        await api.delete(`/staff/${id}`);
        return id;
    }
);

export const assignSubject = createAsyncThunk(
    'staff/assignSubject',
    async (data: Partial<TeacherSubject>) => {
        const response = await api.post<TeacherSubject>('/staff/teacher-subjects/', data);
        return response.data;
    }
);

export const setAvailability = createAsyncThunk(
    'staff/setAvailability',
    async (data: Partial<StaffAvailability>) => {
        const response = await api.post<StaffAvailability>('/staff/availability/', data);
        return response.data;
    }
);

const staffSlice = createSlice({
    name: 'staff',
    initialState,
    reducers: {
        clearSelectedStaff: (state) => {
            state.selectedStaff = null;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Staff
            .addCase(fetchStaff.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStaff.fulfilled, (state, action) => {
                state.loading = false;
                state.staff = action.payload.items;
                state.totalStaff = action.payload.total;
            })
            .addCase(fetchStaff.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch staff';
            })
            // Create Staff
            .addCase(createStaff.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createStaff.fulfilled, (state, action) => {
                state.loading = false;
                state.staff.push(action.payload);
                state.totalStaff += 1;
            })
            .addCase(createStaff.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to create staff';
            })
            // Update Staff
            .addCase(updateStaff.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateStaff.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.staff.findIndex(s => s.id === action.payload.id);
                if (index !== -1) {
                    state.staff[index] = action.payload;
                }
            })
            .addCase(updateStaff.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to update staff';
            })
            // Delete Staff
            .addCase(deleteStaff.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteStaff.fulfilled, (state, action) => {
                state.loading = false;
                state.staff = state.staff.filter(s => s.id !== action.payload);
                state.totalStaff -= 1;
            })
            .addCase(deleteStaff.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to delete staff';
            });
    }
});

export const { clearSelectedStaff, clearError } = staffSlice.actions;
export default staffSlice.reducer;
