// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react'
import { styled, keyframes, css } from 'styled-components'
import {
  type FancyBorderProps,
  type PulseAnimationConfig,
  type AnimationConfig,
  type EntryAnimationConfig,
  type FlowAnimationConfig,
  type SpinAnimationConfig,
} from './types'

/**
 * FancyBorder component that wraps any component with a customizable border
 */
const FancyBorder: React.FC<FancyBorderProps> = ({
  children,
  color = '#000',
  width = '2px',
  borderStyle = 'solid',
  radius = '0px',
  className,
  isGradient = false,
  gradientColors = [],
  gradientDirection = 'to right',
  animated = false,
  animationType = 'pulse',
  animationConfig = {},
  entryAnimation = false,
  entryAnimationConfig = {},
  animateOnHoverOnly = false,
  ...rest
}) => {
  // Track entry animation state
  const [isEntryAnimationComplete, setIsEntryAnimationComplete] = useState(!entryAnimation)
  const [entryTriggerCount, setEntryTriggerCount] = useState(0)
  const prevTriggerRef = useRef(entryAnimationConfig.trigger)

  // Setup the entry animation configuration
  const defaultEntryConfig: EntryAnimationConfig = {
    type: 'corners-to-center',
    duration: 1,
    delay: 0,
    easing: 'ease-in-out',
    cornerSize: 0,
  }

  const mergedEntryConfig = {
    ...defaultEntryConfig,
    ...entryAnimationConfig,
  }

  // Handle entry animation trigger changes
  useEffect(() => {
    if (
      entryAnimation &&
      entryAnimationConfig.trigger !== undefined &&
      prevTriggerRef.current !== entryAnimationConfig.trigger
    ) {
      // Trigger changed, restart the entry animation
      setIsEntryAnimationComplete(false)
      setEntryTriggerCount(prev => prev + 1)
    }
    prevTriggerRef.current = entryAnimationConfig.trigger
  }, [entryAnimation, entryAnimationConfig.trigger])

  // Handle animation completion
  const handleEntryAnimationComplete = () => {
    setIsEntryAnimationComplete(true)
    if (mergedEntryConfig.onComplete) {
      mergedEntryConfig.onComplete()
    }
  }

  return (
    <BorderContainer className={`fancy-border-container ${className || ''}`}>
      <BorderWrapper
        $color={color}
        $width={width}
        $borderStyle={borderStyle}
        $radius={radius}
        $isGradient={isGradient}
        $gradientColors={gradientColors}
        $gradientDirection={gradientDirection}
        $animated={animated}
        $inEntryAnimation={entryAnimation && !isEntryAnimationComplete}
        className='fancy-border'
        {...rest}
      >
        {/* Only show pulse animation if no entry animation is running */}
        {animated && animationType === 'pulse' && (!entryAnimation || isEntryAnimationComplete) && (
          <AnimationEffect
            $color={color}
            $gradientDirection={gradientDirection}
            $gradientColors={gradientColors}
            $isGradient={isGradient}
            $borderStyle={borderStyle}
            $radius={radius}
            $width={width}
            $animationConfig={animationConfig}
            $animateOnHoverOnly={animateOnHoverOnly}
            className='animation-layer'
          />
        )}

        {/* Show flow animation if selected and no entry animation is running */}
        {animated && animationType === 'flow' && (!entryAnimation || isEntryAnimationComplete) && (
          <GradientFlowAnimation
            $color={color}
            $gradientDirection={gradientDirection}
            $gradientColors={gradientColors}
            $borderStyle={borderStyle}
            $radius={radius}
            $width={width}
            $animationConfig={animationConfig as FlowAnimationConfig}
            $animateOnHoverOnly={animateOnHoverOnly}
            className='gradient-flow-layer'
          />
        )}

        {/* Show spin animation if selected and no entry animation is running */}
        {animated && animationType === 'spin' && (!entryAnimation || isEntryAnimationComplete) && (
          <SpinAnimation
            $color={color}
            $gradientColors={gradientColors}
            $borderStyle={borderStyle}
            $radius={radius}
            $width={width}
            $animationConfig={animationConfig as SpinAnimationConfig}
            $animateOnHoverOnly={animateOnHoverOnly}
            className='spin-animation-layer'
          />
        )}

        {entryAnimation && !isEntryAnimationComplete && (
          <EntryAnimationLayer
            $config={mergedEntryConfig}
            $color={color}
            $width={width}
            $borderStyle={borderStyle}
            $radius={radius}
            $isGradient={isGradient}
            $gradientColors={gradientColors}
            $gradientDirection={gradientDirection}
            $key={entryTriggerCount}
            onAnimationEnd={handleEntryAnimationComplete}
            className='entry-animation-layer'
          />
        )}

        <BorderContent $width={width} $radius={radius}>
          {children}
        </BorderContent>
      </BorderWrapper>
    </BorderContainer>
  )
}

