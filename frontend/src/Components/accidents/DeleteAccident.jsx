import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

export default function DeleteAccident({ accidentId, onDeleted }) {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!accidentId) return;
    const ok = window.confirm(
      'Are you sure you want to delete this accident? This cannot be undone.'
    );
    if (!ok) return;

    try {
      setDeleting(true);
      setError('');
      await axiosInstance.delete(`/accidents/${accidentId}`);
      // optional callback for parent
      onDeleted?.();
      // navigate back to list page
      navigate('../../officer/AssignAccidents');
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-3 mt-8">
      {error && (
        <div className="w-full rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-700 text-sm">
          {error}
        </div>
      )}
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
      >
        {deleting ? 'Deleting…' : 'Remove Accident From the Records'}
      </button>
    </div>
  );
}
