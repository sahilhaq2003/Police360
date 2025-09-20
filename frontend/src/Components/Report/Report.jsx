import React from 'react'

function Report(props) {
    const {_id,
    reportType,
      reporterName,
      reporterEmail,
      reporterPhone,
      reporterAddress,
      reporterIdNumber,
      reporterIdType,
      incidentDate,
      incidentLocation,
      incidentDescription,
      witnesses,
      suspects,
      estimatedLoss,
      insuranceInvolved,
      insuranceDetails,
      isConfidential,
      priority
    } = props.report;
  return (
    <div>
      <h1>Report Display</h1>
      <br><br></br></br>
      <h1>ID:{_id}</h1>
        <h1>Report Type:{reportType}</h1>
        <h1>Reporter Name:{reporterName}</h1>
        <h1>Reporter Email:{reporterEmail}</h1>
        <h1>Reporter Phone:{reporterPhone}</h1>
        <h1>Reporter Address:{reporterAddress}</h1>
        <h1>Reporter ID Number:{reporterIdNumber}</h1>
        <h1>Reporter ID Type:{reporterIdType}</h1>
        <h1>Incident Date:{incidentDate}</h1>
        <h1>Incident Location:{incidentLocation}</h1>
        <h1>Incident Description:{incidentDescription}</h1>
        <h1>Witnesses:{witnesses.join(", ")}</h1>
        <h1>Suspects:{suspects.join(", ")}</h1>
        <h1>Estimated Loss:{estimatedLoss}</h1>
        <h1>Insurance Involved:{insuranceInvolved}</h1>
        <h1>Insurance Details:{insuranceDetails}</h1>
        <h1>Confidential:{isConfidential ? "Yes" : "No"}</h1>
        <h1>Priority:{priority}</h1>
        <button>Update</button>
        <button>Delete</button>
    </div>
  )
}

export default Report
