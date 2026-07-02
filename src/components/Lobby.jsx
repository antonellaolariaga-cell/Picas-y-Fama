import { useState } from 'react'
import { Play, Loader as Loader2, LogOut, CircleAlert as AlertCircle, Sparkles } from 'lucide-react'
import Logo from './Logo.jsx'
import { startGame } from '../api/client.js'

export default function Lobby({ auth, onStart, onLogout }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleStart = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await startGame(auth.playerId)
      if (!res || res.gameid === undefined || res.gameid === null) {
        throw new Error('La API no devolvió un gameid válido.')
      }
      onStart(res.gameid)
    } catch (err) {
      setError(err.message || 'No se pudo iniciar la partida.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg animate-slide-up">
        <div className="mb-8 flex items-center justify-between">
          <Logo size="md" />
          <button
            onClick={onLogout}
            className="btn-ghost text-sm"
            title="Cerrar sesión"
          >
            <LogOut size={16} /> Salir
          </button>
        </div>

        <div className="card overflow-hidden">
          <div className="relative border-b border-ink-700 bg-gradient-to-br from-ink-850 to-ink-900 px-8 py-12 text-center">
            <div className="absolute inset-0 opacity-30" style={{
              backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(37,99,235,0.25), transparent 60%)',
            }} />
            <div className="relative">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-electric-500 bg-ink-900 shadow-[0_0_40px_rgba(37,99,235,0.4)] animate-glow">
                <Sparkles size={36} className="text-electric-400" />
              </div>
              <h1 className="text-3xl font-bold text-ink-100">¡Hola, jugador!</h1>
              <p className="mt-2 text-ink-400">
                ID de sesión:{' '}
                <code className="rounded-md bg-ink-800 px-2 py-1 font-mono text-xs text-electric-400">
                  {auth.playerId}
                </code>
              </p>
            </div>
          </div>

          <div className="px-8 py-8">
            <h2 className="mb-2 text-xl font-bold text-ink-100">¿Listo para el reto?</h2>
            <p className="mb-6 text-sm leading-relaxed text-ink-300">
              El juego consiste en adivinar un número secreto de <strong className="text-ink-100">4 dígitos diferentes</strong>.
              Recibirás pistas: una <strong className="text-electric-400">Fama</strong> por cada dígito correcto
              en la posición correcta, y una <strong className="text-amber-400">Pica</strong> por cada dígito
              correcto en una posición equivocada.
            </p>

            {error && (
              <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300 animate-shake">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleStart}
              disabled={loading}
              className="btn-primary w-full py-4 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 size={22} className="animate-spin" />
                  Iniciando partida…
                </>
              ) : (
                <>
                  <Play size={22} fill="currentColor" />
                  Iniciar Nueva Partida
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
