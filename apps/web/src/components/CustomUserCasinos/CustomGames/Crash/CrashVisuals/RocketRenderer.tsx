// @ts-nocheck
import React, { useEffect, useRef, useCallback } from 'react'

interface RocketRendererProps {
  x: number
  y: number
  direction: { x: number; y: number }
  appearance: { url: string } | string // Support both formats
  size?: number
  rotateTowardsDirection?: boolean
}

export const RocketRenderer: React.FC<RocketRendererProps> = ({
  x,
  y,
  direction,
  appearance,
  size = 12,
  rotateTowardsDirection = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const [isImageLoaded, setIsImageLoaded] = useState(false)

  // Normalize appearance to always get a string value
  const appearanceUrl = useMemo(() => {
    if (typeof appearance === 'string') {
      // Check if it's a JSON string
      if (appearance.startsWith('{') && appearance.includes('"url"')) {
        try {
          const parsed = JSON.parse(appearance)
          return parsed.url || '#ffffff'
        } catch (error) {
          console.warn('Failed to parse appearance JSON:', error)
          return appearance // Fallback to original string
        }
      }
      // It's a plain string (color/URL)
      return appearance
    }
    // It's an object
    return appearance?.url || '#ffffff'
  }, [appearance])

  // Calculate rotation angle based on direction
  const rotation = rotateTowardsDirection ? Math.atan2(direction.y, direction.x) : -Math.PI / 2 // Point upward (-90 degrees from right-facing default)

  // Check if appearance is an image URL
  const isImage =
    appearanceUrl &&
    (appearanceUrl.startsWith('http') ||
      appearanceUrl.startsWith('data:') ||
      appearanceUrl.startsWith('blob:') ||
      /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(appearanceUrl))

  // Load image if needed
  useEffect(() => {
    if (isImage) {
      const img = new Image()
      img.onload = () => {
        imageRef.current = img
        setIsImageLoaded(true)
      }
      img.onerror = () => {
        console.warn('Failed to load rocket image:', appearanceUrl)
        setIsImageLoaded(false)
      }
      img.src = appearanceUrl
    } else {
      setIsImageLoaded(false)
    }
  }, [appearanceUrl, isImage])

  // Render function
  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Save context for transformations
    ctx.save()

    // Move to center of canvas (since canvas is positioned at rocket location)
    ctx.translate(100, 100)

    if (isImage && isImageLoaded && imageRef.current) {
      // Rotate for image (assuming vertical orientation)
      ctx.rotate(rotation + Math.PI / 2) // +90 degrees to align vertical image with direction

      // Draw image centered
      const imageSize = size * 3 // Make images a bit larger
      ctx.drawImage(imageRef.current, -imageSize / 2, -imageSize / 2, imageSize, imageSize)
    } else {
      // Draw colored/gradient rocket
      // Create rocket shape (triangle pointing right)
      ctx.rotate(rotation)

      if (isImage && !isImageLoaded) {
        // Show a different color while loading
        ctx.fillStyle = '#cccccc'
      } else if (isImage && !imageRef.current) {
        ctx.fillStyle = '#999999'
      } else {
        // Set fill style
        if (
          appearanceUrl &&
          (appearanceUrl.startsWith('linear-gradient') ||
            appearanceUrl.startsWith('radial-gradient'))
        ) {
          // Handle gradients - parse and create canvas gradient
          try {
            // Simple gradient parsing - this is a basic implementation
            if (appearanceUrl.startsWith('linear-gradient')) {
              const gradient = ctx.createLinearGradient(-size, -size, size, size)
              // Extract colors from CSS gradient string (basic implementation)
              const matches = appearanceUrl.match(
                /#[0-9a-f]{6}|#[0-9a-f]{3}|rgb\([^)]+\)|rgba\([^)]+\)/gi
              )
              if (matches && matches.length >= 2) {
                gradient.addColorStop(0, matches[0])
                gradient.addColorStop(1, matches[matches.length - 1])
              } else {
                // Fallback gradient
                gradient.addColorStop(0, '#ffffff')
                gradient.addColorStop(1, '#cccccc')
              }
              ctx.fillStyle = gradient
            } else {
              // Radial gradient
              const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size)
              const matches = appearanceUrl.match(
                /#[0-9a-f]{6}|#[0-9a-f]{3}|rgb\([^)]+\)|rgba\([^)]+\)/gi
              )
              if (matches && matches.length >= 2) {
                gradient.addColorStop(0, matches[0])
                gradient.addColorStop(1, matches[matches.length - 1])
              } else {
                gradient.addColorStop(0, '#ffffff')
                gradient.addColorStop(1, '#cccccc')
              }
              ctx.fillStyle = gradient
            }
          } catch (error) {
            console.warn('Failed to parse gradient:', appearanceUrl, error)
            ctx.fillStyle = '#ffffff' // Fallback to white
          }
        } else {
          ctx.fillStyle = appearanceUrl || '#ffffff' // Fallback to white if undefined
        }
      }

      // Draw rocket shape
      ctx.beginPath()
      ctx.moveTo(size, 0) // Tip
      ctx.lineTo(-size / 2, -size / 2) // Top back
      ctx.lineTo(-size / 4, 0) // Back center
      ctx.lineTo(-size / 2, size / 2) // Bottom back
      ctx.closePath()

      // Shadow/glow effect
      ctx.shadowColor = appearanceUrl || '#ffffff'
      ctx.shadowBlur = 8
      ctx.fill()
      ctx.shadowBlur = 0

      // Add stroke for better visibility
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 1
      ctx.stroke()

      // Inner highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.beginPath()
      ctx.moveTo(size * 0.7, 0)
      ctx.lineTo(-size / 4, -size / 4)
      ctx.lineTo(-size / 6, 0)
      ctx.lineTo(-size / 4, size / 4)
      ctx.closePath()
      ctx.fill()
    }

    // Restore context
    ctx.restore()
  }, [rotation, appearanceUrl, size, isImage, isImageLoaded])

  // Render when props change
  useEffect(() => {
    render()
  }, [render])

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={200}
      style={{
        position: 'absolute',
        left: x - 100,
        top: y - 100,
        width: 200,
        height: 200,
        pointerEvents: 'none',
        zIndex: 20, // Above particles
      }}
    />
  )
}
