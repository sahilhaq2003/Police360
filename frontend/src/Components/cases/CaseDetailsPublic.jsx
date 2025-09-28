import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import PoliceHeader from "../PoliceHeader/PoliceHeader";

function LabelRow({ label, children }) {
  return (
    <div className="grid grid-cols-12 gap-3 py-2">
      <div className="col-span-4 md:col-span-3 text-sm font-medium text-slate-600">
        {label}
      </div>
      <div className="col-span-8 md:col-span-9 text-sm text-slate-900">
        {children ?? "—"}
      </div>
    </div>
  );
}

export default function CaseDetailsPublic() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [c, setC] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/cases/${id}`);
        setC(res.data?.data || res.data);
      } catch (e) {
        setErr(e?.response?.data?.message || e?.message || "Failed to load case");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (err)
    return (
      <div className="p-6 text-rose-600">
        {err}
        <button
          onClick={() => navigate(-1)}
          className="ml-4 px-3 py-1 border rounded"
        >
          Back
        </button>
      </div>
    );
  if (!c) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC] text-[#0B214A]">
      <PoliceHeader />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6 text-center">Complaint Status</h1>

        <div className="rounded-2xl border border-[#EEF2F7] bg-white p-6 shadow">
          <LabelRow label="Complaint Type">{c.complaintDetails?.typeOfComplaint}</LabelRow>
          <LabelRow label="Location">{c.complaintDetails?.location}</LabelRow>
          <LabelRow label="Description">{c.complaintDetails?.description}</LabelRow>
          <LabelRow label="Priority">{c.priority || "—"}</LabelRow>
          <LabelRow label="Current Status">{c.status || "—"}</LabelRow>
          <LabelRow label="Reported At">
            {c.createdAt ? new Date(c.createdAt).toLocaleString() : "—"}
          </LabelRow>
          <LabelRow label="Last Updated">
            {c.updatedAt ? new Date(c.updatedAt).toLocaleString() : "—"}
          </LabelRow>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 border rounded"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
