// @ts-nocheck
import { motion, AnimatePresence } from 'framer-motion'
import { styled } from 'styled-components'
import { useMemo } from 'react'
import { type TileShape } from '../types'

// Types
type ParticlePosition = 'top' | 'right' | 'bottom' | 'left' | 'corner'

interface ParticleData {
  id: number
  position: ParticlePosition
  index: number
}

interface ParticleEffectConfig {
  // Size multiplier for particles (default: 1)
  sizeMultiplier?: number
  // Speed multiplier for animation duration (default: 1, higher = slower)
  speedMultiplier?: number
  // How far particles travel (default: 1)
  distanceMultiplier?: number
  // How much rotation to apply (default: 1)
  rotationMultiplier?: number
  // How aggressive the initial burst is (default: 1)
  burstIntensity?: number
}

interface BombParticlesProps {
  isVisible: boolean
  color: string
  tileSize: number
  tileShape: TileShape
  particleCount?: number
  effectConfig?: ParticleEffectConfig
  isExplosion?: boolean // New prop to explicitly identify explosion effects
}

// Styled Components
const ParticleContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 0;
  height: 0;
  z-index: 1;
`

const Particle = styled(motion.div)<{ $size: number; $color: string; $shape: TileShape }>`
  position: absolute;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  background-color: ${({ $color }) => $color};
  opacity: 0.8;
  transform-origin: center center;
  border-radius: ${({ $shape }) => ($shape === 'round' ? '50%' : '0')};
