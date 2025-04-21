import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface Props {
    element: React.ReactElement;
}

const ProtectedRoute: React.FC<Props> = ({ element }) => {
    const location = useLocation();
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const loading = useSelector((state: RootState) => state.auth.loading);

    if (loading) {
        // You might want to show a loading spinner here
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        // Redirect them to the login page, but save the current location they were
        // trying to go to when they were redirected. This allows us to send them
        // along to that page after they login, which is a nicer user experience
        // than dropping them off on the home page.
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return element;
};

export { ProtectedRoute };
