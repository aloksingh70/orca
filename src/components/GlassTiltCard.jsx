import { useState, useRef } from 'react'

export default function GlassTiltCard({
  children,
  className = '',
  accentColor = '#17A398',
  maxTilt = 12,
  ...props
}) {
  const cardRef = useRef(null)
  const [style, setStyle] = useState({
    transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
    transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)'
  })
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 })

  const handleMouseMove = (e) => {
    const card = cardRef.current
    if (!card) return

    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const xPct = x / rect.width
    const yPct = y / rect.height

    const rotX = ((0.5 - yPct) * maxTilt * 2).toFixed(2)
    const rotY = ((xPct - 0.5) * maxTilt * 2).toFixed(2)

    setStyle({
      transform: `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: 'transform 0.1s ease-out'
    })

    setGlare({
      x: (xPct * 100).toFixed(1),
      y: (yPct * 100).toFixed(1),
      opacity: 0.18
    })
  }

  const handleMouseLeave = () => {
    setStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)'
    })
    setGlare((prev) => ({ ...prev, opacity: 0 }))
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={style}
      className={`relative rounded-2xl border border-white/10 bg-[#071927]/60 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.37)] transition-colors overflow-hidden group ${className}`}
      {...props}
    >
      {/* Dynamic Specular Glare Reflection */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle 280px at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, 0.18), transparent 80%)`,
          opacity: glare.opacity
        }}
      />

      {/* Subtle Top-Border Specular Highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Corner Accent Light */}
      <div
        className="pointer-events-none absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"
        style={{ backgroundColor: accentColor }}
      />

      {children}
    </div>
  )
}
