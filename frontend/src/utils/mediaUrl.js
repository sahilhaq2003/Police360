export function getMediaUrl(pathOrUrl) {
  if (!pathOrUrl) return '';
  // already absolute
  if (typeof pathOrUrl === 'string' && (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://') || pathOrUrl.startsWith('data:') || pathOrUrl.startsWith('blob:') || pathOrUrl.startsWith('/uploads') || pathOrUrl.startsWith('/'))) {
    return pathOrUrl;
  }
  const api = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  // normalize leading slashes
  const trimmed = String(pathOrUrl).replace(/^\/+/, '');
  return `${api}/uploads/${trimmed}`;
}
