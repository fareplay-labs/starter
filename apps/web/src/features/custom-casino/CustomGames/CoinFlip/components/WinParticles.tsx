// @ts-nocheck
import { motion, AnimatePresence } from 'framer-motion'
import { styled } from 'styled-components'
import { useEffect, useState } from 'react'

const ParticleContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 0;
  height: 0;
  z-index: 0;
`

const Particle = styled(motion.div)<{ $size: number; $color: string }>`
  position: absolute;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  background-color: ${({ $color }) => $color};
  border-radius: 50%;
  opacity: 0.8;
  transform-origin: center center;
`

interface WinParticlesProps {
  isVisible: boolean
  color: string
  coinSize: number
  particleCount?: number
}

export const WinParticles: React.FC<WinParticlesProps> = ({
  isVisible,
  color,
  coinSize,
  particleCount = 32,
}) => {
  const [particles, setParticles] = useState<Array<{ id: number; angle: number }>>([])

  useEffect(() => {
    if (isVisible) {
      const newParticles = []
      // Create particles evenly distributed around the circle
      for (let i = 0; i < particleCount; i++) {
        const angle = (i * 360) / particleCount
        newParticles.push({ id: i, angle })
      }
      setParticles(newParticles)
    } else {
      setParticles([])
    }
  }, [isVisible, particleCount])

  // Calculate visual size of coin based on 3D scaling
  // The coin parameter represents desired visual size in pixels
  // We need to match the 3D coin's visual appearance
  const particleSize = Math.max(6, coinSize * 0.08)

  const getInitialPosition = (angle: number) => {
    // Emit particles from just outside the coin edge
    // The coin's visual radius is approximately coinSize/2
    const visualRadius = coinSize * 1.6
    return {
      x: Math.cos((angle * Math.PI) / 180) * visualRadius,
      y: Math.sin((angle * Math.PI) / 180) * visualRadius,
    }
  }

  const getRandomizedFinalPosition = (initialX: number, initialY: number) => {
    // Calculate base angle based on initial position
    const baseAngle = Math.atan2(initialY, initialX)

    // Add random variation to the angle (±30 degrees)
    const randomAngle = baseAngle + ((Math.random() - 0.5) * Math.PI) / 3

    // Random distance from coin center - particles travel outward from initial position
    const distance = coinSize * (3 + Math.random() * 1.5)

    return {
      x: Math.cos(randomAngle) * distance,
      y: Math.sin(randomAngle) * distance,
    }
  }

  return (
    <ParticleContainer>
      <AnimatePresence>
        {particles.map(({ id, angle }) => {
          const initialPos = getInitialPosition(angle)
          const finalPos = getRandomizedFinalPosition(initialPos.x, initialPos.y)

          // Random rotation between 180° and 720°
          const rotation = 180 + Math.random() * 540

          // Random duration between 0.6 and 1 second
          const duration = 0.6 + Math.random() * 0.4

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
        })}
      </AnimatePresence>
    </ParticleContainer>
  )
}
