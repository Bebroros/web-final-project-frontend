import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { AuthProvider } from './context/AuthContext';

import LoginPage from './pages/LoginPage';
import CalendarPage from './pages/CalendarPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import ProfilePage from './pages/ProfilePage';

function App() {
    return (
        <Router>
            <AuthProvider>
                <Layout>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/calendar" element={<CalendarPage />} />
                        <Route path="/subs" element={<SubscriptionsPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/" element={<Navigate to="/login" replace />} />
                    </Routes>
                </Layout>
            </AuthProvider>
        </Router>
    );
}

export default App;