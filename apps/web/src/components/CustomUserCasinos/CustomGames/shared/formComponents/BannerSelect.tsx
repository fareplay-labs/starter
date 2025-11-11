// @ts-nocheck
import React from 'react'
import { styled } from 'styled-components'
import { BACKGROUND_COLORS, BORDER_COLORS, FARE_COLORS, FONT_STYLES, TEXT_COLORS } from '@/design'

type BannerOptionId = string | number

export interface BannerOption {
  id: BannerOptionId
  title: React.ReactNode
  details?: React.ReactNode
  accentColor?: string
}

interface BannerSelectProps {
  options: BannerOption[]
  selectedId: BannerOptionId | null | undefined
  onSelect: (id: BannerOptionId) => void
  disabled?: boolean
  className?: string
  'data-testid'?: string
}

const BannerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`

const BannerButton = styled.button<{ $selected: boolean; $accentColor?: string }>`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 8px;
  border: 2px solid
    ${({ $selected, $accentColor }) =>
      $selected ? $accentColor || FARE_COLORS.aqua : BORDER_COLORS.one};
  background: ${({ $selected, $accentColor }) =>
    $selected ?
      `linear-gradient(135deg, ${$accentColor || FARE_COLORS.aqua}, ${$accentColor || FARE_COLORS.aqua}22)`
    : BACKGROUND_COLORS.two};
  color: ${TEXT_COLORS.one};
  cursor: pointer;
  transition:
    transform 0.15s ease,
    border-color 0.2s ease,
    background-color 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    border-color: ${({ $accentColor }) => $accentColor || FARE_COLORS.aqua};
    background: ${({ $accentColor, $selected }) =>
      $selected ?
        `linear-gradient(135deg, ${$accentColor || FARE_COLORS.aqua}aa, ${$accentColor || FARE_COLORS.aqua}33)`
      : `${BACKGROUND_COLORS.two}`};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const Title = styled.div`
  ${FONT_STYLES.md};
  font-weight: 700;
  color: ${TEXT_COLORS.one};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Details = styled.div`
  ${FONT_STYLES.xs};
  color: ${TEXT_COLORS.two};
  margin-left: auto;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const BannerSelect: React.FC<BannerSelectProps> = ({
  options,
  selectedId,
  onSelect,
  disabled = false,
  className,
  'data-testid': dataTestId,
}) => {
  return (
    <BannerList className={className} data-testid={dataTestId} role='radiogroup'>
      {options.map(option => {
        const isSelected = option.id === selectedId
        return (
          <BannerButton
            key={String(option.id)}
            type='button'
            onClick={() => onSelect(option.id)}
            disabled={disabled}
            aria-checked={isSelected}
            role='radio'
            $selected={!!isSelected}
            $accentColor={option.accentColor}
          >
            <Title>{option.title}</Title>
            {option.details && <Details>{option.details}</Details>}
          </BannerButton>
        )
      })}
    </BannerList>
  )
}

export default BannerSelect
