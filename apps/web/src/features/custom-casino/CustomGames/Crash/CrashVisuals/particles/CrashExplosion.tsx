// @ts-nocheck
import React, { useEffect, useRef, useCallback, useMemo } from 'react'
import { type CrashExplosionProps, type ParticleData, type PhysicsConfig } from './types'
import { generateCrashExplosion, updateParticle, PARTICLE_SHAPES } from './utils'

// Physics configuration for crash explosion
const EXPLOSION_CONFIG: PhysicsConfig = {
  gravity: 300, // Increased gravity for more dramatic arc trajectories
  friction: 1.9, // Slightly reduced friction to let particles travel further
  initialVelocityRange: [60, 180], // Increased velocity range for more explosive effect
  sizeRange: [1, 4], // Smaller particles for explosion
  lifespan: 1.8, // Slightly longer lifespan to see the gravity effect
}

export const CrashExplosion: React.FC<CrashExplosionProps> = ({
  isActive,
  explosionX,
  explosionY,
  rocketDirection,
  color,
  particleCount = 20,
  intensity = 5,
  width = 800,
  height = 600,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<ParticleData[]>([])
  const animationFrameRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)
  const hasExplodedRef = useRef<boolean>(false)

  // Scale parameters based on intensity (1-10) - properly memoized to fix stale closure
  const scaledConfig = useMemo((): PhysicsConfig => {
    const intensityScale = Math.max(0.6, intensity / 5) // Minimum 0.6 (like old level 3)
    return {
      ...EXPLOSION_CONFIG,
      initialVelocityRange: [
        EXPLOSION_CONFIG.initialVelocityRange[0] * intensityScale,
        EXPLOSION_CONFIG.initialVelocityRange[1] * intensityScale,
      ],
      sizeRange: [
        EXPLOSION_CONFIG.sizeRange[0] * Math.sqrt(intensityScale), // Less size scaling
        EXPLOSION_CONFIG.sizeRange[1] * Math.sqrt(intensityScale),
      ],
      lifespan: EXPLOSION_CONFIG.lifespan * (0.8 + intensityScale * 0.2), // Slight lifespan scaling
    }
  }, [intensity])

  const scaledParticleCount = useMemo(() => {
    const intensityScale = Math.max(0.6, intensity / 5)
    return Math.round(particleCount * intensityScale)
  }, [particleCount, intensity])

  // Generate explosion particles once when activated - fixed dependencies
  const generateExplosion = useCallback(() => {
    if (!isActive || hasExplodedRef.current) return

    const newParticles = generateCrashExplosion(
      explosionX,
      explosionY,
      rocketDirection,
      color,
      scaledParticleCount,
      scaledConfig
    )

    // Add unique IDs and stagger particle birth times for more dynamic explosions
    const timestamp = Date.now()
    newParticles.forEach((particle, index) => {
      particle.id = timestamp + index
      // Stagger particles slightly (up to 100ms delay)
      const birthDelay = Math.random() * 0.1 // 0-100ms in seconds
      particle.life = Math.max(0.9, 1.0 - birthDelay) // Slightly reduce initial life for delayed particles
    })

    particlesRef.current = newParticles
    hasExplodedRef.current = true
  }, [isActive, explosionX, explosionY, rocketDirection, color, scaledParticleCount, scaledConfig])

  // Animation loop - fixed dependencies
  const animate = useCallback(
    (currentTime: number) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Calculate delta time
      const deltaTime = lastTimeRef.current ? (currentTime - lastTimeRef.current) / 1000 : 0
      lastTimeRef.current = currentTime

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and render particles
      particlesRef.current = particlesRef.current
        .map(particle => updateParticle(particle, deltaTime, scaledConfig))
        .filter(particle => particle.life > 0) // Remove dead particles

      // Render particles with pre-baked shapes and varied colors
      particlesRef.current.forEach((particle, index) => {
        const alpha = particle.life
        const size = particle.size * Math.sqrt(particle.life) // Different shrinking curve

        ctx.save()
        ctx.globalAlpha = alpha
        ctx.fillStyle = particle.variedColor // Use the varied color
        ctx.shadowColor = particle.variedColor
        ctx.shadowBlur = size * 1.5

        // Use pre-baked shapes for better performance - alternate between circles and squares
        ctx.translate(particle.x, particle.y)
        ctx.scale(size, size)

        if (index % 3 === 0) {
          // Square particles
          ctx.fill(PARTICLE_SHAPES.square)
        } else {
          // Circle particles
          ctx.fill(PARTICLE_SHAPES.circle)
        }

        ctx.restore()
      })

      // Continue animation if particles exist
      if (particlesRef.current.length > 0) {
        animationFrameRef.current = requestAnimationFrame(animate)
      }
    },
    [scaledConfig]
  )

  // Start explosion when activated
  useEffect(() => {
    if (isActive) {
      generateExplosion()

      // Start animation loop
      lastTimeRef.current = 0
      animationFrameRef.current = requestAnimationFrame(animate)
    } else {
      // Reset for next explosion
      hasExplodedRef.current = false
      particlesRef.current = []
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isActive, generateExplosion, animate])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 15, // Higher than sparks to show on top
      }}
      width={width}
      height={height}
    />
  )
}
