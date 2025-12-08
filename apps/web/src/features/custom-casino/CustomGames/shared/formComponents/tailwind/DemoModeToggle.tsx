import React from 'react'
import { cn } from '@/lib/utils'
import { useGameStore } from '../../CustomGamePage/GameStoreContext'

interface DemoModeToggleProps {
  className?: string
}

/**
 * Demo mode indicator banner
 * Shows current demo mode status and helper text
 */
export const DemoModeToggle: React.FC<DemoModeToggleProps> = ({ className }) => {
  // Keeping the store connection for future toggle functionality
  useGameStore(state => ({
    isDemoMode: state.isDemoMode,
    setDemoMode: state.setDemoMode,
  }))

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3',
        'bg-black/30 rounded-lg mb-5',
        className
      )}
    >
      <span className="text-success text-xs font-bold uppercase">
        Demo Mode
      </span>
      <p className="m-0 text-white/70 text-xs">
        Blockchain betting coming soon. Demo is always enabled.
      </p>
    </div>
  )
}

export default DemoModeToggle
