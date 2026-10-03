import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

export default function Ocean3DCanvas() {
  const mountRef = useRef(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const width = container.clientWidth || 550
    const height = container.clientHeight || 550

    // 1. Scene, Camera & Renderer
    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000)
    camera.position.set(0, 0, 8.5)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    // Master Group for Mouse-Parallax
    const masterGroup = new THREE.Group()
    scene.add(masterGroup)

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0x082538, 2.5)
    scene.add(ambientLight)

    const mainLight = new THREE.DirectionalLight(0x2ca6a4, 3.5)
    mainLight.position.set(5, 5, 5)
    scene.add(mainLight)

    const rimLight = new THREE.PointLight(0x4c7fe0, 3, 20)
    rimLight.position.set(-5, -4, 4)
    scene.add(rimLight)

    const bottomGlow = new THREE.PointLight(0x3fa35c, 2.5, 15)
    bottomGlow.position.set(0, -5, -2)
    scene.add(bottomGlow)

    // 3. Stylized Ocean Depth Sphere
    // Inner Translucent Core
    const coreGeo = new THREE.SphereGeometry(2.3, 40, 40)
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x051a28,
      roughness: 0.2,
      metalness: 0.8,
      transparent: true,
      opacity: 0.85
    })
    const coreMesh = new THREE.Mesh(coreGeo, coreMat)
    masterGroup.add(coreMesh)

    // Bathymetric Depth Contour Wireframe (Isobath lines)
    const wireGeo = new THREE.SphereGeometry(2.35, 24, 16)
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x17a398,
      wireframe: true,
      transparent: true,
      opacity: 0.38
    })
    const wireMesh = new THREE.Mesh(wireGeo, wireMat)
    masterGroup.add(wireMesh)

    // Equatorial & Latitude Depth Rings
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x2ca6a4,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    })
    const ring1 = new THREE.Mesh(new THREE.RingGeometry(2.45, 2.49, 64), ringMat)
    ring1.rotation.x = Math.PI / 2
    masterGroup.add(ring1)

    const ring2 = new THREE.Mesh(new THREE.RingGeometry(2.7, 2.73, 64), new THREE.MeshBasicMaterial({
      color: 0x4c7fe0,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    }))
    ring2.rotation.x = Math.PI / 3
    masterGroup.add(ring2)

    // 4. Sonar Scan Sweep (Revolving semi-transparent planar sweep)
    const sweepGroup = new THREE.Group()
    const sweepSegments = 32
    const sweepGeo = new THREE.BufferGeometry()
    const sweepPositions = []
    const sweepColors = []
    const sweepRadius = 3.2

    sweepPositions.push(0, 0, 0)
    sweepColors.push(0.09, 0.64, 0.60, 0.8)

    for (let i = 0; i <= sweepSegments; i++) {
      const angle = (i / sweepSegments) * (Math.PI / 3) // 60-degree beam
      const x = Math.cos(angle) * sweepRadius
      const z = Math.sin(angle) * sweepRadius
      sweepPositions.push(x, 0, z)
      const alpha = 1 - i / sweepSegments
      sweepColors.push(0.09, 0.64, 0.60, alpha * 0.4)
    }

    const indices = []
    for (let i = 1; i <= sweepSegments; i++) {
      indices.push(0, i, i + 1)
    }
    sweepGeo.setIndex(indices)
    sweepGeo.setAttribute('position', new THREE.Float32BufferAttribute(sweepPositions, 3))
    sweepGeo.setAttribute('color', new THREE.Float32BufferAttribute(sweepColors, 4))

    const sweepMat = new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false
    })
    const sweepMesh = new THREE.Mesh(sweepGeo, sweepMat)
    sweepGroup.add(sweepMesh)
    masterGroup.add(sweepGroup)

    // 5. Orbiting Oceanographic Telemetry Buoy / Sensor Satellite
    const buoyGroup = new THREE.Group()
    const buoyBodyGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.35, 16)
    const buoyBodyMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.9,
      roughness: 0.1
    })
    const buoyMesh = new THREE.Mesh(buoyBodyGeo, buoyBodyMat)

    // Solar panels on buoy
    const panelGeo = new THREE.BoxGeometry(0.55, 0.04, 0.16)
    const panelMat = new THREE.MeshBasicMaterial({ color: 0x17a398 })
    const panelMesh = new THREE.Mesh(panelGeo, panelMat)
    buoyMesh.add(panelMesh)

    // Beacon antenna with pulsing light
    const antennaGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8)
    const antennaMat = new THREE.MeshBasicMaterial({ color: 0xe86014 })
    const antennaMesh = new THREE.Mesh(antennaGeo, antennaMat)
    antennaMesh.position.y = 0.28
    buoyMesh.add(antennaMesh)

    const beaconPoint = new THREE.PointLight(0xe86014, 2, 4)
    beaconPoint.position.y = 0.4
    buoyMesh.add(beaconPoint)

    buoyGroup.add(buoyMesh)
    masterGroup.add(buoyGroup)

    // 6. Floating Bathymetric Sounding Particle Cloud
    const particleCount = 120
    const particleGeo = new THREE.BufferGeometry()
    const particlePositions = new Float32Array(particleCount * 3)
    const particleColors = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 2 - 1)
      const r = 2.6 + Math.random() * 0.9

      particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      particlePositions[i * 3 + 2] = r * Math.cos(phi)

      // Gradient particle colors (Teal, Blue, Emerald)
      const colorChoice = Math.random()
      if (colorChoice > 0.6) {
        particleColors[i * 3] = 0.09; particleColors[i * 3 + 1] = 0.64; particleColors[i * 3 + 2] = 0.60 // Teal
      } else if (colorChoice > 0.3) {
        particleColors[i * 3] = 0.30; particleColors[i * 3 + 1] = 0.50; particleColors[i * 3 + 2] = 0.88 // Blue
      } else {
        particleColors[i * 3] = 0.25; particleColors[i * 3 + 1] = 0.64; particleColors[i * 3 + 2] = 0.36 // Emerald
      }
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3))

    const particleMat = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    })
    const particleCloud = new THREE.Points(particleGeo, particleMat)
    masterGroup.add(particleCloud)

    // 7. Mouse-Parallax Spring Interpolation State
    let mouseX = 0
    let mouseY = 0
    let targetRotX = 0
    let targetRotY = 0
    let currentRotX = 0
    let currentRotY = 0

    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
      mouseX = Math.max(-1, Math.min(1, x))
      mouseY = Math.max(-1, Math.min(1, y))

      targetRotY = mouseX * 0.65
      targetRotX = -mouseY * 0.5
    }

    window.addEventListener('mousemove', onMouseMove)

    // 8. Visibility & Viewport Intersection Guard (Saves GPU when scrolled offscreen)
    let isRenderingActive = true
    const observer = new IntersectionObserver(
      ([entry]) => {
        isRenderingActive = entry.isIntersecting
      },
      { threshold: 0.1 }
    )
    observer.observe(container)

    const onVisibilityChange = () => {
      isRenderingActive = !document.hidden && observer
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    // 9. Resize Handler
    const onResize = () => {
      if (!container) return
      const newWidth = container.clientWidth
      const newHeight = container.clientHeight
      camera.aspect = newWidth / newHeight
      camera.updateProjectionMatrix()
      renderer.setSize(newWidth, newHeight)
    }
    window.addEventListener('resize', onResize)

    // 10. Animation Render Loop (Physics Spring Motion)
    let clock = new THREE.Clock()
    let animationId

    const animate = () => {
      animationId = requestAnimationFrame(animate)

      if (!isRenderingActive) return

      const elapsed = clock.getElapsedTime()

      // Continuous nautical auto-rotation
      coreMesh.rotation.y = elapsed * 0.12
      wireMesh.rotation.y = elapsed * 0.18
      particleCloud.rotation.y = -elapsed * 0.08

      // Sonar Scan beam sweep
      sweepGroup.rotation.y = -elapsed * 1.5

      // Orbiting buoy trajectory
      const orbitRadius = 3.3
      const orbitSpeed = elapsed * 0.8
      buoyMesh.position.x = Math.cos(orbitSpeed) * orbitRadius
      buoyMesh.position.z = Math.sin(orbitSpeed) * orbitRadius
      buoyMesh.position.y = Math.sin(orbitSpeed * 2) * 0.4
      buoyMesh.rotation.y = -orbitSpeed + Math.PI / 2

      // Antenna beacon pulsation
      beaconPoint.intensity = 1.5 + Math.sin(elapsed * 6) * 1.2

      // Buttery mouse-parallax spring lerp
      currentRotX += (targetRotX - currentRotX) * 0.055
      currentRotY += (targetRotY - currentRotY) * 0.055

      masterGroup.rotation.x = currentRotX + 0.1
      masterGroup.rotation.y = currentRotY

      renderer.render(scene, camera)
    }

    animate()
    setIsLoaded(true)

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      observer.disconnect()

      // Dispose Geometries & Materials
      coreGeo.dispose()
      coreMat.dispose()
      wireGeo.dispose()
      wireMat.dispose()
      ringMat.dispose()
      ring1.geometry.dispose()
      ring2.geometry.dispose()
      sweepGeo.dispose()
      sweepMat.dispose()
      buoyBodyGeo.dispose()
      buoyBodyMat.dispose()
      panelGeo.dispose()
      panelMat.dispose()
      antennaGeo.dispose()
      antennaMat.dispose()
      particleGeo.dispose()
      particleMat.dispose()

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  return (
    <div className="relative w-full aspect-square max-w-[560px] mx-auto flex items-center justify-center">
      {/* Three.js Canvas Container */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing select-none"
        style={{ touchAction: 'none' }}
        aria-label="Interactive 3D Ocean-Depth Sonar Sounder"
      />

      {/* Radial Depth Lighting Halo Behind Sphere */}
      <div className="absolute inset-8 rounded-full bg-[#17A398]/10 blur-3xl pointer-events-none -z-10" />
      <div className="absolute inset-16 rounded-full bg-[#4C7FE0]/10 blur-2xl pointer-events-none -z-10" />

      {/* Real-Time Depth Coordinate HUD Overlay */}
      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[10px] font-mono text-teal-300/80 bg-[#071927]/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-teal-500/20 pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          <span>INCOIS TELEMETRY: 3D DEPTH SPHERE ACTIVE</span>
        </div>
        <span className="hidden sm:inline text-white/50">MOVE CURSOR TO ORIENT SONAR</span>
      </div>
    </div>
  )
}
