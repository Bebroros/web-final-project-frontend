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


    const registerUser = async (userData) => {
        setLoading(true);
        setError(null);
        try {
            await api.post('/auth/register/', userData);

            await loginUser(userData.username, userData.password);
        } catch (err) {
            console.error("Registration failed", err.response?.data);

            let errorMessage = "Registration failed.";
            if (err.response && err.response.data) {

                const keys = Object.keys(err.response.data);
                if (keys.length > 0) {
                    const firstKey = keys[0];
                    errorMessage = `${firstKey}: ${err.response.data[firstKey]}`;
                }
            }
            setError(errorMessage);
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