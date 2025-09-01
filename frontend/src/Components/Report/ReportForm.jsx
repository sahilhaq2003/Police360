// src/pages/ReportFormWizard.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../../utils/axiosInstance";

// ---- helpers
const fmtBytes = (b) => `${(b / (1024 * 1024)).toFixed(2)} MB`;
const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function ReportFormWizard() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);

  // wizard step: 0 = Data Entry, 1 = Attachments
  const [step, setStep] = useState(0);

  // Get report type from URL or location state
  const reportType = location.state?.reportType || "eCrime";

  const [formData, setFormData] = useState({
    reportType,
    reporterName: "",
    reporterEmail: "",
    reporterPhone: "",
    reporterAddress: "",
    reporterIdNumber: "",
    reporterIdType: "National ID",
    incidentDate: "",
    incidentLocation: "",
    incidentDescription: "",
    estimatedLoss: 0,
    insuranceInvolved: false,
    insuranceDetails: {
      company: "",
      policyNumber: "",
      contactPerson: "",
      contactPhone: "",
    },
    isConfidential: false,
    priority: "Medium",
  });

  const [witnesses, setWitnesses] = useState([]);
  const [suspects, setSuspects] = useState([]);
  const [evidence, setEvidence] = useState([]); // {file,type,description,fileName,fileSize}
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // inline small forms
  const [witnessForm, setWitnessForm] = useState({ name: "", phone: "", address: "" });
  const [suspectForm, setSuspectForm] = useState({ name: "", description: "", address: "" });

  // test backend on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/api/reports/test");
        console.log("Backend connection test:", res.data);
      } catch (e) {
        console.error("Backend connection test failed:", e);
      }
    })();
  }, []);

  // ----------- handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleInsuranceChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({
      ...p,
      insuranceDetails: { ...p.insuranceDetails, [name]: value },
    }));
  };

  const handleWitnessChange = (e) => {
    const { name, value } = e.target;
    setWitnessForm((p) => ({ ...p, [name]: value }));
  };
  const handleSuspectChange = (e) => {
    const { name, value } = e.target;
    setSuspectForm((p) => ({ ...p, [name]: value }));
  };

  const addWitness = () => {
    if (!witnessForm.name || !witnessForm.phone) return;
    setWitnesses((p) => [...p, { ...witnessForm }]);
    setWitnessForm({ name: "", phone: "", address: "" });
  };
  const removeWitness = (idx) => setWitnesses((p) => p.filter((_, i) => i !== idx));

  const addSuspect = () => {
    if (!suspectForm.name) return;
    setSuspects((p) => [...p, { ...suspectForm }]);
    setSuspectForm({ name: "", description: "", address: "" });
  };
  const removeSuspect = (idx) => setSuspects((p) => p.filter((_, i) => i !== idx));

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    let next = [...evidence];

    for (const f of files) {
      if (next.length >= MAX_FILES) break;
      if (f.size > MAX_FILE_SIZE) {
        alert(`"${f.name}" exceeds 10MB limit and was skipped.`);
        continue;
      }
      next.push({
        file: f,
        type: "Other",
        description: "",
        fileName: f.name,
        fileSize: f.size,
      });
    }
    setEvidence(next);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const updateEvidenceMeta = (idx, key, value) => {
    setEvidence((prev) => prev.map((it, i) => (i === idx ? { ...it, [key]: value } : it)));
  };
  const removeEvidence = (idx) => setEvidence((p) => p.filter((_, i) => i !== idx));

  // ---------- validation for STEP 0 only (data entry)
  const validateDataEntry = () => {
    const newErrors = {};
    if (!formData.reporterName) newErrors.reporterName = "Reporter name is required";
    if (!formData.reporterEmail) newErrors.reporterEmail = "Email is required";
    if (!formData.reporterPhone) newErrors.reporterPhone = "Phone number is required";
    if (!formData.reporterAddress) newErrors.reporterAddress = "Address is required";
    if (!formData.reporterIdNumber) newErrors.reporterIdNumber = "ID number is required";
    if (!formData.incidentDate) newErrors.incidentDate = "Incident date is required";
    if (!formData.incidentLocation) newErrors.incidentLocation = "Incident location is required";
    if (!formData.incidentDescription) newErrors.incidentDescription = "Incident description is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ---------- step transitions
  const goNext = () => {
    if (step === 0) {
      if (!validateDataEntry()) return;
      setStep(1);
    }
  };
  const goPrev = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  // ---------- final submit (STEP 1 → POST)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submitData = new FormData();

      // form data
      Object.keys(formData).forEach((key) => {
        if (key === "insuranceDetails") {
          submitData.append(key, JSON.stringify(formData[key]));
        } else if (key === "incidentDate") {
          const d = new Date(formData[key]);
          submitData.append(key, d.toISOString());
        } else {
          submitData.append(key, formData[key]);
        }
      });

      submitData.append("witnesses", JSON.stringify(witnesses));
      submitData.append("suspects", JSON.stringify(suspects));

      evidence.forEach((item, index) => {
        submitData.append("files", item.file);
        submitData.append(`evidence[${index}][type]`, item.type);
        submitData.append(`evidence[${index}][description]`, item.description);
      });

      const res = await axios.post("/api/reports", submitData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 30000,
      });

      if (res.data?.success) {
        navigate("/report-success", {
          state: {
            reportNumber: res.data.data?.reportNumber,
            reportType: formData.reportType,
          },
          replace: true,
        });
      } else {
        throw new Error(res.data?.message || "Failed to submit report");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      let msg = "Error submitting report. Please try again.";
      if (error.response) msg = error.response.data?.message || msg;
      else if (error.request) msg = "Network error. Please check your connection and try again.";
      else msg = error.message || msg;
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  // ---------- UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50">
      {/* Top bar */}
      <div className="border-b bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {step === 0 ? "New Request · Data Entry" : "New Request · Attach Documents"}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {step === 0
              ? "Fill out the incident and reporter details."
              : "Attach the necessary documents and submit your report."}
          </p>
        </div>
      </div>

      <form
        onSubmit={step === 1 ? handleSubmit : (e) => e.preventDefault()}
        className="mx-auto max-w-6xl px-4 py-8"
      >
        {/* Stepper */}
        <WizardStepper step={step} />

        {/* Report meta */}
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <FieldGroup label="Report Type *">
            <select
              name="reportType"
              value={formData.reportType}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-800 shadow-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 disabled:opacity-60"
              required
              disabled={step === 1}
            >
              <option value="eCrime">eCrime</option>
              <option value="Tourist Police">Tourist Police</option>
              <option value="Police Report Inquiry">Police Report Inquiry</option>
              <option value="File Criminal Complaint">File Criminal Complaint</option>
              <option value="Criminal Status of Financial Cases">Criminal Status of Financial Cases</option>
              <option value="Unknown Accident Report">Unknown Accident Report</option>
              <option value="Reporting Vehicle Obstruction">Reporting Vehicle Obstruction</option>
              <option value="Traffic Violations Copy">Traffic Violations Copy</option>
              <option value="Change Vehicle Color">Change Vehicle Color</option>
              <option value="Traffic Fines Installment">Traffic Fines Installment</option>
              <option value="Event Permit">Event Permit</option>
              <option value="Photography Permit">Photography Permit</option>
              <option value="Sailing Permit">Sailing Permit</option>
              <option value="Road Closure Permit">Road Closure Permit</option>
              <option value="Detainee Visit Request">Detainee Visit Request</option>
              <option value="Police Museum Visit Permit">Police Museum Visit Permit</option>
              <option value="Inmate Visit Permit">Inmate Visit Permit</option>
              <option value="Traffic Status Certificate">Traffic Status Certificate</option>
              <option value="Lost Item Certificate">Lost Item Certificate</option>
              <option value="Gold Management Platform">Gold Management Platform</option>
              <option value="Human Trafficking Victims">Human Trafficking Victims</option>
              <option value="File a Labor Complaint">File a Labor Complaint</option>
              <option value="Child and Women Protection">Child and Women Protection</option>
              <option value="Home Security">Home Security</option>
              <option value="Suggestion">Suggestion</option>
              <option value="Feedback">Feedback</option>
            </select>
          </FieldGroup>

          <FieldGroup label="Priority">
            <select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-800 shadow-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 disabled:opacity-60"
              disabled={step === 1}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </FieldGroup>
        </div>

        {/* STEP CONTENT */}
        {step === 0 ? (
          <>
            <Section title="Reporter Information">
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Full Name *" name="reporterName" value={formData.reporterName} onChange={handleInputChange} error={errors.reporterName} />
                <Input label="Email *" type="email" name="reporterEmail" value={formData.reporterEmail} onChange={handleInputChange} error={errors.reporterEmail} />
                <Input label="Phone Number *" name="reporterPhone" value={formData.reporterPhone} onChange={handleInputChange} error={errors.reporterPhone} />
                <Select
                  label="ID Type *"
                  name="reporterIdType"
                  value={formData.reporterIdType}
                  onChange={handleInputChange}
                  options={["National ID", "Passport", "Driving License", "Other"]}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="ID Number *" name="reporterIdNumber" value={formData.reporterIdNumber} onChange={handleInputChange} error={errors.reporterIdNumber} />
                <Textarea label="Address *" name="reporterAddress" rows={3} value={formData.reporterAddress} onChange={handleInputChange} error={errors.reporterAddress} />
              </div>
            </Section>

            <Section title="Incident Details">
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                label="Incident Date *"
                type="datetime-local"
                name="incidentDate"
                value={formData.incidentDate}
                onChange={handleInputChange}
                error={errors.incidentDate}
                min={new Date().toISOString().slice(0, 16)}   // block past dates
/>
                <Input label="Estimated Loss (if any)" type="number" name="estimatedLoss" min="0" value={formData.estimatedLoss} onChange={handleInputChange} />
              </div>
              <Input label="Incident Location *" name="incidentLocation" value={formData.incidentLocation} onChange={handleInputChange} error={errors.incidentLocation} />
              <Textarea
                label="Incident Description *"
                name="incidentDescription"
                rows={5}
                placeholder="Please provide a detailed description of the incident..."
                value={formData.incidentDescription}
                onChange={handleInputChange}
                error={errors.incidentDescription}
              />
            </Section>

            <Section title="Witnesses (Optional)">
              {witnesses.length > 0 && (
                <div className="mb-4 divide-y rounded-xl border border-slate-200 bg-white/80 shadow-sm">
                  {witnesses.map((w, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3">
                      <div className="text-sm text-slate-700">
                        <span className="font-medium text-slate-900">{w.name}</span> — {w.phone}
                        {w.address ? <span className="text-slate-500">, {w.address}</span> : null}
                      </div>
                      <button type="button" onClick={() => removeWitness(i)} className="text-sm font-medium text-red-600 hover:text-red-700">
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="grid gap-3 md:grid-cols-3">
                <input
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 shadow-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                  placeholder="Witness Name"
                  value={witnessForm.name}
                  onChange={(e) => handleWitnessChange({ target: { name: "name", value: e.target.value } })}
                />
                <input
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 shadow-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                  placeholder="Phone Number"
                  value={witnessForm.phone}
                  onChange={(e) => handleWitnessChange({ target: { name: "phone", value: e.target.value } })}
                />
                <div className="flex gap-3">
                  <input
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 shadow-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    placeholder="Address (optional)"
                    value={witnessForm.address}
                    onChange={(e) => handleWitnessChange({ target: { name: "address", value: e.target.value } })}
                  />
                  <button type="button" onClick={addWitness} className="shrink-0 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white shadow-sm hover:bg-blue-700">
                    Add
                  </button>
                </div>
              </div>
            </Section>

            <Section title="Suspects (Optional)">
              {suspects.length > 0 && (
                <div className="mb-4 divide-y rounded-xl border border-slate-200 bg-white/80 shadow-sm">
                  {suspects.map((s, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3">
                      <div className="text-sm text-slate-700">
                        <span className="font-medium text-slate-900">{s.name}</span>
                        {s.description ? <span className="text-slate-500"> — {s.description}</span> : null}
                        {s.address ? <span className="text-slate-500">, {s.address}</span> : null}
                      </div>
                      <button type="button" onClick={() => removeSuspect(i)} className="text-sm font-medium text-red-600 hover:text-red-700">
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="grid gap-3 md:grid-cols-3">
                <input
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 shadow-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                  placeholder="Suspect Name"
                  value={suspectForm.name}
                  onChange={(e) => handleSuspectChange({ target: { name: "name", value: e.target.value } })}
                />
                <input
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 shadow-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                  placeholder="Description"
                  value={suspectForm.description}
                  onChange={(e) => handleSuspectChange({ target: { name: "description", value: e.target.value } })}
                />
                <div className="flex gap-3">
                  <input
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 shadow-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    placeholder="Address (optional)"
                    value={suspectForm.address}
                    onChange={(e) => handleSuspectChange({ target: { name: "address", value: e.target.value } })}
                  />
                  <button type="button" onClick={addSuspect} className="shrink-0 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white shadow-sm hover:bg-blue-700">
                    Add
                  </button>
                </div>
              </div>
            </Section>
          </>
        ) : (
          <>
            <Section title="Attach Documents">
              <div className="grid gap-4 md:grid-cols-2">
                <FieldGroup label="Attachment Type">
                  <select
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 shadow-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    onChange={(e) => {
                      const t = e.target.value;
                      setEvidence((prev) => prev.map((x) => ({ ...x, type: t })));
                    }}
                    defaultValue="Other"
                  >
                    <option>Acrobat (PDF)</option>
                    <option>Image (JPG/PNG)</option>
                    <option>Video</option>
                    <option>Audio</option>
                    <option>Other</option>
                  </select>
                </FieldGroup>

                <FieldGroup label="Attachment Description">
                  <input
                    placeholder="Complete contact document description..."
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 shadow-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    onChange={(e) => {
                      const v = e.target.value;
                      setEvidence((prev) => prev.map((x) => ({ ...x, description: v })));
                    }}
                  />
                </FieldGroup>
              </div>

              <div className="mt-4">
                <div
                  className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white/70 p-4 shadow-sm hover:border-slate-400"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileUpload}
                    multiple
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                    className="block w-full text-sm text-slate-700 file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2.5 file:font-medium file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <span className="text-xs text-slate-500">
                    Maximum {MAX_FILES} files, 10MB each. Supported: Images, Videos, Audio, PDF, DOC
                  </span>
                </div>
              </div>

              {evidence.length > 0 && (
                <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white/80 shadow-sm">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50/80">
                      <tr>
                        <Th>Document Title</Th>
                        <Th>Type</Th>
                        <Th>Size</Th>
                        <Th>Description</Th>
                        <Th className="text-right">Actions</Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {evidence.map((item, idx) => (
                        <tr key={idx} className="bg-white/70">
                          <Td className="font-medium text-slate-900">{item.fileName}</Td>
                          <Td>
                            <select
                              value={item.type}
                              onChange={(e) => updateEvidenceMeta(idx, "type", e.target.value)}
                              className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                            >
                              <option>Acrobat (PDF)</option>
                              <option>Image (JPG/PNG)</option>
                              <option>Video</option>
                              <option>Audio</option>
                              <option>Other</option>
                            </select>
                          </Td>
                          <Td className="tabular-nums">{fmtBytes(item.fileSize)}</Td>
                          <Td>
                            <input
                              value={item.description}
                              onChange={(e) => updateEvidenceMeta(idx, "description", e.target.value)}
                              className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                              placeholder="Short description…"
                            />
                          </Td>
                          <Td className="text-right">
                            <button type="button" onClick={() => removeEvidence(idx)} className="text-sm font-medium text-red-600 hover:text-red-700">
                              Delete
                            </button>
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Section>

            <Section title="Insurance (Optional)">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  name="insuranceInvolved"
                  checked={formData.insuranceInvolved}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                />
                <span className="text-sm text-slate-700">Insurance is involved</span>
              </label>

              {formData.insuranceInvolved && (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Input label="Insurance Company" name="company" value={formData.insuranceDetails.company} onChange={handleInsuranceChange} />
                  <Input label="Policy Number" name="policyNumber" value={formData.insuranceDetails.policyNumber} onChange={handleInsuranceChange} />
                  <Input label="Contact Person" name="contactPerson" value={formData.insuranceDetails.contactPerson} onChange={handleInsuranceChange} />
                  <Input label="Contact Phone" name="contactPhone" value={formData.insuranceDetails.contactPhone} onChange={handleInsuranceChange} />
                </div>
              )}
            </Section>

            <div className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isConfidential"
                  checked={formData.isConfidential}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                />
                <span className="text-sm text-slate-700">Mark this report as confidential</span>
              </label>
            </div>
          </>
        )}

        {/* Footer actions */}
        <div className="sticky bottom-4 z-10 mt-8">
          <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={step === 0 ? () => navigate(-1) : goPrev}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              >
                {step === 0 ? "Cancel" : "Previous"}
              </button>

              <div className="flex items-center gap-3">
                {step === 0 ? (
                  <button
                    type="button"
                    onClick={goNext}
                    className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white shadow-sm transition hover:bg-blue-700"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-emerald-600 px-5 py-2.5 font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {loading ? "Submitting..." : "Submit Report"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

/* ---------- UI atoms ---------- */
function WizardStepper({ step }) {
  const stages = [
    { name: "Data entry", active: step === 0, done: step > 0 },
    { name: "Attachments", active: step === 1, done: false },
  ];
  return (
    <div className="mb-8">
      <ol className="relative grid grid-cols-2 items-center gap-4">
        {stages.map((s, i) => (
          <li key={s.name} className="group relative flex items-center gap-3">
            {/* Number bubble */}
            <div
              className={[
                "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ring-1 ring-inset",
                "focus:outline-none focus:ring-0",                 // <-- add
                s.active
                  ? "bg-blue-600 text-white ring-blue-600"
                  : s.done
                  ? "bg-emerald-600 text-white ring-emerald-600"
                  : "bg-white text-slate-700 ring-slate-300",
              ].join(" ")}
              tabIndex={-1} // optional: prevents default focus on click
            >
              {i + 1}
            </div>

            {/* Label chip */}
            <div
              className={[
                "relative z-10 rounded-lg border px-3 py-2 text-sm",
                "focus:outline-none focus:ring-0",                 // <-- add
                s.active
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : s.done
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-600",
              ].join(" ")}
            >
              <span className="font-medium">{s.name}</span>
            </div>

            {/* Connector line */}
            {i === 0 && (
              <span
                className={[
                  "pointer-events-none absolute left-[calc(2.25rem+0.75rem)] top-1/2",
                  "hidden h-0.5 w-[calc(100%-3.5rem)] -translate-y-1/2 md:block",
                  "z-0",                                            // <-- keep behind labels
                  s.done ? "bg-emerald-300" : s.active ? "bg-blue-300" : "bg-slate-200",
                ].join(" ")}
              />
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}


function Section({ title, children }) {
  return (
    <section className="mb-6 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
      <h3 className="mb-4 text-base font-semibold tracking-tight text-slate-900">{title}</h3>
      {children}
    </section>
  );
}

function FieldGroup({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );
}

function Input({ label, error, ...props }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <input
        className={[
          "w-full rounded-lg border bg-white px-3 py-2.5 text-slate-800 shadow-sm outline-none transition",
          error ? "border-red-400 focus:border-red-600 focus:ring-2 focus:ring-red-600/20"
                : "border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20",
        ].join(" ")}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function Textarea({ label, error, rows = 4, ...props }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <textarea
        rows={rows}
        className={[
          "w-full rounded-lg border bg-white px-3 py-2.5 text-slate-800 shadow-sm outline-none transition",
          error ? "border-red-400 focus:border-red-600 focus:ring-2 focus:ring-red-600/20"
                : "border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20",
        ].join(" ")}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function Select({ label, options = [], ...props }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <select
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-800 shadow-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
        {...props}
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function Th({ children, className = "" }) {
  return (
    <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 ${className}`}>
      {children}
    </th>
  );
}
function Td({ children, className = "" }) {
  return <td className={`px-4 py-3 text-sm text-slate-700 ${className}`}>{children}</td>;
}
