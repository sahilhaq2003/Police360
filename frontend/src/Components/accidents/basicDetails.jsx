import React from 'react';
import MapPickerSriLanka from './accidentMap';
import { useState } from 'react';

export default function BasicDetails({ form, updateField, evidence, onFiles }) {
  const ACCIDENT_TYPES = [
    { value: 'ROAD_ACCIDENT', label: 'Road Accident' },
    { value: 'FIRE', label: 'Fire' },
    { value: 'STRUCTURAL_COLLAPSE', label: 'Structural Collapse' },
    { value: 'OTHER', label: 'Other' },
  ];

  // NIC validation
  const [nicError, setNicError] = useState('');

  const validateNIC = (value) => {
    const nicPattern = /^(\d{9}[VvXx]|\d{12})$/;
    return nicPattern.test(value);
  };

  return (
    <>
      {/* Accident Type */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Accident Type
        </label>
        <select
          name="accidentType"
          value={form.accidentType}
          onChange={(e) => updateField('accidentType', e.target.value)}
          required
          className="w-full rounded-xl border-slate-300 shadow-sm focus:ring-indigo-500 h-10 pl-3"
        >
          {ACCIDENT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* NIC */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          NIC<span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          name="nic"
          placeholder="123456789V or 200012345678"
          value={form.nic}
          onChange={(e) => {
            const value = e.target.value;
            updateField('nic', value);
            if (value && !validateNIC(value)) {
              setNicError('Invalid NIC format. Use 123456789V or 200012345678');
            } else {
              setNicError('');
            }
          }}
          required
          className="w-full rounded-xl border-slate-300 shadow-sm h-10 pl-3"
        />
        {nicError && <p className="text-sm text-rose-600 mt-1">{nicError}</p>}
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1 ">
          Location description <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          name="locationText"
          placeholder="e.g., A2, near Homagama Junction"
          value={form.locationText}
          onChange={(e) => updateField('locationText', e.target.value)}
          required
          className="w-full rounded-xl border-slate-300 shadow-sm h-10 pl-3"
        />
      </div>

      {/* Map Picker */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Pin the exact location on the map (Sri Lanka)
          </label>
          <MapPickerSriLanka
            value={
              form.geo?.lat && form.geo?.lng
                ? [Number(form.geo.lat), Number(form.geo.lng)]
                : null
            }
            onChange={([lat, lng]) => {
              updateField('geo.lat', lat);
              updateField('geo.lng', lng);
            }}
            height={360}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Latitude
          </label>
          <input
            type="text"
            value={form.geo?.lat ?? ''}
            readOnly
            className="w-full rounded-xl border-slate-300 bg-slate-50 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Longitude
          </label>
          <input
            type="text"
            value={form.geo?.lng ?? ''}
            readOnly
            className="w-full rounded-xl border-slate-300 bg-slate-50 shadow-sm"
          />
        </div>
      </div>

      {/* Evidence */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Evidence (images/videos)
        </label>
        <input
          type="file"
          name="evidence"
          value={form.evidence}
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
    </>
  );
}
