import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Components/UserManage/Login';
import RegisterOfficer from './Components/admin/RegisterOfficer';
import AdminDashboard from  './Components/admin/AdminDashboard';


function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Admin Routes */}
        <Route path="/Admin/register-officer" element={<RegisterOfficer />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />


        {/* Add more routes below */}
        {/* Example: */}
        {/* <Route path="/officer/dashboard" element={<OfficerDashboard />} /> */}
        {/* <Route path="/it/dashboard" element={<ITDashboard />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
