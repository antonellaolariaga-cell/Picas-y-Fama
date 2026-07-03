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

export function sendGuess({ gameid, attemptedNumber, token }) {
    return request('/api/game/v1/guess', {
        method: 'POST',
        body: { gameid, attemptedNumber },
        token,
    })
}

export function startGame(playerId, token) {
  return request(/api/game/v1/start?playerId=${encodeURIComponent(playerId)}, {
      method: 'POST',

      token,

  })
}


export function extractPlayerId(tokenResponse) {
  if (!tokenResponse || !tokenResponse.token) return null
    try {
        const payload = tokenResponse.token.split('.')[1]
        const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
        console.log('Claims del token:', decoded) // dejalo un momento para ver los nombres reales
        return (
            decoded.playerId ||
            decoded.PlayerId ||
            decoded.sub ||
            decoded.nameid ||
            decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
            null
        )
    } catch {
        return null
    }
}
