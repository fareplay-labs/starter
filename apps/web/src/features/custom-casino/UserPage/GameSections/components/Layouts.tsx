import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'

// Carousel Layout
interface CarouselLayoutProps {
  children: React.ReactNode
  className?: string
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void
}

export const CarouselLayout = forwardRef<HTMLDivElement, CarouselLayoutProps>(
  ({ children, className, onScroll }, ref) => (
    <div
      ref={ref}
      onScroll={onScroll}
      className={cn(
        'flex gap-3 mx-auto py-6 overflow-x-auto scroll-smooth',
        '-webkit-overflow-scrolling-touch snap-x snap-mandatory',
        'relative flex-nowrap max-w-[850px]',
        // Custom scrollbar styling
        '[&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar]:bg-white/5 [&::-webkit-scrollbar]:rounded',
        '[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded',
        '[&::-webkit-scrollbar-thumb:hover]:bg-white/30',
        // Child spacing
        '[&>div]:mx-2 [&>div]:overflow-visible [&>div]:flex-none',
        // Remove pseudo-elements
        'before:hidden after:hidden',
        className
      )}
      style={{ scrollPaddingLeft: '8px' }}
    >
      {children}
    </div>
  )
)
CarouselLayout.displayName = 'CarouselLayout'

// Small Tiles Layout
interface SmallTilesLayoutProps {
  children: React.ReactNode
  className?: string
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void
}

export const SmallTilesLayout = forwardRef<HTMLDivElement, SmallTilesLayoutProps>(
  ({ children, className, onScroll }, ref) => (
    <div
      ref={ref}
      onScroll={onScroll}
      className={cn(
        'flex gap-4 py-6 mx-auto w-full justify-center flex-wrap',
        className
      )}
    >
      {children}
    </div>
  )
)
SmallTilesLayout.displayName = 'SmallTilesLayout'

// Large Tiles Layout
interface LargeTilesLayoutProps {
  children: React.ReactNode
  className?: string
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void
}

export const LargeTilesLayout = forwardRef<HTMLDivElement, LargeTilesLayoutProps>(
  ({ children, className, onScroll }, ref) => (
    <div
      ref={ref}
      onScroll={onScroll}
      className={cn(
        'flex gap-12 py-6 mx-auto justify-center w-full flex-wrap',
        className
      )}
    >
      {children}
    </div>
  )
)
LargeTilesLayout.displayName = 'LargeTilesLayout'
