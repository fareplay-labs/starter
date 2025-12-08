import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface CheckBoxProps {
  checked: boolean
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  className?: string
  disabled?: boolean
  children: string
}

export const KeepSelectionCheckbox = ({
  checked,
  onChange,
  className,
  disabled,
  children,
}: CheckBoxProps) => {
  // Convert shadcn's onCheckedChange to match the expected onChange interface
  const handleCheckedChange = (checkedState: boolean | 'indeterminate') => {
    // Create a synthetic event-like object
    const syntheticEvent = {
      target: {
        checked: checkedState === true,
      },
    } as React.ChangeEvent<HTMLInputElement>
    onChange(syntheticEvent)
  }

  return (
    <div
      className={cn(
        'absolute right-0 -bottom-4 flex items-center gap-2',
        className
      )}
    >
      <Label
        htmlFor="reselectCheckbox"
        className="text-[10px] font-normal text-muted-foreground uppercase tracking-wide cursor-pointer"
      >
        {children}
      </Label>
      <Checkbox
        id="reselectCheckbox"
        checked={checked}
        onCheckedChange={handleCheckedChange}
        disabled={disabled}
        className="h-4 w-4 border-muted-foreground data-[state=checked]:bg-muted-foreground data-[state=checked]:border-muted-foreground"
      />
    </div>
  )
}