interface BorderWrapperProps {
  $color: string
  $width: string
  $borderStyle: string
  $radius: string
  $isGradient: boolean
  $gradientColors: string[]
  $gradientDirection: string
  $animated: boolean
  $inEntryAnimation?: boolean
}

interface BorderContentProps {
  $width: string
  $radius: string
}

interface AnimationEffectProps {
  $color: string
  $isGradient: boolean
  $gradientColors: string[]
  $gradientDirection: string
  $borderStyle: string
  $radius: string
  $width: string
  $animationConfig: AnimationConfig
  $animateOnHoverOnly?: boolean
}

interface EntryAnimationProps {
  $config: EntryAnimationConfig
  $color: string
  $width: string
  $borderStyle: string
  $radius: string
  $isGradient: boolean
  $gradientColors: string[]
  $gradientDirection: string
  $key?: number
}

interface GradientFlowProps {
  $color: string
  $gradientDirection: string
  $gradientColors: string[]
  $borderStyle: string
  $radius: string
  $width: string
  $animationConfig: FlowAnimationConfig
  $animateOnHoverOnly?: boolean
}

interface SpinAnimationProps {
  $color: string
  $gradientColors: string[]
  $borderStyle: string
  $radius: string
  $width: string
  $animationConfig: SpinAnimationConfig
  $animateOnHoverOnly?: boolean
}

// Define a type for the corner animation keyframes
type CornerAnimation = {
  before: ReturnType<typeof keyframes>
  after: ReturnType<typeof keyframes>
}

// Create the corner reveal animations with configurable corner size
const getCornerRevealAnimation = (cornerSize = 0): CornerAnimation => {
  return {
    before: keyframes`
      0% { width: calc(100% - ${cornerSize * 2}px); }
      100% { width: 0; }
    `,
    after: keyframes`
      0% { height: calc(100% - ${cornerSize * 2}px); }
      100% { height: 0; }
    `,
  }
}

// Entry animation layer
const EntryAnimationLayer = styled.div<EntryAnimationProps>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: ${props => props.$radius};
  z-index: 1; /* Between border wrapper and content */
  pointer-events: none;
  overflow: hidden;

  ${props => {
    const cornerSize = props.$config.cornerSize || 0
    const animations = getCornerRevealAnimation(cornerSize)
    const duration = props.$config.duration || 1
    const delay = props.$config.delay ? props.$config.delay + 's' : '0s'
    const easing = getTimingFunction(props.$config.easing)
    const borderWidth = props.$width || '2px'

    // Border-only mask using padding technique
    const maskStyle = `
      padding: ${borderWidth};
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask-composite: exclude;
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
    `

    // Apply border styles for the background
    let backgroundStyle
    if (props.$isGradient) {
      const colors =
        props.$gradientColors.length > 0 ?
          props.$gradientColors.join(', ')
        : `${props.$color}, ${props.$color}`

      backgroundStyle = `background: linear-gradient(${props.$gradientDirection}, ${colors});`
    } else if (props.$borderStyle === 'dashed') {
      backgroundStyle = `
        background: ${props.$color};
        -webkit-mask-image:
          repeating-linear-gradient(45deg, black, black 5px, transparent 5px, transparent 10px),
          linear-gradient(#fff 0 0) content-box,
          linear-gradient(#fff 0 0);
      `
    } else if (props.$borderStyle === 'dotted') {
      backgroundStyle = `
        background: ${props.$color};
        -webkit-mask-image:
          radial-gradient(circle, black 1px, transparent 1px),
          linear-gradient(#fff 0 0) content-box,
          linear-gradient(#fff 0 0);
        -webkit-mask-size:
          5px 5px,
          auto,
          auto;
      `
    } else {
      backgroundStyle = `background: ${props.$color};`
    }

    return css`
      ${backgroundStyle}
      ${maskStyle}

      &::before, &::after {
        content: '';
        position: absolute;
        background: #1a1a1a; /* Same as content background */
        z-index: 2; /* Above the border color layer but below content */
      }

      &::before {
        height: 100%;
        width: calc(100% - ${cornerSize * 2}px);
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        animation: ${animations.before} ${duration}s ${delay} ${easing} forwards;
      }

      &::after {
        width: 100%;
        height: calc(100% - ${cornerSize * 2}px);
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        animation: ${animations.after} ${duration}s ${delay} ${easing} forwards;
      }
    `
  }}
