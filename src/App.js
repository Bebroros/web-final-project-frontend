import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { AuthProvider } from './context/AuthContext';

import LoginPage from './pages/LoginPage';
import CalendarPage from './pages/CalendarPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from "./pages/RegisterPage";
import PrivateRoute from './utils/PrivateRoute';
import HomePage from './pages/HomePage';

function App() {
    return (
        <Router>
            <AuthProvider>
                <Layout>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />

                        <Route
                            path="/"
                            element={
                                <PrivateRoute>
                                    <HomePage />
                                </PrivateRoute>
                            }
                        />

                        <Route
                            path="/calendar"
                            element={
                                <PrivateRoute>
                                    <CalendarPage />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/subs"
                            element={
                                <PrivateRoute>
                                    <SubscriptionsPage />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/profile"
                            element={
                                <PrivateRoute>
                                    <ProfilePage />
                                </PrivateRoute>
                            }
                        />
                    </Routes>
                </Layout>
            </AuthProvider>
        </Router>
    );
}

export default App;