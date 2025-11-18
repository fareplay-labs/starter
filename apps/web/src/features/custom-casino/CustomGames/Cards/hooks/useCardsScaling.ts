// @ts-nocheck
import { useState, useEffect, useRef, useCallback } from 'react'
import type { RefObject } from 'react'

interface UseCardsScalingReturn {
  scale: number
  wrapperRef: RefObject<HTMLDivElement>
  contentRef: RefObject<HTMLDivElement>
}

/**
 * Custom hook to handle responsive scaling for Cards game content
 * Uses ResizeObserver to track container dimensions and calculate appropriate scale
 */
export const useCardsScaling = (): UseCardsScalingReturn => {
  const [scale, setScale] = useState(1)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)

  const calculateScale = useCallback(() => {
    if (!wrapperRef.current || !contentRef.current) return

    const wrapper = wrapperRef.current
    const content = contentRef.current

    // Cancel any pending animation frame
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }

    // Use requestAnimationFrame to ensure DOM is ready
    rafRef.current = requestAnimationFrame(() => {
      // Get natural size of content (use offsetWidth/Height for more reliable measurements)
      const contentWidth = content.offsetWidth || content.scrollWidth || 800
      const contentHeight = content.offsetHeight || content.scrollHeight || 600

      // Get available space with boundary checks
      const wrapperWidth = Math.max(wrapper.clientWidth, 0)
      const wrapperHeight = Math.max(wrapper.clientHeight, 0)

      // Skip calculation if dimensions are invalid
      if (wrapperWidth === 0 || wrapperHeight === 0 || contentWidth === 0 || contentHeight === 0) {
        return
      }

      // Calculate scale to fit with padding
      const padding = 32 // Leave some padding around the content
      const availableWidth = Math.max(wrapperWidth - padding, 1)
      const availableHeight = Math.max(wrapperHeight - padding, 1)

      const scaleX = availableWidth / contentWidth
      const scaleY = availableHeight / contentHeight

      // Use smaller scale, never scale up beyond 1.0
      const newScale = Math.min(scaleX, scaleY, 1)

      // Only update if scale has changed meaningfully (avoid micro-updates)
      setScale(prevScale => {
        const diff = Math.abs(prevScale - newScale)
        return diff > 0.001 ? newScale : prevScale
      })
    })
  }, [])

  useEffect(() => {
    // Initial calculation after a small delay to ensure DOM is ready
    const initialTimer = setTimeout(calculateScale, 100)

    const resizeObserver = new ResizeObserver(() => {
      calculateScale()
    })

    const currentWrapper = wrapperRef.current
    if (currentWrapper) {
      resizeObserver.observe(currentWrapper)
    }

    // Also recalculate on window resize as a fallback
    window.addEventListener('resize', calculateScale)

    return () => {
      clearTimeout(initialTimer)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
      resizeObserver.disconnect()
      window.removeEventListener('resize', calculateScale)
    }
  }, [calculateScale])

  return { scale, wrapperRef, contentRef }
}
