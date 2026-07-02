import { useEffect, useState } from 'react'
import AuthScreen from './components/AuthScreen.jsx'
import Lobby from './components/Lobby.jsx'
import GameScreen from './components/GameScreen.jsx'

const STORAGE_KEY = 'picas_auth'

function loadAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && parsed.token && parsed.playerId) return parsed
    return null
  } catch {
    return null
  }
}

export default function App() {
  const [auth, setAuth] = useState(null)
  const [screen, setScreen] = useState('auth')
  const [gameid, setGameid] = useState(null)

  useEffect(() => {
    const stored = loadAuth()
    if (stored) {
      setAuth(stored)
      setScreen('lobby')
    }
  }, [])

  const handleAuth = (data) => {
    setAuth(data)
    setScreen('lobby')
  }

  const handleStart = (id) => {
    setGameid(id)
    setScreen('game')
  }

  const handlePlayAgain = () => {
    setGameid(null)
    setScreen('lobby')
  }

  const handleHome = () => {
    setGameid(null)
    setScreen('lobby')
  }

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setAuth(null)
    setGameid(null)
    setScreen('auth')
  }

  if (!auth || screen === 'auth') {
    return <AuthScreen onAuth={handleAuth} />
  }

  if (screen === 'game' && gameid !== null) {
    return (
      <GameScreen
        auth={auth}
        gameid={gameid}
        onPlayAgain={handlePlayAgain}
        onHome={handleHome}
        onLogout={handleLogout}
      />
    )
  }

  return (
    <Lobby
      auth={auth}
      onStart={handleStart}
      onLogout={handleLogout}
    />
  )
}
