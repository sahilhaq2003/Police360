import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import AdditionalDetails from './additionalDetails';
import BasicDetails from './basicDetails';
import { ArrowLeft } from 'lucide-react';

export default function AccidentForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    accidentType: 'ROAD_ACCIDENT',
    isEmergency: true,
    nic: '',
    locationText: '',
    geo: { lat: '', lng: '' },
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
        if (i === parts.length - 1) {
          cur[p] = value;
        } else {
          cur[p] = cur[p] ?? {};
          cur = cur[p];
        }
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
      geo:
        form?.geo?.lat && form?.geo?.lng
          ? { lat: Number(form.geo.lat), lng: Number(form.geo.lng) }
          : undefined,
      evidence: evidence.map((x) => x.url),
      victim: form.isEmergency ? undefined : form.victim,
      vehicle: form.isEmergency ? undefined : form.vehicle,
    };
    function formatSriLankaPhone(phone) {
      if (!phone) return null;
      let cleaned = phone.replace(/\D/g, ''); // remove non-digits

      if (cleaned.startsWith('0')) {
        cleaned = '94' + cleaned.slice(1); // replace leading 0 with 94
      } else if (!cleaned.startsWith('94')) {
        cleaned = '94' + cleaned; // fallback
      }
      return cleaned;
    }

    try {
      const { data } = await axiosInstance.post('/accidents/report', payload);

      const phone = formatSriLankaPhone(form.victim.phone);

      if (phone) {
        const message = `Hello, this is a message regarding the accident report. Your tracking ID is ${
          data.trackingId
        }. Please keep this ID for future reference.\nYour Insurance Reference Number is ${
          data.insuranceRefNo || 'None'
        }`;
        const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
          message
        )}`;
        window.open(whatsappUrl, '_blank');
      }

      setBanner({
        type: 'success',
        message: `Reported successfully. Tracking ID: ${data.trackingId}${
          data.insuranceRefNo ? `, Insurance Ref: ${data.insuranceRefNo}` : ''
        }`,
      });

      // Reset form
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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-white py-10 px-4">
      {/* Back button ABOVE the form */}
      <div className="max-w-5xl mx-auto mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-white bg-[#0B214A] text-white text-sm font-medium shadow hover:opacity-90 transition"
        >
          <ArrowLeft size={18} />
          Back to Home
        </button>
      </div>

      {/* Form Card */}
      <div className="mx-auto max-w-5xl bg-white rounded-2xl shadow-xl border border-slate-200 p-10">
        <h1 className="text-3xl font-extrabold text-[#0B214A] mb-6 text-center">
          Accident Reporting Form
        </h1>
        <p className="text-slate-500 text-center mb-8">
          Please fill in the details below to report an accident. For
          emergencies, keep the toggle checked for a quick submission.
        </p>

        {banner && (
          <div
            className={`mb-6 rounded-xl px-4 py-3 text-sm font-medium shadow-sm ${
              banner.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {banner.message}
          </div>
        )}

        {/* Emergency toggle */}
        <div className="mb-6 flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-lg border border-slate-200">
          <input
            type="checkbox"
            name="isEmergency"
            checked={form.isEmergency}
            onChange={(e) => updateField('isEmergency', e.target.checked)}
            className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <span className="text-slate-700 font-semibold">
            Mark as <span className="text-rose-600">Emergency</span>
          </span>
        </div>

        <form onSubmit={onSubmit} className="space-y-8">
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
              className="w-full rounded-xl bg-[#0B214A] text-white py-3 font-semibold text-lg shadow hover:opacity-90 transition disabled:opacity-50 transition-colors duration-200"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
