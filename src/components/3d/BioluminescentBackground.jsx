import { useEffect, useRef } from 'react'

export default function BioluminescentBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    // Bioluminescent plankton particles
    const particleCount = Math.min(45, Math.floor(width / 35))
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 0.8,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -Math.random() * 0.45 - 0.15, // gently floating upward like deep-sea plankton
      hue: Math.random() > 0.6 ? 174 : Math.random() > 0.3 ? 215 : 150, // teal, oceanic blue, soft emerald
      alpha: Math.random() * 0.5 + 0.2,
      pulseSpeed: Math.random() * 0.02 + 0.01,
      phase: Math.random() * Math.PI * 2
    }))

    // Sonar ping ripple pulses
    const pings = [
      { radius: 20, maxRadius: 380, alpha: 0.5, speed: 0.8 },
      { radius: 180, maxRadius: 380, alpha: 0.25, speed: 0.8 }
    ]

    let isVisible = true
    const handleVisibility = () => {
      isVisible = !document.hidden
    }
    document.addEventListener('visibilitychange', handleVisibility)

    let tick = 0
    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render)
        return
      }

      tick++
      ctx.clearRect(0, 0, width, height)

      // Draw Sonar Ping Radiations
      pings.forEach((ping) => {
        ping.radius += ping.speed
        if (ping.radius > ping.maxRadius) {
          ping.radius = 15
        }
        const currentAlpha = Math.max(0, 0.4 * (1 - ping.radius / ping.maxRadius))
        
        ctx.save()
        // Anchor sonar pings near top-right / upper center where the 3D sphere floats
        const centerX = width > 1024 ? width * 0.72 : width * 0.5
        const centerY = height * 0.35
        ctx.beginPath()
        ctx.arc(centerX, centerY, ping.radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(44, 166, 164, ${currentAlpha})`
        ctx.lineWidth = 1.2
        ctx.stroke()
        ctx.restore()
      })

      // Draw Bioluminescent Plankton
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.phase += p.pulseSpeed

        // Wrap around viewport edges
        if (p.y < -10) p.y = height + 10
        if (p.x < -10) p.x = width + 10
        if (p.x > width + 10) p.x = -10

        const dynamicAlpha = Math.max(0.1, p.alpha + Math.sin(p.phase) * 0.25)

        // Soft radial glow gradient for each particle
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3.5)
        gradient.addColorStop(0, `hsla(${p.hue}, 85%, 65%, ${dynamicAlpha})`)
        gradient.addColorStop(0.4, `hsla(${p.hue}, 90%, 50%, ${dynamicAlpha * 0.5})`)
        gradient.addColorStop(1, `hsla(${p.hue}, 90%, 40%, 0)`)

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius * 3.5, 0, Math.PI * 2)
        ctx.fill()
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Deep Marine Navy Ambient Light Cones */}
      <div className="absolute -top-40 -right-40 w-[650px] h-[650px] rounded-full bg-radial from-[#17A398]/15 via-[#0c2a38]/20 to-transparent blur-3xl" />
      <div className="absolute top-1/3 -left-40 w-[550px] h-[550px] rounded-full bg-radial from-[#4C7FE0]/12 via-[#061825]/20 to-transparent blur-3xl" />
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] rounded-full bg-radial from-[#3FA35C]/10 via-[#071926]/15 to-transparent blur-3xl" />

      {/* Bioluminescent Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block opacity-70"
        aria-hidden="true"
      />
    </div>
  )
}
