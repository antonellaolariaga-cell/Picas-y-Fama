const BASE_URL = 'https://localhost:7122'

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  let data = null
  const text = await res.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { raw: text }
    }
  }

  if (!res.ok) {
    const message =
      (data && (data.message || data.error || data.title)) ||
      `Error ${res.status}: ${res.statusText}`
    const err = new Error(message)
    err.status = res.status
    err.data = data
    throw err
  }

  return data
}

export function register({ lastname, firstname, age, email, password }) {
  return request('/api/game/v1/register', {
    method: 'POST',
    body: { lastname, firstname, age, email, password },
  })
}

export function login({ email, password }) {
  return request('/api/game/v1/login', {
    method: 'POST',
    body: { email, password },
  })
}

export function startGame(playerId) {
  return request(`/api/game/v1/start?playerId=${encodeURIComponent(playerId)}`, {
    method: 'POST',
  })
}

export function sendGuess({ gameid, attemptedNumber, token }) {
  return request('/api/game/v1/guess', {
    method: 'POST',
    body: { gameid, attemptedNumber },
    token,
  })
}

export function extractPlayerId(tokenResponse) {
  if (!tokenResponse || !tokenResponse.token) return null
  const token = tokenResponse.token
  const match = token.match(/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/)
  return match ? match[1] : token
}
