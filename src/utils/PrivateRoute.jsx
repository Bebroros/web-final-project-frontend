import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
    const { user, authTokens } = useContext(AuthContext);


    if (!authTokens) {
        return <Navigate to="/login" replace />;
    }


    return children;
};

export default PrivateRoute;