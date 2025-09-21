import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PoliceHeader from "../PoliceHeader/PoliceHeader";
import axiosInstance from "../../utils/axiosInstance";

export default function CriminalRecord() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Offense code list
  const OFFENSE_CODES = [
    { code: "09A", desc: "Murder and Nonnegligent Manslaughter" },
    { code: "09B", desc: "Negligent Manslaughter" },
    { code: "09C", desc: "Justifiable Homicide" },
    { code: "100", desc: "Kidnapping / Abduction" },
    { code: "11A", desc: "Rape" },
    { code: "11B", desc: "Sodomy" },
    { code: "11C", desc: "Sexual Assault With Object" },
    { code: "11D", desc: "Fondling" },
    { code: "120", desc: "Robbery" },
    { code: "13A", desc: "Aggravated Assault" },
    { code: "13B", desc: "Simple Assault" },
    { code: "13C", desc: "Intimidation" },
    { code: "220", desc: "Burglary / Breaking and Entering" },
    { code: "23A", desc: "Pocket-picking" },
  ];
  // Institution options (police stations)
  const INSTITUTIONS = [
    "Gampaha Police Station",
    "Horana Police Station",
    "Colombo Police Station",
    "Ragama Police Station",
    "Kaduwela Police Station",
    "Athurugiriya Police Station",
    "Kolonnawa Police Station",
    "Boralla Police Station",
    "Bandaragama Police Station",
  ];

  // Charge and description options
  const CHARGE_OPTIONS = [
    {
      label: "Murder (Homicide)",
      desc: "Unlawfully killing another person with intent or malice aforethought.",
      exampleTerm: "25 years to life",
    },
    {
      label: "Manslaughter (Voluntary)",
      desc: "Killing another person without premeditation, often in the heat of passion.",
      exampleTerm: "10 years",
    },
    {
      label: "Manslaughter (Involuntary)",
      desc: "Causing a death unintentionally through reckless or negligent acts.",
      exampleTerm: "5 years",
    },
    {
      label: "Assault (Aggravated)",
      desc: "Intentionally causing serious bodily injury or using a deadly weapon.",
      exampleTerm: "7 years",
    },
    {
      label: "Assault (Simple)",
      desc: "Intentionally causing or attempting to cause physical harm without a weapon.",
      exampleTerm: "1 year",
    },
    { label: "Battery", desc: "Unlawful physical contact or force on another person.", exampleTerm: "6 months" },
    {
      label: "Robbery",
      desc: "Taking property directly from a person by force, violence, or intimidation.",
      exampleTerm: "8 years",
    },
    {
      label: "Burglary",
      desc: "Entering a building or structure unlawfully with intent to commit a crime (usually theft).",
      exampleTerm: "5 years",
    },
    {
      label: "Theft / Larceny",
      desc: "Taking someone’s property without permission and with intent to permanently deprive them of it.",
      exampleTerm: "2 years",
    },
    { label: "Shoplifting", desc: "Stealing merchandise from a retail store.", exampleTerm: "6 months probation" },
    { label: "Motor Vehicle Theft", desc: "Stealing or attempting to steal a motor vehicle.", exampleTerm: "4 years" },
    {
      label: "Fraud",
      desc: "Obtaining money, goods, or services by deception or false representation.",
      exampleTerm: "3 years",
    },
    {
      label: "Embezzlement",
      desc: "Stealing money or property entrusted to you, often from an employer.",
      exampleTerm: "5 years",
    },
  ];
  // --- Core form state ---
  const [form, setForm] = useState({
    criminalId: "",
    nic: "",
    name: "",
    aliases: "",
    address: "",
    gender: "",
    citizen: "",
    height: "",
    weight: "",
    eyeColor: "",
    hairColor: "",
    maritalStatus: "",
    criminalStatus: "",
    rewardPrice: "",
    arrestDate: "",
    prisonDays: "",
    releaseDate: "",
    dob: { d: "", m: "", y: "" },
    otherInfo: "",
    crimeInfo: "",
  });

  // --- Auto-generated IDs ---
  const [fileNumber, setFileNumber] = useState("");
  const [recordId, setRecordId] = useState("");

  // Load criminal data for editing or generate new IDs
  useEffect(() => {
    if (editId) {
      loadCriminalForEdit(editId);
    } else {
      // Generate unique IDs for new criminal
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      setFileNumber(`CR-${dateStr}-${randomNum}`);

      const randomId = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
      setRecordId(`RID-${dateStr}-${randomId}`);
    }
  }, [editId]);

  const loadCriminalForEdit = async (id) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/criminals/${id}`);
      const criminal = response.data;
      
      console.log('Loading criminal for edit:', criminal);
      
      // Set form data
      setForm({
        criminalId: criminal.criminalId || "",
        nic: criminal.nic || "",
        name: criminal.name || "",
        aliases: criminal.aliases || "",
        address: criminal.address || "",
        gender: criminal.gender || "",
        citizen: criminal.citizen || "",
        height: criminal.height ? String(criminal.height) : "",
        weight: criminal.weight ? String(criminal.weight) : "",
        eyeColor: criminal.eyeColor || "",
        hairColor: criminal.hairColor || "",
        maritalStatus: criminal.maritalStatus || "",
        criminalStatus: criminal.criminalStatus || "",
        rewardPrice: criminal.rewardPrice ? String(criminal.rewardPrice) : "",
        arrestDate: criminal.arrestDate ? new Date(criminal.arrestDate).toISOString().split('T')[0] : "",
        prisonDays: criminal.prisonDays ? String(criminal.prisonDays) : "",
        releaseDate: criminal.releaseDate ? new Date(criminal.releaseDate).toISOString().split('T')[0] : "",
        dob: criminal.dob ? {
          d: criminal.dob.day ? String(criminal.dob.day) : "",
          m: criminal.dob.month ? String(criminal.dob.month) : "",
          y: criminal.dob.year ? String(criminal.dob.year) : ""
        } : { d: "", m: "", y: "" },
        otherInfo: criminal.otherInfo || "",
        crimeInfo: criminal.crimeInfo || "",
      });

      // Set other data
      setFileNumber(criminal.fileNumber || "");
      setRecordId(criminal.recordId || "");
      setPhotoUrl(criminal.photo || "");
      
      // Set arrests data
      if (criminal.arrests && criminal.arrests.length > 0) {
        const formattedArrests = criminal.arrests.map(arrest => ({
          date: arrest.date ? new Date(arrest.date).toISOString().split('T')[0] : "",
          offenseCode: arrest.offenseCode || "",
          institution: arrest.institution || "",
          charge: arrest.charge || "",
          term: arrest.term || ""
        }));
        setRows(formattedArrests);
      }

      // Set fingerprints data
      if (criminal.fingerprints && criminal.fingerprints.length > 0) {
        const formattedPrints = criminal.fingerprints.map(print => ({
          name: print.name || "",
          url: print.url || ""
        }));
        // Pad to 6 slots
        while (formattedPrints.length < 6) {
          formattedPrints.push({ name: "", url: "" });
        }
        setPrints(formattedPrints);
      }

      setIsEditing(true);
    } catch (error) {
      console.error('Error loading criminal for edit:', error);
      alert('Failed to load criminal data for editing');
      navigate('/CriminalManage/CriminalManage');
    } finally {
      setLoading(false);
    }
  };

  // --- Photo ---
  const [photoUrl, setPhotoUrl] = useState("");
  const photoInputRef = useRef(null);

  // --- Arrest & Sentencing rows ---
  const [rows, setRows] = useState([
    { date: "", offenseCode: "", institution: "", charge: "", term: "" },
  ]);

  // --- Fingerprints (6 slots) ---
  const [prints, setPrints] = useState(Array(6).fill({ name: "", url: "" }));
  const printInputRefs = useRef([...Array(6)].map(() => React.createRef()));

  // Helpers
  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Show preview immediately
    const url = URL.createObjectURL(file);
    setPhotoUrl(url);
    
    // Upload to server
    try {
      const formData = new FormData();
      formData.append('photo', file);
      
      const response = await axiosInstance.post('/criminals/upload-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        // Update photoUrl with server URL
        setPhotoUrl(response.data.photoUrl);
      } else {
        console.error('Photo upload failed:', response.data.message);
        alert('Failed to upload photo. Please try again.');
        setPhotoUrl(''); // Clear the preview
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo. Please try again.');
      setPhotoUrl(''); // Clear the preview
    }
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

  const onSave = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!form.criminalId || !form.nic || !form.name || !form.address || !form.gender || !form.citizen || !form.criminalStatus) {
      alert('Please fill in all required fields: Criminal ID, NIC, Name, Address, Gender, Citizen, and Criminal Status');
      return;
    }

    // Prepare DOB structure to match model
    const dobData = {};
    if (form.dob.d && form.dob.m && form.dob.y) {
      dobData.day = parseInt(form.dob.d);
      dobData.month = parseInt(form.dob.m);
      dobData.year = parseInt(form.dob.y);
    }

    // Prepare arrests data with proper date conversion
    const arrestsData = rows.map(row => ({
      ...row,
      date: row.date ? new Date(row.date) : null
    }));

    // Prepare fingerprints data to match model structure
    const fingerprintsData = prints
      .filter(p => p.name && p.url)
      .map(p => ({
        name: p.name,
        url: p.url
      }));

    const payload = {
      // Auto-generated IDs
      fileNumber: fileNumber,
      recordId: recordId,
      
      // Required fields
      criminalId: form.criminalId,
      nic: form.nic,
      name: form.name,
      address: form.address,
      gender: form.gender,
      citizen: form.citizen,
      criminalStatus: form.criminalStatus,
      
      // Optional fields
      aliases: form.aliases || undefined,
      height: form.height ? parseInt(form.height) : undefined,
      weight: form.weight ? parseInt(form.weight) : undefined,
      eyeColor: form.eyeColor || undefined,
      hairColor: form.hairColor || undefined,
      maritalStatus: form.maritalStatus || undefined,
      
      // DOB
      dob: Object.keys(dobData).length > 0 ? dobData : undefined,
      
      // Additional info
      otherInfo: form.otherInfo || undefined,
      crimeInfo: form.crimeInfo || undefined,
      
      // Status-specific fields
      rewardPrice: form.criminalStatus === 'wanted' && form.rewardPrice ? parseInt(form.rewardPrice) : undefined,
      arrestDate: form.criminalStatus === 'arrested' && form.arrestDate ? new Date(form.arrestDate) : undefined,
      prisonDays: form.criminalStatus === 'in prison' && form.prisonDays ? parseInt(form.prisonDays) : undefined,
      releaseDate: form.criminalStatus === 'released' && form.releaseDate ? new Date(form.releaseDate) : undefined,
      
      // Arrays
      arrests: arrestsData,
      photo: photoUrl || undefined,
      fingerprints: fingerprintsData,
    };

    try {
      let response;
      if (isEditing && editId) {
        // Update existing criminal
        response = await axiosInstance.put(`/criminals/${editId}`, payload);
        alert('Criminal record updated successfully!');
      } else {
        // Create new criminal
        response = await axiosInstance.post('/criminals', payload);
        alert('Criminal record saved successfully!');
      }
      
      console.log('Saved criminal:', response.data);
      
      // Navigate to CriminalManage page after successful save
      navigate('/CriminalManage/CriminalManage');
    } catch (error) {
      console.error('Error saving criminal:', error);
      
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || error.response.data?.error || 'Failed to save criminal record';
        alert(`Error: ${errorMessage}`);
      } else if (error.request) {
        // Network error
        alert('Network error. Please check if the server is running and try again.');
      } else {
        // Other error
        alert('An unexpected error occurred. Please try again.');
      }
    }
  };

  const onCancel = () => {
    if (confirm("Discard changes?")) {
      navigate('/CriminalManage/CriminalManage');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC]">
        <PoliceHeader />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B214A] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading criminal data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC] text-[#0B214A]">
      <PoliceHeader />
      <br/>
      <br/>

      <h1 className="text-4xl font-extrabold tracking-tight text-center mb-10">
        {isEditing ? 'Edit Criminal Record' : 'Add Criminal Record'}
      </h1>
      
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
            {/* Criminal ID & NIC */}
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-600">Criminal ID</label>
                <div className="flex items-center">
                  <span className="bg-gray-100 border border-gray-300 border-r-0 rounded-l px-3 py-2 text-sm text-gray-600">#</span>
                  <input
                    value={form.criminalId}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                      if (value.length <= 6) {
                        update("criminalId", value);
                      }
                    }}
                    placeholder="123456"
                    maxLength={6}
                    className="block w-full rounded-r border border-gray-300 bg-white px-3 py-2 text-sm"
                  />
                </div>
                {form.criminalId && form.criminalId.length !== 6 && (
                  <p className="text-xs text-red-500 mt-1">Criminal ID must be exactly 6 digits</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-600">NIC Number</label>
                <input
                  value={form.nic}
                  onChange={(e) => update("nic", e.target.value)}
                  placeholder=""
                  className="block w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
                />
              </div>
            </div>
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
                <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-600">Citizen (Optional)</label>
                <select
                  value={form.citizen}
                  onChange={(e) => update("citizen", e.target.value)}
                  className="block w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white"
                >
                  <option value="">Select Country</option>
                  <option value="Sri Lanka">Sri Lanka</option>
                  <option value="India">India</option>
                  <option value="Pakistan">Pakistan</option>
                  <option value="Bangladesh">Bangladesh</option>
                  <option value="Nepal">Nepal</option>
                  <option value="Maldives">Maldives</option>
                  <option value="Afghanistan">Afghanistan</option>
                  <option value="China">China</option>
                  <option value="Japan">Japan</option>
                  <option value="South Korea">South Korea</option>
                  <option value="Honduras">Honduras</option>
                  <option value="El Salvador">El Salvador</option>
                  <option value="Nicaragua">Nicaragua</option>
                  <option value="Costa Rica">Costa Rica</option>
                  <option value="Panama">Panama</option>
                  <option value="Cuba">Cuba</option>
                  <option value="Jamaica">Jamaica</option>
                  <option value="Haiti">Haiti</option>
                  <option value="Dominican Republic">Dominican Republic</option>
                  <option value="Puerto Rico">Puerto Rico</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-600">Height (cm)</label>
                <input
                  type="number"
                  min={50}
                  max={250}
                  step={1}
                  placeholder="50 - 250"
                  value={form.height}
                  onChange={(e) => {
                    const raw = Number(e.target.value);
                    if (Number.isNaN(raw)) { update("height", ""); return; }
                    const clamped = Math.max(Math.min(250, raw));
                    update("height", String(clamped));
                  }}
                  className="block w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-600">Weight (kg)</label>
                <input
                  type="number"
                  min={20}
                  max={250}
                  step={1}
                  placeholder="20 - 250"
                  value={form.weight}
                  onChange={(e) => {
                    const raw = Number(e.target.value);
                    if (Number.isNaN(raw)) { update("weight", ""); return; }
                    const clamped = Math.max(Math.min(250, raw));
                    update("weight", String(clamped));
                  }}
                  className="block w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-600">Eye Color</label>
                <select
                  value={form.eyeColor}
                  onChange={(e) => update("eyeColor", e.target.value)}
                  className="block w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white"
                >
                  <option value="">Select Eye Color</option>
                  <option>Brown</option>
                  <option>Dark Brown</option>
                  <option>Light Brown</option>
                  <option>Blue</option>
                  <option>Light Blue</option>
                  <option>Green</option>
                  <option>Hazel</option>
                  <option>Amber</option>
                  <option>Gray</option>
                  <option>Black</option>
                  <option>Hazel Green</option>
                  <option>Hazel Brown</option>
                  <option>Violet</option>
                  <option>Red</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-600">Hair Color</label>
                <select
                  value={form.hairColor}
                  onChange={(e) => update("hairColor", e.target.value)}
                  className="block w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white"
                >
                  <option value="">Select Hair Color</option>
                  <option>Black</option>
                  <option>Dark Brown</option>
                  <option>Brown</option>
                  <option>Light Brown</option>
                  <option>Blonde</option>
                  <option>Dark Blonde</option>
                  <option>Platinum Blonde</option>
                  <option>Auburn</option>
                  <option>Red</option>
                  <option>Strawberry Blonde</option>
                  <option>Ginger</option>
                  <option>Chestnut</option>
                  <option>Gray</option>
                  <option>White</option>
                  <option>Dyed/Other</option>
                </select>
              </div>
            </div>

            {/* Additional fields row */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-600">Marital Status</label>
                <select
                  value={form.maritalStatus}
                  onChange={(e) => update("maritalStatus", e.target.value)}
                  className="block w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white"
                >
                  <option value="">Select Status</option>
                  <option>Single</option>
                  <option>Married</option>
                  <option>Separated</option>
                  <option>Divorced</option>
                  <option>Engaged</option>
                  <option>In a Relationship</option>
                </select>
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

            {/* Conditional fields by Criminal Status */}
            {form.criminalStatus === 'wanted' && (
              <div className="mt-3">
                <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-600">Reward Price (LKR)</label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  placeholder="Enter reward amount"
                  value={form.rewardPrice}
                  onChange={(e) => update("rewardPrice", e.target.value)}
                  className="block w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            )}

            {form.criminalStatus === 'arrested' && (
              <div className="mt-3">
                <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-600">Arrest Date</label>
                <input
                  type="date"
                  value={form.arrestDate}
                  onChange={(e) => update("arrestDate", e.target.value)}
                  className="block w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            )}

            {form.criminalStatus === 'in prison' && (
              <div className="mt-3">
                <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-600">Prison Time (days)</label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  placeholder="Enter days"
                  value={form.prisonDays}
                  onChange={(e) => update("prisonDays", e.target.value)}
                  className="block w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            )}

            {form.criminalStatus === 'released' && (
              <div className="mt-3">
                <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-600">Release Date</label>
                <input
                  type="date"
                  value={form.releaseDate}
                  onChange={(e) => update("releaseDate", e.target.value)}
                  className="block w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            )}

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

          <div className="grid grid-cols-3 gap-4">
            {prints.map((p, i) => (
              <div key={i} className="rounded border border-gray-300 p-3 text-center">
                <div className="mb-2 h-30 w-full overflow-hidden rounded bg-gray-50">
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
            <div className="grid grid-cols-[140px_200px_1fr_2fr_200px_40px] items-stretch border border-gray-300 bg-gray-50 text-[11px] uppercase text-gray-600">
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
                className="grid grid-cols-[140px_200px_1fr_2fr_200px_40px] items-center border-l border-r border-b border-gray-300"
              >
                <input
                  type="date"
                  value={r.date}
                  onChange={(e) => updateRow(i, "date", e.target.value)}
                  className="h-10 border-r border-gray-300 px-2 text-sm outline-none"
                />
                <select
                  value={r.offenseCode}
                  onChange={(e) => updateRow(i, "offenseCode", e.target.value)}
                  className="h-10 border-r border-gray-300 px-2 text-sm outline-none bg-white"
                >
                  <option value="">Select code</option>
                  {OFFENSE_CODES.map((o) => (
                    <option key={o.code} value={o.code} title={o.desc}>
                      {o.code} — {o.desc}
                    </option>
                  ))}
                </select>
                <select
                  value={r.institution}
                  onChange={(e) => updateRow(i, "institution", e.target.value)}
                  className="h-10 border-r border-gray-300 px-2 text-sm outline-none bg-white"
                >
                  <option value="">Select institution</option>
                  {INSTITUTIONS.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                <select
                  value={r.charge}
                  onChange={(e) => {
                    const value = e.target.value;
                    updateRow(i, "charge", value);
                    const match = CHARGE_OPTIONS.find((c) => c.label === value);
                    if (match?.exampleTerm) {
                      updateRow(i, "term", match.exampleTerm);
                    }
                  }}
                  className="h-10 border-r border-gray-300 px-2 text-sm outline-none bg-white w-full text-left"
                  title={r.charge ? CHARGE_OPTIONS.find((c) => c.label === r.charge)?.desc || "" : ""}
                >
                  <option value="">Select charge</option>
                  {CHARGE_OPTIONS.map((c) => (
                    <option key={c.label} value={c.label} title={c.desc}>
                      {c.label}
                    </option>
                  ))}
                </select>
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
            {isEditing ? 'Update' : 'Save'}
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
