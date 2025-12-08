import React from 'react'
import { cn } from '@/lib/utils'

interface GameStat {
  label: string
  value: string | number
}

interface GameStatsProps {
  stats: GameStat[]
  className?: string
}

/**
 * A grid for displaying game statistics (win chance, multiplier, etc.)
 * Uses CSS grid with auto-fit for responsive columns
 */
export const GameStats: React.FC<GameStatsProps> = ({ stats, className }) => {
  return (
    <div
      className={cn(
        'grid grid-cols-[repeat(auto-fit,minmax(80px,1fr))] gap-1.5',
        'my-1.5 w-full',
        className
      )}
    >
      {stats.map((stat, index) => (
        <div
          key={index}
          className={cn(
            'flex flex-col items-center justify-center',
            'bg-surface-raised border border-border-subtle rounded-md',
            'p-1.5'
          )}
        >
          <div
            className={cn(
              'text-muted-foreground text-xs',
              'mb-0.5 text-center uppercase tracking-wide'
            )}
          >
            {stat.label}
          </div>
          <div className="text-foreground text-sm text-center">
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  )
}

export default GameStats
