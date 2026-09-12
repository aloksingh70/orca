import { useEffect, useRef } from 'react'

/**
 * OceanShader
 * ---------------------------------------------------------------------------
 * High-performance ambient 2D canvas hydrodynamic wave shader.
 *
 * Performance & Battery Protections:
 * 1. Automatically pauses requestAnimationFrame loop when document is hidden (Visibility API).
 * 2. Automatically pauses animation when scrolled out of viewport (IntersectionObserver).
 * 3. Respects user system preference: prefers-reduced-motion renders static frame.
 * 4. Cleanly cancels animation frame on unmount.
 * ---------------------------------------------------------------------------
 */
export default function OceanShader({ className = 'absolute inset-0 w-full h-full pointer-events-none' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId = null
    let isVisibleInViewport = true
    let isTabVisible = !document.hidden
    let time = 0

    // Check system prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Resize canvas to physical pixel resolution
    const handleResize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(rect.width * dpr)
      canvas.height = Math.floor(rect.height * dpr)
      ctx.scale(dpr, dpr)
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    // Render a single hydrodynamic frame
    const renderFrame = (t) => {
      const rect = canvas.getBoundingClientRect()
      const w = rect.width
      const h = rect.height
      if (w === 0 || h === 0) return

      ctx.clearRect(0, 0, w, h)

      // Wave parameters for 3 layered organic depth currents
      const waves = [
        { amp: 14, freq: 0.008, speed: 0.0012, color: 'rgba(0, 122, 120, 0.07)', yOffset: 0.65 },
        { amp: 20, freq: 0.005, speed: -0.0009, color: 'rgba(16, 102, 68, 0.05)', yOffset: 0.75 },
        { amp: 10, freq: 0.012, speed: 0.0016, color: 'rgba(0, 122, 120, 0.09)', yOffset: 0.85 }
      ]

      waves.forEach((wave) => {
        ctx.beginPath()
        ctx.moveTo(0, h)

        const baseY = h * wave.yOffset
        for (let x = 0; x <= w; x += 6) {
          const y =
            baseY +
            Math.sin(x * wave.freq + t * wave.speed) * wave.amp +
            Math.cos(x * wave.freq * 0.5 + t * wave.speed * 0.8) * (wave.amp * 0.4)
          ctx.lineTo(x, y)
        }

        ctx.lineTo(w, h)
        ctx.closePath()
        ctx.fillStyle = wave.color
        ctx.fill()
      })
    }

    // Animation Loop with Visibility & Viewport Guards
    const loop = (timestamp) => {
      if (prefersReducedMotion) {
        renderFrame(0)
        return
      }

      if (isTabVisible && isVisibleInViewport) {
        time = timestamp
        renderFrame(time)
      }

      animId = requestAnimationFrame(loop)
    }

    // 1. Start Loop
    animId = requestAnimationFrame(loop)

    // 2. Visibility API Handler: Pause when tab hidden
    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // 3. IntersectionObserver: Pause when hero is not in viewport
    let observer = null
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            isVisibleInViewport = entry.isIntersecting
          })
        },
        { threshold: 0.05 }
      )
      observer.observe(canvas)
    }

    // Cleanup on unmount
    return () => {
      if (animId) cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (observer) observer.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
      style={{ opacity: 0.9 }}
    />
  )
}
