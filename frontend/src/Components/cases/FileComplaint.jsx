import React, { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate, useLocation } from "react-router-dom";
import Nav from '../Nav/Nav';
import hero from '../../assets/loginbg.jpg';
import Footer from "../Footer/Footer";

const complaintTypes = ["eCrime", "Tourist Police", "Police Report Inquiry", "File Complaint", "Criminal Status of Financial Cases", "Other"];
const idTypes = ["National ID", "Passport", "Driver's License", "Voter ID", "Other"];
const priorityOptions = ["LOW", "MEDIUM", "HIGH"];

export default function FileComplaint() {
  const navigate = useNavigate();
  const location = useLocation();
  const openedFromHome = location?.state?.fromHome === true;

  // previews store file objects for display: { name, url }
  const [previews, setPreviews] = useState({});

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
  const [validationErrors, setValidationErrors] = useState({});

  // prevent selecting future dates for incidentDate
  const today = new Date().toISOString().slice(0, 10);

  // Validation functions
  const validatePhoneNumber = (phone) => {
    if (!phone) return '';
    if (!phone.startsWith('07')) {
      return 'Phone number must start with 07';
    }
    if (phone.length !== 10) {
      return 'Phone number must have exactly 10 characters';
    }
    if (!/^\d+$/.test(phone)) {
      return 'Phone number must contain only digits';
    }
    return '';
  };

  const validateEmail = (email) => {
    if (!email) return '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validateEstimatedLoss = (amount) => {
    if (!amount) return '';
    if (!/^\d+$/.test(amount)) {
      return 'Estimated loss must contain only numbers';
    }
    return '';
  };

  // Helper function to clear validation errors
  const clearValidationError = (field) => {
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  // Enhanced onChange function with validation
  function onChangeWithValidation(path, value, validator = null) {
    const keys = path.split(".");
    setForm((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      let cur = copy;
      for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
      cur[keys[keys.length - 1]] = value;
      return copy;
    });

    // Clear validation error when user changes field
    clearValidationError(path);

    // Run validator if provided
    if (validator) {
      const error = validator(value);
      if (error) {
        setValidationErrors(prev => ({ ...prev, [path]: error }));
      }
    }
  }

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
    const files = Array.from(e.target.files || []);
    Promise.all(
      files.map(
        (f) =>
          new Promise((res, rej) => {
            const reader = new FileReader();
            reader.onload = (ev) => res({ name: f.name, url: ev.target.result });
            reader.onerror = rej;
            reader.readAsDataURL(f);
          })
      )
    )
      .then((fileObjs) => {
        // store only the data-urls in the form (backend expects data URLs)
        const urls = fileObjs.map((d) => d.url);
        setForm((prev) => ({
          ...prev,
          attachments: urls,
        }));
        // store preview objects for UI
        setPreviews((prev) => ({ ...prev, attachments: (prev.attachments || []).concat(fileObjs) }));
      })
      .catch(() => {});
  }

  function handleAdditionalFiles(path, e) {
    const files = Array.from(e.target.files || []);
    Promise.all(
      files.map(
        (f) =>
          new Promise((res, rej) => {
            const reader = new FileReader();
            reader.onload = (ev) => res({ name: f.name, url: ev.target.result });
            reader.onerror = rej;
            reader.readAsDataURL(f);
          })
      )
    )
      .then((fileObjs) => {
        // update the nested form array with just the urls
        const keys = path.split(".");
        // read the current array at path (if any)
        const getAtPath = (obj, keys) => {
          let cur = obj;
          for (let k of keys) {
            if (!cur) return undefined;
            cur = cur[k];
          }
          return cur;
        };

        const currentArr = getAtPath(form, keys) || [];
        const newUrls = currentArr.concat(fileObjs.map((d) => d.url));

        // set into form
        setForm((prev) => {
          const copy = JSON.parse(JSON.stringify(prev));
          let cur = copy;
          for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
          const last = keys[keys.length - 1];
          cur[last] = newUrls;
          return copy;
        });

        // set previews for this path (keep keyed by path string)
        setPreviews((prev) => ({ ...prev, [path]: (prev[path] || []).concat(fileObjs) }));
      })
      .catch(() => {});
  }

  function removeFile(path, index) {
    // remove from form (urls) and previews (objects)
    const keys = path.split(".");

    setForm((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      let cur = copy;
      for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
      const last = keys[keys.length - 1];
      if (Array.isArray(cur[last])) cur[last].splice(index, 1);
      return copy;
    });

    setPreviews((prev) => {
      const arr = prev[path] ? [...prev[path]] : [];
      arr.splice(index, 1);
      return { ...prev, [path]: arr };
    });
  }

  function renderPreviewGrid(path, extraClass = "") {
    const arr = previews[path] || [];
    if (!arr || arr.length === 0) return null;
    return (
      <div className={`mt-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 ${extraClass}`}>
        {arr.map((f, i) => (
          <div key={`${path}-${i}`} className="relative rounded-lg overflow-hidden border border-slate-200 bg-white/60 p-1">
            {String(f.url || f).startsWith("data:image") ? (
              <img src={f.url} alt={f.name} className="w-full h-24 object-cover rounded-md" />
            ) : (
              <div className="w-full h-24 flex items-center justify-center bg-slate-100 rounded-md text-xs p-2 text-slate-700">{f.name || 'file'}</div>
            )}
            <div className="mt-1 text-xs truncate px-1">{f.name}</div>
            <button
              type="button"
              onClick={() => removeFile(path, i)}
              className="absolute top-1 right-1 bg-white/80 rounded-full p-1 text-rose-600 hover:bg-white"
              title="Remove file"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setBanner(null);

    try {
      const res = await axiosInstance.post("/cases", form);
      if (res?.data?.success) {
        const newCase = res.data.data || res.data;
        const newCaseId = res.data.id || newCase._id || newCase.id;
        const editToken = res.data.editToken || newCase.editToken || null;
        // navigate to success page with id in URL and pass full report + editToken in state so user can view/edit without re-fetch
        navigate(`/report-success/${newCaseId}`, {
          state: { reportNumber: newCaseId, reportType: form.complaintDetails.typeOfComplaint, report: newCase, editToken },
        });
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
      setPreviews({});
    }
  }

  return (
    <div className="min-h-screen relative">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${hero})` }}
        aria-hidden
      />
      {/* Dim overlay to ensure readability */}
      <div className="absolute inset-0 bg-black/30" aria-hidden />

      {/* Content - placed above background */}
      <div className="relative z-10 py-10 px-4">
        <Nav /><br /><br />
  <div className="mt-8 mx-auto max-w-5xl bg-white/100 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/30 p-10">
        {/* Header */}
        <div className="mb-8 relative">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-[#0B214A] mb-6 text-center">Complaint Reporting Form</h1>
            <p className="text-sm text-slate-600 mt-1">Please provide the incident details below to file a complaint.</p>
          </div>
          <div className="absolute right-0 top-0">
            <button
              onClick={() => (openedFromHome ? navigate(-1) : navigate("/"))}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-slate-200 text-sm text-slate-700 hover:bg-slate-50"
            >
              ✕ Close
            </button>
          </div>
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
              <div>
                <input
                  value={form.complainant.phone}
                  onChange={(e) => onChangeWithValidation("complainant.phone", e.target.value, validatePhoneNumber)}
                  placeholder="Phone (07xxxxxxxx)"
                  className={`${inputField} ${validationErrors['complainant.phone'] ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
                />
                {validationErrors['complainant.phone'] && (
                  <p className="text-red-600 text-xs mt-1">{validationErrors['complainant.phone']}</p>
                )}
              </div>
              <div>
                <input
                  value={form.complainant.email}
                  onChange={(e) => onChangeWithValidation("complainant.email", e.target.value, validateEmail)}
                  placeholder="Email (must contain @ symbol)"
                  className={`${inputField} ${validationErrors['complainant.email'] ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
                />
                <p className="text-xs text-gray-500 mt-1">Hint: Make sure to include @ symbol in your email address</p>
                {validationErrors['complainant.email'] && (
                  <p className="text-red-600 text-xs mt-1">{validationErrors['complainant.email']}</p>
                )}
              </div>
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
                <option value="">Select ID type</option>
                {idTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <input
                value={form.idInfo.idValue}
                onChange={(e) => onChange("idInfo.idValue", e.target.value)}
                placeholder="ID Number"
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
              <div>
                <input
                  value={form.estimatedLoss}
                  onChange={(e) => onChangeWithValidation("estimatedLoss", e.target.value, validateEstimatedLoss)}
                  placeholder="Estimated loss - Rs.0 (numbers only)"
                  className={`${inputField} ${validationErrors['estimatedLoss'] ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
                />
                {validationErrors['estimatedLoss'] && (
                  <p className="text-red-600 text-xs mt-1">{validationErrors['estimatedLoss']}</p>
                )}
              </div>
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
                max={today}
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
              <h4 className="font-medium text-slate-600 mb-2">
                Location (images/videos) (Optional)
              </h4>
              <input type="file" className="block w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#0B214A] file:text-white hover:file:opacity-80 cursor-pointer" multiple onChange={handleFile} />
              {renderPreviewGrid('attachments')}
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
                  <div>
                    <input
                      value={w.phone}
                      onChange={(e) => {
                        const val = e.target.value;
                        // Clear validation error
                        clearValidationError(`witness_${idx}_phone`);
                        
                        setForm((prev) => {
                          const copy = JSON.parse(JSON.stringify(prev));
                          copy.additionalInfo.witnesses[idx].phone = val;
                          return copy;
                        });
                        
                        // Validate phone number
                        const error = validatePhoneNumber(val);
                        if (error) {
                          setValidationErrors(prev => ({ ...prev, [`witness_${idx}_phone`]: error }));
                        }
                      }}
                      placeholder="Phone (07xxxxxxxx)"
                      className={`${inputField} ${validationErrors[`witness_${idx}_phone`] ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
                    />
                    {validationErrors[`witness_${idx}_phone`] && (
                      <p className="text-red-600 text-xs mt-1">{validationErrors[`witness_${idx}_phone`]}</p>
                    )}
                  </div>
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
                    onClick={() => {
                      // Clear validation error for this witness before removing
                      clearValidationError(`witness_${idx}_phone`);
                      
                      setForm((prev) => {
                        const copy = JSON.parse(JSON.stringify(prev));
                        copy.additionalInfo.witnesses.splice(idx, 1);
                        return copy;
                      });
                    }}
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
                  <h4 className="font-medium text-slate-600 mb-2">
                    Suspects (images/videos) (Optional)
                  </h4>
                  <input
                    type="file"
                    className="block w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#0B214A] file:text-white hover:file:opacity-80 cursor-pointer"
                    multiple
                    onChange={(e) =>
                      handleAdditionalFiles(
                        `additionalInfo.suspects.${idx}.photos`,
                        e
                      )
                    }
                  />
                  {renderPreviewGrid(`additionalInfo.suspects.${idx}.photos`)}
                    <button
                      type="button"
                      onClick={() => {
                        // remove suspect at idx and shift previews keys accordingly
                        setForm((prev) => {
                          const copy = JSON.parse(JSON.stringify(prev));
                          copy.additionalInfo.suspects.splice(idx, 1);
                          return copy;
                        });

                        setPreviews((prev) => {
                          const next = { ...prev };
                          // move any suspect preview keys after idx down by 1
                          Object.keys(prev)
                            .filter((k) => k.startsWith('additionalInfo.suspects.'))
                            .forEach((k) => {
                              const m = k.match(/additionalInfo\.suspects\.(\d+)\.photos/);
                              if (!m) return;
                              const i = Number(m[1]);
                              if (i === idx) {
                                delete next[k];
                              } else if (i > idx) {
                                next[`additionalInfo.suspects.${i - 1}.photos`] = prev[k];
                                delete next[k];
                              }
                            });
                          return next;
                        });
                      }
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
                className="block w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#0B214A] file:text-white hover:file:opacity-80 cursor-pointer"
                multiple
                onChange={(e) =>
                  handleAdditionalFiles("additionalInfo.evidence", e)
                }
              />
              {renderPreviewGrid('additionalInfo.evidence')}
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
              className="flex-1 rounded-xl bg-[#0B214A] text-white py-3 font-semibold text-lg shadow hover:opacity-90 transition disabled:opacity-50 transition-colors duration-200"
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
      <br /><br /><br /><br />
      <Footer />
    </div>
  );
}

/* Tailwind reusable styles */
const inputField =
  "w-full rounded-lg border border-slate-300 bg-white/80 px-3 py-2 text-sm shadow-sm " +
  "focus:border-[#0B214A] focus:ring-2 focus:ring-[#0B214A] focus:bg-white outline-none transition";

const btnSecondary =
  "text-sm text-[#0B214A] hover:text-[#0B114C] font-medium transition";
