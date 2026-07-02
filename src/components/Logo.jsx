export default function Logo({ size = 'md' }) {
  const sizes = {
    sm: { box: 'h-9 w-9', text: 'text-base' },
    md: { box: 'h-12 w-12', text: 'text-xl' },
    lg: { box: 'h-16 w-16', text: 'text-2xl' },
  }
  const s = sizes[size] || sizes.md

  return (
    <div className="flex items-center gap-3">
      <div
        className={`${s.box} flex items-center justify-center rounded-xl border-2 border-electric-500 bg-ink-900 font-mono font-bold text-electric-500 ${s.text} shadow-[0_0_20px_rgba(37,99,235,0.3)]`}
      >
        PF
      </div>
      <div className="leading-tight">
        <p className="font-bold tracking-tight text-ink-100">Picas y Famas</p>
        <p className="text-xs font-medium text-ink-400">Universidad Nacional de Córdoba</p>
      </div>
    </div>
  )
}
