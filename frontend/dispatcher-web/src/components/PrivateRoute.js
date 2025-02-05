import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from './Layout';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Ładowanie...</div>;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    return <Layout>{children}</Layout>;
};

export default PrivateRoute;