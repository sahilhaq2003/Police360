import React, { useState } from 'react';
import api from '../../utils/accidentapi';
import AdditionalDetails from './additionalDetails';
import BasicDetails from './basicDetails';

export default function AccidentForm() {
  const [form, setForm] = useState({
    accidentType: 'ROAD_ACCIDENT',
    isEmergency: true, // default to emergency quick mode
    nic: '',
    locationText: '',
    victim: {
      fullName: '',
      phone: '',
      email: '',
      address: '',
      insuranceCompany: '',
      insurancePolicyNo: '',
    },
    vehicle: {
      plateNo: '',
      make: '',
      model: '',
      color: '',
      ownerNIC: '',
    },
  });

  const [evidence, setEvidence] = useState([]);
  const [banner, setBanner] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function updateField(path, value) {
    setForm((prev) => {
      const clone = structuredClone(prev);
      const parts = path.split('.');
      let cur = clone;
      parts.forEach((p, i) => {
        if (i === parts.length - 1) cur[p] = value;
        else cur = cur[p];
      });
      return clone;
    });
  }

  function onFiles(files) {
    const arr = Array.from(files || []);
    arr.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setEvidence((prev) => [
          ...prev,
          { name: f.name, url: e.target.result },
        ]);
      };
      reader.readAsDataURL(f);
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setBanner(null);

    const payload = {
      accidentType: form.accidentType,
      isEmergency: form.isEmergency,
      nic: form.nic || undefined,
      locationText: form.locationText,
      evidence: evidence.map((x) => x.url),
      victim: form.isEmergency ? undefined : form.victim,
      vehicle: form.isEmergency ? undefined : form.vehicle,
    };

    try {
      const res = await api.post('/api/accidents/report', payload);
      setBanner({
        type: 'success',
        message: `Reported successfully. Tracking ID: ${res.trackingId}${
          res.insuranceRefNo ? `, Insurance Ref: ${res.insuranceRefNo}` : ''
        }`,
      });
      setEvidence([]);
      setForm({
        accidentType: 'ROAD_ACCIDENT',
        isEmergency: true,
        nic: '',
        locationText: '',
        victim: {
          fullName: '',
          phone: '',
          email: '',
          address: '',
          insuranceCompany: '',
          insurancePolicyNo: '',
        },
        vehicle: {
          plateNo: '',
          make: '',
          model: '',
          color: '',
          ownerNIC: '',
        },
      });
    } catch (err) {
      setBanner({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="mx-auto max-w-3xl bg-white rounded-2xl shadow p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">
          Accident Reporting Form
        </h1>

        {banner && (
          <div
            className={`mb-6 rounded-xl px-4 py-3 text-sm ${
              banner.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {banner.message}
          </div>
        )}

        {/* Emergency toggle */}
        <div className="mb-6">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isEmergency"
              checked={form.isEmergency}
              onChange={(e) => updateField('isEmergency', e.target.checked)}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <span className="text-slate-700 font-medium">
              This is an <b>Emergency</b> accident
            </span>
          </label>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Common fields */}
          <BasicDetails
            form={form}
            updateField={updateField}
            evidence={evidence}
            onFiles={onFiles}
          />

          {/* Non-emergency details */}
          {!form.isEmergency && (
            <AdditionalDetails
              victim={form.victim}
              vehicle={form.vehicle}
              updateField={updateField}
            />
          )}

          <div className="pt-6">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-indigo-600 text-white py-3 font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
