import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import CalendarPage from './pages/CalendarPage';

function App() {
  return (
      <Router>
        <div className="App">
          <Routes>

            <Route path="/login" element={<LoginPage />} />
            <Route path="/calendar" element={<CalendarPage />} />

            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
  );
}

export default App;