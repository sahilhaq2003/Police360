import React, { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate, useLocation } from "react-router-dom";

const complaintTypes = ["Theft", "Assault", "Fraud", "Harassment", "Other"];
const idTypes = ["National ID", "Passport", "Driver's License", "Voter ID", "Other"];
const priorityOptions = ["LOW", "MEDIUM", "HIGH"];

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
    idInfo: { idType: "", idValue: "" },
    priority: "MEDIUM",
    estimatedLoss: "",
    additionalInfo: {
      witnesses: [],
      suspects: [],
      evidence: [],
    },
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

  function handleAdditionalFiles(path, e) {
    const files = Array.from(e.target.files || []);
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
      .then((data) => {
        const keys = path.split(".");
        setForm((prev) => {
          const copy = JSON.parse(JSON.stringify(prev));
          let cur = copy;
          for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
          const last = keys[keys.length - 1];
          cur[last] = cur[last] ? cur[last].concat(data) : data;
          return copy;
        });
      })
      .catch(() => {});
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setBanner(null);

    try {
      const res = await axiosInstance.post("/cases", form);
      if (res?.data?.success) {
        navigate("/report-success", { state: { reportNumber: res.data.id } });
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

  function handleClear() {
    if (window.confirm("Are you sure you want to clear the form?")) {
      setForm({
        complainant: { name: "", address: "", phone: "", email: "" },
        complaintDetails: {
          typeOfComplaint: "",
          incidentDate: "",
          location: "",
          description: "",
        },
        attachments: [],
        idInfo: { idType: "", idValue: "" },
        priority: "MEDIUM",
        estimatedLoss: "",
        additionalInfo: {
          witnesses: [],
          suspects: [],
          evidence: [],
        },
      });
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 py-10 px-4">
      <div className="mx-auto max-w-4xl bg-white rounded-2xl shadow-xl border border-slate-200 p-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800">
            File a Criminal Complaint
          </h1>
          <button
            onClick={() => (openedFromHome ? navigate(-1) : navigate("/"))}
            className="text-sm text-slate-500 hover:text-slate-700 transition"
          >
            ✕ Close
          </button>
        </div>

        {/* Banner */}
        {banner && (
          <div
            className={`mb-6 rounded-lg px-4 py-3 text-sm font-medium ${
              banner.type === "success"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}
          >
            {banner.message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Instructions */}
          <p className="text-slate-600 text-sm">
            Please provide as many details as possible. Your submission will be
            reviewed by IT and assigned to an officer.
          </p>

          {/* Section: Complainant */}
          <section>
            <h3 className="text-lg font-semibold text-slate-700 mb-3">
              Complainant Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                value={form.complainant.name}
                onChange={(e) => onChange("complainant.name", e.target.value)}
                placeholder="Full Name"
                className={inputField}
              />
              <input
                value={form.complainant.phone}
                onChange={(e) => onChange("complainant.phone", e.target.value)}
                placeholder="Phone"
                className={inputField}
              />
              <input
                value={form.complainant.email}
                onChange={(e) => onChange("complainant.email", e.target.value)}
                placeholder="Email"
                className={inputField}
              />
              <input
                value={form.complainant.address}
                onChange={(e) => onChange("complainant.address", e.target.value)}
                placeholder="Address"
                className={`${inputField} md:col-span-2`}
              />
              <select
                value={form.idInfo.idType}
                onChange={(e) => onChange("idInfo.idType", e.target.value)}
                className={inputField}
              >
                <option value="">Select ID type (optional)</option>
                {idTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <input
                value={form.idInfo.idValue}
                onChange={(e) => onChange("idInfo.idValue", e.target.value)}
                placeholder="ID Number (optional)"
                className={inputField}
              />
              <select
                value={form.priority}
                onChange={(e) => onChange("priority", e.target.value)}
                className={inputField}
              >
                {priorityOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <input
                value={form.estimatedLoss}
                onChange={(e) => onChange("estimatedLoss", e.target.value)}
                placeholder="Estimated loss (optional)"
                className={inputField}
              />
            </div>
          </section>

          

          {/* Section: Complaint */}
          <section>
            <h3 className="text-lg font-semibold text-slate-700 mb-3">
              Complaint Details
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <select
                value={form.complaintDetails.typeOfComplaint}
                onChange={(e) =>
                  onChange("complaintDetails.typeOfComplaint", e.target.value)
                }
                className={inputField}
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
                className={inputField}
              />
              <input
                value={form.complaintDetails.location}
                onChange={(e) =>
                  onChange("complaintDetails.location", e.target.value)
                }
                placeholder="Incident Location"
                className={inputField}
              />
              <textarea
                value={form.complaintDetails.description}
                onChange={(e) =>
                  onChange("complaintDetails.description", e.target.value)
                }
                placeholder="Description"
                className={`${inputField} h-28`}
              />
              <input type="file" multiple onChange={handleFile} />
            </div>
          </section>

          

          {/* Section: Additional Info */}
          <section>
            <h3 className="text-lg font-semibold text-slate-700 mb-3">
              Additional Information (Optional)
            </h3>

            {/* Witnesses */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-slate-600">Witnesses</h4>
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      additionalInfo: {
                        ...prev.additionalInfo,
                        witnesses: [
                          ...(prev.additionalInfo.witnesses || []),
                          { name: "", phone: "", id: "" },
                        ],
                      },
                    }))
                  }
                  className={btnSecondary}
                >
                  + Add
                </button>
              </div>
              {(form.additionalInfo.witnesses || []).map((w, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 gap-2 border border-slate-200 rounded-lg p-4 mb-3 bg-slate-50"
                >
                  <input
                    value={w.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setForm((prev) => {
                        const copy = JSON.parse(JSON.stringify(prev));
                        copy.additionalInfo.witnesses[idx].name = val;
                        return copy;
                      });
                    }}
                    placeholder="Name"
                    className={inputField}
                  />
                  <input
                    value={w.phone}
                    onChange={(e) => {
                      const val = e.target.value;
                      setForm((prev) => {
                        const copy = JSON.parse(JSON.stringify(prev));
                        copy.additionalInfo.witnesses[idx].phone = val;
                        return copy;
                      });
                    }}
                    placeholder="Phone"
                    className={inputField}
                  />
                  <input
                    value={w.id}
                    onChange={(e) => {
                      const val = e.target.value;
                      setForm((prev) => {
                        const copy = JSON.parse(JSON.stringify(prev));
                        copy.additionalInfo.witnesses[idx].id = val;
                        return copy;
                      });
                    }}
                    placeholder="ID (optional)"
                    className={inputField}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => {
                        const copy = JSON.parse(JSON.stringify(prev));
                        copy.additionalInfo.witnesses.splice(idx, 1);
                        return copy;
                      })
                    }
                    className="text-sm text-rose-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Suspects */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-slate-600">Suspects</h4>
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      additionalInfo: {
                        ...prev.additionalInfo,
                        suspects: [
                          ...(prev.additionalInfo.suspects || []),
                          { name: "", appearance: "", photos: [] },
                        ],
                      },
                    }))
                  }
                  className={btnSecondary}
                >
                  + Add
                </button>
              </div>
              {(form.additionalInfo.suspects || []).map((s, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 gap-2 border border-slate-200 rounded-lg p-4 mb-3 bg-slate-50"
                >
                  <input
                    value={s.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setForm((prev) => {
                        const copy = JSON.parse(JSON.stringify(prev));
                        copy.additionalInfo.suspects[idx].name = val;
                        return copy;
                      });
                    }}
                    placeholder="Name"
                    className={inputField}
                  />
                  <textarea
                    value={s.appearance}
                    onChange={(e) => {
                      const val = e.target.value;
                      setForm((prev) => {
                        const copy = JSON.parse(JSON.stringify(prev));
                        copy.additionalInfo.suspects[idx].appearance = val;
                        return copy;
                      });
                    }}
                    placeholder="Appearance"
                    className={`${inputField} h-20`}
                  />
                  <input
                    type="file"
                    multiple
                    onChange={(e) =>
                      handleAdditionalFiles(
                        `additionalInfo.suspects.${idx}.photos`,
                        e
                      )
                    }
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => {
                        const copy = JSON.parse(JSON.stringify(prev));
                        copy.additionalInfo.suspects.splice(idx, 1);
                        return copy;
                      })
                    }
                    className="text-sm text-rose-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Evidence */}
            <div>
              <h4 className="font-medium text-slate-600 mb-2">
                Evidence (images/videos)
              </h4>
              <input
                type="file"
                multiple
                onChange={(e) =>
                  handleAdditionalFiles("additionalInfo.evidence", e)
                }
              />
              <p className="mt-2 text-sm text-slate-500">
                Upload optional evidence files. Images and short videos are
                supported.
              </p>
            </div>
          </section>

          {/* Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-indigo-600 text-white py-3 font-semibold hover:bg-indigo-700 disabled:opacity-50 shadow-md transition"
            >
              {loading ? "Submitting..." : "Submit Complaint"}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="px-6 py-3 rounded-xl border border-slate-300 text-slate-600 font-medium hover:bg-slate-100 transition"
            >
              Clear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* Tailwind reusable styles */
const inputField =
  "w-full rounded-lg border border-slate-400 bg-slate-50 px-3 py-2 text-sm shadow-sm " +
  "focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 focus:bg-white outline-none transition";

const btnSecondary =
  "text-sm text-indigo-600 hover:text-indigo-800 font-medium transition";
