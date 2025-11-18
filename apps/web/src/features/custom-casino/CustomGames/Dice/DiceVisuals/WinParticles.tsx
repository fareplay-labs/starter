// @ts-nocheck
import { motion, AnimatePresence } from 'framer-motion'
import { styled } from 'styled-components'
import { useMemo } from 'react'

// Types
type ParticlePosition = 'top' | 'right' | 'bottom' | 'left' | 'corner'

interface ParticleData {
  id: number
  position: ParticlePosition
  index: number
}

interface WinParticlesProps {
  isVisible: boolean
  color: string
  diceSize: number
  particleCount?: number
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

const Particle = styled(motion.div)<{ $size: number; $color: string }>`
  position: absolute;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  background-color: ${({ $color }) => $color};
  opacity: 0.8;
  transform-origin: center center;
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

  // Distribute remaining particles, prioritizing corners if count allows
  // (This logic favors placing remainder on corners for visual balance)
  const remainder = effectiveCount % 4
  const corners = ['corner', 'corner', 'corner', 'corner'] as ParticlePosition[]
  for (let i = 0; i < remainder; i++) {
    if (distributedCount < effectiveCount) {
      // Place remainder as corner particles
      particles.push({ id: distributedCount, position: corners[i], index: particlesPerSide + i })
      distributedCount++
    }
  }

  // The total number of particles should now match effectiveCount exactly
  return particles
}

const getInitialPosition = (
  position: ParticlePosition,
  index: number,
  total: number,
  diceSize: number
) => {
  const halfSize = diceSize / 2
  const spacing = diceSize / (Math.floor(total / 4) + 1)
  const offset = (index + 1) * spacing - halfSize

  switch (position) {
    case 'top':
      return { x: offset, y: -halfSize }
    case 'right':
      return { x: halfSize, y: offset }
    case 'bottom':
      return { x: offset, y: halfSize }
    case 'left':
      return { x: -halfSize, y: offset }
    case 'corner':
      switch (index % 4) {
        case 0:
          return { x: -halfSize, y: -halfSize }
        case 1:
          return { x: halfSize, y: -halfSize }
        case 2:
          return { x: halfSize, y: halfSize }
        case 3:
          return { x: -halfSize, y: halfSize }
        default:
          return { x: 0, y: 0 }
      }
  }
}

const getRandomizedFinalPosition = (initialX: number, initialY: number, diceSize: number) => {
  // Calculate base angle based on initial position
  const baseAngle = Math.atan2(initialY, initialX)

  // Add random variation to the angle (±30 degrees)
  const randomAngle = baseAngle + ((Math.random() - 0.5) * Math.PI) / 3

  // Random distance between 1.5x and 2.5x the dice size
  const distance = diceSize * (1.5 + Math.random())

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
  diceSize: number
  particleCount: number
}> = ({ particle, particleSize, color, diceSize, particleCount }) => {
  const { id, position, index } = particle

  const initialPos = useMemo(
    () => getInitialPosition(position, index, particleCount, diceSize),
    [position, index, particleCount, diceSize]
  )

  const finalPos = useMemo(
    () => getRandomizedFinalPosition(initialPos.x, initialPos.y, diceSize),
    [initialPos.x, initialPos.y, diceSize]
  )

  // Random rotation between 180° and 720°
  const rotation = useMemo(() => 180 + Math.random() * 540, [])

  // Random duration between 0.6 and 1 second
  const duration = useMemo(() => 0.6 + Math.random() * 0.4, [])

  return (
    <Particle
      key={id}
      $size={particleSize}
      $color={color}
      initial={{
        x: initialPos.x,
        y: initialPos.y,
        scale: 1,
        opacity: 1,
      }}
      animate={{
        x: [
          initialPos.x,
          initialPos.x * 1.2, // Slight outward push
          finalPos.x,
        ],
        y: [
          initialPos.y,
          initialPos.y * 1.2, // Slight outward push
          finalPos.y,
        ],
        scale: [1, 1.2, 0],
        opacity: [1, 1, 0],
        rotate: [0, rotation],
      }}
      exit={{
        scale: 0,
        opacity: 0,
      }}
      transition={{
        duration,
        times: [0, 0.1, 0.9], // Controls timing of the intermediate position
        ease: [0.2, 0.3, 0.8, 0.1], // Custom easing for more dynamic movement
      }}
    />
  )
}

// Main Component
export const WinParticles: React.FC<WinParticlesProps> = ({
  isVisible,
  color,
  diceSize,
  particleCount = 32,
}) => {
  // Calculate particle size once
  const particleSize = useMemo(() => Math.max(4, diceSize * 0.05), [diceSize])

  // Generate particles only when needed
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
            diceSize={diceSize}
            particleCount={particleCount}
          />
        ))}
      </AnimatePresence>
    </ParticleContainer>
  )
}
