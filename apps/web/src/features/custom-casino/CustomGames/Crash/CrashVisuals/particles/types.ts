// @ts-nocheck
export interface ParticleData {
  id: number
  x: number
  y: number
  velocityX: number
  velocityY: number
  size: number
  life: number // 0 to 1
  color: string
  variedColor: string // Individual hue-shifted color for visual variety
}

export interface PhysicsConfig {
  gravity: number
  friction: number
  initialVelocityRange: [number, number]
  sizeRange: [number, number]
  lifespan: number // in seconds
}

export interface CrashExplosionProps {
  isActive: boolean
  explosionX: number
  explosionY: number
  rocketDirection: { x: number; y: number } // normalized direction vector for forward momentum
  color: string
  particleCount?: number
  intensity?: number // 1-10 scale for particle intensity
  width?: number
  height?: number
}

export interface ParticleSystemProps {
  width: number
  height: number
  isActive: boolean
}
