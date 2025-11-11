// @ts-nocheck
import { type CoinAnimationPreset } from './types'

export interface CoinAnimation {
  y: number[]
  rotateX: number[]
  rotateY?: number[]
  scale: number[]
  times: number[]
  ease: string | number[]
}

export const COIN_ANIMATIONS: Record<CoinAnimationPreset, CoinAnimation> = {
  flip: {
    y: [0, -100, -100, -120, 0],
    rotateX: [0, 180, 180, 360, 360],
    scale: [1, 0.9, 0.8, 0.9, 1],
    times: [0, 0.3, 0.5, 0.7, 1],
    ease: [0.2, 0.3, 0.2, 0.1],
  },
  spin: {
    y: [0, -50, -50, 0],
    rotateX: [0, 0, 0, 0],
    rotateY: [0, 180, 360, 360],
    scale: [1, 1.1, 1.1, 1],
    times: [0, 0.4, 0.6, 1],
    ease: 'easeInOut',
  },
  twist: {
    y: [0, -20, -20, 0],
    rotateX: [0, 90, 270, 360],
    scale: [1, 0.8, 0.8, 1],
    times: [0, 0.3, 0.7, 1],
    ease: 'linear',
  },
}
