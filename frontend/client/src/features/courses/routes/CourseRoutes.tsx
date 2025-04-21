import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CourseList from '../components/CourseList';
import CourseForm from '../components/CourseForm';
import TimetableForm from '../components/TimetableForm';
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';

const CourseRoutes: React.FC = () => {
    return (
        <Routes>
            <Route
                index
                element={
                    <ProtectedRoute element={<CourseList />} />
                }
            />
            <Route
                path="new"
                element={
                    <ProtectedRoute element={<CourseForm />} />
                }
            />
            <Route
                path="edit/:id"
                element={
                    <ProtectedRoute element={<CourseForm />} />
                }
            />
            <Route
                path=":id/timetable"
                element={
                    <ProtectedRoute element={<TimetableForm />} />
                }
            />
        </Routes>
    );
};

export default CourseRoutes;
