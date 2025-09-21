import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './Components/Home/Home';
import Login from './Components/UserManage/Login';
import RegisterOfficer from './Components/admin/RegisterOfficer';
import AdminDashboard from './Components/admin/AdminDashboard';
import Officers from './Components/admin/officers';
import OfficerProfile from './Components/admin/OfficerProfile';
import ReportForm from './Components/Report/ReportForm';
import ReportSuccess from './Components/Report/ReportSuccess';
import OfficerDashboard from './Components/officer/officerDashboard';

import OfficerRequest from './Components/officer/OfficerRequest';
import ViewRequests from './Components/admin/ViewRequests';
import ItOfficerDashboard from './Components/itOfficer/ItOfficerDashboard';
import ItDutySchedules from './Components/itOfficer/ItDutySchedules';
import OfficerCalendar from './Components/officer/OfficerCalendar';

import Criminal from './Components/CriminalManage/Criminal';
import CriminalProfile from './Components/CriminalManage/CriminalProfile';
import CriminalManage from './Components/CriminalManage/CriminalManage';



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
        <Route path="/report-success" element={<ReportSuccess />} />
        <Route path="/officer/OfficerDashboard" element={<OfficerDashboard />} />

        <Route path="/officer/calendar" element={<OfficerCalendar />} />
        <Route path="/officer/request" element={<OfficerRequest />} />
        <Route path="/admin/requests" element={<ViewRequests />} />
        <Route path="/itOfficer/ItOfficerDashboard" element={<ItOfficerDashboard />} />
        <Route path="/itOfficer/schedules" element={<ItDutySchedules />} />


        <Route path="/officer/request" element={<OfficerRequest />} />
        <Route path="/admin/requests" element={<ViewRequests />} />

        {/* Criminal Management Routes */}
        <Route path="/CriminalManage/CriminalManage" element={<CriminalManage />} />
        <Route path="/CriminalManage/Criminal" element={<Criminal/>}/>
        <Route path="/CriminalManage/CriminalProfile" element={<CriminalProfile />} />
        <Route path="/CriminalManage/CriminalProfile/:id" element={<CriminalProfile />} />
       

      </Routes>
    </Router>
  );
}

export default App;
