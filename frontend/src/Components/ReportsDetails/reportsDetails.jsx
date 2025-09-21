import React, { useState, useEffect } from "react";
import axios from "axios";
import Report from "../Report/Report";

const URL = "http://localhost:8000/api/reporting";

const fetchHandler = async () => {
  const res = await axios.get(URL);
  return res.data; // full response
};

function ReportsDetails() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchHandler().then((data) => {
      // adjust to backend shape
      if (data?.data?.docs) {
        setReports(data.data.docs);
      } else if (data?.reports) {
        setReports(data.reports);
      } else {
        setReports([]);
      }
    });
  }, []);

  return (
    <div>
      <h1>Reports Details</h1>
      <div>
        {reports.length > 0 ? (
          reports.map((report, i) => (
            <div key={report._id || i}>
              <Report report={report} />
            </div>
          ))
        ) : (
          <p>No reports found</p>
        )}
      </div>
    </div>
  );
}

export default ReportsDetails;
