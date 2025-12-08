import React from 'react'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'

interface FormGroupProps {
  label: string
  children: React.ReactNode
  className?: string
}

/**
 * A consistent container for form controls with a label
 * Uses shadcn Label component
 */
export const FormGroup: React.FC<FormGroupProps> = ({
  label,
  children,
  className,
}) => {
  return (
    <div className={cn('flex flex-col gap-1.5 w-full', className)}>
      <Label className="text-muted-foreground text-xs uppercase tracking-wide">
        {label}
      </Label>
      {children}
    </div>
  )
}

export default FormGroup
