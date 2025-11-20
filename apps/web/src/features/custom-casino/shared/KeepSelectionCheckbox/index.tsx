// @ts-nocheck
import { CheckboxContainer, CheckboxLabel, StyledCheckbox } from './styles'

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
  return (
    <CheckboxContainer className={className}>
      <CheckboxLabel htmlFor='reselectCheckbox'>{children}</CheckboxLabel>
      <StyledCheckbox
        type='checkbox'
        id='reselectCheckbox'
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
    </CheckboxContainer>
  )
}
