// @ts-nocheck
import React from 'react'
import { styled, keyframes } from 'styled-components'
import { SPACING, TEXT_COLORS, BORDER_COLORS } from '@/design'
import { type ThemeColors } from '../utils'
import EditableText from '../../editor/EditableText'

// Props interfaces
interface SectionTitleProps {
  title: string
  themeColors?: ThemeColors
  isEditMode?: boolean
  fieldName?: string
  onEdit?: (field: string, value: string) => void
}

// Animation keyframes
const lineRevealAnimation = keyframes`
  0% {
    transform: scaleX(0);
  }
  100% {
    transform: scaleX(1);
  }
`

// Styled components
const STitleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${SPACING.xl}px;
  width: 100%;
  position: relative;
`

const STitleLine = styled.div<{
  $colors?: ThemeColors
  $position?: 'left' | 'right'
}>`
  height: 2px;
  background: ${props =>
    props.$colors ?
      props.$position === 'right' ?
        `linear-gradient(90deg, ${props.$colors.themeColor3}, ${props.$colors.themeColor2}, ${props.$colors.themeColor1})`
      : `linear-gradient(90deg, ${props.$colors.themeColor1}, ${props.$colors.themeColor2}, ${props.$colors.themeColor3})`
    : BORDER_COLORS.one};
  flex: 1;
  transform-origin: ${props => (props.$position === 'left' ? 'right' : 'left')};
  animation: ${lineRevealAnimation} 2s ease-out forwards;
`

const STitle = styled.div`
  color: ${TEXT_COLORS.one};
  margin: 0 ${SPACING.lg}px;
  font-size: 24px;
  text-align: center;
  white-space: nowrap;
`

// Component implementation
export const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  themeColors,
  isEditMode,
  fieldName,
  onEdit,
}) => (
  <STitleContainer>
    <STitleLine $colors={themeColors} $position='left' />
    <STitle>
      {isEditMode && fieldName && onEdit ?
        <EditableText
          fieldName={fieldName}
          value={title}
          onSave={onEdit}
          placeholder='Section Title'
          className='section-title'
        />
      : title}
    </STitle>
    <STitleLine $colors={themeColors} $position='right' />
  </STitleContainer>
)
