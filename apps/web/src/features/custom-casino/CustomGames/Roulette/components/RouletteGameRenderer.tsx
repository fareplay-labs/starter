// @ts-nocheck
import React from 'react'
import { type RouletteLayoutProps } from '../types'
import { RouletteSpinLayout } from '../layouts/RouletteSpinLayout'
import { RouletteScrollLayout } from '../layouts/RouletteScrollLayout'
import { RouletteTilesLayout } from '../layouts/RouletteTilesLayout'

/**
 * Main renderer component that conditionally displays different roulette layouts
 * based on the layoutType parameter
 */
export const RouletteGameRenderer: React.FC<RouletteLayoutProps> = props => {
  const { parameters } = props

  const layoutType = parameters.layoutType || 'spin'

  switch (layoutType) {
    case 'spin':
      return <RouletteSpinLayout {...props} />

    case 'scroll':
      return <RouletteScrollLayout {...props} />

    case 'tiles':
      return <RouletteTilesLayout {...props} />

    default:
      console.warn(
        `[RouletteGameRenderer] Unknown layout type: ${layoutType}, falling back to spin`
      )
      return <RouletteSpinLayout {...props} />
  }
}
