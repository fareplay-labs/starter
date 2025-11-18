// @ts-nocheck
import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'

const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 50;
`

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  life: number
  maxLife: number
  color: string
  type: 'sparkle' | 'coin' | 'confetti' | 'firework'
  rotation?: number
  rotationSpeed?: number
  gravity?: number
  fadeRate?: number
}

interface WinParticlesProps {
  winTier: 'small' | 'medium' | 'large' | 'mega' | null
  isActive: boolean
  originY?: number // Y position of the payline as percentage (default 50%)
}

export const WinParticles: React.FC<WinParticlesProps> = ({ winTier, isActive, originY = 50 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const particlesRef = useRef<Particle[]>([])

  useEffect(() => {
    // Do not stop immediately when isActive becomes false.
    // Only fully reset when there's no win tier (component will usually unmount).
    if (!winTier) {
      particlesRef.current = []
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Create particles based on win tier
    const createParticles = () => {
      const particles: Particle[] = []
      const centerY = (canvas.offsetHeight * originY) / 100
      const centerX = canvas.offsetWidth / 2

      switch (winTier) {
        case 'small':
          // Small win: 20 sparkles from payline
          for (let i = 0; i < 20; i++) {
            particles.push({
              x: centerX + (Math.random() - 0.5) * canvas.offsetWidth * 0.6,
              y: centerY,
              vx: (Math.random() - 0.5) * 2,
              vy: -Math.random() * 3 - 1,
              size: Math.random() * 3 + 1,
              life: 60,
              maxLife: 60,
              color: '#FFD700',
              type: 'sparkle',
              gravity: 0.05,
              fadeRate: 1,
            })
          }
          break

        case 'medium':
          // Medium win: 50 coins falling
          for (let i = 0; i < 50; i++) {
            particles.push({
              x: Math.random() * canvas.offsetWidth,
              y: -20 - Math.random() * 100,
              vx: (Math.random() - 0.5) * 1,
              vy: Math.random() * 2 + 2,
              size: Math.random() * 6 + 4,
              life: 150,
              maxLife: 150,
              color: '#FFA500',
              type: 'coin',
              rotation: Math.random() * Math.PI * 2,
              rotationSpeed: (Math.random() - 0.5) * 0.2,
              gravity: 0.15,
              fadeRate: 0.5,
            })
          }
          break

        case 'large':
          // Large win: 100+ confetti burst
          for (let i = 0; i < 100; i++) {
            const angle = (Math.PI * 2 * i) / 100
            const speed = Math.random() * 8 + 4
            particles.push({
              x: centerX,
              y: centerY,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed - 3,
              size: Math.random() * 8 + 3,
              life: 120,
              maxLife: 120,
              color: ['#FF6347', '#FFD700', '#00CED1', '#FF69B4', '#32CD32'][
                Math.floor(Math.random() * 5)
              ],
              type: 'confetti',
              rotation: Math.random() * Math.PI * 2,
              rotationSpeed: (Math.random() - 0.5) * 0.3,
              gravity: 0.2,
              fadeRate: 0.8,
            })
          }
          break

        case 'mega':
          // Mega win: Full-screen fireworks
          for (let i = 0; i < 200; i++) {
            const burstCount = 5
            const burstIndex = Math.floor(i / (200 / burstCount))
            const burstX = (canvas.offsetWidth / (burstCount + 1)) * (burstIndex + 1)
            const burstY = centerY + (Math.random() - 0.5) * 100

            const angle = (Math.PI * 2 * i) / (200 / burstCount)
            const speed = Math.random() * 12 + 6

            particles.push({
              x: burstX + (Math.random() - 0.5) * 30,
              y: burstY,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              size: Math.random() * 10 + 2,
              life: 180,
              maxLife: 180,
              color: ['#FF00FF', '#00FFFF', '#FFFF00', '#FF1493', '#00FF00', '#FF4500'][
                Math.floor(Math.random() * 6)
              ],
              type: 'firework',
              rotation: Math.random() * Math.PI * 2,
              rotationSpeed: (Math.random() - 0.5) * 0.5,
              gravity: 0.1,
              fadeRate: 0.6,
            })
          }
          break
      }

      return particles
    }

    // Only create new particles while active; when deactivated, let existing
    // particles finish animating and fade out naturally.
    if (isActive) {
      particlesRef.current = createParticles()
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      particlesRef.current = particlesRef.current.filter(particle => {
        // Update position
        particle.x += particle.vx
        particle.y += particle.vy

        // Apply gravity
        if (particle.gravity) {
          particle.vy += particle.gravity
        }

        // Update rotation
        if (particle.rotation !== undefined && particle.rotationSpeed) {
          particle.rotation += particle.rotationSpeed
        }

        // Update life
        particle.life -= particle.fadeRate || 1

        const opacity = Math.max(0, particle.life / particle.maxLife)

        if (particle.life > 0 && particle.y < canvas.offsetHeight + 20) {
          ctx.save()
          ctx.globalAlpha = opacity

          // Move to particle position
          ctx.translate(particle.x, particle.y)

          // Apply rotation if exists
          if (particle.rotation !== undefined) {
            ctx.rotate(particle.rotation)
          }

          // Draw based on type
          switch (particle.type) {
            case 'sparkle':
              // Draw sparkle as star
              ctx.fillStyle = particle.color
              ctx.shadowBlur = 10
              ctx.shadowColor = particle.color
              const spikes = 5
              const outerRadius = particle.size
              const innerRadius = particle.size * 0.5

              ctx.beginPath()
              for (let i = 0; i < spikes * 2; i++) {
                const radius = i % 2 === 0 ? outerRadius : innerRadius
                const angle = (i / (spikes * 2)) * Math.PI * 2
                const x = Math.cos(angle) * radius
                const y = Math.sin(angle) * radius
                if (i === 0) ctx.moveTo(x, y)
                else ctx.lineTo(x, y)
              }
              ctx.closePath()
              ctx.fill()
              break

            case 'coin':
              // Draw coin as circle with gradient
              const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size)
              gradient.addColorStop(0, '#FFD700')
              gradient.addColorStop(0.7, particle.color)
              gradient.addColorStop(1, '#B8860B')

              ctx.fillStyle = gradient
              ctx.shadowBlur = 15
              ctx.shadowColor = particle.color
              ctx.beginPath()
              ctx.arc(0, 0, particle.size, 0, Math.PI * 2)
              ctx.fill()
              break

            case 'confetti':
              // Draw confetti as rectangle
              ctx.fillStyle = particle.color
              ctx.shadowBlur = 5
              ctx.shadowColor = particle.color
              ctx.fillRect(
                -particle.size / 2,
                -particle.size / 2,
                particle.size,
                particle.size * 0.6
              )
              break

            case 'firework':
              // Draw firework as glowing orb
              const fwGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size)
              fwGradient.addColorStop(0, 'white')
              fwGradient.addColorStop(0.3, particle.color)
              fwGradient.addColorStop(1, 'transparent')

              ctx.fillStyle = fwGradient
              ctx.shadowBlur = 20
              ctx.shadowColor = particle.color
              ctx.beginPath()
              ctx.arc(0, 0, particle.size, 0, Math.PI * 2)
              ctx.fill()
              break
          }

          ctx.restore()
          return true
        }
        return false
      })

      // Continue animation if particles exist
      if (particlesRef.current.length > 0 || isActive) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [winTier, isActive, originY])

  return <Canvas ref={canvasRef} />
}
