import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import PoliceHeader from '../PoliceHeader/PoliceHeader';

const ItDutySchedules = () => {
  const navigate = useNavigate();
  const [officers, setOfficers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ officer: '', date: '', startTime: '', endTime: '', location: '', notes: '' });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [o, s] = await Promise.all([
          axiosInstance.get('/officers', { params: { page: 1, pageSize: 100, role: 'All', status: 'All', station: 'All' } }),
          axiosInstance.get('/schedules', { params: { page: 1, pageSize: 200 } })
        ]);
        const list = Array.isArray(o.data?.data) ? o.data.data : [];
        // Filter to only normal Officers (exclude IT Officer and Admin)
        setOfficers(list.filter((x) => x.role === 'Officer'));
        setItems(s.data?.data || []);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    if (!form.officer || !form.date || !form.startTime || !form.endTime) return;
    const payload = {
      officer: form.officer,
      date: form.date,
      shift: `${form.startTime}-${form.endTime}`,
      location: form.location,
      notes: form.notes,
    };
    await axiosInstance.post('/schedules', payload);
    const res = await axiosInstance.get('/schedules', { params: { page: 1, pageSize: 200 } });
    setItems(res.data?.data || []);
    setForm({ officer: '', date: '', startTime: '', endTime: '', location: '', notes: '' });
  };

  const remove = async (id) => {
    await axiosInstance.delete(`/schedules/${id}`);
    setItems((prev) => prev.filter((x) => x._id !== id));
  };

  const officerMap = useMemo(() => Object.fromEntries(officers.map(o => [o._id, o])), [officers]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC] text-[#0B214A]">
      <PoliceHeader />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Manage Duty Schedules</h1>
          <button onClick={() => navigate(-1)} className="px-4 py-2 rounded-lg bg-[#EAF1FF] hover:bg-[#DDE9FF]">Back</button>
        </div>

        <form onSubmit={save} className="p-4 md:p-6 rounded-2xl bg-white border border-[#EEF2F7] mb-8 grid grid-cols-1 md:grid-cols-6 gap-4">
          <select className="border border-[#EEF2F7] rounded-md px-3 py-2" value={form.officer} onChange={(e) => setForm(v => ({ ...v, officer: e.target.value }))} required>
            <option value="">Select Officer</option>
            {officers.map(o => (
              <option key={o._id} value={o._id}>{o.name} ({o.role})</option>
            ))}
          </select>
          <input type="date" className="border border-[#EEF2F7] rounded-md px-3 py-2" value={form.date} onChange={(e) => setForm(v => ({ ...v, date: e.target.value }))} required />
          <input type="time" className="border border-[#EEF2F7] rounded-md px-3 py-2" value={form.startTime} onChange={(e) => setForm(v => ({ ...v, startTime: e.target.value }))} required />
          <input type="time" className="border border-[#EEF2F7] rounded-md px-3 py-2" value={form.endTime} onChange={(e) => setForm(v => ({ ...v, endTime: e.target.value }))} required />
          <input type="text" placeholder="Location" className="border border-[#EEF2F7] rounded-md px-3 py-2" value={form.location} onChange={(e) => setForm(v => ({ ...v, location: e.target.value }))} />
          <button type="submit" className="px-4 py-2 rounded-md bg-[#0B214A] text-white hover:bg-[#132e63]">Save</button>
          <textarea placeholder="Notes (optional)" className="md:col-span-6 border border-[#EEF2F7] rounded-md px-3 py-2" value={form.notes} onChange={(e) => setForm(v => ({ ...v, notes: e.target.value }))} />
        </form>

        <div className="p-4 md:p-6 rounded-2xl bg-white border border-[#EEF2F7]">
          <h2 className="text-lg font-semibold mb-4">Upcoming Schedules</h2>
          {loading ? (
            <p className="text-sm text-[#5A6B85]">Loading…</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-[#5A6B85]">No schedules found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-[#5A6B85]">
                    <th className="py-2 pr-4">Officer</th>
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Shift</th>
                    <th className="py-2 pr-4">Location</th>
                    <th className="py-2 pr-4">Notes</th>
                    <th className="py-2 pr-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it._id} className="border-t border-[#EEF2F7]">
                      <td className="py-2 pr-4">{officerMap[it.officer?._id || it.officer]?.name || it.officer?.name || '—'}</td>
                      <td className="py-2 pr-4">{it.date ? new Date(it.date).toLocaleDateString() : ''}</td>
                      <td className="py-2 pr-4">{it.shift}</td>
                      <td className="py-2 pr-4">{it.location || '—'}</td>
                      <td className="py-2 pr-4 max-w-xs truncate" title={it.notes}>{it.notes || '—'}</td>
                      <td className="py-2 pr-4 text-right">
                        <button onClick={() => remove(it._id)} className="text-red-600 hover:underline">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItDutySchedules;


