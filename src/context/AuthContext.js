import React, { createContext, useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const getUserFromToken = () => {
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const decoded = jwtDecode(token);

                return { user_id: decoded.user_id, ...decoded };
            } catch (error) {
                console.error("Invalid token", error);
                return null;
            }
        }
        return null;
    };

    const [authTokens, setAuthTokens] = useState(() =>
        localStorage.getItem('access_token') ? localStorage.getItem('access_token') : null
    );

    const [user, setUser] = useState(() => getUserFromToken());

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

            const decodedUser = jwtDecode(access);
            setUser({ user_id: decodedUser.user_id });

            navigate('/');
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

    const googleLogin = async (accessToken) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post('/auth/google/', {
                access_token: accessToken
            });

            const { access, refresh, key } = response.data;
            const tokenToSave = access || key;

            localStorage.setItem('access_token', tokenToSave);
            if (refresh) localStorage.setItem('refresh_token', refresh);

            setAuthTokens(tokenToSave);

            if (tokenToSave) {
                const decodedUser = jwtDecode(tokenToSave);
                setUser({ user_id: decodedUser.user_id });
            }

            navigate('/');

        } catch (err) {
            console.error("Google Auth Error:", err);
            setError("Failed to login with Google.");
        } finally {
            setLoading(false);
        }
    };

    const contextData = {
        user,
        authTokens,
        loginUser,
        registerUser,
        googleLogin,
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