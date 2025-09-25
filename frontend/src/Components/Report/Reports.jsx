import React, { useState, useEffect } from 'react'
import axios from 'axios';
import Report from './Report';

const URL = "http://localhost:8000/api/reports";

const fetchReports = async () => {
    return await axios.get(URL).then(res => res.data);
}

function Reports() {

    const [reports, setReports] = useState();
    useEffect(() => {
        fetchReports().then(data => setReports(data.reports));
    }, []);

  return (
    <div>
      <h1>Reports</h1>
      <div>
        {reports && reports.map((report, i) => (
          <div key={i}>
            <Report report={report} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default Reports
