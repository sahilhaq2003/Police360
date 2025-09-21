import axios from 'axios';

// Create a single axios instance for all accident-related requests
const api = axios.create({
  baseURL: 'http://localhost:8000', // adjust if your backend URL changes
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetch all accidents.
 * @returns {Promise<Array>} Array of accident objects.
 */
export const getAllAccidents = async () => {
  const res = await api.get('/api/accidents');
  // Normalize: some backends return {items: [...]}, others return [...]
  if (res.data?.items && Array.isArray(res.data.items)) {
    return res.data.items;
  }
  if (Array.isArray(res.data)) {
    return res.data;
  }
  return [res.data];
};

/**
 * Fetch a single accident by its database _id.
 * @param {string} id - MongoDB _id of the accident.
 * @returns {Promise<Object>} Accident object.
 */
export const getAccidentById = async (id) => {
  const res = await api.get(`/api/accidents/${id}`);
  return res.data;
};

/**
 * Report (create) a new accident.
 * @param {Object} payload - Accident payload from the form.
 * @returns {Promise<Object>} Newly created accident record.
 */
export const reportAccident = async (payload) => {
  const res = await api.post('/api/accidents/report', payload);
  return res.data;
};

/**
 * Update an accident by id (e.g. to change status or notes).
 * @param {string} id
 * @param {Object} updates
 * @returns {Promise<Object>} Updated accident.
 */
export const updateAccident = async (id, updates) => {
  const res = await api.put(`/api/accidents/${id}`, updates);
  return res.data;
};

export const addInvestigationNote = async (id, note) => {
  const res = await api.post(`/api/accidents/${id}/notes`, { note });
  return res.data; // return updated accident OR the inserted note (your choice)
};

export const assignAccidentOfficer = async (id, officerId) => {
  const res = await api.post(`/api/accidents/${id}/assign`, { officerId });
  return res.data;
};

/**
 * Delete an accident by id.
 * @param {string} id
 * @returns {Promise<Object>} Delete confirmation.
 */
export const deleteAccident = async (id) => {
  const res = await api.delete(`/api/accidents/${id}`);
  return res.data;
};

export const getAccidentByTrackingId = async (trackingId) => {
  const res = await api.get(
    `/api/accidents/track/${encodeURIComponent(trackingId)}`
  );
  return res.data; // the accident doc
};

export default api;
