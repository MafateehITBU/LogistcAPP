import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import {jwtDecode} from 'jwt-decode';

function ProtectedRoute({ component: Component, roleRequired, ...rest }) {
    const token = Cookies.get('jwt');

    if (!token) {
        return <Navigate to="/unAuth" />;
    }

    try {
        // Decode the token and check the user's role
        const decodedToken = jwtDecode(token);
        if (decodedToken.role !== roleRequired) {
            return <Navigate to="/login" replace />;
        }
    } catch (error) {
        console.error("Invalid token:", error);
        return <Navigate to="/unAuth" replace />;
    }

    return <Component {...rest} />;
}

export default ProtectedRoute;
