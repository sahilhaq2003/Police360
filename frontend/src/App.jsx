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
import Accidentform from './Components/accidents/accidentform';
import AllAccidents from './Components/accidents/allAccidents';
import AccidentDetails from './Components/accidents/AccidentDetails';
import TrackAccident from './Components/accidents/TrackAccident';

import OfficerRequest from './Components/officer/OfficerRequest';
import ViewRequests from './Components/admin/ViewRequests';
import ItOfficerDashboard from './Components/itOfficer/ItOfficerDashboard';
import ItDutySchedules from './Components/itOfficer/ItDutySchedules';
import OfficerCalendar from './Components/officer/OfficerCalendar';

import Criminal from './Components/CriminalManage/Criminal';



import ReportsDetails from './Components/ReportsDetails/reportsDetails';
import Report from './Components/Report/Report';


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

        <Route path="/CriminalManage/Criminal" element ={<Criminal/>}/>

        <Route
          path="/officer/OfficerDashboard"
          element={<OfficerDashboard />}
        />
        <Route path="/accident-form" element={<Accidentform />} />
        <Route path="/accidents" element={<AllAccidents />} />
        <Route path="/accidents/:id" element={<AccidentDetails />} />
        <Route path="/accidents/track" element={<TrackAccident />} />


        <Route path="/report-details" element={<ReportsDetails />} />
        <Route path="/report" element={<Report />} />

      </Routes>
    </Router>
  );
}

export default App;
