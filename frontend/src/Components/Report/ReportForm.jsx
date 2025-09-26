import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, User, MapPin, Phone, Mail, ShieldCheck } from "lucide-react";

function ReportForm() {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({
    reportType: "",
    priority: "Medium",
    reporterName: "",
    reporterEmail: "",
    reporterPhone: "",
    reporterAddress: "",
    reporterIdNumber: "",
    reporterIdType: "National ID",
    incidentDate: "",
    incidentLocation: "",
    incidentDescription: "",
    estimatedLoss: "",
    witnesses: "",
    suspects: "",
    evidence: "",
    insuranceInvolved: false,
    insuranceDetails: "",
  });

  const handleChange = (e) => {
    setInputs((prev) => ({
      ...prev,
      [e.target.name]:
        e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const evidenceArray = inputs.evidence
      ? inputs.evidence.split(",").map((desc) => ({
          type: "Photo",
          description: desc.trim(),
          fileUrl: "",
          fileName: "",
          fileSize: 0,
        }))
      : [];

    const payload = {
      ...inputs,
      reporterPhone: Number(inputs.reporterPhone),
      estimatedLoss: Number(inputs.estimatedLoss),
      witnesses: inputs.witnesses
        ? inputs.witnesses.split(",").map((w) => ({ name: w.trim() }))
        : [],
      suspects: inputs.suspects
        ? inputs.suspects.split(",").map((s) => ({ name: s.trim() }))
        : [],
      evidence: evidenceArray,
      insuranceInvolved: Boolean(inputs.insuranceInvolved),
    };

    await axios.post("http://localhost:8000/api/reports", payload);

    navigate("/report-success");
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 relative">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2 justify-center">
              <FileText className="text-blue-700" /> Create New Report
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Fill in the following details to register a new police report.
            </p>
          </div>
          <div className="absolute right-0 top-0">
            <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-slate-200 text-sm text-slate-700 hover:bg-slate-50">← Back</button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-8 md:grid-cols-2"
        >
          {/* Left side */}
          <div className="space-y-6">
            <Section title="Report Metadata">
              <Select
                label="Report Type"
                name="reportType"
                value={inputs.reportType}
                onChange={handleChange}
                options={[
                  "eCrime",
                  "Tourist Police",
                  "File Criminal Complaint",
                  "Unknown Accident Report",
                  "Reporting Vehicle Obstruction",
                ]}
              />
              <Select
                label="Priority"
                name="priority"
                value={inputs.priority}
                onChange={handleChange}
                options={["Low", "Medium", "High", "Urgent"]}
              />
            </Section>

            <Section title="Reporter Information">
              <Input
                icon={<User />}
                label="Full Name"
                name="reporterName"
                value={inputs.reporterName}
                onChange={handleChange}
              />
              <Input
                icon={<Mail />}
                label="Email"
                type="email"
                name="reporterEmail"
                value={inputs.reporterEmail}
                onChange={handleChange}
              />
              <Input
                icon={<Phone />}
                label="Phone"
                name="reporterPhone"
                value={inputs.reporterPhone}
                onChange={handleChange}
              />
              <Input
                label="ID Number"
                name="reporterIdNumber"
                value={inputs.reporterIdNumber}
                onChange={handleChange}
              />
              <Select
                label="ID Type"
                name="reporterIdType"
                value={inputs.reporterIdType}
                onChange={handleChange}
                options={["National ID", "Passport", "Driving License", "Other"]}
              />
              <Textarea
                label="Address"
                name="reporterAddress"
                value={inputs.reporterAddress}
                onChange={handleChange}
              />
            </Section>
          </div>

          {/* Right side */}
          <div className="space-y-6">
            <Section title="Incident Details">
              <Input
                label="Incident Date"
                type="date"
                name="incidentDate"
                value={inputs.incidentDate}
                onChange={handleChange}
              />
              <Input
                icon={<MapPin />}
                label="Location"
                name="incidentLocation"
                value={inputs.incidentLocation}
                onChange={handleChange}
              />
              <Textarea
                label="Description"
                name="incidentDescription"
                value={inputs.incidentDescription}
                onChange={handleChange}
              />
              <Input
                label="Estimated Loss"
                type="number"
                name="estimatedLoss"
                value={inputs.estimatedLoss}
                onChange={handleChange}
              />
            </Section>

            <Section title="Additional Information">
              <Input
                label="Witnesses (comma separated)"
                name="witnesses"
                value={inputs.witnesses}
                onChange={handleChange}
              />
              <Input
                label="Suspects (comma separated)"
                name="suspects"
                value={inputs.suspects}
                onChange={handleChange}
              />
              <Input
                label="Evidence (comma separated)"
                name="evidence"
                value={inputs.evidence}
                onChange={handleChange}
              />
            </Section>

            <Section title="Insurance">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="insuranceInvolved"
                  checked={inputs.insuranceInvolved}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                />
                Insurance involved
              </label>
              {inputs.insuranceInvolved && (
                <Textarea
                  label="Insurance Details"
                  name="insuranceDetails"
                  value={inputs.insuranceDetails}
                  onChange={handleChange}
                />
              )}
            </Section>

            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-lg bg-blue-700 px-6 py-3 font-medium text-white shadow hover:bg-blue-800 flex items-center gap-2"
              >
                <ShieldCheck size={18} /> Submit Report
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

/* --- Shared UI components --- */
function Section({ title, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-base font-semibold text-slate-800">{title}</h3>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Input({ label, icon, ...props }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2.5 shadow-sm focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/20">
        {icon && <span className="mr-2 text-slate-400">{icon}</span>}
        <input
          className="w-full outline-none text-slate-800"
          {...props}
        />
      </div>
    </div>
  );
}

function Textarea({ label, ...props }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <textarea
        rows={3}
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 shadow-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
        {...props}
      />
    </div>
  );
}

function Select({ label, options, ...props }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <select
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 shadow-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
        {...props}
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

export default ReportForm;
