import React from 'react'
import { cn } from '@/lib/utils'
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

// Title container
const TitleContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center justify-center mx-auto mb-8 w-full relative">
    {children}
  </div>
)

// Title line with gradient
interface TitleLineProps {
  colors?: ThemeColors
  position: 'left' | 'right'
}

const TitleLine: React.FC<TitleLineProps> = ({ colors, position }) => {
  // Build gradient based on position
  const getGradient = () => {
    if (!colors) return '#1b1d26'
    if (position === 'right') {
      return `linear-gradient(90deg, ${colors.themeColor3}, ${colors.themeColor2}, ${colors.themeColor1})`
    }
    return `linear-gradient(90deg, ${colors.themeColor1}, ${colors.themeColor2}, ${colors.themeColor3})`
  }

  return (
    <div
      className={cn(
        'h-0.5 flex-1 animate-line-reveal-left',
        position === 'left' ? 'origin-right' : 'origin-left'
      )}
      style={{ background: getGradient() }}
    />
  )
}

// Title text
const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="text-white mx-6 text-2xl text-center whitespace-nowrap">
    {children}
  </div>
)

// Component implementation
export const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  themeColors,
  isEditMode,
  fieldName,
  onEdit,
}) => (
  <TitleContainer>
    <TitleLine colors={themeColors} position='left' />
    <Title>
      {isEditMode && fieldName && onEdit ?
        <EditableText
          fieldName={fieldName}
          value={title}
          onSave={onEdit}
          placeholder='Section Title'
          className='section-title'
        />
      : title}
    </Title>
    <TitleLine colors={themeColors} position='right' />
  </TitleContainer>
)
