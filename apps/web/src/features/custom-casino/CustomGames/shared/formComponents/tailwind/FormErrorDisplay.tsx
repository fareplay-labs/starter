import React from 'react'
import { cn } from '@/lib/utils'

interface FormErrorDisplayProps {
  message: string | null | undefined
  className?: string
}

/**
 * Displays form validation errors
 * Simple text display with error styling
 */
export const FormErrorDisplay: React.FC<FormErrorDisplayProps> = ({
  message,
  className
}) => {
  if (!message) {
    return null
  }

  return (
    <div
      className={cn(
        'text-error text-sm text-center',
        'mb-1',
        className
      )}
    >
      {message}
    </div>
  )
}

export default FormErrorDisplay
