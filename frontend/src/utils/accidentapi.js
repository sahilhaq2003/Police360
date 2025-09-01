// simple API helper that works for both local dev and prod behind a proxy
export const API_BASE =
  import.meta.env.VITE_API_BASE?.replace(/\/+$/, '') || 'http://localhost:5000';

export async function postJSON(path, payload) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(data?.error || data?.message || 'Request failed');
  return data;
}
