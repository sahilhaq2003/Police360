import React, { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate, useLocation } from "react-router-dom";

const complaintTypes = ["Theft", "Assault", "Fraud", "Harassment", "Other"];

export default function FileComplaint() {
  const navigate = useNavigate();
  const location = useLocation();
  const openedFromHome = location?.state?.fromHome === true;

  const [form, setForm] = useState({
    complainant: { name: "", address: "", phone: "", email: "" },
    complaintDetails: {
      typeOfComplaint: "",
      incidentDate: "",
      location: "",
      description: "",
    },
    attachments: [],
  });

  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(false);

  function onChange(path, value) {
    const keys = path.split(".");
    setForm((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      let cur = copy;
      for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
      cur[keys[keys.length - 1]] = value;
      return copy;
    });
  }

  function handleFile(e) {
    const files = Array.from(e.target.files);
    Promise.all(
      files.map(
        (f) =>
          new Promise((res, rej) => {
            const reader = new FileReader();
            reader.onload = () => res(reader.result);
            reader.onerror = rej;
            reader.readAsDataURL(f);
          })
      )
    )
      .then((data) =>
        setForm((prev) => ({
          ...prev,
          attachments: data,
        }))
      )
      .catch(() => {});
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setBanner(null);

    try {
      const res = await axiosInstance.post("/cases", form);
      if (res?.data?.success) {
        setBanner({
          type: "success",
          message: "Your complaint has been submitted successfully.",
        });
        setForm({
          complainant: { name: "", address: "", phone: "", email: "" },
          complaintDetails: {
            typeOfComplaint: "",
            incidentDate: "",
            location: "",
            description: "",
          },
          attachments: [],
        });
        if (!openedFromHome) navigate("/officer/cases");
      } else {
        setBanner({ type: "error", message: "Failed to submit complaint." });
      }
    } catch (err) {
      setBanner({
        type: "error",
        message: err?.response?.data?.message || "Failed to submit complaint.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="mx-auto max-w-3xl bg-white rounded-2xl shadow p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800">
            File Criminal Complaint
          </h1>
          {openedFromHome && (
            <button
              onClick={() => navigate(-1)}
              className="text-sm text-slate-500 hover:underline"
            >
              Close
            </button>
          )}
        </div>

        {banner && (
          <div
            className={`mb-6 rounded-xl px-4 py-3 text-sm ${
              banner.type === "success"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}
          >
            {banner.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Instructions */}
          <p className="text-sm text-slate-600">
            Please provide as many details as possible. Your submission will be
            reviewed by IT and assigned to an officer.
          </p>

          {/* Complainant Details */}
          <div>
            <h3 className="font-medium text-slate-700 mb-2">Complainant</h3>
            <div className="grid grid-cols-1 gap-3">
              <input
                value={form.complainant.name}
                onChange={(e) => onChange("complainant.name", e.target.value)}
                placeholder="Full Name"
                className="border p-3 rounded-lg text-sm focus:ring focus:ring-indigo-200"
              />
              <input
                value={form.complainant.phone}
                onChange={(e) => onChange("complainant.phone", e.target.value)}
                placeholder="Phone"
                className="border p-3 rounded-lg text-sm focus:ring focus:ring-indigo-200"
              />
              <input
                value={form.complainant.email}
                onChange={(e) => onChange("complainant.email", e.target.value)}
                placeholder="Email"
                className="border p-3 rounded-lg text-sm focus:ring focus:ring-indigo-200"
              />
              <input
                value={form.complainant.address}
                onChange={(e) => onChange("complainant.address", e.target.value)}
                placeholder="Address"
                className="border p-3 rounded-lg text-sm focus:ring focus:ring-indigo-200"
              />
            </div>
          </div>

          {/* Complaint Details */}
          <div>
            <h3 className="font-medium text-slate-700 mb-2">Complaint</h3>
            <div className="grid grid-cols-1 gap-3">
              <select
                value={form.complaintDetails.typeOfComplaint}
                onChange={(e) =>
                  onChange("complaintDetails.typeOfComplaint", e.target.value)
                }
                className="border p-3 rounded-lg text-sm focus:ring focus:ring-indigo-200"
              >
                <option value="">Select type of complaint</option>
                {complaintTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={form.complaintDetails.incidentDate}
                onChange={(e) =>
                  onChange("complaintDetails.incidentDate", e.target.value)
                }
                className="border p-3 rounded-lg text-sm focus:ring focus:ring-indigo-200"
              />
              <input
                value={form.complaintDetails.location}
                onChange={(e) =>
                  onChange("complaintDetails.location", e.target.value)
                }
                placeholder="Incident Location"
                className="border p-3 rounded-lg text-sm focus:ring focus:ring-indigo-200"
              />
              <textarea
                value={form.complaintDetails.description}
                onChange={(e) =>
                  onChange("complaintDetails.description", e.target.value)
                }
                placeholder="Description"
                className="border p-3 rounded-lg text-sm focus:ring focus:ring-indigo-200 h-28"
              />
              <input
                type="file"
                multiple
                onChange={handleFile}
                className="text-sm"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-4 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-indigo-600 text-white py-3 font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Complaint"}
            </button>
            {openedFromHome && (
              <button
                type="button"
                onClick={() =>
                  setForm({
                    complainant: { name: "", address: "", phone: "", email: "" },
                    complaintDetails: {
                      typeOfComplaint: "",
                      incidentDate: "",
                      location: "",
                      description: "",
                    },
                    attachments: [],
                  })
                }
                className="px-4 py-2 text-sm text-slate-600 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
