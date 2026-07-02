import { Trophy, RotateCcw, Chrome as Home } from 'lucide-react'

export default function WinModal({ attempts, winningNumber, onPlayAgain, onHome }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm animate-fade-in" />
      <div className="relative w-full max-w-md animate-pop">
        <div className="card overflow-hidden border-electric-500/40">
          <div className="relative bg-gradient-to-br from-electric-600 to-electric-700 px-8 py-10 text-center">
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.4), transparent 60%)',
            }} />
            <div className="relative">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm animate-glow">
                <Trophy size={42} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">¡Felicidades!</h2>
              <p className="mt-2 text-blue-100">Has adivinado el número secreto</p>
            </div>
          </div>

          <div className="px-8 py-7 text-center">
            <p className="mb-1 text-sm text-ink-400">Número secreto</p>
            <p className="mb-5 font-mono text-4xl font-bold tracking-[0.3em] text-electric-400">
              {winningNumber}
            </p>
            <p className="mb-6 text-sm text-ink-300">
              Lo lograste en{' '}
              <strong className="text-ink-100">{attempts}</strong>{' '}
              {attempts === 1 ? 'intento' : 'intentos'}.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button onClick={onPlayAgain} className="btn-primary flex-1">
                <RotateCcw size={18} /> Jugar de nuevo
              </button>
              <button onClick={onHome} className="btn-ghost flex-1">
                <Home size={18} /> Ir al lobby
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
