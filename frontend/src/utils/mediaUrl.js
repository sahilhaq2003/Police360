export function getMediaUrl(pathOrUrl) {
  if (!pathOrUrl) return '';
  // already absolute
  if (typeof pathOrUrl === 'string') {
    // already absolute or data/blob URL
    if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://') || pathOrUrl.startsWith('data:') || pathOrUrl.startsWith('blob:')) {
      return pathOrUrl;
    }
    // Normalize API base. If VITE_API_URL includes a trailing '/api', strip it so we prefix '/uploads' correctly.
    const rawApi = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    // remove trailing slashes then remove a trailing '/api' (case-insensitive)
    const apiBase = String(rawApi).replace(/\/+$/, '').replace(/\/api$/i, '');

    // If path already begins with /uploads or uploads/, treat it as server path and prefix API URL
    if (pathOrUrl.startsWith('/uploads') || pathOrUrl.startsWith('uploads')) {
      // ensure single slash between apiBase and uploads
      return apiBase.replace(/\/$/, '') + '/' + String(pathOrUrl).replace(/^\/+/, '');
    }

    // If it's a relative path (no leading slash) assume it's an uploads filename
    const trimmed = String(pathOrUrl).replace(/^\/+/, '');
    return `${apiBase}/uploads/${trimmed}`;
  }
  return String(pathOrUrl);
}
