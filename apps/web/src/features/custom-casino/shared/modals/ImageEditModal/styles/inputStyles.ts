// @ts-nocheck
import { styled } from 'styled-components'
import { SPACING, TEXT_COLORS, BORDER_COLORS, FARE_COLORS, BREAKPOINTS } from '@/design'

export const InputContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${SPACING.sm}px;
  margin-bottom: ${SPACING.md}px;
`

export const InputLabel = styled.label`
  color: ${TEXT_COLORS.two};
  font-size: 14px;
  font-weight: 500;
`

export const ImageUrlInput = styled.input<{ $hasError: boolean }>`
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid ${props => (props.$hasError ? FARE_COLORS.salmon : BORDER_COLORS.one)};
  border-radius: 8px;
  color: ${TEXT_COLORS.one};
  padding: ${SPACING.md}px;
  font-size: 16px;
  width: 100%;
  height: 48px;
  box-sizing: border-box;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => (props.$hasError ? FARE_COLORS.salmon : FARE_COLORS.blue)};
    box-shadow: 0 0 0 2px
      ${props => (props.$hasError ? 'rgba(255, 94, 79, 0.15)' : 'rgba(0, 112, 243, 0.15)')};
  }

  @media (max-width: ${BREAKPOINTS.sm}px) {
    height: 52px;
  }
`

export const ErrorMessage = styled.div`
  color: ${FARE_COLORS.salmon};
  font-size: 13px;
  margin-top: 4px;
`
