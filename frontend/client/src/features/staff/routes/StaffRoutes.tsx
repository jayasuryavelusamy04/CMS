import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StaffList from '../components/StaffList';
import StaffForm from '../components/StaffForm';
import StaffDetails from '../components/StaffDetails';
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';

const StaffRoutes: React.FC = () => {
    return (
        <Routes>
            <Route
                index
                element={
                    <ProtectedRoute element={<StaffList />} />
                }
            />
            <Route
                path="new"
                element={
                    <ProtectedRoute element={<StaffForm />} />
                }
            />
            <Route
                path="edit/:id"
                element={
                    <ProtectedRoute element={<StaffForm />} />
                }
            />
            <Route
                path=":id"
                element={
                    <ProtectedRoute element={<StaffDetails />} />
                }
            />
        </Routes>
    );
};

export default StaffRoutes;
