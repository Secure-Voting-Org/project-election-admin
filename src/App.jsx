import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Tally from './pages/Tally';
import SupportInbox from './pages/SupportInbox';

const PrivateRoute = ({ children }) => {
  const isAdmin = localStorage.getItem('admin_token');
  return isAdmin ? children : <Navigate to="/" />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
          <Route
          path="/tally"
          element={
            <PrivateRoute>
              <Tally />
            </PrivateRoute>
          }
        />
        <Route
          path="/support-inbox"
          element={
            <PrivateRoute>
              <SupportInbox />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
