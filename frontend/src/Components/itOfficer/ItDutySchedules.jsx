import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import PoliceHeader from "../PoliceHeader/PoliceHeader";
import {
  User,
  CalendarDays,
  Clock,
  MapPin,
  FileText,
  Trash2,
  ArrowLeft,
  ClipboardList,
} from "lucide-react";

const ItDutySchedules = () => {
  const navigate = useNavigate();
  const [officers, setOfficers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    officer: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    notes: "",
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [o, s] = await Promise.all([
          axiosInstance.get("/officers", {
            params: {
              page: 1,
              pageSize: 100,
              role: "All",
              status: "All",
              station: "All",
            },
          }),
          axiosInstance.get("/schedules", {
            params: { page: 1, pageSize: 200 },
          }),
        ]);
        const list = Array.isArray(o.data?.data) ? o.data.data : [];
        setOfficers(list.filter((x) => x.role === "Officer"));
        setItems(s.data?.data || []);
      } catch (e) {
        console.error("Error loading data:", e);
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
    await axiosInstance.post("/schedules", payload);
    const res = await axiosInstance.get("/schedules", {
      params: { page: 1, pageSize: 200 },
    });
    setItems(res.data?.data || []);
    setForm({
      officer: "",
      date: "",
      startTime: "",
      endTime: "",
      location: "",
      notes: "",
    });
  };

  const remove = async (id) => {
    await axiosInstance.delete(`/schedules/${id}`);
    setItems((prev) => prev.filter((x) => x._id !== id));
  };

  const officerMap = useMemo(
    () => Object.fromEntries(officers.map((o) => [o._id, o])),
    [officers]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F7FB] via-[#E9EEF5] to-[#F4F7FB] text-[#0B214A]">
      <PoliceHeader />
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Manage Duty Schedules</h1>
            <p className="text-sm text-[#5A6B85]">
              Assign shifts and manage upcoming officer schedules
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0B214A] text-white hover:bg-[#123974] transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={save}
          className="p-6 rounded-2xl bg-white shadow-md border border-[#E5E9F2] mb-10"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[#0B214A]" />
            Create New Duty Schedule
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <select
              className="border border-[#E5E9F2] rounded-md px-3 py-2 text-sm"
              value={form.officer}
              onChange={(e) =>
                setForm((v) => ({ ...v, officer: e.target.value }))
              }
              required
            >
              <option value="">Select Officer</option>
              {officers.map((o) => (
                <option key={o._id} value={o._id}>
                  {o.name}
                </option>
              ))}
            </select>
            <input
              type="date"
              className="border border-[#E5E9F2] rounded-md px-3 py-2 text-sm"
              value={form.date}
              onChange={(e) => setForm((v) => ({ ...v, date: e.target.value }))}
              required
            />
            <input
              type="time"
              className="border border-[#E5E9F2] rounded-md px-3 py-2 text-sm"
              value={form.startTime}
              onChange={(e) =>
                setForm((v) => ({ ...v, startTime: e.target.value }))
              }
              required
            />
            <input
              type="time"
              className="border border-[#E5E9F2] rounded-md px-3 py-2 text-sm"
              value={form.endTime}
              onChange={(e) =>
                setForm((v) => ({ ...v, endTime: e.target.value }))
              }
              required
            />
            <input
              type="text"
              placeholder="Location"
              className="border border-[#E5E9F2] rounded-md px-3 py-2 text-sm"
              value={form.location}
              onChange={(e) =>
                setForm((v) => ({ ...v, location: e.target.value }))
              }
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-[#0B214A] text-white hover:bg-[#123974] transition text-sm"
            >
              Save
            </button>
            <textarea
              placeholder="Notes (optional)"
              className="md:col-span-6 border border-[#E5E9F2] rounded-md px-3 py-2 text-sm mt-2"
              value={form.notes}
              onChange={(e) =>
                setForm((v) => ({ ...v, notes: e.target.value }))
              }
            />
          </div>
        </form>

        {/* Table */}
        <div className="p-6 rounded-2xl bg-white shadow-md border border-[#E5E9F2]">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-[#0B214A]" />
            Upcoming Schedules
          </h2>
          {loading ? (
            <p className="text-sm text-[#5A6B85] animate-pulse">
              Loading schedules…
            </p>
          ) : items.length === 0 ? (
            <div className="text-center py-10">
              <FileText className="w-10 h-10 mx-auto text-[#9AA7C2]" />
              <p className="mt-3 text-sm text-[#5A6B85]">
                No schedules have been assigned yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-[#E5E9F2] rounded-lg overflow-hidden">
                <thead className="bg-[#F9FBFF] text-[#374151] text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left">Officer</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Shift</th>
                    <th className="px-4 py-3 text-left">Location</th>
                    <th className="px-4 py-3 text-left">Notes</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF2F7]">
                  {items.map((it, idx) => (
                    <tr
                      key={it._id}
                      className={`${
                        idx % 2 === 0 ? "bg-white" : "bg-[#F9FAFB]"
                      } hover:bg-[#F1F5F9] transition`}
                    >
                      <td className="px-4 py-3 font-medium text-[#0B214A]">
                        {officerMap[it.officer?._id || it.officer]?.name ||
                          it.officer?.name ||
                          "—"}
                      </td>
                      <td className="px-4 py-3">
                        {it.date
                          ? new Date(it.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : ""}
                      </td>
                      <td className="px-4 py-3">{it.shift}</td>
                      <td className="px-4 py-3">{it.location || "—"}</td>
                      <td
                        className="px-4 py-3 max-w-xs truncate"
                        title={it.notes}
                      >
                        {it.notes || "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => remove(it._id)}
                          className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 transition text-sm"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
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
