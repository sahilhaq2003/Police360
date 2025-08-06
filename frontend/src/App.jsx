import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './Components/Home/Home';
import Login from './Components/UserManage/Login';
import RegisterOfficer from './Components/admin/RegisterOfficer';
import AdminDashboard from './Components/admin/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Home Route */}
        <Route path="/" element={<Home />} />

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/Admin/register-officer" element={<RegisterOfficer />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Add more routes below if needed */}
        {/* Example: */}
        {/* <Route path="/officer/dashboard" element={<OfficerDashboard />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
