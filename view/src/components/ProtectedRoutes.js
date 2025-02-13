import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

function ProtectedRoute({ component: Component, rolesRequired, ...rest }) {
    const token = Cookies.get('jwt');

    if (!token) {
        return <Navigate to="/login" replace />; // Redirect to login if no token
    }

    try {
        const decodedToken = jwtDecode(token);
        const adminRole = decodedToken.role.trim();  // Ensure role has no extra spaces

        if (!rolesRequired.map(role => role.trim()).includes(adminRole)) {
            return <Navigate to="/unAuth" replace />;
        }
    } catch (error) {
        console.error("Invalid token:", error);
        return <Navigate to="/login" replace />; // Redirect if token is invalid
    }

    return <Component {...rest} />;
}

export default ProtectedRoute;