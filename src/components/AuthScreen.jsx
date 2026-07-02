import { useState } from 'react'
import { UserPlus, LogIn, Loader as Loader2, CircleAlert as AlertCircle, Eye, EyeOff } from 'lucide-react'
import Logo from './Logo.jsx'
import { register, login, extractPlayerId } from '../api/client.js'

const EMPTY = {
  lastname: '',
  firstname: '',
  age: '',
  email: '',
  password: '',
}

export default function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState(EMPTY)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isRegister = mode === 'register'

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    setError('')
  }

  const switchMode = () => {
    setMode((m) => (m === 'login' ? 'register' : 'login'))
    setError('')
  }

  const validate = () => {
    if (isRegister) {
      if (!form.lastname.trim() || !form.firstname.trim()) return 'Nombre y apellido son obligatorios.'
      if (!form.age || Number(form.age) < 5 || Number(form.age) > 120) return 'Edad inválida.'
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Correo electrónico inválido.'
    if (form.password.length < 4) return 'La contraseña debe tener al menos 4 caracteres.'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const v = validate()
    if (v) {
      setError(v)
      return
    }

    setLoading(true)
    try {
      const payload = isRegister
        ? register({
            lastname: form.lastname.trim(),
            firstname: form.firstname.trim(),
            age: Number(form.age),
            email: form.email.trim(),
            password: form.password,
          })
        : login({ email: form.email.trim(), password: form.password })

      const res = await payload
      const playerId = extractPlayerId(res)
      if (!playerId) throw new Error('No se pudo extraer el identificador del jugador.')

      const authData = { token: res.token, playerId }
      localStorage.setItem('picas_auth', JSON.stringify(authData))
      onAuth(authData)
    } catch (err) {
      setError(err.message || 'Ocurrió un error inesperado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md animate-slide-up">
        <div className="mb-8 flex justify-center">
          <Logo size="lg" />
        </div>

        <div className="card p-7">
          <div className="mb-6 flex rounded-xl border border-ink-700 bg-ink-850 p-1">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                mode === 'login'
                  ? 'bg-electric-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.35)]'
                  : 'text-ink-300 hover:text-ink-100'
              }`}
            >
              <LogIn size={16} /> Ingresar
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                mode === 'register'
                  ? 'bg-electric-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.35)]'
                  : 'text-ink-300 hover:text-ink-100'
              }`}
            >
              <UserPlus size={16} /> Registrarse
            </button>
          </div>

          <h1 className="mb-1 text-2xl font-bold text-ink-100">
            {isRegister ? 'Crea tu cuenta' : 'Bienvenido de nuevo'}
          </h1>
          <p className="mb-6 text-sm text-ink-400">
            {isRegister
              ? 'Regístrate para empezar a jugar Picas y Famas.'
              : 'Inicia sesión para continuar jugando.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label" htmlFor="firstname">Nombre</label>
                  <input
                    id="firstname"
                    className="input-field"
                    value={form.firstname}
                    onChange={update('firstname')}
                    placeholder="Juan"
                    autoComplete="given-name"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="lastname">Apellido</label>
                  <input
                    id="lastname"
                    className="input-field"
                    value={form.lastname}
                    onChange={update('lastname')}
                    placeholder="Pérez"
                    autoComplete="family-name"
                  />
                </div>
              </div>
            )}

            {isRegister && (
              <div>
                <label className="label" htmlFor="age">Edad</label>
                <input
                  id="age"
                  type="number"
                  min="5"
                  max="120"
                  className="input-field"
                  value={form.age}
                  onChange={update('age')}
                  placeholder="20"
                />
              </div>
            )}

            <div>
              <label className="label" htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                type="email"
                className="input-field"
                value={form.email}
                onChange={update('email')}
                placeholder="juan@unal.edu.co"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label" htmlFor="password">Contraseña</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pr-12"
                  value={form.password}
                  onChange={update('password')}
                  placeholder="••••••••"
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 transition-colors hover:text-ink-200"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300 animate-shake">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Procesando…
                </>
              ) : isRegister ? (
                <>
                  <UserPlus size={18} /> Crear cuenta
                </>
              ) : (
                <>
                  <LogIn size={18} /> Ingresar
                </>
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-ink-400">
            {isRegister ? '¿Ya tienes cuenta?' : '¿Aún no te registras?'}{' '}
            <button
              type="button"
              onClick={switchMode}
              className="font-semibold text-electric-400 transition-colors hover:text-electric-500"
            >
              {isRegister ? 'Inicia sesión' : 'Crea una cuenta'}
            </button>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-ink-500">
          API: https://localhost:7122 · Autenticación Mock
        </p>
      </div>
    </div>
  )
}
