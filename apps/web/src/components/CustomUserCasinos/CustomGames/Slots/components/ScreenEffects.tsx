// @ts-nocheck
import React from 'react'
import styled, { keyframes, css } from 'styled-components'

interface ScreenEffectsProps {
  winTier: 'small' | 'medium' | 'large' | 'mega' | null
  isActive: boolean
}

const flash = keyframes`
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
`

const shimmer = keyframes`
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
`

const borderPulse = keyframes`
  0%, 100% {
    box-shadow: inset 0 0 50px rgba(255, 215, 0, 0.5);
  }
  50% {
    box-shadow: inset 0 0 100px rgba(255, 215, 0, 0.8);
  }
`

const rainbowBorder = keyframes`
  0% {
    box-shadow: 
      inset 0 0 50px rgba(255, 0, 0, 0.5),
      inset 0 0 100px rgba(255, 0, 0, 0.3);
  }
  16% {
    box-shadow: 
      inset 0 0 50px rgba(255, 165, 0, 0.5),
      inset 0 0 100px rgba(255, 165, 0, 0.3);
  }
  33% {
    box-shadow: 
      inset 0 0 50px rgba(255, 255, 0, 0.5),
      inset 0 0 100px rgba(255, 255, 0, 0.3);
  }
  50% {
    box-shadow: 
      inset 0 0 50px rgba(0, 255, 0, 0.5),
      inset 0 0 100px rgba(0, 255, 0, 0.3);
  }
  66% {
    box-shadow: 
      inset 0 0 50px rgba(0, 255, 255, 0.5),
      inset 0 0 100px rgba(0, 255, 255, 0.3);
  }
  83% {
    box-shadow: 
      inset 0 0 50px rgba(255, 0, 255, 0.5),
      inset 0 0 100px rgba(255, 0, 255, 0.3);
  }
  100% {
    box-shadow: 
      inset 0 0 50px rgba(255, 0, 0, 0.5),
      inset 0 0 100px rgba(255, 0, 0, 0.3);
  }
`

const Container = styled.div<{ $isActive: boolean; $winTier: string | null }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 45;
  opacity: ${props => (props.$isActive ? 1 : 0)};
  transition: opacity 0.3s ease;
`

const VignetteGlow = styled.div<{ $winTier: string }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  ${props => {
    switch (props.$winTier) {
      case 'small':
        return css`
          background: radial-gradient(
            ellipse at center,
            transparent 30%,
            rgba(255, 215, 0, 0.1) 70%,
            rgba(255, 215, 0, 0.2) 100%
          );
        `
      case 'medium':
        return css`
          background: radial-gradient(
            ellipse at center,
            rgba(255, 215, 0, 0.05) 0%,
            transparent 40%,
            rgba(255, 165, 0, 0.2) 80%,
            rgba(255, 165, 0, 0.3) 100%
          );
        `
      case 'large':
        return css`
          background: radial-gradient(
            ellipse at center,
            rgba(255, 255, 255, 0.1) 0%,
            transparent 30%,
            rgba(255, 99, 71, 0.2) 70%,
            rgba(255, 99, 71, 0.4) 100%
          );
        `
      case 'mega':
        return css`
          background: radial-gradient(
            ellipse at center,
            rgba(255, 255, 255, 0.2) 0%,
            transparent 20%,
            rgba(255, 20, 147, 0.3) 60%,
            rgba(255, 20, 147, 0.5) 100%
          );
          animation: ${flash} 0.5s ease-out;
        `
      default:
        return ''
    }
  }}
`

const ShimmerOverlay = styled.div<{ $winTier: string }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;

  ${props => {
    if (props.$winTier === 'large' || props.$winTier === 'mega') {
      return css`
        opacity: 0.3;
        background: linear-gradient(
          105deg,
          transparent 40%,
          rgba(255, 255, 255, 0.7) 50%,
          transparent 60%
        );
        background-size: 200% 100%;
        animation: ${shimmer} ${props.$winTier === 'mega' ? '1s' : '2s'} ease-in-out infinite;
      `
    }
    return ''
  }}
`

const BorderGlow = styled.div<{ $winTier: string }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  ${props => {
    switch (props.$winTier) {
      case 'medium':
        return css`
          animation: ${borderPulse} 2s ease-in-out infinite;
        `
      case 'large':
        return css`
          animation: ${borderPulse} 1.5s ease-in-out infinite;
          border: 3px solid rgba(255, 215, 0, 0.5);
        `
      case 'mega':
        return css`
          animation: ${rainbowBorder} 2s linear infinite;
          border: 5px solid transparent;
        `
      default:
        return ''
    }
  }}
`

const FlashEffect = styled.div<{ $show: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  opacity: 0;
  pointer-events: none;

  ${props =>
    props.$show &&
    css`
      animation: ${flash} 0.3s ease-out;
    `}
`

const SparkleOverlay = styled.div<{ $winTier: string }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  ${props => {
    if (props.$winTier === 'mega') {
      return css`
        &::before,
        &::after {
          content: '';
          position: absolute;
          top: 10%;
          width: 4px;
          height: 4px;
          background: white;
          border-radius: 50%;
          box-shadow:
            0 0 10px white,
            0 0 20px white,
            0 0 30px white;
          animation: sparkleMove 3s linear infinite;
        }

        &::before {
          left: 10%;
          animation-delay: 0s;
        }

        &::after {
          right: 10%;
          animation-delay: 1.5s;
        }

        @keyframes sparkleMove {
          0% {
            transform: translateY(0) scale(0);
            opacity: 0;
          }
          10% {
            transform: translateY(10px) scale(1);
            opacity: 1;
          }
          90% {
            transform: translateY(350px) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(400px) scale(0);
            opacity: 0;
          }
        }
      `
    }
    return ''
  }}
`

export const ScreenEffects: React.FC<ScreenEffectsProps> = ({ winTier, isActive }) => {
  const showFlash = isActive && (winTier === 'large' || winTier === 'mega')

  return (
    <Container $isActive={isActive} $winTier={winTier}>
      {winTier && (
        <>
          <VignetteGlow $winTier={winTier} />
          <ShimmerOverlay $winTier={winTier} />
          <BorderGlow $winTier={winTier} />
          <SparkleOverlay $winTier={winTier} />
          <FlashEffect $show={showFlash} />
        </>
      )}
    </Container>
  )
}
