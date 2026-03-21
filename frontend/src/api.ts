const API = 'https://winter-arc-production-760f.up.railway.app'

const DATA_KEY = 'winter_arc_data'

function getToken() {
  return localStorage.getItem('token')
}

export function isLoggedIn() {
  return !!getToken()
}

export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem(DATA_KEY)
  window.location.reload()
}

export async function register(email: string, username: string, password: string) {
  const res = await fetch(`${API}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Ошибка регистрации')
  localStorage.removeItem(DATA_KEY)
  localStorage.setItem('token', data.access_token)
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Ошибка входа')
  localStorage.removeItem(DATA_KEY)
  localStorage.setItem('token', data.access_token)
}

export async function loadData() {
  const res = await fetch(`${API}/api/data/`, {
    headers: { 'Authorization': `Bearer ${getToken()}` },
  })
  if (!res.ok) return null
  const data = await res.json()
  return data.payload
}

export async function saveData(payload: string) {
  await fetch(`${API}/api/data/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ payload }),
  })
}