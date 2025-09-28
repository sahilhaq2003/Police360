import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import PoliceHeader from '../PoliceHeader/PoliceHeader';

const complaintTypes = ["eCrime", "Tourist Police", "Police Report Inquiry", "File Complaint", "Criminal Status of Financial Cases", "Other"];
const idTypes = ["National ID", "Passport", "Driver's License", "Voter ID", "Other"];
const priorityOptions = ["LOW", "MEDIUM", "HIGH"];

export default function CreateCase() {
  const navigate = useNavigate();

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
    // IT Officer specific fields
    itOfficerDetails: {
      caseAnalysis: "",
      technicalDetails: "",
      recommendedActions: "",
      urgencyLevel: "MEDIUM",
      assignedDepartment: "",
      followUpRequired: false,
      followUpDate: "",
    },
    // Resource allocation
    resourceAllocation: {
      supportOfficers: [],
      vehicles: [],
      firearms: [],
    }
  });

  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [firearms, setFirearms] = useState([]);
  const [selectedComplaintId, setSelectedComplaintId] = useState("");
  
  // Search states
  const [complaintSearch, setComplaintSearch] = useState("");
  const [showComplaintDropdown, setShowComplaintDropdown] = useState(false);
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchComplaints();
    fetchOfficers();
    fetchVehicles();
    fetchFirearms();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowComplaintDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await axiosInstance.get('/cases', { params: { pageSize: 100 } });
      const complaintsList = res.data?.data || res.data || [];
      setComplaints(Array.isArray(complaintsList) ? complaintsList : []);
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
    }
  };

  const fetchOfficers = async () => {
    try {
      const res = await axiosInstance.get('/officers', { params: { role: 'Officer', pageSize: 100 } });
      const officersList = res.data?.data || res.data || [];
      setOfficers(Array.isArray(officersList) ? officersList : []);
    } catch (error) {
      console.error('Failed to fetch officers:', error);
    }
  };

  const fetchVehicles = async () => {
    // Mock data for vehicles - replace with actual API call when available
    setVehicles([
      { id: 'V001', name: 'Patrol Car 001', type: 'Patrol Vehicle', status: 'Available' },
      { id: 'V002', name: 'Patrol Car 002', type: 'Patrol Vehicle', status: 'Available' },
      { id: 'V003', name: 'Motorcycle 001', type: 'Motorcycle', status: 'Available' },
      { id: 'V004', name: 'Van 001', type: 'Transport Van', status: 'Available' },
    ]);
  };

  const fetchFirearms = async () => {
    // Mock data for firearms - replace with actual API call when available
    setFirearms([
      { id: 'F001', name: 'Pistol 001', type: 'Handgun', status: 'Available' },
      { id: 'F002', name: 'Rifle 001', type: 'Assault Rifle', status: 'Available' },
      { id: 'F003', name: 'Shotgun 001', type: 'Shotgun', status: 'Available' },
    ]);
  };

  const handleComplaintSelection = (complaintId) => {
    setSelectedComplaintId(complaintId);
    setShowComplaintDropdown(false);
    if (complaintId) {
      const selectedComplaint = complaints.find(c => c._id === complaintId);
      if (selectedComplaint) {
        setComplaintSearch(`${selectedComplaint._id} - ${selectedComplaint.complainant?.name} - ${selectedComplaint.complaintDetails?.typeOfComplaint}`);
        setForm(prev => ({
          ...prev,
          complainant: selectedComplaint.complainant || prev.complainant,
          complaintDetails: {
            ...prev.complaintDetails,
            typeOfComplaint: selectedComplaint.complaintDetails?.typeOfComplaint || prev.complaintDetails.typeOfComplaint,
            incidentDate: selectedComplaint.complaintDetails?.incidentDate || prev.complaintDetails.incidentDate,
            location: selectedComplaint.complaintDetails?.location || prev.complaintDetails.location,
            description: selectedComplaint.complaintDetails?.description || prev.complaintDetails.description,
          },
          priority: selectedComplaint.priority || prev.priority,
          estimatedLoss: selectedComplaint.estimatedLoss || prev.estimatedLoss,
        }));
      }
    }
  };

  // Filter functions
  const filteredComplaints = complaints.filter(complaint => 
    complaint._id.toLowerCase().includes(complaintSearch.toLowerCase()) ||
    complaint.complainant?.name?.toLowerCase().includes(complaintSearch.toLowerCase()) ||
    complaint.complaintDetails?.typeOfComplaint?.toLowerCase().includes(complaintSearch.toLowerCase())
  );

  const addResource = (type, resourceId) => {
    setForm(prev => ({
      ...prev,
      resourceAllocation: {
        ...prev.resourceAllocation,
        [type]: [...prev.resourceAllocation[type], resourceId]
      }
    }));
  };

  const removeResource = (type, resourceId) => {
    setForm(prev => ({
      ...prev,
      resourceAllocation: {
        ...prev.resourceAllocation,
        [type]: prev.resourceAllocation[type].filter(id => id !== resourceId)
      }
    }));
  };

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
          attachments: [...prev.attachments, ...data],
        }))
      )
      .catch(() => {
        setBanner({ type: "error", message: "Failed to process files" });
      });
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
      .catch(() => {
        setBanner({ type: "error", message: "Failed to process additional files" });
      });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setBanner(null);

    // Basic validation
    if (!form.complainant.name.trim()) {
      setBanner({ type: "error", message: "Complainant name is required." });
      setLoading(false);
      return;
    }

    if (!form.complaintDetails.typeOfComplaint.trim()) {
      setBanner({ type: "error", message: "Type of complaint is required." });
      setLoading(false);
      return;
    }

    try {
      // Create a simplified form data for testing
      const testForm = {
        complainant: {
          name: form.complainant.name,
          address: form.complainant.address || "",
          phone: form.complainant.phone || "",
          email: form.complainant.email || ""
        },
        complaintDetails: {
          typeOfComplaint: form.complaintDetails.typeOfComplaint,
          incidentDate: form.complaintDetails.incidentDate || "",
          location: form.complaintDetails.location || "",
          description: form.complaintDetails.description || ""
        },
        attachments: form.attachments || [],
        idInfo: form.idInfo || { idType: "", idValue: "" },
        priority: form.priority || "MEDIUM",
        estimatedLoss: form.estimatedLoss || "",
        additionalInfo: form.additionalInfo || { witnesses: [], suspects: [], evidence: [] },
        itOfficerDetails: form.itOfficerDetails || {},
        resourceAllocation: form.resourceAllocation || { supportOfficers: [], vehicles: [], firearms: [] }
      };
      
      console.log('Submitting form data:', testForm);
      console.log('Attachments type:', typeof testForm.attachments[0]);
      console.log('Attachments sample:', testForm.attachments[0]);
      
      const res = await axiosInstance.post("/it-cases", testForm);
      console.log('Response:', res.data);
      if (res?.data?.success) {
        const newCase = res.data.data || res.data;
        const newCaseId = res.data.id || newCase._id || newCase.id;
        setBanner({ type: "success", message: `Case created successfully! Case ID: ${newCase.caseId || newCaseId}` });
        // Navigate to view-cases page after a delay
        setTimeout(() => {
          navigate("/it/view-cases");
        }, 2000);
      } else {
        setBanner({ type: "error", message: "Failed to create case." });
      }
    } catch (err) {
      console.error('Error details:', err);
      console.error('Error response:', err.response);
      console.error('Error response data:', err.response?.data);
      console.error('Error response status:', err.response?.status);
      
      setBanner({
        type: "error",
        message: err?.response?.data?.message || "Failed to create case.",
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
        itOfficerDetails: {
          caseAnalysis: "",
          technicalDetails: "",
          recommendedActions: "",
          urgencyLevel: "MEDIUM",
          assignedDepartment: "",
          followUpRequired: false,
          followUpDate: "",
        },
        resourceAllocation: {
          supportOfficers: [],
          vehicles: [],
          firearms: [],
        }
      });
      setSelectedComplaintId("");
      setComplaintSearch("");
      setShowComplaintDropdown(false);
      setShowAdditionalInfo(false);
    }
  }

  const inputField = "w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-700 placeholder-slate-400 focus:border-[#0B214A] focus:ring-2 focus:ring-[#0B214A]/20 transition";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC] text-[#0B214A]">
      <PoliceHeader />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="bg-white border border-[#E4E9F2] rounded-2xl shadow p-8">
          {/* Header */}
          <div className="mb-8 relative">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold text-slate-800">Create New Case</h1>
              <p className="text-sm text-slate-600 mt-1">IT Officer - Create a new case based on complaint analysis</p>
            </div>
            <div className="absolute right-0 top-0">
              <button
                onClick={() => navigate("/it/cases")}
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
            {/* Section: Case ID */}
            <section>
              <h3 className="text-lg font-semibold text-slate-700 mb-3">
                Case Information
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="font-medium text-blue-800">Case ID</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    A unique Case ID will be automatically generated when you submit this form.
                    This ID will be different from complaint IDs and is specifically for IT Officer created cases.
                  </p>
                </div>
              </div>
            </section>

            {/* Section: Complaint Selection */}
            <section>
              <h3 className="text-lg font-semibold text-slate-700 mb-3">
                Select Related Complaint (Optional)
              </h3>
              <div className="relative dropdown-container">
                <input
                  type="text"
                  value={complaintSearch}
                  onChange={(e) => {
                    setComplaintSearch(e.target.value);
                    setShowComplaintDropdown(true);
                  }}
                  onFocus={() => setShowComplaintDropdown(true)}
                  placeholder="Search complaints by ID, name, or type..."
                  className={`${inputField} pr-10`}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                
                {showComplaintDropdown && complaintSearch && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredComplaints.length > 0 ? (
                      filteredComplaints.map((complaint) => (
                        <div
                          key={complaint._id}
                          onClick={() => handleComplaintSelection(complaint._id)}
                          className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                        >
                          <div className="font-medium text-slate-900">{complaint._id}</div>
                          <div className="text-sm text-slate-600">{complaint.complainant?.name}</div>
                          <div className="text-xs text-slate-500">{complaint.complaintDetails?.typeOfComplaint}</div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-slate-500 text-sm">No complaints found</div>
                    )}
                  </div>
                )}
              </div>
              
              {selectedComplaintId && (
                <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                  <strong>Selected Complaint:</strong> {complaints.find(c => c._id === selectedComplaintId)?.complainant?.name} - {complaints.find(c => c._id === selectedComplaintId)?.complaintDetails?.typeOfComplaint}
                </div>
              )}
            </section>

            {/* Section: Complainant Information */}
            <section>
              <h3 className="text-lg font-semibold text-slate-700 mb-3">
                Complainant Information
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <input
                  value={form.complainant.name}
                  onChange={(e) => onChange("complainant.name", e.target.value)}
                  placeholder="Complainant Name *"
                  className={inputField}
                  required
                />
                <input
                  value={form.complainant.address}
                  onChange={(e) => onChange("complainant.address", e.target.value)}
                  placeholder="Address"
                  className={inputField}
                />
                <input
                  value={form.complainant.phone}
                  onChange={(e) => onChange("complainant.phone", e.target.value)}
                  placeholder="Phone Number"
                  className={inputField}
                />
                <input
                  type="email"
                  value={form.complainant.email}
                  onChange={(e) => onChange("complainant.email", e.target.value)}
                  placeholder="Email Address"
                  className={inputField}
                />
              </div>
            </section>

            {/* Section: Complaint Details */}
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
                  required
                >
                  <option value="">Select type of complaint *</option>
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
                  placeholder="Complaint Description"
                  className={`${inputField} h-28`}
                />
                <input type="file" multiple onChange={handleFile} />
              </div>
            </section>

            {/* Section: IT Officer Analysis */}
            <section>
              <h3 className="text-lg font-semibold text-slate-700 mb-3">
                IT Officer Analysis & Recommendations
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <textarea
                  value={form.itOfficerDetails.caseAnalysis}
                  onChange={(e) =>
                    onChange("itOfficerDetails.caseAnalysis", e.target.value)
                  }
                  placeholder="Case Analysis - Your assessment of the complaint"
                  className={`${inputField} h-24`}
                />
                <textarea
                  value={form.itOfficerDetails.technicalDetails}
                  onChange={(e) =>
                    onChange("itOfficerDetails.technicalDetails", e.target.value)
                  }
                  placeholder="Technical Details - Any technical aspects or digital evidence"
                  className={`${inputField} h-24`}
                />
                <textarea
                  value={form.itOfficerDetails.recommendedActions}
                  onChange={(e) =>
                    onChange("itOfficerDetails.recommendedActions", e.target.value)
                  }
                  placeholder="Recommended Actions - Suggested next steps"
                  className={`${inputField} h-24`}
                />
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={form.itOfficerDetails.urgencyLevel}
                    onChange={(e) =>
                      onChange("itOfficerDetails.urgencyLevel", e.target.value)
                    }
                    className={inputField}
                  >
                    <option value="">Select Urgency Level</option>
                    {priorityOptions.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <input
                    value={form.itOfficerDetails.assignedDepartment}
                    onChange={(e) =>
                      onChange("itOfficerDetails.assignedDepartment", e.target.value)
                    }
                    placeholder="Assigned Department"
                    className={inputField}
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.itOfficerDetails.followUpRequired}
                      onChange={(e) =>
                        onChange("itOfficerDetails.followUpRequired", e.target.checked)
                      }
                    />
                    <span className="text-sm text-slate-700">Follow-up Required</span>
                  </label>
                  {form.itOfficerDetails.followUpRequired && (
                    <input
                      type="date"
                      value={form.itOfficerDetails.followUpDate}
                      onChange={(e) =>
                        onChange("itOfficerDetails.followUpDate", e.target.value)
                      }
                      className={inputField}
                    />
                  )}
                </div>
              </div>
            </section>

            {/* Section: Resource Allocation */}
            <section>
              <h3 className="text-lg font-semibold text-slate-700 mb-3">
                Resource Allocation
              </h3>
              <div className="space-y-6">
                {/* Support Officers */}
                <div>
                  <h4 className="text-md font-medium text-slate-600 mb-2">Support Officers</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <select
                      onChange={(e) => {
                        if (e.target.value && !form.resourceAllocation.supportOfficers.includes(e.target.value)) {
                          addResource('supportOfficers', e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className={inputField}
                    >
                      <option value="">Select support officer...</option>
                      {officers.filter(o => !form.resourceAllocation.supportOfficers.includes(o._id)).map(officer => (
                        <option key={officer._id} value={officer._id}>
                          {officer.name || officer.officerId} - {officer.department || 'General'}
                        </option>
                      ))}
                    </select>
                    <div className="flex flex-wrap gap-2">
                      {form.resourceAllocation.supportOfficers.map(officerId => {
                        const officer = officers.find(o => o._id === officerId);
                        return (
                          <div key={officerId} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                            {officer?.name || officer?.officerId || officerId}
                            <button
                              type="button"
                              onClick={() => removeResource('supportOfficers', officerId)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Vehicles */}
                <div>
                  <h4 className="text-md font-medium text-slate-600 mb-2">Vehicles</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <select
                      onChange={(e) => {
                        if (e.target.value && !form.resourceAllocation.vehicles.includes(e.target.value)) {
                          addResource('vehicles', e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className={inputField}
                    >
                      <option value="">Select vehicle...</option>
                      {vehicles.filter(v => !form.resourceAllocation.vehicles.includes(v.id)).map(vehicle => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.name} - {vehicle.type} ({vehicle.status})
                        </option>
                      ))}
                    </select>
                    <div className="flex flex-wrap gap-2">
                      {form.resourceAllocation.vehicles.map(vehicleId => {
                        const vehicle = vehicles.find(v => v.id === vehicleId);
                        return (
                          <div key={vehicleId} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                            {vehicle?.name || vehicleId}
                            <button
                              type="button"
                              onClick={() => removeResource('vehicles', vehicleId)}
                              className="text-green-600 hover:text-green-800"
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Firearms */}
                <div>
                  <h4 className="text-md font-medium text-slate-600 mb-2">Firearms</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <select
                      onChange={(e) => {
                        if (e.target.value && !form.resourceAllocation.firearms.includes(e.target.value)) {
                          addResource('firearms', e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className={inputField}
                    >
                      <option value="">Select firearm...</option>
                      {firearms.filter(f => !form.resourceAllocation.firearms.includes(f.id)).map(firearm => (
                        <option key={firearm.id} value={firearm.id}>
                          {firearm.name} - {firearm.type} ({firearm.status})
                        </option>
                      ))}
                    </select>
                    <div className="flex flex-wrap gap-2">
                      {form.resourceAllocation.firearms.map(firearmId => {
                        const firearm = firearms.find(f => f.id === firearmId);
                        return (
                          <div key={firearmId} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                            {firearm?.name || firearmId}
                            <button
                              type="button"
                              onClick={() => removeResource('firearms', firearmId)}
                              className="text-red-600 hover:text-red-800"
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section: Additional Information (Optional) */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-slate-700">
                  Additional Information
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAdditionalInfo(!showAdditionalInfo)}
                  className="text-sm text-[#0B214A] hover:text-[#0A1E42] font-medium"
                >
                  {showAdditionalInfo ? 'Hide' : 'Show'} Additional Information
                </button>
              </div>
              
              {showAdditionalInfo && (
                <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="grid grid-cols-1 gap-4">
                    <select
                      value={form.idInfo.idType}
                      onChange={(e) => onChange("idInfo.idType", e.target.value)}
                      className={inputField}
                    >
                      <option value="">Select ID Type</option>
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
                    <input
                      value={form.estimatedLoss}
                      onChange={(e) => onChange("estimatedLoss", e.target.value)}
                      placeholder="Estimated Loss (if applicable)"
                      className={inputField}
                    />
                    <select
                      value={form.priority}
                      onChange={(e) => onChange("priority", e.target.value)}
                      className={inputField}
                    >
                      <option value="">Select Priority</option>
                      {priorityOptions.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </section>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={handleClear}
                className="px-6 py-3 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
              >
                Clear Form
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/it/cases")}
                  className="px-6 py-3 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 rounded-lg bg-[#0B214A] text-white hover:bg-[#0A1E42] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating Case..." : "Create Case"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
