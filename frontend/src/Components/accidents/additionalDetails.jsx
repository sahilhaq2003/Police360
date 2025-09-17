import { useState } from 'react';

export default function AdditionalDetails({ victim, vehicle, updateField }) {
  //phone validation
  const [phoneError, setPhoneError] = useState('');
  const sriLankaPhoneRegex = /^(?:0(?:7[0-8][0-9]{7}|[1-9][0-9]{8}))$/;

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    updateField('victim.phone', val);

    if (!val) {
      setPhoneError('Phone number is required');
    } else if (!sriLankaPhoneRegex.test(val)) {
      setPhoneError('Invalid Sri Lankan phone number (e.g. 0771234567)');
    } else {
      setPhoneError(''); // valid number
    }
  };

  //email validation
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email) return 'Email is required';
    if (!regex.test(email))
      return 'Enter a valid email address (e.g. example@gmail.com)';
    return '';
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    updateField('victim.email', value);
    setEmailError(validateEmail(value));
  };

  const [platenoerror, platenosetError] = useState('');

  const handleChange = (e) => {
    const value = e.target.value.toUpperCase();
    updateField('vehicle.plateNo', value);

    // Sri Lanka Plate Number Regex: 2 letters + 4 digits + optional letter
    const plateRegex = /^[A-Z]{2}\s\d{4}([A-Z])?$/;

    if (!plateRegex.test(value)) {
      platenosetError(
        'Enter a valid Sri Lankan plate number (e.g., WP 1234 or WP 1234 X)'
      );
    } else {
      platenosetError('');
    }
  };

  return (
    <>
      {/* Victim */}
      <div className="border-t pt-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Victim Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={victim.fullName}
            onChange={(e) => updateField('victim.fullName', e.target.value)}
            className="rounded-xl border-slate-300 shadow-sm h-10 pl-3"
            pattern="^[A-Za-z ]+$"
            title="Full name should only contain letters and spaces"
            required
          />
          <div>
            <input
              type="tel"
              name="phone"
              placeholder="Phone"
              value={victim.phone}
              onChange={handlePhoneChange}
              className={`rounded-xl border-slate-300 shadow-sm h-10 pl-3 w-full ${
                phoneError ? 'border-red-500' : 'border-slate-300'
              }`}
            />
            {phoneError && (
              <p className="text-red-500 text-sm mt-1">{phoneError}</p>
            )}
          </div>
          <div className="flex flex-col">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={victim.email}
              onChange={handleEmailChange}
              className={`rounded-xl border-slate-300 h-10 pl-3 shadow-sm ${
                emailError ? 'border-rose-500' : 'border-slate-300'
              }`}
              required
            />
            {emailError && (
              <span className="text-rose-500 text-sm mt-1">{emailError}</span>
            )}
          </div>
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={victim.address}
            onChange={(e) => updateField('victim.address', e.target.value)}
            className="rounded-xl border-slate-300 shadow-sm h-10 pl-3"
            pattern="^[A-Za-z0-9\s,.\-\/]+$"
            title="Enter a valid address. Letters, numbers, spaces, commas, dots, hyphens, and slashes are allowed."
            required
          />
        </div>
      </div>

      {/* Insurance */}
      <div className="border-t pt-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Insurance Details (if any)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="insuranceCompany"
            placeholder="Insurance Company"
            value={victim.insuranceCompany}
            onChange={(e) =>
              updateField('victim.insuranceCompany', e.target.value)
            }
            className="rounded-xl border-slate-300 shadow-sm h-10 pl-3"
          />
          <input
            type="text"
            name="insurancePolicyNo"
            placeholder="Policy No."
            value={victim.insurancePolicyNo}
            onChange={(e) =>
              updateField('victim.insurancePolicyNo', e.target.value)
            }
            className="rounded-xl border-slate-300 shadow-sm h-10 pl-3"
          />
        </div>
      </div>

      {/* Vehicle */}
      <div className="border-t pt-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Vehicle Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <input
              type="text"
              name="plateNo"
              placeholder="Plate No."
              value={vehicle.plateNo}
              onChange={handleChange}
              className="rounded-xl border-slate-300 shadow-sm h-10 pl-3 w-full"
            />
            {platenoerror && (
              <p className="text-rose-500 text-sm mt-1">{platenoerror}</p>
            )}
          </div>
          <input
            type="text"
            name="make"
            placeholder="Make"
            value={vehicle.make}
            onChange={(e) => updateField('vehicle.make', e.target.value)}
            className="rounded-xl border-slate-300 shadow-sm h-10 pl-3"
          />
          <input
            type="text"
            name="model"
            placeholder="Model"
            value={vehicle.model}
            onChange={(e) => updateField('vehicle.model', e.target.value)}
            className="rounded-xl border-slate-300 shadow-sm h-10 pl-3"
          />
          <input
            type="text"
            name="color"
            placeholder="Color"
            value={vehicle.color}
            onChange={(e) => updateField('vehicle.color', e.target.value)}
            className="rounded-xl border-slate-300 shadow-sm h-10 pl-3"
          />
          <input
            type="text"
            name="ownerNIC"
            placeholder="Owner NIC"
            value={vehicle.ownerNIC}
            onChange={(e) => updateField('vehicle.ownerNIC', e.target.value)}
            className="rounded-xl border-slate-200 shadow-sm md:col-span-2 h-10 pl-3"
          />
        </div>
      </div>
    </>
  );
}
