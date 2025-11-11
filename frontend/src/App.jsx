import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './Components/Home/Home';
import Login from './Components/UserManage/Login';
import RegisterOfficer from './Components/admin/RegisterOfficer';
import AdminDashboard from './Components/admin/AdminDashboard';
import About from './Components/About_us/About';
import OpenData from './Components/Open_data/OpenData';
import ApplicationStatus from './Components/ApplicationStatus/ApplicationStatus';
import Information from './Components/Information/Information';
import Media from './Components/Media/Media';

import ReportForm from './Components/Report/ReportForm';
import ReportSuccess from './Components/Report/ReportSuccess';

import Reports from './Components/Report/Reports';
import UpdateReport from './Components/Report/UpdateReport';

import Officers from './Components/admin/officers';
import OfficerProfile from './Components/admin/OfficerProfile';
import AdminScheduleView from './Components/admin/AdminScheduleView';

import OfficerDashboard from './Components/officer/officerDashboard';
import AssignAccidents from './Components/officer/AssignAccidents';
import Accidentform from './Components/accidents/accidentform';
import AllAccidents from './Components/accidents/AllAccidents';
import AccidentDetails from './Components/accidents/AccidentDetails';
import TrackAccident from './Components/accidents/TrackAccident';
import InsuranceLookup from './Components/accidents/InsuranceLookup';

import OfficerRequest from './Components/officer/OfficerRequest';
import ViewRequests from './Components/admin/ViewRequests';
import ItOfficerDashboard from './Components/itOfficer/ItOfficerDashboard';
import ItDutySchedules from './Components/itOfficer/ItDutySchedules';
import OfficerCalendar from './Components/officer/OfficerCalendar';
import CaseDetails from './Components/cases/CaseDetails';
import UpdateComplaint from './Components/cases/UpdateComplaint';
import CaseDetailsPublic from './Components/cases/CaseDetailsPublic';
import ComplaintProgress from './Components/cases/ComplaintProgress';

import FileComplaint from './Components/cases/FileComplaint';
import CreateCase from './Components/cases/CreateCase';
import ViewCases from './Components/cases/ViewCases';
import ITCaseDetails from './Components/cases/ITCaseDetails';
import ItCasesPanel from './Components/cases/ItCasesPanel';
import OfficerCases from './Components/cases/OfficerCases';
import OfficerCaseDetails from './Components/cases/OfficerCaseDetails';

import Criminal from './Components/CriminalManage/Criminal';
import CriminalProfile from './Components/CriminalManage/CriminalProfile';
import CriminalManage from './Components/CriminalManage/CriminalManage';
import CriminalStatus from './Components/CriminalManage/CriminalStatus';
import CrimeStatus from './Components/CriminalManage/CrimeStatus';

import Suspect from './Components/Suspect/Suspect';
import SuspectProfile from './Components/Suspect/SuspectProfile';
import SuspectManage from './Components/Suspect/SuspectManage';
import SuspectUpdate from './Components/Suspect/SuspectUpdate';

