// @ts-nocheck
import React from 'react'
import { cn } from '@/lib/utils'
import { useIsBreakpoint } from '@/hooks/common/useIsBreakpoint'

// Layout options type
export type LayoutType = 'carousel' | 'smallTiles' | 'largeTiles'

// Carousel Preview
const CarouselPreview = () => (
  <div className="flex items-center justify-center w-full">
    <div
      className="h-10 w-[30px] bg-white/20 rounded mr-0.5 flex-shrink-0 transition-all duration-300 hover:scale-105 hover:bg-white/45 hover:shadow-lg"
      style={{ transform: 'translateX(18px) scale(0.8)' }}
    />
    <div
      className="h-10 w-[30px] bg-white/20 rounded mr-0.5 flex-shrink-0 transition-all duration-300 hover:scale-105 hover:bg-white/45 hover:shadow-lg"
      style={{ transform: 'translateX(8px)' }}
    />
    <div className="h-[50px] w-[38px] bg-white/40 rounded mr-0.5 flex-shrink-0 z-[2] transition-all duration-300 hover:scale-105 hover:bg-white/45 hover:shadow-lg" />
    <div
      className="h-10 w-[30px] bg-white/20 rounded mr-0.5 flex-shrink-0 transition-all duration-300 hover:scale-105 hover:bg-white/45 hover:shadow-lg"
      style={{ transform: 'translateX(-8px)' }}
    />
    <div
      className="h-10 w-[30px] bg-white/20 rounded mr-0.5 flex-shrink-0 transition-all duration-300 hover:scale-105 hover:bg-white/45 hover:shadow-lg"
      style={{ transform: 'translateX(-18px) scale(0.8)' }}
    />
  </div>
)

// Small Tiles Preview
const SmallTilesPreview = () => (
  <div className="grid grid-cols-4 gap-3.5 w-3/4">
    {Array.from({ length: 8 }).map((_, i) => (
      <div
        key={i}
        className="h-[26px] aspect-square justify-self-center bg-white/25 rounded-sm shadow-sm transition-all duration-300 hover:scale-105 hover:bg-white/45 hover:shadow-lg"
      />
    ))}
  </div>
)

// Large Tiles Preview
const LargeTilesPreview = () => (
  <div className="grid grid-cols-4 gap-2 w-3/4">
    {Array.from({ length: 8 }).map((_, i) => (
      <div
        key={i}
        className="h-10 bg-white/25 rounded-sm transition-all duration-300 hover:scale-105 hover:bg-white/45 hover:shadow-lg"
      />
    ))}
  </div>
)

// LayoutSelector props interface
export interface LayoutSelectorProps {
  selectedLayout: LayoutType
  onLayoutChange: (layout: LayoutType) => void
  themeColor: string
}

/**
 * Component for selecting layout type in GameSelectModal
 */
export const LayoutSelector: React.FC<LayoutSelectorProps> = ({
  selectedLayout,
  onLayoutChange,
  themeColor,
}) => {
  const isMobileScreen = useIsBreakpoint('sm')

  const layouts = [
    { key: 'carousel', label: 'Carousel', Preview: CarouselPreview },
    { key: 'smallTiles', label: 'Small Tiles', Preview: SmallTilesPreview },
    { key: 'largeTiles', label: 'Large Tiles', Preview: LargeTilesPreview },
  ]

  return (
    <div className="flex flex-col gap-4 mb-8 p-6 bg-black/20 rounded-xl max-[992px]:mb-0">
      {/* Title */}
      <h3 className="text-white text-base m-0 text-center">Select Layout</h3>

      {/* Layout Options */}
      <div className="grid grid-cols-3 gap-4 max-[992px]:flex max-[992px]:flex-col max-[992px]:gap-3">
        {layouts.map(({ key, label, Preview }) => {
          const isSelected = selectedLayout === key

          return (
            <button
              key={key}
              onClick={() => onLayoutChange(key as LayoutType)}
              className={cn(
                'flex flex-col items-center gap-3 p-4 bg-transparent rounded-lg',
                'cursor-pointer transition-all duration-200 border',
                isSelected ? 'border-current' : 'border-[#1b1d26]',
                !isSelected && 'hover:border-[#2c3142]'
              )}
              style={{ borderColor: isSelected ? themeColor : undefined }}
            >
              <span
                className={cn(
                  'text-sm transition-all duration-200',
                  isSelected ? 'text-current' : 'text-[#aaaaaa]',
                  'hover:font-semibold hover:scale-[1.02]'
                )}
                style={{ color: isSelected ? themeColor : undefined }}
              >
                {label}
              </span>
              {!isMobileScreen && (
                <div className="w-full min-h-[60px] bg-[rgba(10,10,10,0.7)] rounded mt-2 p-1 flex items-center justify-center overflow-hidden">
                  <Preview />
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
