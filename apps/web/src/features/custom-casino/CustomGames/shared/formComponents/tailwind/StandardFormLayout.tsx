import React from 'react'
import { cn } from '@/lib/utils'

interface StandardFormLayoutProps {
  children: React.ReactNode
  className?: string
}

/**
 * Standard layout container for game forms
 * Provides consistent spacing and structure
 */
export const StandardFormLayout: React.FC<StandardFormLayoutProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col w-full h-full',
        'gap-3 select-none',
        className
      )}
    >
      {children}
    </div>
  )
}

export default StandardFormLayout
