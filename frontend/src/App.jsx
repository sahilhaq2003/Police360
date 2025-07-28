import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Components/UserManage/Login';
import RegisterOfficer from './Components/UserManage/RegisterOfficer';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin/register-officer" element={<RegisterOfficer />} />
        {/* You can add more protected routes later */}
      </Routes>
    </Router>
  );
}

export default App;
