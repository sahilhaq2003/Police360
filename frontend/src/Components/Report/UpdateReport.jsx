import React, { useEffect,useState } from 'react'
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

function UpdateReport() {
    const [input, setInput] = useState({});
    const id = useParams().id;
    const history = useNavigate();

    useEffect(() => {
        const fetchHandler = async () => {
            await axios
            .get(`http://localhost:8000/api/reports/${id}`)
            .then((res) => res.data)
            .then((data) => setInput(data.report));
        };
        fetchHandler();
    }, [id]);


    const sendRequest = async () => {
        await axios.put(`http://localhost:8000/api/reports/${id}`, {
            reportType: String(input.reportType),
            priority: String(input.priority),
            reporterName: String(input.reporterName),
            reporterEmail: String(input.reporterEmail),
            reporterPhone: Number(input.reporterPhone),
            reporterAddress: String(input.reporterAddress),
            reporterIdNumber: String(input.reporterIdNumber),
            reporterIdType: String(input.reporterIdType),
            incidentDate: String(input.incidentDate),
            incidentLocation: String(input.incidentLocation),
            incidentDescription: String(input.incidentDescription),
            estimatedLoss: Number(input.estimatedLoss),
            witnesses: input.witnesses.split(',').map(witness => ({ name: witness.trim() })),
            suspects: input.suspects.split(',').map(suspect => ({ name: suspect.trim() })),
            evidence: input.evidence, // Already an array of objects from handleSubmit
            insuranceInvolved: Boolean(input.insuranceInvolved),
            insuranceDetails: String(input.insuranceDetails)
        })
        .then(res => res.data);
    };

    const handleChange = (e) => {
    setInputs((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Convert evidence string to array of objects
    console.log(input);
    sendRequest().then(() => 
        history('/reports'));
  };

  return (
    <div>
      <h1>Update Report</h1>
      {/* Add form or components to update the report */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="reportType"
          placeholder="Report Type"
          value={inputs.reportType}
          onChange={handleChange}
        />
        <input
          type="text"
          name="priority"
          placeholder="Priority"
          value={inputs.priority}
          onChange={handleChange}
        />
        <input
          type="text"
          name="reporterName"
          placeholder="Reporter Name"
          value={inputs.reporterName}
          onChange={handleChange}
        />
        <input
          type="email"
          name="reporterEmail"
          placeholder="Reporter Email"
          value={inputs.reporterEmail}
          onChange={handleChange}
        />
        <input
          type="text"
          name="reporterPhone"
          placeholder="Reporter Phone"
          value={inputs.reporterPhone}
          onChange={handleChange}
        />
        <input
          type="text"
          name="reporterAddress"
          placeholder="Reporter Address"
          value={inputs.reporterAddress}
          onChange={handleChange}
        />
        <input
          type="text"
          name="reporterIdNumber"
          placeholder="Reporter ID Number"
          value={inputs.reporterIdNumber}
          onChange={handleChange}
        />
        <input
          type="text"
          name="reporterIdType"
          placeholder="Reporter ID Type"
          value={inputs.reporterIdType}
          onChange={handleChange}
        />
        <input
          type="date"
          name="incidentDate"
          placeholder="Incident Date"
          value={inputs.incidentDate}
          onChange={handleChange}
        />
        <input
          type="text"
          name="incidentLocation"
          placeholder="Incident Location"
          value={inputs.incidentLocation}
          onChange={handleChange}
        />
        <textarea
          name="incidentDescription"
          placeholder="Incident Description"
          value={inputs.incidentDescription}
          onChange={handleChange}
        />
        <input
          type="number"
          name="estimatedLoss"
          placeholder="Estimated Loss"
          value={inputs.estimatedLoss}
          onChange={handleChange}
        />
        <input
          type="text"
          name="witnesses"
          placeholder="Witnesses (comma separated)"
          value={inputs.witnesses}
          onChange={handleChange}
        />
        <input
          type="text"
          name="suspects"
          placeholder="Suspects (comma separated)"
          value={inputs.suspects}
          onChange={handleChange}
        />
        <input
          type="text"
          name="evidence"
          placeholder="Evidence (comma separated)"
          value={inputs.evidence}
          onChange={handleChange}
        />
        <label>
          Insurance Involved:
          <input
            type="checkbox"
            name="insuranceInvolved"
            checked={inputs.insuranceInvolved}
            onChange={handleChange}
          />
        </label>
        <textarea
          name="insuranceDetails"
          placeholder="Insurance Details"
          value={inputs.insuranceDetails}
          onChange={handleChange}
        />
        <button type="submit">Submit Report</button>
      </form>
    </div>
  )
}

export default UpdateReport
