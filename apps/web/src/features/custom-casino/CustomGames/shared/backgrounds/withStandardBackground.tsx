// @ts-nocheck
import React, { useEffect, useState, useRef, forwardRef } from 'react'
import { styled } from 'styled-components'
import { getBackgroundType, parseImageValue } from '../utils/backgroundUtils'
import CroppedImage from '../../../shared/ui/CroppedImage'

interface BackgroundWrapperProps {
  $backgroundColor: string
  $hasImageBackground: boolean
  $preserveContainerStyles?: boolean
}

const BackgroundWrapper = styled.div<BackgroundWrapperProps>`
  position: relative;
  width: 100%;
  height: 100%;

  ${props =>
    !props.$preserveContainerStyles &&
    `
    background: ${props.$hasImageBackground ? 'transparent' : props.$backgroundColor};
    overflow: hidden;
  `}
`

interface BackgroundImageLayerProps {
  $overlay?: {
    gradient?: string
    opacity?: number
  }
  $imageOpacity?: number
}

const BackgroundImageLayer = styled.div<BackgroundImageLayerProps>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  overflow: hidden;

  /* Apply opacity only to the image, not the overlay */
  & > * {
    opacity: ${props => props.$imageOpacity ?? 1};
  }

  /* Ensure the cropped image fills the container properly and adjusts to new dimensions */
  & > div {
    width: 100% !important;
    height: 100% !important;
    position: relative !important;
  }

  /* Force CroppedImage to recalculate on container size changes */
  & img {
    transition: transform 0.3s ease;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: ${props =>
      props.$overlay?.gradient ||
      'linear-gradient(0deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.2) 100%)'};
    opacity: ${props => props.$overlay?.opacity ?? 1};
    pointer-events: none;
    z-index: 2;
  }
`

const ContentLayer = styled.div`
  position: relative;
  z-index: 3;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

// Component that forces CroppedImage to re-render when container dimensions change
const ResponsiveBackgroundImage: React.FC<{
  imageData: any
  alt: string
}> = ({ imageData, alt }) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [renderKey, setRenderKey] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let timeoutId: NodeJS.Timeout

    const updateDimensions = () => {
      // Debounce the update to prevent excessive re-renders
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        const rect = container.getBoundingClientRect()
        const newDimensions = { width: Math.round(rect.width), height: Math.round(rect.height) }

        // Only update if dimensions actually changed significantly (> 1px)
        if (
          Math.abs(newDimensions.width - dimensions.width) > 1 ||
          Math.abs(newDimensions.height - dimensions.height) > 1
        ) {
          setDimensions(newDimensions)
          setRenderKey(prev => prev + 1)
        }
      }, 100) // 100ms debounce
    }

    // Use ResizeObserver for better performance
    const resizeObserver = new ResizeObserver(updateDimensions)
    resizeObserver.observe(container)

    // Initial measurement
    updateDimensions()

    return () => {
      clearTimeout(timeoutId)
      resizeObserver.disconnect()
    }
  }, [dimensions.width, dimensions.height])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <CroppedImage
        key={`${renderKey}-${dimensions.width}x${dimensions.height}`}
        imageData={imageData}
        alt={alt}
        width='100%'
        height='100%'
      />
    </div>
  )
}

export interface StandardBackgroundOptions {
  /** Optional overlay for image backgrounds */
  overlay?: {
    gradient?: string
    opacity?: number
  }
  /** Whether to preserve existing container styles (for integration with existing components) */
  preserveContainerStyles?: boolean
}

export interface WithStandardBackgroundProps {
  backgroundColor: string | any
  backgroundOptions?: StandardBackgroundOptions
}

/**
 * Higher-order component that adds standardized background support to existing game containers
 * This allows integration with existing components without breaking their styling
 */
export function withStandardBackground<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  defaultOptions?: StandardBackgroundOptions
) {
  const Component = forwardRef<any, P & WithStandardBackgroundProps>((props, ref) => {
    const { backgroundColor, backgroundOptions, ...componentProps } = props
    const options = { ...defaultOptions, ...backgroundOptions }

    const backgroundType = getBackgroundType(backgroundColor)
    const hasImageBackground = backgroundType === 'image'

    // If it's a solid color or gradient, let the wrapped component handle it normally
    if (!hasImageBackground) {
      return (
        <WrappedComponent
          {...(componentProps as P)}
          $backgroundColor={backgroundColor}
          ref={ref}
        />
      )
    }

    // For image backgrounds, wrap with our background system
    return (
      <BackgroundWrapper
        $backgroundColor={backgroundColor}
        $hasImageBackground={hasImageBackground}
        $preserveContainerStyles={options?.preserveContainerStyles}
      >
        {(() => {
          const { url, opacity } = parseImageValue(backgroundColor)
          return (
            <BackgroundImageLayer $overlay={options?.overlay} $imageOpacity={opacity}>
              <ResponsiveBackgroundImage imageData={url} alt='Game Background' />
            </BackgroundImageLayer>
          )
        })()}
        <ContentLayer>
          <WrappedComponent {...(componentProps as P)} ref={ref} />
        </ContentLayer>
      </BackgroundWrapper>
    )
  })

  Component.displayName = `withStandardBackground(${WrappedComponent.displayName || WrappedComponent.name})`

  return Component
}
