import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { LoginPage } from '../features/auth/components/LoginPage';
import DashboardPage from '../features/dashboard/components/DashboardPage';
import AdmissionRoutes from '../features/admission/routes/AdmissionRoutes';
import CourseRoutes from '../features/courses/routes/CourseRoutes';
import StaffRoutes from '../features/staff/routes/StaffRoutes';
import StudentRoutes from '../features/students/routes/StudentRoutes';
import TimetableRoutes from '../features/timetable/routes/TimetableRoutes';
import { FeeRoutes } from '../features/fees/routes/FeeRoutes';
import { AttendanceRoutes } from '../features/attendance/routes/AttendanceRoutes';

export const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute element={<Layout />} />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="admissions/*" element={<AdmissionRoutes />} />
                <Route path="courses/*" element={<CourseRoutes />} />
                <Route path="staff/*" element={<StaffRoutes />} />
                <Route path="students/*" element={<StudentRoutes />} />
                <Route path="timetable/*" element={<TimetableRoutes />} />
                <Route path="fees/*" element={<FeeRoutes />} />
                <Route path="attendance/*" element={<AttendanceRoutes />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};
