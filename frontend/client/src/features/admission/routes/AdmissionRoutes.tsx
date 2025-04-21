import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdmissionList from '../components/AdmissionList';
import AdmissionForm from '../components/AdmissionForm';
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';

const AdmissionRoutes: React.FC = () => {
    return (
        <Routes>
            <Route
                index
                element={
                    <ProtectedRoute element={<AdmissionList />} />
                }
            />
            <Route
                path="new"
                element={
                    <ProtectedRoute element={<AdmissionForm />} />
                }
            />
            <Route
                path="edit/:id"
                element={
                    <ProtectedRoute element={<AdmissionForm />} />
                }
            />
        </Routes>
    );
};

export default AdmissionRoutes;
