import React, { useRef, useState } from "react";
import PoliceHeader from "../PoliceHeader/PoliceHeader";

export default function CriminalRecord() {
  // --- Core form state ---
  const [form, setForm] = useState({
    name: "",
    aliases: "",
    address: "",
    recordIdBlocks: Array(7).fill(""),
    gender: "",
    citizen: "",
    height: "",
    weight: "",
    eyeColor: "",
    hairColor: "",
    maritalStatus: "",
    criminalStatus: "",
    dob: { d: "", m: "", y: "" },
    otherInfo: "",
    crimeInfo: "",
  });

  // --- Auto-generated IDs ---
  const [fileNumber, setFileNumber] = useState("");
  const [recordId, setRecordId] = useState("");

  // Generate unique IDs on component mount
  React.useEffect(() => {
    // Generate File Number (format: CR-YYYY-MM-DD-XXXX)
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    setFileNumber(`CR-${dateStr}-${randomNum}`);

    // Generate Record ID (format: RID-YYYYMMDD-XXXXX)
    const randomId = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    setRecordId(`RID-${dateStr}-${randomId}`);
  }, []);

  // --- Photo ---
  const [photoUrl, setPhotoUrl] = useState("");
  const photoInputRef = useRef(null);

  // --- Arrest & Sentencing rows ---
  const [rows, setRows] = useState([
    { date: "", offenseCode: "", institution: "", charge: "", term: "" },
  ]);

  // --- Fingerprints (8 slots) ---
  const [prints, setPrints] = useState(Array(8).fill({ name: "", url: "" }));
  const printInputRefs = useRef([...Array(8)].map(() => React.createRef()));

  // Helpers
  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const updateRecordIdBlock = (idx, val) =>
    setForm((f) => {
      const blocks = [...f.recordIdBlocks];
      blocks[idx] = val.toUpperCase().slice(0, 1);
      return { ...f, recordIdBlocks: blocks };
    });

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotoUrl(url);
  };

  const addRow = () =>
    setRows((r) => [...r, { date: "", offenseCode: "", institution: "", charge: "", term: "" }]);
  const removeRow = (i) => setRows((r) => r.filter((_, idx) => idx !== i));
  const updateRow = (i, key, val) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [key]: val } : row)));

  const choosePrint = (i) => printInputRefs.current[i].current?.click();
  const handlePrintFile = (i, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPrints((p) => {
      const copy = [...p];
      copy[i] = { name: file.name, url };
      return copy;
    });
  };

  const uploadAllPrints = () => {
    // Hook your batch-upload logic here
    alert("Uploading all fingerprints (stub)...");
  };

  const onSave = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      fileNumber: fileNumber,
      recordId: recordId,
      recordIdBlocks: form.recordIdBlocks.join(""),
      arrests: rows,
      photo: photoUrl,
      fingerprints: prints.map((p) => p.name).filter(Boolean),
    };
    console.log("CRIMINAL RECORD SUBMIT =>", payload);
    alert("Saved (check console for payload). Hook this to your API.");
  };

  const onCancel = () => {
    if (confirm("Discard changes?")) {
      window.history.back();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC] text-[#0B214A]">
      <PoliceHeader />
      <br/>
      <br/>

      <h1 className="text-4xl font-extrabold tracking-tight text-center mb-10">Add Criminal Record</h1>
      
      <div className="mx-auto max-w-7xl border border-gray-300 rounded-4xl p-6 md:p-6 bg-white shadow p-6">

        {/* Top Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="h-15 w-15 rounded-full bg-[#0B214A] flex items-center justify-center">
              <img src="/src/assets/PLogo.png" alt="Police Logo" className="h-15 w-15 object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-wide text-[#0B214A] bg-white p-2 rounded-md">CRIMINAL RECORD</h1>
              <span className="text-[12px] text-gray-500 b">
                Made by {localStorage.getItem('userName') || sessionStorage.getItem('userName') || '_____'}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] uppercase text-gray-500 bg-white p-2 rounded-md">
              File Number #
              <span className="ml-2 inline-block min-w-32 border border-gray-400 px-2 py-0.5 text-gray-700 font-mono text-xs">
                {fileNumber}
              </span>
            </div>
            <div className="mt-1 text-[11px] uppercase text-gray-500 bg-white p-2 rounded-md">
              Record ID
              <span className="ml-2 inline-block min-w-32 border border-gray-400 px-2 py-0.5 text-gray-700 font-mono text-xs">
                {recordId}
              </span>
            </div>
            <div className="mt-1 text-[10px] text-gray-400">Generated by the Police Computer</div>
          </div>
        </div>

        <hr className="my-4 border-gray-300 mb-10" />

        <h1 className="text-3xl font-semibold mx-auto max-w-7xl mb-10">Criminal Bio</h1> 
        

        {/* Main Form */}
        <form className="mt-4 grid grid-cols-12 gap-4 bg-white p-4 rounded-md">

          
          {/* Left big column */}
          <div className="col-span-12 md:col-span-8">
            {/* Name */}
            <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-600">Full Name</label>
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder=""
              className="mb-3 block w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
            />

            {/* Aliases */}
            <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-600">Aliases</label>
            <input
              value={form.aliases}
              onChange={(e) => update("aliases", e.target.value)}
              className="mb-3 block w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
            />

            {/* Address */}
            <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-600">Address</label>
            <input
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              className="mb-3 block w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
            />

            {/* Two columns */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-600">Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => update("gender", e.target.value)}
                  className="block w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-600">Citizen</label>
                <input
                  value={form.citizen}
                  onChange={(e) => update("citizen", e.target.value)}
                  className="block w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-600">Height</label>
                <input
                  value={form.height}
                  onChange={(e) => update("height", e.target.value)}
                  className="block w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-600">Weight</label>
                <input
                  value={form.weight}
                  onChange={(e) => update("weight", e.target.value)}
                  className="block w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-600">Eye Color</label>
                <input
                  value={form.eyeColor}
                  onChange={(e) => update("eyeColor", e.target.value)}
                  className="block w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-600">Hair Color</label>
                <input
                  value={form.hairColor}
                  onChange={(e) => update("hairColor", e.target.value)}
                  className="block w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Additional fields row */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-600">Marital Status</label>
                <input
                  value={form.maritalStatus}
                  onChange={(e) => update("maritalStatus", e.target.value)}
                  className="block w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-600">Criminal Status</label>
                <select
                  value={form.criminalStatus}
                  onChange={(e) => update("criminalStatus", e.target.value)}
                  className="block w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white"
                >
                  <option value="">Select Status</option>
                  <option value="wanted">Wanted</option>
                  <option value="arrested">Arrested</option>
                  <option value="in prison">In Prison</option>
                  <option value="released">Released</option>
                </select>
              </div>
            </div>

            {/* DOB */}
            <div className="mt-3">
              <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-600">DOB</label>
              <div className="flex items-center gap-2">
                <input
                  placeholder="DD"
                  value={form.dob.d}
                  onChange={(e) => update("dob", { ...form.dob, d: e.target.value })}
                  className="h-9 w-12 rounded border border-gray-300 px-2 text-center text-sm"
                />
                <input
                  placeholder="MM"
                  value={form.dob.m}
                  onChange={(e) => update("dob", { ...form.dob, m: e.target.value })}
                  className="h-9 w-12 rounded border border-gray-300 px-2 text-center text-sm"
                />
                <input
                  placeholder="YYYY"
                  value={form.dob.y}
                  onChange={(e) => update("dob", { ...form.dob, y: e.target.value })}
                  className="h-9 w-16 rounded border border-gray-300 px-2 text-center text-sm"
                />
              </div>
            </div>
          </div>
          
          {/* Right photo column */}
          <div className="col-span-12 md:col-span-4">
            <div className="flex flex-col items-center">
              <div className="flex h-80 w-56 items-center justify-center border border-gray-300 bg-gray-50">
                {photoUrl ? (
                  <img src={photoUrl} alt="Photo" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs text-gray-400">PHOTO</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="mt-2 w-40 rounded border border-gray-400 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                Upload Photo
              </button>
              <input
                type="file"
                accept="image/*"
                ref={photoInputRef}
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Other Info */}
          <div className="col-span-12 lg:col-span-12">
            <div className="mb-2 border-b border-gray-300 pb-2 text-[12px] font-semibold uppercase tracking-wide text-gray-700">
              Other Info
            </div>
            <textarea
              rows={8}
              value={form.otherInfo}
              onChange={(e) => update("otherInfo", e.target.value)}
              className="h-48 w-full rounded border border-gray-300 p-3 text-sm"
            />
          </div>
          
        </form>

        {/* Fingerprints & Other Info */}
        <div className="mt-6 grid grid-cols-12 gap-6 bg-white p-4 rounded-md">
          {/* Fingerprints */}
          <div className="col-span-12 lg:col-span-7">
            <div className="mb-2 border-b border-gray-300 pb-1 text-[12px] font-semibold uppercase tracking-wide text-gray-700">
              Fingerprints
            </div>

          <div className="grid grid-cols-4 gap-4">
            {prints.map((p, i) => (
              <div key={i} className="rounded border border-gray-300 p-3 text-center">
                <div className="mb-2 h-16 w-full overflow-hidden rounded bg-gray-50">
                  {p.url ? (
                    <img src={p.url} alt={`fp-${i + 1}`} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-xs text-gray-400">#{i + 1}</span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => choosePrint(i)}
                  className="w-full rounded border border-gray-400 bg-white px-2 py-1 text-xs hover:bg-gray-50"
                >
                  {p.url ? "Replace" : "Upload"}
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={printInputRefs.current[i]}
                  onChange={(e) => handlePrintFile(i, e)}
                  className="hidden"
                />
              </div>
            ))}
          </div>

            <button
              type="button"
              onClick={uploadAllPrints}
              className="mt-4 rounded border border-gray-400 bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-50 mb-10"
            >
              Upload All Fingerprints
            </button>
          </div>
        </div>
        <h1 className="text-3xl font-semibold mx-auto max-w-7xl mb-10">Criminal Crime</h1>  

        <div className="mt-6 bg-white p-4 rounded-md">
          <div className="mb-2 border-b border-gray-300 pb-1 text-[12px] font-semibold uppercase tracking-wide text-gray-700">
            Arrest & Sentencing Info
          </div>

          <div className="overflow-x-auto">
            <div className="grid grid-cols-[140px_140px_1fr_1fr_120px_40px] items-stretch border border-gray-300 bg-gray-50 text-[11px] uppercase text-gray-600">
              <div className="border-r border-gray-300 px-2 py-2">Date</div>
              <div className="border-r border-gray-300 px-2 py-2">Offense Code</div>
              <div className="border-r border-gray-300 px-2 py-2">Institution</div>
              <div className="border-r border-gray-300 px-2 py-2">Charge and Description</div>
              <div className="border-r border-gray-300 px-2 py-2">Term</div>
              <div className="px-2 py-2 text-center">—</div>
            </div>

            {rows.map((r, i) => (
              <div
                key={i}
                className="grid grid-cols-[140px_140px_1fr_1fr_120px_40px] items-center border-l border-r border-b border-gray-300"
              >
                <input
                  type="date"
                  value={r.date}
                  onChange={(e) => updateRow(i, "date", e.target.value)}
                  className="h-10 border-r border-gray-300 px-2 text-sm outline-none"
                />
                <input
                  value={r.offenseCode}
                  onChange={(e) => updateRow(i, "offenseCode", e.target.value)}
                  className="h-10 border-r border-gray-300 px-2 text-sm outline-none"
                />
                <input
                  value={r.institution}
                  onChange={(e) => updateRow(i, "institution", e.target.value)}
                  className="h-10 border-r border-gray-300 px-2 text-sm outline-none"
                />
                <input
                  value={r.charge}
                  onChange={(e) => updateRow(i, "charge", e.target.value)}
                  className="h-10 border-r border-gray-300 px-2 text-sm outline-none"
                />
                <input
                  value={r.term}
                  onChange={(e) => updateRow(i, "term", e.target.value)}
                  className="h-10 border-r border-gray-300 px-2 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  className="mx-auto my-1 inline-flex h-7 w-7 items-center justify-center rounded border border-red-300 text-red-600 hover:bg-red-50"
                  title="Remove row"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addRow}
            className="mt-3 rounded border border-gray-400 bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
          >
            + Add Arrest & Sentencing Row
          </button>
        </div>

        {/* Crime Info */}
        <div className="mt-6 bg-white p-4 rounded-md">
            <div className="mb-2 border-b border-gray-300 pb-2 text-[12px] font-semibold uppercase tracking-wide text-gray-700">
              Crime Info
            </div>
            <textarea
              rows={8}
              value={form.crimeInfo}
              onChange={(e) => update("crimeInfo", e.target.value)}
              className="h-48 w-full rounded border border-gray-300 p-3 text-sm"
            />
          </div>

        
        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={onSave}
            className="rounded bg-[#0B214A] px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
          >
            Save
          </button>
          <button
            onClick={onCancel}
            className="rounded border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </div>
      <br/>
      <br/>
    </div>
  );
}
