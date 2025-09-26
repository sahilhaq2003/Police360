import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import PoliceHeader from "../PoliceHeader/PoliceHeader";
import {
  CalendarDays,
  MapPin,
  Clock,
  ClipboardList,
  ArrowLeft,
} from "lucide-react";

const OfficerCalendar = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const id =
          localStorage.getItem("userId") || sessionStorage.getItem("userId");
        if (!id) return navigate("/login");
        const res = await axiosInstance.get("/schedules", {
          params: { officer: id, page: 1, pageSize: 200 },
        });
        setItems(res.data?.data || []);
      } catch (e) {
        console.error("Error loading schedules:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F7FB] via-[#E9EEF5] to-[#F4F7FB] text-[#0B214A]">
      <PoliceHeader />

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#0B214A]">
              Duty Schedule
            </h1>
            <p className="text-sm text-[#5A6B85]">
              View your assigned shifts and duty notes
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0B214A] text-white hover:bg-[#123974] transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>

        {/* Schedule List */}
        <div className="p-6 rounded-2xl bg-white shadow-lg border border-[#E0E6F0]">
          {loading ? (
            <p className="text-sm text-[#5A6B85] animate-pulse">
              Loading duty schedule…
            </p>
          ) : items.length === 0 ? (
            <div className="text-center py-10">
              <CalendarDays className="w-10 h-10 mx-auto text-[#9AA7C2]" />
              <p className="mt-3 text-sm text-[#5A6B85]">
                No schedules assigned yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((it) => (
                <div
                  key={it._id}
                  className="px-5 py-4 rounded-xl border border-[#E5E9F2] bg-gradient-to-r from-[#F9FBFF] to-[#F2F6FB] hover:shadow-md transition"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    {/* Date & Shift */}
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#0B214A]">
                      <CalendarDays className="w-4 h-4 text-[#1D4ED8]" />
                      {it.date
                        ? new Date(it.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : ""}
                      <span className="mx-2">•</span>
                      <Clock className="w-4 h-4 text-[#059669]" />
                      {it.shift}
                    </div>

                    {/* Location */}
                    <div className="mt-2 md:mt-0 flex items-center gap-2 text-xs text-[#374151]">
                      <MapPin className="w-4 h-4 text-[#DC2626]" />
                      {it.location || "Location not specified"}
                    </div>
                  </div>

                  {/* Notes */}
                  {it.notes && (
                    <div className="mt-3 flex items-start gap-2 text-xs text-[#4B5563]">
                      <ClipboardList className="w-4 h-4 text-[#F59E0B]" />
                      <span>{it.notes}</span>
                    </div>
                  )}
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
