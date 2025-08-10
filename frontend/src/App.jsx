import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './Components/Home/Home';
import Login from './Components/UserManage/Login';
import RegisterOfficer from './Components/admin/RegisterOfficer';
import AdminDashboard from './Components/admin/AdminDashboard';
import Officers from './Components/admin/Officers';
import OfficerProfile from './Components/admin/OfficerProfile';
import ReportForm from './Components/Report/ReportForm';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/register-officer" element={<RegisterOfficer />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/officers" element={<Officers />} />
        <Route path="/admin/officer/:id" element={<OfficerProfile />} />
        <Route path="/report-form" element={<ReportForm />} />
      </Routes>
    </Router>
  );
}

export default App;