import ReportsDetails from './Components/ReportsDetails/reportsDetails';
import Report from './Components/Report/Report';
import AccidentReports from './Components/accidents/AccidentReports';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/register-officer" element={<RegisterOfficer />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/officers" element={<Officers />} />
        <Route path="/admin/officer/:id" element={<OfficerProfile />} />
        <Route path="/admin/schedules" element={<AdminScheduleView />} />
        <Route path="/track/case" element={<ComplaintProgress />} />
        <Route path="/track/case/:id" element={<CaseDetailsPublic />} />
        <Route path="/about" element={<About />} />
        <Route path="/open-data" element={<OpenData />} />
        <Route path="/application-status" element={<ApplicationStatus />} />
        <Route path="/complaint-progress/:id" element={<ComplaintProgress />} />
        <Route path="/accident-progress/:id" element={<TrackAccident />} />
        <Route path="/information" element={<Information />} />
        <Route path="/media" element={<Media />} />

        <Route path="/report-form" element={<ReportForm />} />
        <Route path="/report-success" element={<ReportSuccess />} />
        <Route path="/report-success/:id" element={<ReportSuccess />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/reports/:id" element={<UpdateReport />} />

        <Route
          path="/officer/OfficerDashboard"
          element={<OfficerDashboard />}
        />
        <Route path="/officer/dashboard" element={<OfficerDashboard />} />
        <Route path="/officer/assign-accidents" element={<AssignAccidents />} />

        <Route
          path="/officer/OfficerDashboard"
          element={<OfficerDashboard />}
        />

        <Route path="/officer/calendar" element={<OfficerCalendar />} />
        <Route path="/officer/request" element={<OfficerRequest />} />
        <Route path="/officer/reports" element={<OfficerCases />} />
        <Route
          path="/officer/case-details/:id"
          element={<OfficerCaseDetails />}
        />
        <Route path="/admin/requests" element={<ViewRequests />} />
        <Route
          path="/itOfficer/ItOfficerDashboard"
          element={<ItOfficerDashboard />}
        />
        <Route path="/itOfficer/schedules" element={<ItDutySchedules />} />
        <Route path="/CriminalManage/Criminal" element={<Criminal />} />
        <Route path="/apply/file-complaint" element={<FileComplaint />} />
        <Route path="/create-case" element={<CreateCase />} />
        <Route path="/it/view-cases" element={<ViewCases />} />
        <Route path="/it/case-details/:id" element={<ITCaseDetails />} />
        <Route path="/it/cases" element={<ItCasesPanel />} />
        <Route path="/officer/cases" element={<OfficerCases />} />
        <Route path="/cases/:id" element={<CaseDetails />} />
        <Route path="/accident-form" element={<Accidentform />} />
        <Route path="/accidents" element={<AllAccidents />} />
        <Route path="/accidents/:id" element={<AccidentDetails />} />
        <Route path="/accidents/track" element={<TrackAccident />} />

        <Route
          path="/accidents/insurance-lookup"
          element={<InsuranceLookup />}
        />

        <Route path="/cases/update/:id" element={<UpdateComplaint />} />
        <Route path="/cases/progress" element={<ComplaintProgress />} />

        <Route path="/report-details" element={<ReportsDetails />} />
        <Route path="/report" element={<Report />} />

        {/* Criminal Management Routes */}

        <Route
          path="/CriminalManage/CriminalManage"
          element={<CriminalManage />}
        />
        <Route path="/CriminalManage/Criminal" element={<Criminal />} />
        <Route
          path="/CriminalManage/CriminalProfile"
          element={<CriminalProfile />}
        />
        <Route
          path="/CriminalManage/CriminalProfile/:id"
          element={<CriminalProfile />}
        />
        <Route path="/CriminalStatus" element={<CriminalStatus />} />
        <Route path="/crime-status" element={<CrimeStatus />} />

        <Route
          path="/CriminalManage/CriminalManage"
          element={<CriminalManage />}
        />
        <Route path="/CriminalManage/Criminal" element={<Criminal />} />
        <Route
          path="/CriminalManage/CriminalProfile"
          element={<CriminalProfile />}
        />
        <Route
          path="/CriminalManage/CriminalProfile/:id"
          element={<CriminalProfile />}
        />

        {/* Suspect Management Routes */}
        <Route path="/SuspectManage/Suspect" element={<Suspect />} />
        <Route
          path="/SuspectManage/SuspectProfile"
          element={<SuspectProfile />}
        />
        <Route
          path="/SuspectManage/SuspectProfile/:id"
          element={<SuspectProfile />}
        />
        <Route
          path="/SuspectManage/SuspectManage"
          element={<SuspectManage />}
        />
        <Route path="/SuspectManage/Suspect/:id" element={<Suspect />} />
        <Route
          path="/SuspectManage/SuspectUpdate/:id"
          element={<SuspectUpdate />}
        />

        <Route path="Accidents/reports" element={<AccidentReports />} />
      </Routes>
    </Router>
  );
}

export default App;
