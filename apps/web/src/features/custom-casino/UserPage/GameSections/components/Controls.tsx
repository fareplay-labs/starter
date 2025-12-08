import React from 'react'
import { cn } from '@/lib/utils'
import { GearIcon, LayoutIcon, RemoveIcon, type ThemeColors } from '../utils'

// Props interfaces
interface ControlButtonProps {
  color?: string
  title: string
  onClick: () => void
  icon: React.ReactNode
}

interface SectionControlsProps {
  themeColors: ThemeColors
  onLayoutToggle: () => void
  onAddGame: () => void
  onRemoveSection: () => void
}

interface GameControlsProps {
  themeColors: ThemeColors
  onEdit: () => void
  gameName?: string
}

interface AddSectionButtonProps {
  colors?: ThemeColors
  onClick?: () => void
}

// Control button component
const ControlButton: React.FC<ControlButtonProps> = ({ color, title, onClick, icon }) => (
  <button
    title={title}
    onClick={onClick}
    className={cn(
      'w-8 h-8 rounded-full bg-black/70 flex items-center justify-center',
      'cursor-pointer text-white transition-all duration-200',
      'hover:scale-110 hover:bg-[rgba(40,40,40,0.9)]',
      '[&_svg]:w-4 [&_svg]:h-4 [&_svg]:fill-current'
    )}
    style={{ border: `2px solid ${color || '#1b1d26'}` }}
  >
    {icon}
  </button>
)

// Section controls container
export const SectionControls: React.FC<SectionControlsProps> = ({
  themeColors,
  onLayoutToggle,
  onAddGame,
  onRemoveSection,
}) => (
  <div className="absolute top-[52px] right-[5px] flex gap-3 z-10">
    <ControlButton
      color={themeColors.themeColor2}
      title='Change Layout'
      onClick={onLayoutToggle}
      icon={<LayoutIcon />}
    />
    <ControlButton
      color={themeColors.themeColor2}
      title='Add Game'
      onClick={onAddGame}
      icon={<GearIcon />}
    />
    <ControlButton
      color={themeColors.themeColor3}
      title='Remove Section'
      onClick={onRemoveSection}
      icon={<RemoveIcon />}
    />
  </div>
)

// Game controls (shown on hover)
export const GameControls: React.FC<GameControlsProps> = ({ themeColors, onEdit, gameName }) => (
  <div className="absolute top-[5px] right-[5px] flex gap-2 opacity-0 transition-opacity duration-200 z-10">
    <ControlButton
      color={themeColors.themeColor2}
      title={gameName || 'Edit Game'}
      onClick={onEdit}
      icon={<GearIcon />}
    />
  </div>
)

// Add section button
export const AddSectionButton: React.FC<AddSectionButtonProps> = ({ colors, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      'w-full p-4 my-8 rounded-xl bg-casino-dark flex items-center justify-center',
      'cursor-pointer text-white transition-all duration-200',
      'text-base font-semibold gap-4 relative',
      'hover:bg-[rgba(40,40,40,0.3)]',
      '[&_svg]:w-5 [&_svg]:h-5 [&_svg]:fill-current'
    )}
    style={{
      border: `2px dashed ${colors?.themeColor1 || '#1b1d26'}`,
    }}
    onMouseOver={(e) => {
      if (colors?.themeColor2) {
        e.currentTarget.style.borderColor = colors.themeColor2
      }
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.borderColor = colors?.themeColor1 || '#1b1d26'
    }}
  >
    <GearIcon /> Add New Section
  </button>
)
