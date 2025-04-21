import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { FeesPage } from '../pages/FeesPage';

export const FeeRoutes = () => {
    return (
        <Routes>
            <Route index element={<FeesPage />} />
        </Routes>
    );
};
