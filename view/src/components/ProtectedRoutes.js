import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

function ProtectedRoute({ component: Component, roleRequired, ...rest }) {
    const token = Cookies.get('jwt');

    if (!token) {
        return <Navigate to="/login" replace />; // Redirect to login if no token
    }

    try {
        const decodedToken = jwtDecode(token);

        if (decodedToken.role !== roleRequired) {
            return <Navigate to="/unAuth" replace />; // Redirect to UnAuth if role doesn't match
        }
    } catch (error) {
        console.error("Invalid token:", error);
        return <Navigate to="/login" replace />; // Redirect to login if token is invalid
    }

    return <Component {...rest} />;
}

export default ProtectedRoute;
