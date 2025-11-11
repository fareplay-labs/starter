// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react'

interface TrailLine {
  id: number
  startX: number
  startY: number
  endX: number
  endY: number
  opacity: number
  createdAt: number
}

interface RetroTrailProps {
  width: number
  height: number
  rocketX: number | null
  rocketY: number | null
  rocketDirection: { x: number; y: number }
  isActive: boolean
  color?: string
  intensity?: number // 1-10 scale
}

export const RetroTrail: React.FC<RetroTrailProps> = ({
  width,
  height,
  rocketX,
  rocketY,
  rocketDirection,
  isActive,
  color = '#00ff88',
  intensity = 5,
}) => {
  const [trails, setTrails] = useState<TrailLine[]>([])
  const animationFrameRef = useRef<number>()
  const lastEmitTimeRef = useRef<number>(0)
  const trailIdRef = useRef<number>(0)

  // Cleanup trails and animation on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!isActive || !rocketX || !rocketY || intensity === 0) {
      // Clear trails when not active or intensity is 0
      setTrails([])
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      return
    }

    const animate = () => {
      const now = Date.now()
      
      // Emit new trail lines based on intensity
      const emitRate = 30 - (intensity * 2) // Higher intensity = more frequent lines (base rate increased)
      if (now - lastEmitTimeRef.current > emitRate) {
        lastEmitTimeRef.current = now

        // Calculate cone parameters
        const coneAngle = Math.PI / 5 // Slightly wider cone (36 degrees)
        const lineLength = 20 + intensity * 3 // Longer base lines with more scaling
        const numLines = 3 + Math.floor(intensity / 2) // More base lines
        
        const newTrails: TrailLine[] = []
        
        for (let i = 0; i < numLines; i++) {
          // Distribute lines within the cone
          const angleOffset = (i / (numLines - 1) - 0.5) * coneAngle
          
          // Calculate the base angle from rocket direction (opposite direction for trail)
          const baseAngle = Math.atan2(-rocketDirection.y, -rocketDirection.x)
          const lineAngle = baseAngle + angleOffset
          
          // Add some randomness for organic feel
          const randomLength = lineLength + (Math.random() - 0.5) * 10
          const randomOffset = (Math.random() - 0.5) * 5
          
          // Calculate line endpoints
          const startX = rocketX + randomOffset * Math.cos(lineAngle + Math.PI / 2)
          const startY = rocketY + randomOffset * Math.sin(lineAngle + Math.PI / 2)
          const endX = startX + randomLength * Math.cos(lineAngle)
          const endY = startY + randomLength * Math.sin(lineAngle)
          
          newTrails.push({
            id: trailIdRef.current++,
            startX,
            startY,
            endX,
            endY,
            opacity: 1,
            createdAt: now,
          })
        }
        
        setTrails(prev => [...prev, ...newTrails])
      }
      
      // Update existing trails (fade out and remove old ones)
      setTrails(prev => {
        const fadeRate = 0.04 + (intensity * 0.008) // Slightly slower fade for more visible trails
        const maxAge = 600 - (intensity * 15) // Longer lifespan for more persistent trails
        
        return prev
          .map(trail => ({
            ...trail,
            opacity: trail.opacity - fadeRate,
          }))
          .filter(trail => 
            trail.opacity > 0 && 
            (now - trail.createdAt) < maxAge
          )
      })
      
      animationFrameRef.current = requestAnimationFrame(animate)
    }
    
    animationFrameRef.current = requestAnimationFrame(animate)
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isActive, rocketX, rocketY, rocketDirection, intensity])

  if (!isActive || trails.length === 0) {
    return null
  }

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 5,
      }}
      width={width}
      height={height}
    >
      {trails.map(trail => (
        <line
          key={trail.id}
          x1={trail.startX}
          y1={trail.startY}
          x2={trail.endX}
          y2={trail.endY}
          stroke={color}
          strokeWidth={2}
          strokeOpacity={trail.opacity}
          strokeLinecap="round"
        />
      ))}
    </svg>
  )
}