import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../../utils/axiosInstance';
import './ReportForm.css';

const ReportForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  
  // Get report type from URL or location state
  const reportType = location.state?.reportType || 'eCrime';
  
  const [formData, setFormData] = useState({
    reportType: reportType,
    reporterName: '',
    reporterEmail: '',
    reporterPhone: '',
    reporterAddress: '',
    reporterIdNumber: '',
    reporterIdType: 'National ID',
    incidentDate: '',
    incidentLocation: '',
    incidentDescription: '',
    estimatedLoss: 0,
    insuranceInvolved: false,
    insuranceDetails: {
      company: '',
      policyNumber: '',
      contactPerson: '',
      contactPhone: ''
    },
    isConfidential: false,
    priority: 'Medium'
  });

  const [witnesses, setWitnesses] = useState([]);
  const [suspects, setSuspects] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Test backend connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await axios.get('/api/reports/test');
        console.log('Backend connection test:', response.data);
      } catch (error) {
        console.error('Backend connection test failed:', error);
      }
    };
    testConnection();
  }, []);

  // Witness form state
  const [witnessForm, setWitnessForm] = useState({
    name: '',
    phone: '',
    address: ''
  });

  // Suspect form state
  const [suspectForm, setSuspectForm] = useState({
    name: '',
    description: '',
    address: ''
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleInsuranceChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      insuranceDetails: {
        ...prev.insuranceDetails,
        [name]: value
      }
    }));
  };

  const handleWitnessChange = (e) => {
    const { name, value } = e.target;
    setWitnessForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSuspectChange = (e) => {
    const { name, value } = e.target;
    setSuspectForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addWitness = () => {
    if (witnessForm.name && witnessForm.phone) {
      setWitnesses(prev => [...prev, { ...witnessForm }]);
      setWitnessForm({ name: '', phone: '', address: '' });
    }
  };

  const removeWitness = (index) => {
    setWitnesses(prev => prev.filter((_, i) => i !== index));
  };

  const addSuspect = () => {
    if (suspectForm.name) {
      setSuspects(prev => [...prev, { ...suspectForm }]);
      setSuspectForm({ name: '', description: '', address: '' });
    }
  };

  const removeSuspect = (index) => {
    setSuspects(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newEvidence = files.map(file => ({
      file,
      type: 'Other',
      description: '',
      fileName: file.name,
      fileSize: file.size
    }));
    setEvidence(prev => [...prev, ...newEvidence]);
  };

  const removeEvidence = (index) => {
    setEvidence(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.reporterName) newErrors.reporterName = 'Reporter name is required';
    if (!formData.reporterEmail) newErrors.reporterEmail = 'Email is required';
    if (!formData.reporterPhone) newErrors.reporterPhone = 'Phone number is required';
    if (!formData.reporterAddress) newErrors.reporterAddress = 'Address is required';
    if (!formData.reporterIdNumber) newErrors.reporterIdNumber = 'ID number is required';
    if (!formData.incidentDate) newErrors.incidentDate = 'Incident date is required';
    if (!formData.incidentLocation) newErrors.incidentLocation = 'Incident location is required';
    if (!formData.incidentDescription) newErrors.incidentDescription = 'Incident description is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Add form data
      Object.keys(formData).forEach(key => {
        if (key === 'insuranceDetails') {
          submitData.append(key, JSON.stringify(formData[key]));
        } else if (key === 'incidentDate') {
          // Ensure date is in the correct format
          const date = new Date(formData[key]);
          submitData.append(key, date.toISOString());
        } else {
          submitData.append(key, formData[key]);
        }
      });

      // Add witnesses and suspects
      submitData.append('witnesses', JSON.stringify(witnesses));
      submitData.append('suspects', JSON.stringify(suspects));

      // Add evidence files
      evidence.forEach((item, index) => {
        submitData.append('files', item.file);
        submitData.append(`evidence[${index}][type]`, item.type);
        submitData.append(`evidence[${index}][description]`, item.description);
      });

      const response = await axios.post('/api/reports', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 second timeout
      });

      if (response.data.success) {
        alert(`Report submitted successfully! Report Number: ${response.data.data.reportNumber}`);
        navigate('/');
      } else {
        throw new Error(response.data.message || 'Failed to submit report');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      let errorMessage = 'Error submitting report. Please try again.';
      
      if (error.response) {
        // Server responded with error
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        // Network error
        errorMessage = 'Network error. Please check your connection and try again.';
      } else {
        // Other error
        errorMessage = error.message || errorMessage;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-form-container">
      <div className="report-form-header">
        <h1>Submit Police Report</h1>
        <p>Please fill out all required fields to submit your report</p>
      </div>

      <form onSubmit={handleSubmit} className="report-form">
        {/* Report Type */}
        <div className="form-section">
          <h3>Report Information</h3>
          <div className="form-group">
            <label>Report Type *</label>
            <select
              name="reportType"
              value={formData.reportType}
              onChange={handleInputChange}
              required
            >
              <option value="eCrime">eCrime</option>
              <option value="Tourist Police">Tourist Police</option>
              <option value="Police Report Inquiry">Police Report Inquiry</option>
              <option value="File Criminal Complaint">File Criminal Complaint</option>
              <option value="Criminal Status of Financial Cases">Criminal Status of Financial Cases</option>
              <option value="Unknown Accident Report">Unknown Accident Report</option>
              <option value="Reporting Vehicle Obstruction">Reporting Vehicle Obstruction</option>
              <option value="Traffic Violations Copy">Traffic Violations Copy</option>
              <option value="Change Vehicle Color">Change Vehicle Color</option>
              <option value="Traffic Fines Installment">Traffic Fines Installment</option>
              <option value="Event Permit">Event Permit</option>
              <option value="Photography Permit">Photography Permit</option>
              <option value="Sailing Permit">Sailing Permit</option>
              <option value="Road Closure Permit">Road Closure Permit</option>
              <option value="Detainee Visit Request">Detainee Visit Request</option>
              <option value="Police Museum Visit Permit">Police Museum Visit Permit</option>
              <option value="Inmate Visit Permit">Inmate Visit Permit</option>
              <option value="Traffic Status Certificate">Traffic Status Certificate</option>
              <option value="Lost Item Certificate">Lost Item Certificate</option>
              <option value="Gold Management Platform">Gold Management Platform</option>
              <option value="Human Trafficking Victims">Human Trafficking Victims</option>
              <option value="File a Labor Complaint">File a Labor Complaint</option>
              <option value="Child and Women Protection">Child and Women Protection</option>
              <option value="Home Security">Home Security</option>
              <option value="Suggestion">Suggestion</option>
              <option value="Feedback">Feedback</option>
            </select>
          </div>

          <div className="form-group">
            <label>Priority Level</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Reporter Information */}
        <div className="form-section">
          <h3>Reporter Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="reporterName"
                value={formData.reporterName}
                onChange={handleInputChange}
                required
              />
              {errors.reporterName && <span className="error">{errors.reporterName}</span>}
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="reporterEmail"
                value={formData.reporterEmail}
                onChange={handleInputChange}
                required
              />
              {errors.reporterEmail && <span className="error">{errors.reporterEmail}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                name="reporterPhone"
                value={formData.reporterPhone}
                onChange={handleInputChange}
                required
              />
              {errors.reporterPhone && <span className="error">{errors.reporterPhone}</span>}
            </div>
            <div className="form-group">
              <label>ID Type *</label>
              <select
                name="reporterIdType"
                value={formData.reporterIdType}
                onChange={handleInputChange}
                required
              >
                <option value="National ID">National ID</option>
                <option value="Passport">Passport</option>
                <option value="Driving License">Driving License</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>ID Number *</label>
            <input
              type="text"
              name="reporterIdNumber"
              value={formData.reporterIdNumber}
              onChange={handleInputChange}
              required
            />
            {errors.reporterIdNumber && <span className="error">{errors.reporterIdNumber}</span>}
          </div>

          <div className="form-group">
            <label>Address *</label>
            <textarea
              name="reporterAddress"
              value={formData.reporterAddress}
              onChange={handleInputChange}
              required
              rows="3"
            />
            {errors.reporterAddress && <span className="error">{errors.reporterAddress}</span>}
          </div>
        </div>

        {/* Incident Details */}
        <div className="form-section">
          <h3>Incident Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Incident Date *</label>
              <input
                type="datetime-local"
                name="incidentDate"
                value={formData.incidentDate}
                onChange={handleInputChange}
                required
              />
              {errors.incidentDate && <span className="error">{errors.incidentDate}</span>}
            </div>
            <div className="form-group">
              <label>Estimated Loss (if any)</label>
              <input
                type="number"
                name="estimatedLoss"
                value={formData.estimatedLoss}
                onChange={handleInputChange}
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Incident Location *</label>
            <input
              type="text"
              name="incidentLocation"
              value={formData.incidentLocation}
              onChange={handleInputChange}
              required
            />
            {errors.incidentLocation && <span className="error">{errors.incidentLocation}</span>}
          </div>

          <div className="form-group">
            <label>Incident Description *</label>
            <textarea
              name="incidentDescription"
              value={formData.incidentDescription}
              onChange={handleInputChange}
              required
              rows="5"
              placeholder="Please provide a detailed description of the incident..."
            />
            {errors.incidentDescription && <span className="error">{errors.incidentDescription}</span>}
          </div>
        </div>

        {/* Witnesses */}
        <div className="form-section">
          <h3>Witnesses (Optional)</h3>
          {witnesses.map((witness, index) => (
            <div key={index} className="witness-item">
              <span><strong>{witness.name}</strong> - {witness.phone}</span>
              <button type="button" onClick={() => removeWitness(index)} className="remove-btn">
                Remove
              </button>
            </div>
          ))}
          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                placeholder="Witness Name"
                value={witnessForm.name}
                onChange={(e) => handleWitnessChange({ target: { name: 'name', value: e.target.value } })}
              />
            </div>
            <div className="form-group">
              <input
                type="tel"
                placeholder="Phone Number"
                value={witnessForm.phone}
                onChange={(e) => handleWitnessChange({ target: { name: 'phone', value: e.target.value } })}
              />
            </div>
            <button type="button" onClick={addWitness} className="add-btn">
              Add Witness
            </button>
          </div>
        </div>

        {/* Suspects */}
        <div className="form-section">
          <h3>Suspects (Optional)</h3>
          {suspects.map((suspect, index) => (
            <div key={index} className="suspect-item">
              <span><strong>{suspect.name}</strong> - {suspect.description}</span>
              <button type="button" onClick={() => removeSuspect(index)} className="remove-btn">
                Remove
              </button>
            </div>
          ))}
          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                placeholder="Suspect Name"
                value={suspectForm.name}
                onChange={(e) => handleSuspectChange({ target: { name: 'name', value: e.target.value } })}
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Description"
                value={suspectForm.description}
                onChange={(e) => handleSuspectChange({ target: { name: 'description', value: e.target.value } })}
              />
            </div>
            <button type="button" onClick={addSuspect} className="add-btn">
              Add Suspect
            </button>
          </div>
        </div>

        {/* Evidence */}
        <div className="form-section">
          <h3>Evidence (Optional)</h3>
          {evidence.map((item, index) => (
            <div key={index} className="evidence-item">
              <span>{item.fileName} ({(item.fileSize / 1024 / 1024).toFixed(2)} MB)</span>
              <button type="button" onClick={() => removeEvidence(index)} className="remove-btn">
                Remove
              </button>
            </div>
          ))}
          <div className="form-group">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
            />
            <small>Maximum 5 files, 10MB each. Supported: Images, Videos, Audio, PDF, DOC</small>
          </div>
        </div>

        {/* Insurance Information */}
        <div className="form-section">
          <h3>Insurance Information (Optional)</h3>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="insuranceInvolved"
                checked={formData.insuranceInvolved}
                onChange={handleInputChange}
              />
              Insurance is involved
            </label>
          </div>
          
          {formData.insuranceInvolved && (
            <div className="insurance-details">
              <div className="form-row">
                <div className="form-group">
                  <label>Insurance Company</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.insuranceDetails.company}
                    onChange={handleInsuranceChange}
                  />
                </div>
                <div className="form-group">
                  <label>Policy Number</label>
                  <input
                    type="text"
                    name="policyNumber"
                    value={formData.insuranceDetails.policyNumber}
                    onChange={handleInsuranceChange}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Contact Person</label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.insuranceDetails.contactPerson}
                    onChange={handleInsuranceChange}
                  />
                </div>
                <div className="form-group">
                  <label>Contact Phone</label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.insuranceDetails.contactPhone}
                    onChange={handleInsuranceChange}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confidentiality */}
        <div className="form-section">
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="isConfidential"
                checked={formData.isConfidential}
                onChange={handleInputChange}
              />
              Mark this report as confidential
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button type="button" onClick={() => navigate('/')} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportForm; 