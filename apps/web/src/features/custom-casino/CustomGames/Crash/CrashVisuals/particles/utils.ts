// @ts-nocheck
import { type ParticleData, type PhysicsConfig } from './types'

/**
 * Generate random number between min and max
 */
export const random = (min: number, max: number): number => {
  return Math.random() * (max - min) + min
}

/**
 * Pre-baked shapes for better performance
 */
export const PARTICLE_SHAPES = {
  circle: (() => {
    const path = new Path2D()
    path.arc(0, 0, 0.5, 0, Math.PI * 2)
    return path
  })(),
  square: (() => {
    const path = new Path2D()
    path.rect(-0.5, -0.5, 1, 1)
    return path
  })(),
}

/**
 * Convert hex color to HSL for hue manipulation
 */
export const hexToHsl = (hex: string): [number, number, number] => {
  // Remove # if present
  hex = hex.replace('#', '')

  const r = parseInt(hex.substr(0, 2), 16) / 255
  const g = parseInt(hex.substr(2, 2), 16) / 255
  const b = parseInt(hex.substr(4, 2), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max === min) {
    h = s = 0 // achromatic
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return [h * 360, s * 100, l * 100]
}

/**
 * Convert HSL back to hex color
 */
export const hslToHex = (h: number, s: number, l: number): string => {
  h = h / 360
  s = s / 100
  l = l / 100

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  let r, g, b

  if (s === 0) {
    r = g = b = l // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  const toHex = (c: number) => {
    const hex = Math.round(c * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * Generate color with hue variation
 */
export const generateVariedColor = (baseColor: string, hueVariation = 10): string => {
  const [h, s, l] = hexToHsl(baseColor)
  const hueShift = (Math.random() - 0.5) * 2 * hueVariation // ±hueVariation degrees
  const newHue = (h + hueShift + 360) % 360 // Ensure positive hue
  return hslToHex(newHue, s, l)
}

/**
 * Generate particles for crash explosion (radiating outward with forward momentum)
 */
export const generateCrashExplosion = (
  x: number,
  y: number,
  direction: { x: number; y: number },
  color: string,
  count: number,
  config: PhysicsConfig
): ParticleData[] => {
  const particles: ParticleData[] = []

  for (let i = 0; i < count; i++) {
    // Create directional bias - 60% of particles favor forward direction
    const shouldBiasForward = Math.random() < 0.6
    let angle: number

    if (shouldBiasForward) {
      // Forward-biased particles: ±90 degrees from rocket direction
      const rocketAngle = Math.atan2(direction.y, direction.x)
      angle = rocketAngle + random(-Math.PI / 2, Math.PI / 2)
    } else {
      // Random direction particles for full explosion effect
      angle = random(0, Math.PI * 2)
    }

    const velocity = random(config.initialVelocityRange[0], config.initialVelocityRange[1])
    const size = random(config.sizeRange[0], config.sizeRange[1])

    // Add randomization to make explosions less predictable
    const spreadRadius = random(0, 8) // Random initial spread from explosion center
    const spreadAngle = random(0, Math.PI * 2)
    const startX = x + Math.cos(spreadAngle) * spreadRadius
    const startY = y + Math.sin(spreadAngle) * spreadRadius

    // Random initial life (some particles start partially faded)
    const initialLife = random(0.8, 1.0)

    // Add velocity variation (some particles move faster/slower)
    const velocityVariation = random(0.7, 1.3)
    const adjustedVelocity = velocity * velocityVariation

    // Calculate radial velocity
    const radialVelX = Math.cos(angle) * adjustedVelocity
    const radialVelY = Math.sin(angle) * adjustedVelocity

    // Significantly increased forward momentum (60-100% of base velocity)
    const forwardMomentum = adjustedVelocity * random(0.6, 1.0)
    const forwardVelX = direction.x * forwardMomentum
    const forwardVelY = direction.y * forwardMomentum

    particles.push({
      id: i,
      x: startX,
      y: startY,
      velocityX: radialVelX + forwardVelX,
      velocityY: radialVelY + forwardVelY,
      size,
      life: initialLife,
      color,
      variedColor: generateVariedColor(color, 12), // ±12 degree hue variation for explosions
    })
  }

  return particles
}

/**
 * Update particle physics for one frame
 */
export const updateParticle = (
  particle: ParticleData,
  deltaTime: number,
  config: PhysicsConfig
): ParticleData => {
  // Clamp deltaTime to prevent large jumps (e.g., after tab switching)
  const clampedDeltaTime = Math.min(deltaTime, 0.1) // Max 100ms

  // Apply gravity
  const newVelocityY = particle.velocityY + config.gravity * clampedDeltaTime

  // Apply friction using exponential decay (prevents negative velocity)
  const decay = Math.exp(-config.friction * clampedDeltaTime)
  const newVelocityX = particle.velocityX * decay

  // Update position
  const newX = particle.x + newVelocityX * clampedDeltaTime
  const newY = particle.y + newVelocityY * clampedDeltaTime

  // Update life
  const newLife = Math.max(0, particle.life - clampedDeltaTime / config.lifespan)

  return {
    ...particle,
    x: newX,
    y: newY,
    velocityX: newVelocityX,
    velocityY: newVelocityY,
    life: newLife,
  }
}

/**
 * Calculate normalized direction vector between two points
 */
export const getDirectionVector = (
  fromX: number,
  fromY: number,
  toX: number,
  toY: number
): { x: number; y: number } => {
  const dx = toX - fromX
  const dy = toY - fromY
  const magnitude = Math.sqrt(dx * dx + dy * dy)

  if (magnitude === 0) {
    return { x: 1, y: 0 } // Default to right if no movement
  }

  return {
    x: dx / magnitude,
    y: dy / magnitude,
  }
}
