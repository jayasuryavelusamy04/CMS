import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export interface FeeStructure {
    id: number;
    class_section_id: number;
    fee_type: string;
    amount: number;
    due_date: string;
    academic_year: string;
    created_at: string;
    updated_at: string;
}

export interface FeePayment {
    id: number;
    student_id: number;
    fee_structure_id: number;
    amount_paid: number;
    payment_date: string;
    payment_mode: string;
    payment_status: string;
    transaction_id?: string;
    remarks?: string;
    created_at: string;
    updated_at: string;
}

export interface FeeState {
    feeStructures: FeeStructure[];
    feePayments: FeePayment[];
    loading: boolean;
    error: string | null;
}

const initialState: FeeState = {
    feeStructures: [],
    feePayments: [],
    loading: false,
    error: null,
};

export const createFeeStructure = createAsyncThunk(
    'fees/createFeeStructure',
    async (feeStructure: Omit<FeeStructure, 'id' | 'created_at' | 'updated_at'>) => {
        const response = await api.post('/fees/fee-structures/', feeStructure);
        return response.data;
    }
);

export const fetchFeeStructures = createAsyncThunk(
    'fees/fetchFeeStructures',
    async (class_section_id?: number) => {
        const url = class_section_id
            ? `/fees/fee-structures/?class_section_id=${class_section_id}`
            : '/fees/fee-structures/';
        const response = await api.get(url);
        return response.data;
    }
);

export const createFeePayment = createAsyncThunk(
    'fees/createFeePayment',
    async (payment: Omit<FeePayment, 'id' | 'payment_date' | 'created_at' | 'updated_at'>) => {
        const response = await api.post('/fees/payments/', payment);
        return response.data;
    }
);

export const fetchStudentFeePayments = createAsyncThunk(
    'fees/fetchStudentFeePayments',
    async (student_id: number) => {
        const response = await api.get(`/fees/students/${student_id}/payments`);
        return response.data;
    }
);

const feeSlice = createSlice({
    name: 'fees',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Create Fee Structure
            .addCase(createFeeStructure.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createFeeStructure.fulfilled, (state, action) => {
                state.feeStructures.push(action.payload);
                state.loading = false;
            })
            .addCase(createFeeStructure.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to create fee structure';
            })
            // Fetch Fee Structures
            .addCase(fetchFeeStructures.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchFeeStructures.fulfilled, (state, action) => {
                state.feeStructures = action.payload;
                state.loading = false;
            })
            .addCase(fetchFeeStructures.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch fee structures';
            })
            // Create Fee Payment
            .addCase(createFeePayment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createFeePayment.fulfilled, (state, action) => {
                state.feePayments.push(action.payload);
                state.loading = false;
            })
            .addCase(createFeePayment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to create fee payment';
            })
            // Fetch Student Fee Payments
            .addCase(fetchStudentFeePayments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStudentFeePayments.fulfilled, (state, action) => {
                state.feePayments = action.payload;
                state.loading = false;
            })
            .addCase(fetchStudentFeePayments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch student fee payments';
            });
    },
});

export default feeSlice.reducer;
