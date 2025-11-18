// @ts-nocheck
import { useState, useEffect, useRef, type RefObject } from 'react'

interface Dimensions {
  width: number
  height: number
}

/**
 * Hook to track container dimensions using ResizeObserver
 * @param containerRef - Ref to the container element to observe
 * @returns Current dimensions of the container
 */
export const useContainerDimensions = (containerRef: RefObject<HTMLElement>): Dimensions => {
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 0, height: 0 })
  const resizeObserverRef = useRef<ResizeObserver | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Create ResizeObserver instance
    resizeObserverRef.current = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        setDimensions({ width, height })
      }
    })

    // Start observing
    resizeObserverRef.current.observe(container)

    // Get initial dimensions
    const rect = container.getBoundingClientRect()
    setDimensions({ width: rect.width, height: rect.height })

    // Cleanup
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
        resizeObserverRef.current = null
      }
    }
  }, [containerRef])

  return dimensions
}
