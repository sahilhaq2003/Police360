import React, { useEffect, useMemo, useState } from 'react';
import { updateAccident, addInvestigationNote } from '../../utils/accidentapi';

export default function AccidentUpdatePanel({ accident, onUpdated }) {
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);
  const [banner, setBanner] = useState(null);

  const [draft, setDraft] = useState(null);

  // seed draft when accident changes
  useEffect(() => {
    if (!accident) return;
    setDraft({
      status: accident.status || 'REPORTED',
      accidentType: accident.accidentType || 'OTHER',
      locationText: accident.locationText || '',
      victim: {
        fullName: accident.victim?.fullName || '',
        phone: accident.victim?.phone || '',
        email: accident.victim?.email || '',
        address: accident.victim?.address || '',
        insuranceCompany: accident.victim?.insuranceCompany || '',
        insurancePolicyNo: accident.victim?.insurancePolicyNo || '',
        insuranceRefNo: accident.victim?.insuranceRefNo || '',
      },
      vehicle: {
        plateNo: accident.vehicle?.plateNo || '',
        make: accident.vehicle?.make || '',
        model: accident.vehicle?.model || '',
        color: accident.vehicle?.color || '',
        ownerNIC: accident.vehicle?.ownerNIC || '',
      },
      evidence: Array.isArray(accident.evidence) ? [...accident.evidence] : [],
    });
  }, [accident]);

  const setDraftField = (path, value) => {
    setDraft((prev) => {
      const clone = structuredClone(prev || {});
      const parts = path.split('.');
      let cur = clone;
      parts.forEach((p, i) => {
        if (i === parts.length - 1) cur[p] = value;
        else {
          cur[p] = cur[p] ?? {};
          cur = cur[p];
        }
      });
      return clone;
    });
  };

  // --- LOCK LOGIC: true if any victim/vehicle field already exists on the accident ---
  const victimLocked = useMemo(() => {
    const v = accident?.victim;
    if (!v) return false;
    const vals = [
      v.fullName,
      v.phone,
      v.email,
      v.address,
      v.insuranceCompany,
      v.insurancePolicyNo,
      v.insuranceRefNo,
    ];
    return vals.some((x) => x && String(x).trim() !== '');
  }, [accident]);

  const vehicleLocked = useMemo(() => {
    const ve = accident?.vehicle;
    if (!ve) return false;
    const vals = [ve.plateNo, ve.make, ve.model, ve.color, ve.ownerNIC];
    return vals.some((x) => x && String(x).trim() !== '');
  }, [accident]);

  // Evidence handlers
  const onFiles = (files) => {
    const arr = Array.from(files || []);
    arr.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setDraft((prev) => ({
          ...prev,
          evidence: [...(prev?.evidence || []), e.target.result],
        }));
      };
      reader.readAsDataURL(f);
    });
  };

  const removeEvidence = (idx) => {
    setDraft((prev) => {
      const copy = [...(prev?.evidence || [])];
      copy.splice(idx, 1);
      return { ...prev, evidence: copy };
    });
  };

  const onSaveChanges = async () => {
    if (!draft) return;
    try {
      setSaving(true);
      setBanner(null);

      // Build payload; only include victim/vehicle if NOT locked.
      const payload = {
        status: draft.status,
        accidentType: draft.accidentType,
        locationText: draft.locationText,
        evidence: draft.evidence,
      };
      if (!victimLocked) payload.victim = draft.victim;
      if (!vehicleLocked) payload.vehicle = draft.vehicle;

      const updated = await updateAccident(accident._id, payload);
      setEditMode(false);
      setBanner({ type: 'success', message: 'Changes saved.' });
      onUpdated?.(updated);
    } catch (e) {
      setBanner({
        type: 'error',
        message: e?.response?.data?.message || e?.message || 'Save failed',
      });
    } finally {
      setSaving(false);
    }
  };

  const onAddNote = async () => {
    const text = (noteText || '').trim();
    if (!text) return;
    try {
      setNoteSaving(true);
      setBanner(null);
      const updated = await addInvestigationNote(accident._id, text);
      setNoteText('');
      setBanner({ type: 'success', message: 'Note added.' });
      onUpdated?.(updated);
    } catch (e) {
      setBanner({
        type: 'error',
        message: e?.response?.data?.message || e?.message || 'Add note failed',
      });
    } finally {
      setNoteSaving(false);
    }
  };

  const evidence = useMemo(() => draft?.evidence || [], [draft]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-slate-900">
          Update / Investigation
        </h2>
        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            Edit Details
          </button>
        ) : (
          <div className="space-x-2">
            <button
              onClick={() => {
                setEditMode(false);
                // reset to persisted values
                if (accident) {
                  setDraft({
                    status: accident.status || 'REPORTED',
                    accidentType: accident.accidentType || 'OTHER',
                    locationText: accident.locationText || '',
                    victim: {
                      fullName: accident.victim?.fullName || '',
                      phone: accident.victim?.phone || '',
                      email: accident.victim?.email || '',
                      address: accident.victim?.address || '',
                      insuranceCompany: accident.victim?.insuranceCompany || '',
                      insurancePolicyNo:
                        accident.victim?.insurancePolicyNo || '',
                      insuranceRefNo: accident.victim?.insuranceRefNo || '',
                    },
                    vehicle: {
                      plateNo: accident.vehicle?.plateNo || '',
                      make: accident.vehicle?.make || '',
                      model: accident.vehicle?.model || '',
                      color: accident.vehicle?.color || '',
                      ownerNIC: accident.vehicle?.ownerNIC || '',
                    },
                    evidence: Array.isArray(accident.evidence)
                      ? [...accident.evidence]
                      : [],
                  });
                }
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={onSaveChanges}
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {banner && (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            banner.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {banner.message}
        </div>
      )}

      {/* EDIT FORM */}
      {editMode && draft && (
        <div className="space-y-8">
          {/* Overview */}
          <section className="space-y-4">
            <h3 className="text-md font-medium text-slate-900">Overview</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Status
                </label>
                <select
                  className="w-full rounded-xl border-slate-300 shadow-sm h-10 px-3"
                  value={draft.status}
                  onChange={(e) => setDraftField('status', e.target.value)}
                >
                  <option value="REPORTED">REPORTED</option>
                  <option value="UNDER_INVESTIGATION">
                    UNDER_INVESTIGATION
                  </option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Accident Type
                </label>
                <select
                  className="w-full rounded-xl border-slate-300 shadow-sm h-10 px-3"
                  value={draft.accidentType}
                  onChange={(e) =>
                    setDraftField('accidentType', e.target.value)
                  }
                >
                  <option value="ROAD_ACCIDENT">Road Accident</option>
                  <option value="FIRE">Fire</option>
                  <option value="STRUCTURAL_COLLAPSE">
                    Structural Collapse
                  </option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border-slate-300 shadow-sm h-10 px-3"
                  value={draft.locationText}
                  onChange={(e) =>
                    setDraftField('locationText', e.target.value)
                  }
                />
              </div>
            </div>
          </section>

          {/* Victim */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-medium text-slate-900">Victim</h3>
              {victimLocked && (
                <span className="text-xs rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
                  Locked (already provided)
                </span>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <input
                type="text"
                placeholder="Full Name"
                className="rounded-xl border-slate-300 shadow-sm h-10 px-3"
                value={draft.victim.fullName}
                onChange={(e) =>
                  setDraftField('victim.fullName', e.target.value)
                }
                disabled={victimLocked}
              />
              <input
                type="text"
                placeholder="Phone"
                className="rounded-xl border-slate-300 shadow-sm h-10 px-3"
                value={draft.victim.phone}
                onChange={(e) => setDraftField('victim.phone', e.target.value)}
                disabled={victimLocked}
              />
              <input
                type="email"
                placeholder="Email"
                className="rounded-xl border-slate-300 shadow-sm h-10 px-3"
                value={draft.victim.email}
                onChange={(e) => setDraftField('victim.email', e.target.value)}
                disabled={victimLocked}
              />
              <input
                type="text"
                placeholder="Address"
                className="rounded-xl border-slate-300 shadow-sm h-10 px-3"
                value={draft.victim.address}
                onChange={(e) =>
                  setDraftField('victim.address', e.target.value)
                }
                disabled={victimLocked}
              />
              <input
                type="text"
                placeholder="Insurance Company"
                className="rounded-xl border-slate-300 shadow-sm h-10 px-3"
                value={draft.victim.insuranceCompany}
                onChange={(e) =>
                  setDraftField('victim.insuranceCompany', e.target.value)
                }
                disabled={victimLocked}
              />
              <input
                type="text"
                placeholder="Policy No."
                className="rounded-xl border-slate-300 shadow-sm h-10 px-3"
                value={draft.victim.insurancePolicyNo}
                onChange={(e) =>
                  setDraftField('victim.insurancePolicyNo', e.target.value)
                }
                disabled={victimLocked}
              />
              <input
                type="text"
                placeholder="Insurance Ref"
                className="rounded-xl border-slate-300 shadow-sm h-10 px-3 md:col-span-2"
                value={draft.victim.insuranceRefNo}
                onChange={(e) =>
                  setDraftField('victim.insuranceRefNo', e.target.value)
                }
                disabled={victimLocked}
              />
            </div>
            {victimLocked && (
              <p className="text-xs text-slate-500">
                Victim details were already provided and can’t be modified.
              </p>
            )}
          </section>

          {/* Vehicle */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-medium text-slate-900">Vehicle</h3>
              {vehicleLocked && (
                <span className="text-xs rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
                  Locked (already provided)
                </span>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <input
                type="text"
                placeholder="Plate No."
                className="rounded-xl border-slate-300 shadow-sm h-10 px-3"
                value={draft.vehicle.plateNo}
                onChange={(e) =>
                  setDraftField('vehicle.plateNo', e.target.value)
                }
                disabled={vehicleLocked}
              />
              <input
                type="text"
                placeholder="Make"
                className="rounded-xl border-slate-300 shadow-sm h-10 px-3"
                value={draft.vehicle.make}
                onChange={(e) => setDraftField('vehicle.make', e.target.value)}
                disabled={vehicleLocked}
              />
              <input
                type="text"
                placeholder="Model"
                className="rounded-xl border-slate-300 shadow-sm h-10 px-3"
                value={draft.vehicle.model}
                onChange={(e) => setDraftField('vehicle.model', e.target.value)}
                disabled={vehicleLocked}
              />
              <input
                type="text"
                placeholder="Color"
                className="rounded-xl border-slate-300 shadow-sm h-10 px-3"
                value={draft.vehicle.color}
                onChange={(e) => setDraftField('vehicle.color', e.target.value)}
                disabled={vehicleLocked}
              />
              <input
                type="text"
                placeholder="Owner NIC"
                className="rounded-xl border-slate-300 shadow-sm h-10 px-3 md:col-span-2"
                value={draft.vehicle.ownerNIC}
                onChange={(e) =>
                  setDraftField('vehicle.ownerNIC', e.target.value)
                }
                disabled={vehicleLocked}
              />
            </div>
            {vehicleLocked && (
              <p className="text-xs text-slate-500">
                Vehicle details were already provided and can’t be modified.
              </p>
            )}
          </section>

          {/* Evidence */}
          <section className="space-y-4">
            <h3 className="text-md font-medium text-slate-900">Evidence</h3>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(e) => onFiles(e.target.files)}
              className="block w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {evidence.length > 0 && (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {evidence.map((ev, idx) => (
                  <div
                    key={idx}
                    className="relative overflow-hidden rounded-xl border border-slate-200"
                  >
                    <button
                      type="button"
                      onClick={() => removeEvidence(idx)}
                      className="absolute right-2 top-2 rounded bg-white/90 px-2 py-0.5 text-xs shadow hover:bg-white"
                    >
                      Remove
                    </button>
                    {typeof ev === 'string' && ev.startsWith('data:video') ? (
                      <video
                        src={ev}
                        controls
                        className="h-40 w-full object-cover"
                      />
                    ) : (
                      <img
                        src={ev}
                        alt={`ev-${idx}`}
                        className="h-40 w-full object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Add investigation note (always visible) */}
      <div className="pt-4 border-t border-slate-200">
        <h3 className="text-md font-medium text-slate-900 mb-2">
          Add Investigation Note
        </h3>
        <textarea
          rows={3}
          className="w-full rounded-xl border-slate-300 shadow-sm px-3 py-2"
          placeholder="Write a new note…"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
        />
        <div className="mt-3 flex justify-end">
          <button
            onClick={onAddNote}
            disabled={noteSaving || !noteText.trim()}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {noteSaving ? 'Adding…' : 'Add Note'}
          </button>
        </div>
      </div>
    </div>
  );
}
