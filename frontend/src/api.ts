const API = 'https://winter-arc-production-760f.up.railway.app'

const DATA_KEY = 'winter_arc_data'

// Все ключи которые принадлежат конкретному пользователю
const USER_KEYS = [
  DATA_KEY,
  'calorie_prefs',
  'winter_arc_fact_ru',
]

function clearUserData() {
  USER_KEYS.forEach(key => localStorage.removeItem(key))
}

function getToken() {
  return localStorage.getItem('token')
}

export function isLoggedIn() {
  return !!getToken()
}

export function logout() {
  localStorage.removeItem('token')
  clearUserData()
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
  clearUserData()
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
  clearUserData()
  localStorage.setItem('token', data.access_token)
}

export async function loadData() {
  const token = getToken()
  if (!token) return null
  const res = await fetch(`${API}/api/data/`, {
    headers: { 'Authorization': `Bearer ${token}` },
  })
  if (!res.ok) return null
  const data = await res.json()
  return data.payload ?? null
}

export async function saveData(payload: string): Promise<boolean> {
  const token = getToken()
  if (!token) return false
  try {
    const res = await fetch(`${API}/api/data/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ payload }),
    })
    return res.ok
  } catch {
    return false
  }
}