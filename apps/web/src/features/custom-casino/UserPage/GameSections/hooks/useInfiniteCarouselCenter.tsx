// @ts-nocheck
import { useRef, useEffect, useState, useMemo } from 'react'

export function useInfiniteCarouselCenter<T = any>(items: T[], isCarousel: boolean, marginPx = 8) {
  const carouselRef = useRef<HTMLDivElement>(null)
  const originalLength = items.length
  const duplicatedItems = useMemo(
    () => (isCarousel ? [...items, ...items, ...items] : items),
    [items, isCarousel]
  )

  const [centerIndex, setCenterIndex] = useState<number>(() =>
    Math.floor(duplicatedItems.length / 2)
  )

  // Ensure the index is recomputed whenever the source list length changes
  useEffect(() => {
    const newCenter = Math.floor(duplicatedItems.length / 2)
    setCenterIndex(prev => (prev === newCenter ? prev : newCenter))
  }, [duplicatedItems.length])
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Center on the middle set
  useEffect(() => {
    if (!isCarousel || !carouselRef.current || originalLength === 0) return
    const container = carouselRef.current
    const id = requestAnimationFrame(() => {
      const firstTile = container.children[0] as HTMLElement
      if (firstTile) {
        const tileWidth = firstTile.offsetWidth + 2 * marginPx
        container.scrollLeft = tileWidth * originalLength
      }
    })
    return () => cancelAnimationFrame(id)
  }, [isCarousel, originalLength, marginPx])

  // Infinite scroll and center detection
  const handleInfiniteScroll = () => {
    if (!isCarousel || !carouselRef.current) return
    const container = carouselRef.current
    const containerRect = container.getBoundingClientRect()
    const firstTile = container.children[0] as HTMLElement
    if (!firstTile) return
    const tileWidth = firstTile.offsetWidth + 2 * marginPx

    // Calculate approximate center index based on scroll position
    const containerCenter = containerRect.width / 2
    const estimatedIndex = Math.floor((container.scrollLeft + containerCenter) / tileWidth)

    // Only check a small window of items around the estimated index
    const startIdx = Math.max(0, estimatedIndex - 2)
    const endIdx = Math.min(container.children.length - 1, estimatedIndex + 2)
    let minDiff = Infinity
    let newCenter = 0

    for (let idx = startIdx; idx <= endIdx; idx++) {
      const child = container.children[idx]
      const rect = (child as HTMLElement).getBoundingClientRect()
      const tileCenter = rect.left + rect.width / 2
      const viewportCenter = containerRect.left + containerRect.width / 2
      const diff = Math.abs(tileCenter - viewportCenter)
      if (diff < minDiff) {
        minDiff = diff
        newCenter = idx
      }
    }

    // Infinite scroll logic
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current)
    debounceTimeout.current = setTimeout(() => {
      const scrollLeft = container.scrollLeft
      const scrollWidth = container.scrollWidth
      const containerWidth = container.offsetWidth
      const firstTile = container.children[0] as HTMLElement
      if (!firstTile) return
      const tileWidth = firstTile.offsetWidth + 2 * marginPx

      if (scrollLeft < tileWidth * 0.5) {
        container.scrollLeft = tileWidth * originalLength + scrollLeft
        setCenterIndex(prev => (prev + originalLength) % duplicatedItems.length)
      } else if (scrollLeft > scrollWidth - containerWidth - tileWidth * originalLength) {
        container.scrollLeft = scrollLeft - tileWidth * originalLength
        setCenterIndex(
          prev => (prev - originalLength + duplicatedItems.length) % duplicatedItems.length
        )
      } else {
        setCenterIndex(newCenter)
      }
    }, 60)
  }

  useEffect(() => {
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current)
    }
  }, [])

  return {
    carouselRef,
    duplicatedItems,
    centerIndex,
    handleInfiniteScroll,
  }
}
