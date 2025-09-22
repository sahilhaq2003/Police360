import React from 'react'
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Report(props) {
    const {_id,reportType,priority,reporterName,reporterEmail,reporterPhone,reporterAddress,reporterIdNumber,reporterIdType,incidentDate,incidentLocation,incidentDescription,estimatedLoss,witnesses,suspects,evidence,insuranceInvolved,insuranceDetails}= props.report;

    const history = useNavigate();

    const deleteHandler = async () => {
        await axios.delete(`http://localhost:8000/api/reports/${_id}`)
        .then(res => res.data)
        .then(() =>  history("/"))
        .then(() => history("/reports"));
    };

  return (
    <div>
        <br></br><br></br>
      <h1>Report Display</h1>
      <br></br>
        <h1>ID: {_id}</h1>
        <h1>Report Type: {reportType}</h1>
        <h1>Priority: {priority}</h1>
        <h1>Reporter Name: {reporterName}</h1>
        <h1>Reporter Email: {reporterEmail}</h1>
        <h1>Reporter Phone: {reporterPhone}</h1>
        <h1>Reporter Address: {reporterAddress}</h1>
        <h1>Reporter ID Number: {reporterIdNumber}</h1>
        <h1>Reporter ID Type: {reporterIdType}</h1>
        <h1>Incident Date: {incidentDate}</h1>
        <h1>Incident Location: {incidentLocation}</h1>
        <h1>Incident Description: {incidentDescription}</h1>
        <h1>Estimated Loss: {estimatedLoss}</h1>
        <h1>Witnesses: {witnesses.join(", ")}</h1>
        <h1>Suspects: {suspects.join(", ")}</h1>
        <h1>Evidence: {evidence.join(", ")}</h1>
        <h1>Insurance Involved: {insuranceInvolved ? "Yes" : "No"}</h1>
        <h1>Insurance Details: {insuranceDetails}</h1>
        <Link to={`/reports/${_id}`}>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Update
          </button>
        </Link>
          <button onClick={deleteHandler} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 ml-2">
            Delete
          </button>
        
        
    </div>  
  )
}

export default Report
