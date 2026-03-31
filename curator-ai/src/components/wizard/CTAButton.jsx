import { useMemo, useState } from 'react'

function CTAButton({ label, disabled = false, onClick, className = '' }) {
  const [ripples, setRipples] = useState([])

  const disabledClasses = useMemo(
    () => (disabled ? 'cursor-not-allowed opacity-45 saturate-50' : 'hover:brightness-110'),
    [disabled],
  )

  const createRipple = (event) => {
    if (disabled) return
    const rect = event.currentTarget.getBoundingClientRect()
    const ripple = {
      id: `${Date.now()}-${Math.random()}`,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
    setRipples((prev) => [...prev, ripple])
    window.setTimeout(() => {
      setRipples((prev) => prev.filter((item) => item.id !== ripple.id))
    }, 540)
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onPointerDown={createRipple}
      onClick={onClick}
      className={[
        'relative overflow-hidden rounded-2xl px-6 py-3 text-sm font-semibold text-white',
        'accent-gradient shadow-[0_10px_30px_rgba(79,140,255,0.45)] transition-all duration-200',
        'focus-ring',
        disabledClasses,
        className,
      ].join(' ')}
    >
      {ripples.map((ripple) => (
        <span key={ripple.id} className="ripple" style={{ left: ripple.x, top: ripple.y }} />
      ))}
      <span className="relative z-10">{label}</span>
    </button>
  )
}

export default CTAButton
