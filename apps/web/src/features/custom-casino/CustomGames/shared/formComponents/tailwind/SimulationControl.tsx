import React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SimulationControlProps {
  onSimulateWin: () => void
  onSimulateLoss: () => void
  disabled?: boolean
  className?: string
}

/**
 * Win/Loss simulation buttons for edit mode testing
 * Uses shadcn Button with success/destructive color variants
 */
export const SimulationControl: React.FC<SimulationControlProps> = ({
  onSimulateWin,
  onSimulateLoss,
  disabled = false,
  className,
}) => {
  return (
    <div className={cn('flex gap-2 w-full', className)}>
      <Button
        onClick={onSimulateWin}
        disabled={disabled}
        type="button"
        className={cn(
          'flex-1 h-10',
          'bg-success-soft hover:bg-success-soft/80 text-white',
          'font-bold text-sm rounded-md',
          'disabled:bg-muted-foreground disabled:cursor-not-allowed'
        )}
      >
        SIMULATE WIN
      </Button>
      <Button
        onClick={onSimulateLoss}
        disabled={disabled}
        type="button"
        className={cn(
          'flex-1 h-10',
          'bg-error hover:bg-error/80 text-white',
          'font-bold text-sm rounded-md',
          'disabled:bg-muted-foreground disabled:cursor-not-allowed'
        )}
      >
        SIMULATE LOSS
      </Button>
    </div>
  )
}

export default SimulationControl
