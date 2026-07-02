import { useState, useRef, useEffect } from 'react'
import { Send, Loader as Loader2, LogOut, Chrome as Home, CircleAlert as AlertCircle, Hash, Flame, Target, History } from 'lucide-react'
import Logo from './Logo.jsx'
import WinModal from './WinModal.jsx'
import { sendGuess } from '../api/client.js'

function parsePicasFamas(message) {
  if (!message) return { famas: 0, picas: 0 }
  const famasMatch = message.match(/(\d+)\s*(?:famas|fama)/i)
  const picasMatch = message.match(/(\d+)\s*(?:picas|pica)/i)
  return {
    famas: famasMatch ? Number(famasMatch[1]) : 0,
    picas: picasMatch ? Number(picasMatch[1]) : 0,
  }
}

function validateGuess(value) {
  if (value.length === 0) return 'Ingresa un número de 4 dígitos.'
  if (value.length !== 4) return 'El número debe tener exactamente 4 dígitos.'
  if (!/^\d{4}$/.test(value)) return 'Solo se permiten dígitos numéricos.'
  const digits = value.split('')
  if (new Set(digits).size !== 4) return 'Los 4 dígitos deben ser diferentes (sin repetir).'
  return null
}

export default function GameScreen({ auth, gameid, onPlayAgain, onHome, onLogout }) {
  const [guess, setGuess] = useState('')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [won, setWon] = useState(false)
  const [winningNumber, setWinningNumber] = useState('')
  const inputRef = useRef(null)
  const listRef = useRef(null)

  const validationError = guess.length > 0 ? validateGuess(guess) : null
  const canSubmit = !loading && !won && guess.length === 4 && !validationError

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus()
  }, [])

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [history])

  const handleChange = (e) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 4)
    setGuess(v)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return

    setLoading(true)
    setError('')
    const currentGuess = guess

    try {
      const res = await sendGuess({
        gameid,
        attemptedNumber: currentGuess,
        token: auth.token,
      })

      const message = res?.message || res?.Message || ''
      const { famas, picas } = parsePicasFamas(message)
      const isWin = /¡felicidades!/i.test(message)

      const entry = {
        number: currentGuess,
        message,
        famas,
        picas,
        win: isWin,
      }
      setHistory((h) => [...h, entry])
      setGuess('')

      if (isWin) {
        setWinningNumber(currentGuess)
        setWon(true)
      }
    } catch (err) {
      setError(err.message || 'No se pudo enviar el intento.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="mx-auto max-w-2xl">
        <header className="mb-6 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <button onClick={onHome} className="btn-ghost text-sm" title="Volver al lobby">
              <Home size={16} /> Lobby
            </button>
            <button onClick={onLogout} className="btn-ghost text-sm" title="Cerrar sesión">
              <LogOut size={16} /> Salir
            </button>
          </div>
        </header>

        <div className="card mb-5 p-6 animate-slide-up">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-ink-400">Partida</p>
              <p className="font-mono text-lg font-bold text-electric-400">#{gameid}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider text-ink-400">Intentos</p>
              <p className="font-mono text-lg font-bold text-ink-100">{history.length}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <label className="label" htmlFor="guess">Tu intento</label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Hash
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400"
                />
                <input
                  ref={inputRef}
                  id="guess"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  className="input-field pl-11 font-mono text-2xl tracking-[0.4em] text-center"
                  value={guess}
                  onChange={handleChange}
                  disabled={loading || won}
                  placeholder="----"
                  maxLength={4}
                />
              </div>
              <button
                type="submit"
                disabled={!canSubmit}
                className="btn-primary px-6 text-base"
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    <Send size={18} /> Enviar
                  </>
                )}
              </button>
            </div>

            {(validationError || error) && (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm text-red-300 animate-shake">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error || validationError}</span>
              </div>
            )}

            <p className="mt-3 text-xs text-ink-500">
              Ingresa 4 dígitos diferentes. Sin repetir.
            </p>
          </form>
        </div>

        <div className="card flex flex-col animate-slide-up" style={{ minHeight: '300px' }}>
          <div className="flex items-center gap-2 border-b border-ink-700 px-6 py-4">
            <History size={18} className="text-ink-400" />
            <h3 className="font-semibold text-ink-100">Historial de intentos</h3>
            {history.length > 0 && (
              <span className="ml-auto rounded-full bg-ink-800 px-2.5 py-0.5 text-xs font-medium text-ink-300">
                {history.length} {history.length === 1 ? 'intento' : 'intentos'}
              </span>
            )}
          </div>

          <div ref={listRef} className="max-h-[420px] flex-1 overflow-y-auto px-4 py-3">
            {history.length === 0 ? (
              <div className="flex h-full min-h-[200px] flex-col items-center justify-center text-center text-ink-500">
                <Target size={40} className="mb-3 opacity-50" />
                <p className="text-sm">Aún no has realizado intentos.</p>
                <p className="text-xs">Ingresa tu primer número arriba.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {history.map((entry, idx) => (
                  <li
                    key={idx}
                    className={`flex items-center gap-4 rounded-xl border px-4 py-3 animate-fade-in ${
                      entry.win
                        ? 'border-electric-500/50 bg-electric-500/10'
                        : 'border-ink-700 bg-ink-850'
                    }`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink-900 font-mono text-sm font-bold text-ink-400">
                      {idx + 1}
                    </div>
                    <div className="font-mono text-2xl font-bold tracking-[0.25em] text-ink-100">
                      {entry.number}
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-ink-900 px-2.5 py-1.5 text-sm">
                        <Flame size={15} className="text-amber-400" />
                        <span className="font-semibold text-amber-400">{entry.famas}</span>
                        <span className="text-xs text-ink-400">F</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-ink-900 px-2.5 py-1.5 text-sm">
                        <Target size={15} className="text-electric-400" />
                        <span className="font-semibold text-electric-400">{entry.picas}</span>
                        <span className="text-xs text-ink-400">P</span>
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {history.length > 0 && (
            <div className="border-t border-ink-700 px-6 py-3">
              <p className="text-xs text-ink-400">
                <span className="font-semibold text-amber-400">Fama</span>: dígito correcto en la posición correcta.{' '}
                <span className="font-semibold text-electric-400">Pica</span>: dígito correcto en posición equivocada.
              </p>
            </div>
          )}
        </div>
      </div>

      {won && (
        <WinModal
          attempts={history.length}
          winningNumber={winningNumber}
          onPlayAgain={onPlayAgain}
          onHome={onHome}
        />
      )}
    </div>
  )
}
