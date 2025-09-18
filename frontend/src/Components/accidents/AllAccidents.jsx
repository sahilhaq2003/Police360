import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const URL = 'http://localhost:8000/api/accidents';

const fetchHandler = async () => {
  return await axios.get(URL).then((res) => {
    console.log('API Response:', res.data);

    if (res.data.items && Array.isArray(res.data.items)) {
      return res.data.items;
    }

    if (Array.isArray(res.data)) {
      return res.data;
    }

    return [res.data];
  });
};

function AllAccidents() {
  const [accidents, setAccidents] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchHandler().then((data) => setAccidents(data));
  }, []);

  const handleView = (accident) => {
    navigate(`/accidents/${accident._id}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Accident Records
        </h1>

        {accidents.length === 0 ? (
          <p className="text-center text-gray-500">No accidents found.</p>
        ) : (
          <div className="overflow-x-auto shadow rounded-2xl">
            <table className="min-w-full bg-white border border-gray-200 rounded-2xl">
              <thead className="bg-gray-200 text-gray-700 uppercase text-sm">
                <tr>
                  <th className="py-3 px-4 border-b">ID</th>
                  <th className="py-3 px-4 border-b">Tracking ID</th>
                  <th className="py-3 px-4 border-b">Type</th>
                  <th className="py-3 px-4 border-b">Emergency</th>
                  <th className="py-3 px-4 border-b">Location</th>
                  <th className="py-3 px-4 border-b text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm divide-y divide-gray-200">
                {accidents.map((accident) => (
                  <tr
                    key={accident._id}
                    className="hover:bg-gray-50 transition duration-200"
                  >
                    <td className="py-3 px-4">{accident._id}</td>
                    <td className="py-3 px-4">{accident.trackingId}</td>
                    <td className="py-3 px-4">{accident.accidentType}</td>
                    <td className="py-3 px-4">
                      {accident.isEmergency ? (
                        <span className="text-red-600 font-semibold">Yes</span>
                      ) : (
                        <span className="text-green-600">No</span>
                      )}
                    </td>
                    <td className="py-3 px-4">{accident.locationText}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleView(accident)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AllAccidents;
