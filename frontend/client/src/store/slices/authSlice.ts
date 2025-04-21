import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

interface AuthState {
    user: any | null;  // Replace 'any' with proper User interface when implementing
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

interface LoginCredentials {
    username: string;
    password: string;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null
};

export const login = createAsyncThunk(
    'auth/login',
    async (credentials: LoginCredentials) => {
        const response = await api.post('/auth/login', credentials);
        const { access_token, refresh_token } = response.data;

        // Store tokens in localStorage
        localStorage.setItem('accessToken', access_token);
        localStorage.setItem('refreshToken', refresh_token);

        return response.data;
    }
);

export const logout = createAsyncThunk(
    'auth/logout',
    async () => {
        try {
            await api.post('/auth/logout');
        } finally {
            // Clear tokens regardless of API call success
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        }
    }
);

export const checkAuth = createAsyncThunk(
    'auth/checkAuth',
    async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            throw new Error('No token found');
        }

        const response = await api.get('/auth/me');
        return response.data;
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Login failed';
            })
            // Logout
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.loading = false;
                state.error = null;
            })
            // Check Auth
            .addCase(checkAuth.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
            })
            .addCase(checkAuth.rejected, (state) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
            });
    }
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
