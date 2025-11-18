// @ts-nocheck
import React from 'react'
import { HandBorderContainer } from '../styles/animation.styles'

interface HandBorderProps {
  isPlaying: boolean
  isRight?: boolean
  primaryColor: string
  secondaryColor: string
  size?: number
  timing?: {
    traceSpeed?: number
    fadeOutSpeed?: number
    delay?: number
  }
}

export const HandBorder: React.FC<HandBorderProps> = ({
  isPlaying,
  isRight,
  primaryColor,
  secondaryColor,
  size,
  timing,
}) => {
  return (
    <HandBorderContainer
      $isPlaying={isPlaying}
      $isRight={isRight}
      $primaryColor={primaryColor}
      $secondaryColor={secondaryColor}
      $size={size}
      $timing={timing}
      data-is-playing={isPlaying}
    >
      <svg viewBox='0 0 120 120'>
        <rect className='box-outline' x='2' y='2' width='116' height='116' rx='8' ry='8' />
        <path
          className='pulse-top'
          d='M 2,60 L 2,20 A 18,18 0 0 1 20,2 L 100,2 A 18,18 0 0 1 118,20 L 118,60'
        />
        <path
          className='pulse-bottom'
          d='M 2,60 L 2,100 A 18,18 0 0 0 20,118 L 100,118 A 18,18 0 0 0 118,100 L 118,60'
        />
      </svg>
    </HandBorderContainer>
  )
}
