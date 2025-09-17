import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

const OfficerCalendar = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const id = localStorage.getItem('userId') || sessionStorage.getItem('userId');
        if (!id) return navigate('/login');
        const res = await axiosInstance.get('/schedules', { params: { officer: id, page: 1, pageSize: 200 } });
        setItems(res.data?.data || []);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC] text-[#0B214A]">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">My Duty Schedule</h1>
          <button onClick={() => navigate(-1)} className="px-4 py-2 rounded-lg bg-[#EAF1FF] hover:bg-[#DDE9FF]">Back</button>
        </div>

        <div className="p-4 md:p-6 rounded-2xl bg-white border border-[#EEF2F7]">
          {loading ? (
            <p className="text-sm text-[#5A6B85]">Loading…</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-[#5A6B85]">No schedules found.</p>
          ) : (
            <div className="space-y-3">
              {items.map((it) => (
                <div key={it._id} className="px-4 py-3 rounded-lg border border-[#EEF2F7]">
                  <div className="text-sm font-medium">{it.date ? new Date(it.date).toLocaleDateString() : ''} • {it.shift}</div>
                  <div className="text-[11px] text-[#5A6B85]">{it.location || '—'} {it.notes ? `• ${it.notes}` : ''}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfficerCalendar;


