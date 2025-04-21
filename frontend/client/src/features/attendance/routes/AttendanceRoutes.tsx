import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { AttendancePage } from '../pages/AttendancePage';
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';

export const AttendanceRoutes: React.FC = () => {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <ProtectedRoute
                        element={<AttendancePage />}
                    />
                }
            />
            {/* Add more attendance-related routes here */}
        </Routes>
    );
};