`

// Separate element for animation effects (pulse)
const AnimationEffect = styled.div<AnimationEffectProps>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: ${props => props.$radius};
  pointer-events: none;
  z-index: 1; /* Same as EntryAnimationLayer */

  ${props => {
    // Create shadow color using primary color from border
    let shadowColor

    if (props.$isGradient && props.$gradientColors.length > 0) {
      shadowColor = props.$gradientColors[0]
    } else {
      shadowColor = props.$color
    }

    // Convert hex to rgba if it's in hex format
    const hexToRgba = (hex: string, alpha: number) => {
      if (hex.startsWith('#')) {
        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7), 16)
        return `rgba(${r}, ${g}, ${b}, ${alpha})`
      }
      return hex // If not hex, return as is (might be named color or rgb)
    }

    // Try to convert to rgba for the shadow
    const rgbaShadowColor = hexToRgba(shadowColor, 0.7)

    // Get animation configuration
    const config = props.$animationConfig
    const pulseConfig = config as PulseAnimationConfig

    // Calculate glow intensity based on animation intensity
    const glowSize = 15 * (pulseConfig.intensity || 1)

    // Use configured min/max opacity values, adjusted by intensity
    const maxOpacityValue = Math.min(
      pulseConfig.maxOpacity || 1,
      (pulseConfig.maxOpacity || 1) * (pulseConfig.intensity || 1)
    )
    const minOpacityValue = pulseConfig.minOpacity || 0

    // Calculate the mid-point opacity for the pulse effect
    const glowOpacity = Math.min(0.8, maxOpacityValue)

    // Create custom keyframes with intensity and configurable opacity
    // Choose animation pattern based on defaultMaxOpacity setting
    const intensityKeyframes =
      pulseConfig.defaultMaxOpacity ?
        keyframes`
          0% {
            opacity: ${maxOpacityValue};
            box-shadow: 0 0 ${glowSize}px ${glowSize / 3}px ${rgbaShadowColor};
          }

          50% {
            opacity: ${minOpacityValue};
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
          }

          100% {
            opacity: ${maxOpacityValue};
            box-shadow: 0 0 ${glowSize}px ${glowSize / 3}px ${rgbaShadowColor};
          }
        `
      : keyframes`
          0% {
            opacity: ${minOpacityValue};
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
          }

          50% {
            opacity: ${glowOpacity};
            box-shadow: 0 0 ${glowSize}px ${glowSize / 3}px ${rgbaShadowColor};
          }

          100% {
            opacity: ${minOpacityValue};
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
          }
        `

    // Border-only mask using padding technique
    const borderWidth = props.$width || '2px'
    const maskStyle = `
      padding: ${borderWidth};
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask-composite: exclude;
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
    `

    // Set border styles based on type
    let borderStyles = ''

    if (props.$isGradient) {
      // Gradient background
      const colors =
        props.$gradientColors.length > 0 ?
          props.$gradientColors.join(', ')
        : `${props.$color}, ${props.$color}`

      borderStyles = `
        background: linear-gradient(${props.$gradientDirection}, ${colors});
        ${maskStyle}
      `
    } else if (props.$borderStyle === 'dashed') {
      // Dashed border
      borderStyles = `
        background: ${props.$color};
        ${maskStyle}
        -webkit-mask-image:
          repeating-linear-gradient(45deg, black, black 5px, transparent 5px, transparent 10px),
          linear-gradient(#fff 0 0) content-box,
          linear-gradient(#fff 0 0);
      `
    } else if (props.$borderStyle === 'dotted') {
      // Dotted border
      borderStyles = `
        background: ${props.$color};
        ${maskStyle}
        -webkit-mask-image:
          radial-gradient(circle, black 1px, transparent 1px),
          linear-gradient(#fff 0 0) content-box,
          linear-gradient(#fff 0 0);
        -webkit-mask-size:
          5px 5px,
          auto,
          auto;
      `
    } else {
      // Solid border
      borderStyles = `
        background: ${props.$color};
        ${maskStyle}
      `
    }

    // Return the animation style with keyframes and the border styles
    if (props.$animateOnHoverOnly) {
      // Hover-only animations
      // Determine default opacity based on defaultMaxOpacity setting
      const defaultOpacity =
        pulseConfig.defaultMaxOpacity ? maxOpacityValue : (
          minOpacityValue + (maxOpacityValue - minOpacityValue) * 0.3
        )

      // Determine default shadow effect based on defaultMaxOpacity
      const defaultShadow =
        pulseConfig.defaultMaxOpacity ?
          `0 0 ${glowSize}px ${glowSize / 3}px ${rgbaShadowColor}`
        : `0 0 ${glowSize / 4}px ${glowSize / 6}px ${hexToRgba(shadowColor, 0.3)}`

      return css`
        ${borderStyles}
        opacity: ${defaultOpacity}; /* Default state opacity */
        transition:
          opacity 0.3s ease,
          box-shadow 0.3s ease;

        /* Only animate on hover */
        .fancy-border-container:hover & {
          animation: ${intensityKeyframes} ${pulseConfig.duration || 1.5}s infinite ease-in-out;
        }

        /* Steady state when not hovered */
        .fancy-border-container:not(:hover) & {
          animation: none;
          box-shadow: ${defaultShadow};
        }
      `
    } else {
      // Continuous animations
      return css`
        ${borderStyles}
        animation: ${intensityKeyframes} ${pulseConfig.duration || 1.5}s infinite ease-in-out;
      `
    }
  }}
`

const BorderWrapper = styled.div<BorderWrapperProps>`
  position: relative;
  border-radius: ${props => props.$radius};
  padding: ${props => props.$width};
  box-sizing: border-box;
  display: inline-block;
  z-index: 0; /* Below animation layers */

  ${props => {
    if (props.$animated || props.$inEntryAnimation) {
      // When animated or in entry animation, use a transparent background
      return `
        background: transparent;
      `
    } else if (props.$isGradient) {
      // Use the provided colors or fall back to the single color
      const colors =
        props.$gradientColors.length > 0 ? props.$gradientColors : [props.$color, props.$color]

      // Create the gradient
      const gradient = `linear-gradient(${props.$gradientDirection}, ${colors.join(', ')})`

      return `
        background: ${gradient};
      `
    } else {
      return `
        background: ${props.$color};
        ${props.$borderStyle === 'dashed' ? 'background-image: repeating-linear-gradient(45deg, transparent, transparent 5px, currentColor 5px, currentColor 10px);' : ''}
        ${props.$borderStyle === 'dotted' ? 'background-image: radial-gradient(circle, currentColor 1px, transparent 1px); background-size: 5px 5px;' : ''}
      `
    }
  }}
`

const BorderContent = styled.div<BorderContentProps>`
  position: relative;
  background: transparent;
  height: 100%;
  width: 100%;
  color: #f1f1f1;
  z-index: 3; /* Highest z-index to stay above animation layers */

  ${({ $radius, $width }) => {
    // Helper function to calculate inner radius
    const calculateInnerRadius = (outerRadius: string, borderWidth: string) => {
      // Handle percentage case
      if (outerRadius.includes('%')) {
        return outerRadius // Keep percentage as is
      }

      // Handle 'px' values
      if (outerRadius.includes('px')) {
        const outerValue = parseFloat(outerRadius)
        const borderValue = parseFloat(borderWidth)

        // Ensure the inner radius doesn't go negative
        const innerValue = Math.max(0, outerValue - borderValue)
        return `${innerValue}px`
      }

      // For other units or '0', just use the value directly
      if (outerRadius === '0' || outerRadius === '0px') {
        return '0'
      }

      // For any other case, use calc to subtract border width
      return `calc(${outerRadius} - ${$width})`
    }

    // Handle special case for circular shapes (50% radius)
    if ($radius === '50%') {
      return 'border-radius: 50%;'
    }

    // For multiple values like "5px 10px 15px 20px"
    if ($radius.includes(' ')) {
      const radiusValues = $radius.split(' ')
      const newRadiusValues = radiusValues.map(r => calculateInnerRadius(r, $width))
      return `border-radius: ${newRadiusValues.join(' ')};`
    }

    // Default case - single value
    return `border-radius: ${calculateInnerRadius($radius, $width)};`
  }}
`

// Container to maintain consistent positioning
const BorderContainer = styled.div`
  position: relative;
  display: inline-block;
`

// Helper to get CSS timing function from string or custom value
const getTimingFunction = (easing: string | undefined): string => {
  if (!easing) return 'ease-in-out'

  // Handle preset easing values
  switch (easing) {
    case 'linear':
      return 'linear'
    case 'ease':
      return 'ease'
    case 'ease-in':
      return 'ease-in'
    case 'ease-out':
      return 'ease-out'
    case 'ease-in-out':
      return 'ease-in-out'
    case 'smooth': // Custom smoother curve
      return 'cubic-bezier(0.4, 0, 0.2, 1)'
    default:
      // If a custom cubic-bezier is provided, use it directly
      if (easing.startsWith('cubic-bezier')) {
        return easing
      }
      return 'ease-in-out' // Default fallback
  }
}

// Gradient flow animation keyframes
const gradientFlowKeyframes = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`

// Gradient flow animation component
const GradientFlowAnimation = styled.div<GradientFlowProps>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: ${props => props.$radius};
  z-index: 1;
  pointer-events: none;

  ${props => {
    // Fallback to default values if not provided
    const flowDirection = props.$animationConfig.flowDirection ?? 90
    const speed = props.$animationConfig.speed ?? 1
    const duration = props.$animationConfig.duration ?? 3
    const effectiveDuration = duration / speed
    const borderWidth = props.$width || '2px'

    // Use provided color stops or generate from gradient colors or default color
    const colorStops =
      props.$animationConfig.colorStops ??
      (props.$gradientColors.length > 0 ?
        props.$gradientColors
      : [props.$color, lightenColor(props.$color, 30), props.$color])

    // Create the gradient
    const gradientString = colorStops.join(', ')

    // Border-only mask using padding technique
    const maskStyle = `
      padding: ${borderWidth};
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask-composite: exclude;
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
    `

    // Common mask styles for different border styles
    const maskStylesForBorderType = `
      /* Apply border styles based on borderStyle prop */
      ${
        props.$borderStyle === 'dashed' &&
        css`
          -webkit-mask-image:
            repeating-linear-gradient(45deg, transparent, transparent 5px, black 5px, black 10px),
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
        `
      }

      ${
        props.$borderStyle === 'dotted' &&
        css`
          -webkit-mask-image:
            radial-gradient(circle, black 1px, transparent 1px),
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-size:
            5px 5px,
            auto,
            auto;
        `
      }
    `

    if (props.$animateOnHoverOnly) {
      // Hover-only animations
      return css`
        background: linear-gradient(${flowDirection}deg, ${gradientString});
        background-size: 200% 200%;
        ${maskStyle}
        transition: background-position 0.3s ease;

        /* Only animate on hover */
        .fancy-border-container:hover & {
          animation: ${gradientFlowKeyframes} ${effectiveDuration}s ease infinite;
        }

        /* Steady state when not hovered */
        .fancy-border-container:not(:hover) & {
          animation: none;
          background-position: 0% 50%;
        }

        ${maskStylesForBorderType}
      `
    } else {
      // Continuous animations
      return css`
        background: linear-gradient(${flowDirection}deg, ${gradientString});
        background-size: 200% 200%;
        animation: ${gradientFlowKeyframes} ${effectiveDuration}s ease infinite;
        ${maskStyle}
        ${maskStylesForBorderType}
      `
    }
  }}
`

// Utility function to lighten a color by a percentage
const lightenColor = (color: string, percent: number): string => {
  // Basic implementation for hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1)
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)

    const factor = 1 + percent / 100

    const newR = Math.min(255, Math.round(r * factor))
    const newG = Math.min(255, Math.round(g * factor))
    const newB = Math.min(255, Math.round(b * factor))

    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
  }

  // Return original color if not a hex color
  return color
}

// Spin animation component
const SpinAnimation = styled.div<SpinAnimationProps>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: ${props => props.$radius};
  z-index: 1;
  pointer-events: none;
  overflow: hidden; /* Ensure gradient stays within border */

  ${props => {
    // Fallback to default values if not provided
    const speed = props.$animationConfig.speed ?? 1
    const duration = props.$animationConfig.duration ?? 4
    const direction = props.$animationConfig.direction ?? 1 // 1 for clockwise, -1 for counter-clockwise
    const effectiveDuration = duration / speed
    const rotationDirection = direction > 0 ? 'normal' : 'reverse'
    const borderWidth = props.$width || '2px'

    // Use provided color stops or generate from gradient colors or default color
    const colorStops =
      props.$animationConfig.colorStops ??
      (props.$gradientColors.length > 0 ?
        props.$gradientColors
      : [props.$color, lightenColor(props.$color, 30), props.$color])

    // Create the gradient string
    const gradientString = colorStops.join(', ')

    // Border-only mask using padding technique
    const maskStyle = `
      padding: ${borderWidth};
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask-composite: exclude;
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
    `

    // Define keyframe for rotation
    const rotateKeyframes = keyframes`
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    `

    // Common mask styles for different border styles
    const maskStylesForBorderType = `
      /* Apply border styles based on borderStyle prop */
      ${
        props.$borderStyle === 'dashed' &&
        css`
          mask-image:
            repeating-linear-gradient(45deg, black, black 5px, transparent 5px, transparent 10px),
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-image:
            repeating-linear-gradient(45deg, black, black 5px, transparent 5px, transparent 10px),
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
        `
      }

      ${
        props.$borderStyle === 'dotted' &&
        css`
          mask-image:
            radial-gradient(circle, black 1px, transparent 1px),
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          mask-size:
            5px 5px,
            auto,
            auto;
          -webkit-mask-image:
            radial-gradient(circle, black 1px, transparent 1px),
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-size:
            5px 5px,
            auto,
            auto;
        `
      }
    `

    // Common before element with gradient
    const beforeElement = `
      /* Create the rotating gradient background */
      &::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        right: -50%;
        bottom: -50%;
        width: 200%;
        height: 200%;
        background: conic-gradient(from 0deg, ${gradientString});
        transform-origin: center center;
      }
    `

    if (props.$animateOnHoverOnly) {
      // Hover-only animations
      return css`
        /* Apply mask to only show border */
        ${maskStyle}
        ${maskStylesForBorderType}
        
        ${beforeElement}
        
        &::before {
          transition: transform 0.3s ease;
        }

        /* Only animate on hover */
        .fancy-border-container:hover &::before {
          animation: ${rotateKeyframes} ${effectiveDuration}s linear infinite ${rotationDirection};
        }

        /* Steady state when not hovered */
        .fancy-border-container:not(:hover) &::before {
          animation: none;
          transform: rotate(0deg);
        }
      `
    } else {
      // Continuous animations
      return css`
        /* Apply mask to only show border */
        ${maskStyle}
        ${maskStylesForBorderType}
        
        ${beforeElement}
        
        &::before {
          animation: ${rotateKeyframes} ${effectiveDuration}s linear infinite ${rotationDirection};
        }
      `
    }
  }}
`

export default FancyBorder
