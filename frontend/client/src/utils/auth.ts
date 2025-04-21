import { authAPI } from './api';

export interface AuthResponse {
    token: {
        access_token: string;
        refresh_token: string;
        token_type: string;
    };
    user: User;
}

export interface User {
    id: number;
    username: string;
    email: string;
    full_name: string;
    role: string;
    is_active: boolean;
    last_login: string | null;
}

export class AuthError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AuthError';
    }
}

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user';

export const authService = {
    getStoredToken: (): string | null => {
        return localStorage.getItem(TOKEN_KEY);
    },

    getStoredRefreshToken: (): string | null => {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    },

    getStoredUser: (): User | null => {
        const userStr = localStorage.getItem(USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    },

    setTokens: (access_token: string, refresh_token: string) => {
        localStorage.setItem(TOKEN_KEY, access_token);
        localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
    },

    setUser: (user: User) => {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    },

    clearAuth: () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    },

    login: async (credentials: { username: string; password: string }): Promise<AuthResponse> => {
        try {
            const response = await authAPI.login(credentials.username, credentials.password);
            const { token, user } = response as AuthResponse;

            // Store tokens and user data
            authService.setTokens(token.access_token, token.refresh_token);
            authService.setUser(user);

            return response as AuthResponse;
        } catch (error: any) {
            throw new AuthError(error.response?.data?.detail || 'Login failed');
        }
    },

    logout: async (): Promise<void> => {
        authService.clearAuth();
    },

    getCurrentUser: async (): Promise<User | null> => {
        try {
            // First check if we have a stored user
            const storedUser = authService.getStoredUser();
            if (!storedUser) return null;

            // Verify the user with the backend
            const user = await authAPI.getCurrentUser();
            authService.setUser(user);
            return user;
        } catch (error) {
            authService.clearAuth();
            return null;
        }
    },

    refreshToken: async (): Promise<string | null> => {
        const refreshToken = authService.getStoredRefreshToken();
        if (!refreshToken) return null;

        try {
            const response = await authAPI.refreshToken();
            const { access_token } = response;

            localStorage.setItem(TOKEN_KEY, access_token);
            return access_token;
        } catch (error) {
            authService.clearAuth();
            return null;
        }
    },
};
