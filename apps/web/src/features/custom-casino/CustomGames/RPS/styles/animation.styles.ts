// @ts-nocheck
import { styled } from 'styled-components'
import { CONFIG } from '../config/animation.config'

export const IconWrapper = styled.div<{
  $isPlaying: boolean
  $isRight?: boolean
  $glow?: boolean
  $glowColor?: string
}>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  transform: scale(0.85);
  opacity: 0.9;
  ${props =>
    props.$glow
      ? `filter: drop-shadow(0 0 10px ${props.$glowColor ?? '#ffffff'}80)
                 drop-shadow(0 0 24px ${props.$glowColor ?? '#ffffff'}40);
         `
      : 'filter: none;'}
  transition:
    transform 0.3s ease-out,
    opacity 0.3s ease-out;

  ${({ $isPlaying, $isRight }) =>
    $isPlaying &&
    `
    animation: scaleIcon 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    animation-delay: ${$isRight ? CONFIG.animations.timings.rightHandStartDelay : 0}s;

    @keyframes scaleIcon {
      0% {
        transform: scale(0.85);
        opacity: 0.9;
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }
  `}
`

export const HandIcon = styled.img<{ $flipped?: boolean; $idle?: boolean }>`
  width: 90%;
  height: 90%;
  object-fit: contain;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: ${props => {
    const flip = props.$flipped ? 'scaleX(-1)' : ''
    return `${flip} rotate(45deg) translate(-50%, -50%)`
  }};
  transform-origin: 0 0;
  filter: ${props => (props.$idle ? 'opacity(0.7)' : 'none')};
`

export const HandBorderContainer = styled.div<{
  $isPlaying: boolean
  $isRight?: boolean
  $primaryColor: string
  $secondaryColor: string
  $size?: number
  $timing?: {
    traceSpeed?: number
    fadeOutSpeed?: number
    delay?: number
  }
}>`
  position: absolute;
  top: 50%;
  left: 50%;
  width: ${props => props.$size || CONFIG.layout.svgSize}px;
  height: ${props => props.$size || CONFIG.layout.svgSize}px;
  transform: translate(-50%, -50%);
  pointer-events: none;

  svg {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }

  .box-outline {
    fill: transparent;
    stroke: transparent;
    stroke-width: 2;
  }

  .pulse-top,
  .pulse-bottom {
    fill: transparent;
    stroke: ${props => (props.$isRight ? props.$secondaryColor : props.$primaryColor)};
    stroke-width: ${CONFIG.layout.strokeWidth}px;
    stroke-linecap: round;
    stroke-dasharray: 500;
    stroke-dashoffset: 500;
    opacity: 0;
    filter: drop-shadow(
      0 0 2px ${props => (props.$isRight ? props.$secondaryColor : props.$primaryColor)}
    );
  }

  &[data-is-playing='true'] {
    .pulse-top,
    .pulse-bottom {
      animation: energyPulse
        ${props => (props.$timing?.traceSpeed ?? (props.$isRight
              ? CONFIG.animations.timings.rightHandDuration
              : CONFIG.animations.timings.leftHandDuration))}s
        ease-in forwards;
      ${props => `animation-delay: ${props.$timing?.delay ?? (props.$isRight ? CONFIG.animations.timings.rightHandStartDelay : 0)}s;`}
      mask-image: linear-gradient(
        to right,
        transparent,
        black ${CONFIG.animations.gradientStart}%,
        black ${CONFIG.animations.gradientEnd}%,
        transparent
      );
      mask-size: ${CONFIG.animations.maskSize}% 100%;
      mask-position: 100% 0;
      mask-repeat: no-repeat;
    }
  }

  @keyframes energyPulse {
    0% {
      stroke-dashoffset: 500;
      opacity: 0;
      mask-position: 100% 0;
    }
    10% {
      opacity: 1;
    }
    100% {
      stroke-dashoffset: 0;
      opacity: 1;
      mask-position: -200% 0;
    }
  }
`

export const LaserLine = styled.div<{
  $isPlaying: boolean
  $startPosition?: number
  $endPosition?: number
  $primaryColor: string
  $secondaryColor: string
  $duration?: number
  $delay?: number
}>`
  position: absolute;
  top: 50%;
  left: ${props => props.$startPosition || CONFIG.layout.laserStartDefault}%;
  width: ${props =>
    (props.$endPosition || CONFIG.layout.laserEndDefault) -
    (props.$startPosition || CONFIG.layout.laserStartDefault)}%;
  height: ${CONFIG.layout.laserWidth}px;
  background: linear-gradient(
    90deg,
    ${props => props.$primaryColor},
    ${props => props.$secondaryColor}
  );
  opacity: 0;
  transform: translateY(-50%);

  ${props =>
    props.$isPlaying &&
    `
    animation: shootLaser ${props.$duration ?? CONFIG.animations.timings.laserDuration}s ease-in forwards;
    animation-delay: ${props.$delay ?? CONFIG.animations.timings.laserStartDelay}s;
    
    @keyframes shootLaser {
      0% {
        opacity: 0;
        transform: translateY(-50%) scaleX(0);
        transform-origin: left;
      }
      50% {
        opacity: 1;
        transform: translateY(-50%) scaleX(1);
        transform-origin: left;
      }
      51% {
        opacity: 1;
        transform: translateY(-50%) scaleX(1);
        transform-origin: right;
      }
      100% {
        opacity: 0;
        transform: translateY(-50%) scaleX(0);
        transform-origin: right;
      }
    }
  `}
`

export const HorizontalLaserLine = styled.div<{
  $isPlaying: boolean
  $primaryColor: string
  $secondaryColor: string
  $delay?: number // animation delay in seconds (optional override)
}>`
  position: absolute;
  top: 85%;
  left: 50%;
  width: 90%;
  height: ${CONFIG.layout.laserWidth}px;
  background: linear-gradient(
    90deg,
    ${props => props.$secondaryColor},
    ${props => props.$primaryColor},
    ${props => props.$secondaryColor}
  );
  opacity: 0;
  transform: translateX(-50%);
  box-shadow:
    0 0 10px ${props => props.$primaryColor},
    0 0 20px ${props => props.$secondaryColor};

  ${props =>
    props.$isPlaying &&
    `
    animation: expandLaser 1.75s ease-in-out forwards;
    animation-delay: ${typeof props.$delay === 'number' ? props.$delay : (CONFIG.animations.timings.rightHandStartDelay + 1)}s;
    
    @keyframes expandLaser {
      0% {
        opacity: 0;
        transform: translateX(-50%) scaleX(0);
      }
      15% {
        opacity: 1;
        transform: translateX(-50%) scaleX(0.1);
      }
      30% {
        opacity: 1;
        transform: translateX(-50%) scaleX(1);
      }
      85% {
        opacity: 1;
        transform: translateX(-50%) scaleX(1);
      }
      100% {
        opacity: 0;
        transform: translateX(-50%) scaleX(1);
      }
    }
  `}
`
