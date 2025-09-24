import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './Components/Home/Home';
import Login from './Components/UserManage/Login';
import RegisterOfficer from './Components/admin/RegisterOfficer';
import AdminDashboard from './Components/admin/AdminDashboard';

import ReportForm from './Components/Report/ReportForm';
import ReportSuccess from './Components/Report/ReportSuccess';

import Reports from './Components/Report/Reports';
import UpdateReport from './Components/Report/UpdateReport';

import Officers from './Components/admin/officers';
import OfficerProfile from './Components/admin/OfficerProfile';

import OfficerDashboard from './Components/officer/officerDashboard';
import AssignAccidents from './Components/officer/AssignAccidents';
import Accidentform from './Components/accidents/accidentform';
import AllAccidents from './Components/accidents/AllAccidents';
import AccidentDetails from './Components/accidents/AccidentDetails';
import TrackAccident from './Components/accidents/TrackAccident';

import OfficerRequest from './Components/officer/OfficerRequest';
import ViewRequests from './Components/admin/ViewRequests';
import ItOfficerDashboard from './Components/itOfficer/ItOfficerDashboard';
import ItDutySchedules from './Components/itOfficer/ItDutySchedules';
import OfficerCalendar from './Components/officer/OfficerCalendar';
import CaseDetails from './Components/cases/CaseDetails';
import UpdateComplaint from './Components/cases/UpdateComplaint';

import Criminal from './Components/CriminalManage/Criminal';

import FileComplaint from './Components/cases/FileComplaint';
import ItCasesPanel from './Components/cases/ItCasesPanel';
import OfficerCases from './Components/cases/OfficerCases';

import CriminalProfile from './Components/CriminalManage/CriminalProfile';
import CriminalManage from './Components/CriminalManage/CriminalManage';





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
        <Route path="/reports" element={<Reports />} />
        <Route path="/reports/:id" element={<UpdateReport />} />


        <Route
          path="/officer/OfficerDashboard"
          element={<OfficerDashboard />}
        />
        <Route path="/officer/dashboard" element={<OfficerDashboard />} />
        <Route path="/officer/assign-accidents" element={<AssignAccidents />} />


        <Route path="/officer/OfficerDashboard" element={<OfficerDashboard />} />


        <Route path="/officer/calendar" element={<OfficerCalendar />} />
        <Route path="/officer/request" element={<OfficerRequest />} />
        <Route path="/admin/requests" element={<ViewRequests />} />
        <Route
          path="/itOfficer/ItOfficerDashboard"
          element={<ItOfficerDashboard />}
        />
        <Route path="/itOfficer/schedules" element={<ItDutySchedules />} />
        <Route path="/CriminalManage/Criminal" element={<Criminal />} />
        <Route path="/apply/file-complaint" element={<FileComplaint />} />
        <Route path="/it/cases" element={<ItCasesPanel />} />
        <Route path="/officer/cases" element={<OfficerCases />} />
        <Route path="/cases/:id" element={<CaseDetails />} />
        <Route path="/accident-form" element={<Accidentform />} />
        <Route path="/accidents" element={<AllAccidents />} />
        <Route path="/accidents/:id" element={<AccidentDetails />} />
        <Route path="/accidents/track" element={<TrackAccident />} />
        <Route path="/cases/update/:id" element={<UpdateComplaint />} />




        <Route path="/report-details" element={<ReportsDetails />} />
        <Route path="/report" element={<Report />} />


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
