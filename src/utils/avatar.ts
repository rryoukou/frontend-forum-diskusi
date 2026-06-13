/**
 * Resolve avatar URL — prepend backend base URL jika path relatif dari storage Laravel.
 * e.g. "/storage/avatars/file.jpg" → "http://localhost:8000/storage/avatars/file.jpg"
 */
const BACKEND_URL = (import.meta.env.VITE_API_URL as string).replace('/api', '');

export function resolveAvatar(avatarUrl: string | null | undefined): string | null {
  if (!avatarUrl) return null;
  // Already absolute URL (http/https) or data URL → return as-is
  if (avatarUrl.startsWith('http') || avatarUrl.startsWith('data:') || avatarUrl.startsWith('blob:')) {
    return avatarUrl;
  }
  // Relative path from Laravel storage → prepend backend host
  return `${BACKEND_URL}${avatarUrl}`;
}
