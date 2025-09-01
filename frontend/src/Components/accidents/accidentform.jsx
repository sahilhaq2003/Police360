import React, { useState } from 'react';
import { postJSON } from '../../utils/accidentapi';

const ACCIDENT_TYPES = [
  { value: 'ROAD_ACCIDENT', label: 'Road Accident' },
  { value: 'FIRE', label: 'Fire' },
  { value: 'STRUCTURAL_COLLAPSE', label: 'Structural Collapse' },
  { value: 'OTHER', label: 'Other' },
];

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
      const res = await postJSON('/api/accidents/report', payload);
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
              checked={form.isEmergency}
              onChange={(e) => updateField('isEmergency', e.target.checked)}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <span className="text-slate-700 font-medium">
              This is an <b>Emergency</b> accident (quick form)
            </span>
          </label>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Common fields */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Accident Type
            </label>
            <select
              value={form.accidentType}
              onChange={(e) => updateField('accidentType', e.target.value)}
              className="w-full rounded-xl border-slate-300 shadow-sm focus:ring-indigo-500"
            >
              {ACCIDENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              NIC (optional)
            </label>
            <input
              type="text"
              value={form.nic}
              onChange={(e) => updateField('nic', e.target.value)}
              className="w-full rounded-xl border-slate-300 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Location <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.locationText}
              onChange={(e) => updateField('locationText', e.target.value)}
              required
              className="w-full rounded-xl border-slate-300 shadow-sm"
            />
          </div>

          {/* Evidence */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Evidence (images/videos)
            </label>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(e) => onFiles(e.target.files)}
              className="block w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {evidence.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                {evidence.map((ev, idx) => (
                  <div key={idx} className="relative">
                    {ev.url.startsWith('data:video') ? (
                      <video
                        src={ev.url}
                        controls
                        className="rounded-lg border border-slate-200"
                      />
                    ) : (
                      <img
                        src={ev.url}
                        alt={ev.name}
                        className="rounded-lg border border-slate-200"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Non-emergency details */}
          {!form.isEmergency && (
            <>
              <div className="border-t pt-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">
                  Victim Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={form.victim.fullName}
                    onChange={(e) =>
                      updateField('victim.fullName', e.target.value)
                    }
                    className="rounded-xl border-slate-300 shadow-sm"
                  />
                  <input
                    type="text"
                    placeholder="Phone"
                    value={form.victim.phone}
                    onChange={(e) =>
                      updateField('victim.phone', e.target.value)
                    }
                    className="rounded-xl border-slate-300 shadow-sm"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={form.victim.email}
                    onChange={(e) =>
                      updateField('victim.email', e.target.value)
                    }
                    className="rounded-xl border-slate-300 shadow-sm"
                  />
                  <input
                    type="text"
                    placeholder="Address"
                    value={form.victim.address}
                    onChange={(e) =>
                      updateField('victim.address', e.target.value)
                    }
                    className="rounded-xl border-slate-300 shadow-sm"
                  />
                  <input
                    type="text"
                    placeholder="Insurance Company"
                    value={form.victim.insuranceCompany}
                    onChange={(e) =>
                      updateField('victim.insuranceCompany', e.target.value)
                    }
                    className="rounded-xl border-slate-300 shadow-sm"
                  />
                  <input
                    type="text"
                    placeholder="Policy No."
                    value={form.victim.insurancePolicyNo}
                    onChange={(e) =>
                      updateField('victim.insurancePolicyNo', e.target.value)
                    }
                    className="rounded-xl border-slate-300 shadow-sm"
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">
                  Vehicle Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Plate No."
                    value={form.vehicle.plateNo}
                    onChange={(e) =>
                      updateField('vehicle.plateNo', e.target.value)
                    }
                    className="rounded-xl border-slate-300 shadow-sm"
                  />
                  <input
                    type="text"
                    placeholder="Make"
                    value={form.vehicle.make}
                    onChange={(e) =>
                      updateField('vehicle.make', e.target.value)
                    }
                    className="rounded-xl border-slate-300 shadow-sm"
                  />
                  <input
                    type="text"
                    placeholder="Model"
                    value={form.vehicle.model}
                    onChange={(e) =>
                      updateField('vehicle.model', e.target.value)
                    }
                    className="rounded-xl border-slate-300 shadow-sm"
                  />
                  <input
                    type="text"
                    placeholder="Color"
                    value={form.vehicle.color}
                    onChange={(e) =>
                      updateField('vehicle.color', e.target.value)
                    }
                    className="rounded-xl border-slate-300 shadow-sm"
                  />
                  <input
                    type="text"
                    placeholder="Owner NIC"
                    value={form.vehicle.ownerNIC}
                    onChange={(e) =>
                      updateField('vehicle.ownerNIC', e.target.value)
                    }
                    className="rounded-xl border-slate-300 shadow-sm md:col-span-2"
                  />
                </div>
              </div>
            </>
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
