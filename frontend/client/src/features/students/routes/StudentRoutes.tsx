import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StudentList from '../components/StudentList';
import StudentProfile from '../components/StudentProfile';
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';

const StudentRoutes: React.FC = () => {
    return (
        <Routes>
            <Route
                index
                element={
                    <ProtectedRoute element={<StudentList />} />
                }
            />
            <Route
                path=":id"
                element={
                    <ProtectedRoute element={<StudentProfile />} />
                }
            />
        </Routes>
    );
};

export default StudentRoutes;
