const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '')
const TOKEN_KEY = 'best-gram-auth-token'
const LEGACY_TOKEN_KEY = 'bestgram-api-token'

// Старое клиентское демо-хранилище больше не является источником данных.
try { localStorage.removeItem('bestgram-storage-v3') } catch (error) { void error }

function getCookieToken() { return document.cookie.split('; ').find(item => item.startsWith('best-gram-session='))?.split('=').slice(1).join('=') || '' }
export const getApiToken = () => {
  try {
    const current = localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY) || getCookieToken()
    if (current && !localStorage.getItem(TOKEN_KEY)) localStorage.setItem(TOKEN_KEY, current)
    return current
  } catch { return getCookieToken() }
}
export const setApiToken = (token) => {
  try {
    if (token) { localStorage.setItem(TOKEN_KEY, token); localStorage.removeItem(LEGACY_TOKEN_KEY); document.cookie = `best-gram-session=${encodeURIComponent(token)}; Max-Age=15552000; Path=/; SameSite=Lax` }
    else { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(LEGACY_TOKEN_KEY); document.cookie = 'best-gram-session=; Max-Age=0; Path=/; SameSite=Lax' }
  } catch { /* storage can be disabled by private browser settings */ }
}

export async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  const token = getApiToken()
  if (token) headers.Authorization = `Bearer ${token}`
  const response = await fetch(`${API_URL}${path}`, { ...options, headers })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.error || 'Ошибка сервера')
  return body
}

export { API_URL }