`

// Helper functions
const generateParticles = (count: number): ParticleData[] => {
  const particles: ParticleData[] = []
  const sides = ['top', 'right', 'bottom', 'left'] as ParticlePosition[]

  // Ensure count is at least 4 if possible, for corners
  const effectiveCount = Math.max(count, 0)

  let distributedCount = 0

  // Distribute particles along sides first
  const particlesPerSide = Math.floor(effectiveCount / 4)
  if (particlesPerSide > 0) {
    for (let i = 0; i < particlesPerSide; i++) {
      sides.forEach(side => {
        if (distributedCount < effectiveCount) {
          particles.push({ id: distributedCount, position: side, index: i })
          distributedCount++
        }
      })
    }
  }

  // Add corner particles
  const corners = ['corner', 'corner', 'corner', 'corner'] as ParticlePosition[]
  corners.forEach((corner, i) => {
    if (distributedCount < effectiveCount) {
      particles.push({ id: distributedCount, position: corner, index: i })
      distributedCount++
    }
  })

  // Add any remaining particles to sides
  while (distributedCount < effectiveCount) {
    sides.forEach(side => {
      if (distributedCount < effectiveCount) {
        particles.push({
          id: distributedCount,
          position: side,
          index: Math.floor(distributedCount / 4),
        })
        distributedCount++
      }
    })
  }

  return particles
}

const getInitialPosition = (
  position: ParticlePosition,
  index: number,
  total: number,
  tileSize: number,
  tileShape: TileShape
) => {
  const halfSize = tileSize / 2
  const spacing = tileSize / (Math.floor(total / 4) + 1)
  const offset = (index + 1) * spacing - halfSize

  if (tileShape === 'round') {
    // For round tiles, position particles in a circular pattern
    const angle = (() => {
      switch (position) {
        case 'top':
          return -Math.PI / 2 + (Math.PI / 2) * (offset / halfSize)
        case 'right':
          return (offset / halfSize) * (Math.PI / 2)
        case 'bottom':
          return Math.PI / 2 + (Math.PI / 2) * (offset / halfSize)
        case 'left':
          return Math.PI + (Math.PI / 2) * (offset / halfSize)
        case 'corner':
          return (Math.PI / 2) * (index % 4)
        default:
          return 0
      }
    })()

    const radius = halfSize * 0.95 // Slightly inside the circle edge
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    }
  } else {
    // For square tiles, position particles along the edges
    switch (position) {
      case 'top':
        return { x: offset, y: -halfSize * 0.95 }
      case 'right':
        return { x: halfSize * 0.95, y: offset }
      case 'bottom':
        return { x: offset, y: halfSize * 0.95 }
      case 'left':
        return { x: -halfSize * 0.95, y: offset }
      case 'corner':
        const cornerOffset = halfSize * 0.95
        switch (index % 4) {
          case 0:
            return { x: -cornerOffset, y: -cornerOffset }
          case 1:
            return { x: cornerOffset, y: -cornerOffset }
          case 2:
            return { x: cornerOffset, y: cornerOffset }
          case 3:
            return { x: -cornerOffset, y: cornerOffset }
          default:
            return { x: 0, y: 0 }
        }
    }
  }
  return { x: 0, y: 0 } // Fallback
}

const getRandomizedFinalPosition = (
  initialX: number,
  initialY: number,
  tileSize: number,
  tileShape: TileShape,
  isExplosion?: boolean
) => {
  const baseAngle = Math.atan2(initialY, initialX)
  const angleVariation = isExplosion ? Math.PI / 2 : Math.PI / 3

  const randomAngle =
    baseAngle + (Math.random() - 0.5) * angleVariation * (tileShape === 'round' ? 0.7 : 1)
  const distance = tileSize * (isExplosion ? 2.5 + Math.random() * 1.5 : 1.5 + Math.random())

  return {
    x: Math.cos(randomAngle) * distance,
    y: Math.sin(randomAngle) * distance,
  }
}

// Single Particle Component
const ParticleItem: React.FC<{
  particle: ParticleData
  particleSize: number
  color: string
  tileSize: number
  tileShape: TileShape
  particleCount: number
  isExplosion?: boolean
  effectConfig?: ParticleEffectConfig
}> = ({
  particle,
  particleSize,
  color,
  tileSize,
  tileShape,
  particleCount,
  isExplosion,
  effectConfig = {},
}) => {
  const {
    sizeMultiplier = 1,
    speedMultiplier = 1,
    distanceMultiplier = 1,
    rotationMultiplier = 1,
    burstIntensity = 1,
  } = effectConfig

  const { id, position, index } = particle

  const initialPos = useMemo(
    () => getInitialPosition(position, index, particleCount, tileSize, tileShape),
    [position, index, particleCount, tileSize, tileShape]
  )

  const finalPos = useMemo(
    () =>
      getRandomizedFinalPosition(
        initialPos.x,
        initialPos.y,
        tileSize * distanceMultiplier,
        tileShape,
        isExplosion
      ),
    [initialPos.x, initialPos.y, tileSize, tileShape, isExplosion, distanceMultiplier]
  )

  // More intense rotation for explosions
  const rotation = useMemo(
    () =>
      (isExplosion ? 360 + Math.random() * 720 : 180 + Math.random() * 540) * rotationMultiplier,
    [isExplosion, rotationMultiplier]
  )

  // Animation duration (lower = faster)
  const duration = useMemo(
    () => (isExplosion ? 0.3 + Math.random() * 0.3 : 0.4 + Math.random() * 0.4) * speedMultiplier,
    [isExplosion, speedMultiplier]
  )

  // Scale based on config
  const maxScale = (isExplosion ? 2 : 1.2) * sizeMultiplier

  // Burst multiplier for initial push
  const burstMultiplier = isExplosion ? 1.5 : 1.2
  const effectiveBurst = burstMultiplier * burstIntensity

  // Size is now directly controlled by props and config
  const finalSize = particleSize * sizeMultiplier

  return (
    <Particle
      key={id}
      $size={finalSize}
      $color={color}
      $shape={tileShape}
      initial={{
        x: initialPos.x,
        y: initialPos.y,
        scale: 1,
        opacity: 1,
      }}
      animate={{
        x: [initialPos.x, initialPos.x * effectiveBurst, finalPos.x],
        y: [initialPos.y, initialPos.y * effectiveBurst, finalPos.y],
        scale: [1, maxScale, 0],
        opacity: [1, 1, 0],
        rotate: [0, rotation],
      }}
      exit={{
        scale: 0,
        opacity: 0,
      }}
      transition={{
        duration,
        times: [0, 0.1, 0.9],
        ease: isExplosion ? [0.1, 0.5, 0.9, 0.1] : [0.2, 0.3, 0.8, 0.1],
      }}
    />
  )
}

// Main Component
export const BombParticles: React.FC<BombParticlesProps> = ({
  isVisible,
  color,
  tileSize,
  tileShape,
  particleCount = 24,
  effectConfig = {},
  isExplosion = false,
}) => {
  // Base particle size - simplified calculation
  const particleSize = useMemo(() => Math.max(4, tileSize * 0.06), [tileSize])

  const particles = useMemo(
    () => (isVisible ? generateParticles(particleCount) : []),
    [isVisible, particleCount]
  )

  return (
    <ParticleContainer>
      <AnimatePresence>
        {particles.map(particle => (
          <ParticleItem
            key={particle.id}
            particle={particle}
            particleSize={particleSize}
            color={color}
            tileSize={tileSize}
            tileShape={tileShape}
            particleCount={particleCount}
            isExplosion={isExplosion}
            effectConfig={effectConfig}
          />
        ))}
      </AnimatePresence>
    </ParticleContainer>
  )
}
