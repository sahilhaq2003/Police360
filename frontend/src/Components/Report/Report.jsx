import React from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Report(props) {
  const {
    _id,
    reportType,
    priority,
    reporterName,
    reporterEmail,
    reporterPhone,
    reporterAddress,
    reporterIdNumber,
    reporterIdType,
    incidentDate,
    incidentLocation,
    incidentDescription,
    estimatedLoss,
    witnesses = [],
    suspects = [],
    evidence = [],
    insuranceInvolved,
    insuranceDetails,
    isConfidential,
  } = props.report;

  const navigate = useNavigate();

  const deleteHandler = async () => {
    try {
      await axios.delete(`http://localhost:8000/api/reports/${_id}`);
      navigate("/reports");
    } catch (err) {
      console.error("Delete failed:", err.message);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-3">
      <h1 className="text-xl font-bold">Report Display</h1>

      <h2>ID: {_id}</h2>
      <h2>Report Type: {reportType}</h2>
      <h2>Priority: {priority}</h2>
      <h2>Reporter Name: {reporterName}</h2>
      <h2>Reporter Email: {reporterEmail}</h2>
      <h2>Reporter Phone: {reporterPhone}</h2>
      <h2>Reporter Address: {reporterAddress}</h2>
      <h2>Reporter ID Number: {reporterIdNumber}</h2>
      <h2>Reporter ID Type: {reporterIdType}</h2>
      <h2>Incident Date: {incidentDate}</h2>
      <h2>Incident Location: {incidentLocation}</h2>
      <h2>Incident Description: {incidentDescription}</h2>
      <h2>Estimated Loss: {estimatedLoss}</h2>

      <h2>
        Witnesses:{" "}
        {Array.isArray(witnesses) && witnesses.length > 0
          ? witnesses.map((w) => w.name || JSON.stringify(w)).join(", ")
          : "None"}
      </h2>

      <h2>
        Suspects:{" "}
        {Array.isArray(suspects) && suspects.length > 0
          ? suspects.map((s) => s.name || JSON.stringify(s)).join(", ")
          : "None"}
      </h2>

      <h2>
        Evidence:{" "}
        {Array.isArray(evidence) && evidence.length > 0
          ? evidence.map((e) => e.fileName || JSON.stringify(e)).join(", ")
          : "None"}
      </h2>

      <h2>Insurance Involved: {insuranceInvolved ? "Yes" : "No"}</h2>
      <h2>
        Insurance Details:{" "}
        {insuranceDetails
          ? JSON.stringify(insuranceDetails)
          : "No Insurance Info"}
      </h2>
      <h2>Confidential: {isConfidential ? "Yes" : "No"}</h2>

      <div className="flex gap-3 mt-4">
        <Link to={`/reports/${_id}`}>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Update
          </button>
        </Link>
        <button
          onClick={deleteHandler}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default Report;
