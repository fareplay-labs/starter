// @ts-nocheck
import { motion, AnimatePresence } from 'framer-motion'
import { styled } from 'styled-components'
import { useMemo } from 'react'
import { CONFIG } from '../config/animation.config'

// Types
interface ParticleData {
  id: number
  position: number // Position along the line (0-1)
  delay: number
  size: number
}

interface LaserParticlesProps {
  isVisible: boolean
  color: string
  secondaryColor?: string
  lineWidth: number
  particleCount?: number
  duration?: number
  gravity?: number
  animationDelay?: number
}

// Styled Components
const ParticleContainer = styled.div<{ $width: number }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: ${({ $width }) => $width}px;
  height: 0;
  z-index: 1;
`

const Particle = styled(motion.div)<{ $size: number; $color: string }>`
  position: absolute;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  background-color: ${({ $color }) => $color};
  border-radius: 50%;
  opacity: 0.8;
  filter: blur(1px);
  box-shadow: 0 0 5px ${({ $color }) => $color};
  transform-origin: center center;
`

// Helper functions
const generateParticles = (count: number): ParticleData[] => {
  const particles: ParticleData[] = []

  for (let i = 0; i < count; i++) {
    // Position starts from center and expands outward
    const position = 0.5 + (Math.random() - 0.5) * 0.2 // Start near center (0.4-0.6)

    // Random delay for staggered emission (0-0.2s)
    const delay = Math.random() * 0.2

    // Random size (3-8px)
    const size = 3 + Math.random() * 5

    particles.push({
      id: i,
      position,
      delay,
      size,
    })
  }

  return particles
}

// Single Particle Component
const ParticleItem: React.FC<{
  particle: ParticleData
  color: string
  secondaryColor: string
  lineWidth: number
  duration: number
  gravity: number
  animationDelay: number
}> = ({ particle, color, secondaryColor, duration, gravity, animationDelay }) => {
  const { id, position, delay, size } = particle

  // Choose between primary and secondary color randomly
  const particleColor = useMemo(
    () => (Math.random() > 0.5 ? color : secondaryColor),
    [color, secondaryColor]
  )

  // Random horizontal velocity (-30 to 30 pixels), scaled by position from center
  const velocityX = useMemo(() => {
    const distFromCenter = Math.abs(position - 0.5)
    return (Math.random() - 0.5) * 60 * (1 + distFromCenter)
  }, [position])

  // Random upward velocity (-80 to -40 pixels)
  const velocityY = useMemo(() => -(40 + Math.random() * 40), [])

  return (
    <Particle
      key={id}
      $size={size}
      $color={particleColor}
      initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
      animate={{
        x: [
          0, // Start at center
          velocityX * 0.3, // Initial spread
          velocityX * duration, // Final spread
        ],
        y: [
          0,
          velocityY * 0.3 + 0.5 * gravity * 0.3 * 0.3,
          velocityY * duration + 0.5 * gravity * duration * duration,
        ],
        scale: [0, 1, 0],
        opacity: [0, 1, 0],
      }}
      transition={{
        duration,
        times: [0, 0.3, 1],
        ease: 'easeOut',
        delay: animationDelay + delay,
      }}
    />
  )
}

// Main Component
export const LaserParticles: React.FC<LaserParticlesProps> = ({
  isVisible,
  color,
  secondaryColor = color,
  lineWidth,
  particleCount = 80,
  duration = 1.2,
  gravity = 200,
  animationDelay = CONFIG.animations.timings.rightHandStartDelay + 1,
}) => {
  // Generate particles only when needed
  const particles = useMemo(
    () => (isVisible ? generateParticles(particleCount) : []),
    [isVisible, particleCount]
  )

  return (
    <ParticleContainer $width={lineWidth}>
      <AnimatePresence>
        {particles.map(particle => (
          <ParticleItem
            key={particle.id}
            particle={particle}
            color={color}
            secondaryColor={secondaryColor}
            lineWidth={lineWidth}
            duration={duration}
            gravity={gravity}
            animationDelay={animationDelay}
          />
        ))}
      </AnimatePresence>
    </ParticleContainer>
  )
}
