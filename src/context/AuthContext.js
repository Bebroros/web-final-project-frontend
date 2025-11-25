import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authTokens, setAuthTokens] = useState(() =>
        localStorage.getItem('access_token') ? localStorage.getItem('access_token') : null
    );
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();


    const loginUser = async (username, password) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post('/auth/token/', {
                username,
                password
            });


            const { access, refresh } = response.data;

            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);

            setAuthTokens(access);

            navigate('/calendar');
        } catch (err) {
            console.error("Login failed", err);
            setError("Invalid username or password");
        } finally {
            setLoading(false);
        }
    };

    const registerUser = async (username, password) => {
        setLoading(true);
        setError(null);
        try {
            await api.post('/auth/register/', {
                username,
                password
            });

            await loginUser(username, password);
        } catch (err) {
            console.error("Registration failed", err);
            setError("Registration failed. Try a different username.");
        } finally {
            setLoading(false);
        }
    };


    const logoutUser = () => {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
    };

    const contextData = {
        user,
        authTokens,
        loginUser,
        registerUser,
        logoutUser,
        loading,
        error
    };

    return (
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;