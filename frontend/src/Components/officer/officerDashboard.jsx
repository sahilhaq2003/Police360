import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, ClipboardCheck, BookMarked, CalendarDays, ShieldCheck, LogOut
} from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import PoliceHeader from '../../Components/PoliceHeader/PoliceHeader';

const OfficerDashboard = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [myAccidents, setMyAccidents] = useState([]);
  const [myCases, setMyCases] = useState([]);
  const [stats, setStats] = useState({ assigned: 0, inProgress: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get('/reports/my');
        setReports(res.data || []);
        const stat = { assigned: 0, inProgress: 0, completed: 0 };
        res.data.forEach(r => {
          if (r.status === 'In Progress') stat.inProgress++;
          else if (r.status === 'Completed') stat.completed++;
          else stat.assigned++;
        });
        setStats(stat);
        // load accidents assigned to me
        const myId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
        if (myId) {
          const [accRes, caseRes] = await Promise.all([
            axiosInstance.get('/accidents', { params: { page: 1, limit: 50, assignedToMe: 'true' } }),
            axiosInstance.get('/cases', { params: { assignedOfficer: myId } }),
          ]);
          const items = accRes.data?.items || accRes.data || [];
          setMyAccidents(items);
          setMyCases(caseRes.data?.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const loadMe = async () => {
      try {
        const id = localStorage.getItem('userId') || sessionStorage.getItem('userId');
        if (!id) return;
        const res = await axiosInstance.get(`/officers/${id}`);
        setMe(res.data || null);
      } catch {}
    };
    loadMe();
  }, []);

  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
  };

  const recentReports = useMemo(() => reports.slice(0, 5), [reports]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC] text-[#0B214A]">
      <PoliceHeader />
      <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3">
            {me?.photo ? (
              <img src={me.photo} alt={me.name} className="w-15 h-15 rounded-full object-cover border border-[#E4E9F2]" />
            ) : (
              <ShieldCheck className="w-6 h-6 text-[#00296B]" />
            )}
            <h2 className="text-3xl font-extrabold tracking-tight mb-4">Welcome, Officer</h2>           
          </div>
        
        <p className="text-sm text-[#5A6B85] mb-8">Here is your report summary and recent activity overview.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <KpiCard icon={<ClipboardCheck className="w-5 h-5" />} label="Assigned" value={stats.assigned} />
          <KpiCard icon={<BookMarked className="w-5 h-5" />} label="In Progress" value={stats.inProgress} />
          <KpiCard icon={<FileText className="w-5 h-5" />} label="Completed" value={stats.completed} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ActionCard
            icon={<ClipboardCheck className="h-10 w-10" />}
            title="Assigned Reports"
            desc="View all your assigned complaint and accident reports."
            onClick={() => navigate('/officer/reports')}
          />
          <button
            onClick={() => navigate('/officer/assign-accidents')}
            className="bg-white border border-[#E4E9F2] rounded-2xl p-6 text-left shadow hover:shadow-lg transition hover:-translate-y-0.5"
          >
            <div className="mb-3 text-[#00296B]"><BookMarked className="h-10 w-10" /></div>
            <div className="text-lg font-semibold">Assigned Accidents</div>
            <div className="text-sm text-[#5A6B85] mt-1">View and assign accidents to officers</div>
            <div className="mt-4 space-y-2">
              {loading ? (
                <SkeletonRow />
              ) : myAccidents.length === 0 ? (
                <div className="text-sm text-[#5A6B85]">
                  No accidents assigned to you. Click to view all accidents and assign them.
                </div>
              ) : (
                myAccidents.slice(0, 5).map((a) => (
                  <div
                    key={a._id}
                    className="w-full text-left px-4 py-3 rounded-lg border border-[#EEF2F7] bg-[#F8FAFC]"
                  >
                    <div className="text-sm font-medium">{a.trackingId} • {a.accidentType?.replaceAll('_', ' ')}</div>
                    <div className="text-[11px] text-[#5A6B85]">{a.status} • {a.locationText}</div>
                    {a.assignedOfficer && (
                      <div className="text-[10px] text-[#5A6B85] mt-1">
                        Assigned to: {a.assignedOfficer.name}
                      </div>
                    )}
                  </div>
                ))
              )}
              {/* (Assigned criminal cases moved to its own card below) */}
            </div>
          </button>
          {/* Assigned Cases card (separate from Assigned Accidents) */}
          <button
            onClick={() => navigate('/officer/cases')}
            className="bg-white border border-[#E4E9F2] rounded-2xl p-6 text-left shadow hover:shadow-lg transition hover:-translate-y-0.5"
          >
            <div className="mb-3 text-[#00296B]"><BookMarked className="h-10 w-10" /></div>
            <div className="text-lg font-semibold">Assigned Cases</div>
            <div className="text-sm text-[#5A6B85] mt-1">Cases assigned to you. View details and add investigation notes.</div>
            <div className="mt-4 space-y-2">
              {loading ? (
                <SkeletonRow />
              ) : myCases.length === 0 ? (
                <div className="text-sm text-[#5A6B85]">No assigned cases yet.</div>
              ) : (
                myCases.slice(0, 5).map(c => (
                  <div key={c._id} className="w-full text-left px-4 py-3 rounded-lg border border-[#EEF2F7] bg-[#F8FAFC]">
                    <div className="text-sm font-medium">{c.complainant?.name} • {c.complaintDetails?.typeOfComplaint}</div>
                    <div className="text-[11px] text-[#5A6B85]">{c.status} • {c.complaintDetails?.location}</div>
                    <div className="text-[10px] text-[#5A6B85] mt-1">{new Date(c.createdAt).toLocaleString()}</div>
                    <div className="mt-2">
                      <button onClick={() => navigate(`/cases/${c._id}`)} className="px-2 py-1 text-xs bg-[#EEF2F7] rounded">View</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </button>
          <ActionCard
            icon={<CalendarDays className="h-10 w-10" />}
            title="Duty Schedule"
            desc="Check upcoming shifts and duty allocations."
            onClick={() => navigate('/officer/calendar')}
          />
          <ActionCard
            icon={<FileText className="h-10 w-10" />}
            title="Request Chief"
            desc="Create requests and track their status."
            onClick={() => navigate('/officer/request')}
          />
        </div>

        <div className="mt-10">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {loading ? <SkeletonRow /> : recentReports.length === 0 ? (
              <p className="text-sm text-[#5A6B85]">No recent reports.</p>
            ) : (
              recentReports.map((r) => (
                <button
                  key={r._id}
                  onClick={() => navigate(`/officer/reports/${r._id}`)}
                  className="w-full text-left px-4 py-3 rounded-lg border border-[#EEF2F7] hover:bg-[#EEF6FF] transition"
                >
                  <div className="text-sm font-medium">{r.reportNumber} • {r.reportType}</div>
                  <div className="text-[11px] text-[#5A6B85]">{r.status} • {new Date(r.createdAt).toLocaleString()}</div>
                </button>
              ))
            )}
          </div>
        </div>

        <p className="mt-12 text-center text-xs text-[#5A6B85]">
          &copy; {new Date().getFullYear()} Police360 Officer Panel
        </p>
      </div>
    </div>
  );
};

const KpiCard = ({ icon, label, value }) => (
  <div className="bg-white rounded-2xl border border-[#E4E9F2] shadow p-5 flex items-center justify-between">
    <div>
      <div className="text-sm text-[#5A6B85]">{label}</div>
      <div className="text-2xl font-extrabold mt-1">{value}</div>
    </div>
    <div className="rounded-xl p-3 bg-[#F0F5FF] text-[#00296B]">{icon}</div>
  </div>
);

const ActionCard = ({ icon, title, desc, onClick }) => (
  <button
    onClick={onClick}
    className="bg-white border border-[#E4E9F2] rounded-2xl p-6 text-left shadow hover:shadow-lg transition hover:-translate-y-0.5"
  >
    <div className="mb-3 text-[#00296B]">{icon}</div>
    <div className="text-lg font-semibold">{title}</div>
    <div className="text-sm text-[#5A6B85] mt-1">{desc}</div>
  </button>
);

const SkeletonRow = () => (
  <div className="animate-pulse space-y-2">
    <div className="h-10 bg-[#EEF2F7] rounded-lg" />
    <div className="h-10 bg-[#EEF2F7] rounded-lg" />
  </div>
);

export default OfficerDashboard;
