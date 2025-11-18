// @ts-nocheck
import React from 'react'
import { styled } from 'styled-components'
import { SPACING, BORDER_COLORS, TEXT_COLORS } from '@/design'
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

// Styled components
const SSectionControls = styled.div`
  position: absolute;
  top: ${SPACING.xl + 20}px;
  right: 5px;
  display: flex;
  gap: ${SPACING.sm}px;
  z-index: 10;
`

const SControlButton = styled.button<{ $color?: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid ${props => props.$color || BORDER_COLORS.one};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
    background: rgba(40, 40, 40, 0.9);
  }

  svg {
    width: 16px;
    height: 16px;
    fill: currentColor;
  }
`

const SGameControls = styled.div`
  position: absolute;
  top: 5px;
  right: 5px;
  display: flex;
  gap: ${SPACING.xs}px;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 10;
`

const SAddSectionButton = styled.button<{
  $colors?: ThemeColors
}>`
  width: 100%;
  padding: ${SPACING.md}px;
  margin: ${SPACING.xl}px 0;
  border-radius: 12px;
  background: #0a0a0a;
  border: 2px dashed ${props => props.$colors?.themeColor1 || BORDER_COLORS.one};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${TEXT_COLORS.one};
  transition: all 0.2s ease;
  font-size: 16px;
  font-weight: 600;
  gap: ${SPACING.md}px;
  position: relative;

  &:hover {
    background: rgba(40, 40, 40, 0.3);
    border-color: ${props => props.$colors?.themeColor2 || BORDER_COLORS.two};
  }

  svg {
    width: 20px;
    height: 20px;
    fill: currentColor;
  }
`

// Component implementations
const ControlButton: React.FC<ControlButtonProps> = ({ color, title, onClick, icon }) => (
  <SControlButton $color={color} title={title} onClick={onClick}>
    {icon}
  </SControlButton>
)

export const SectionControls: React.FC<SectionControlsProps> = ({
  themeColors,
  onLayoutToggle,
  onAddGame,
  onRemoveSection,
}) => (
  <SSectionControls>
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
  </SSectionControls>
)

export const GameControls: React.FC<GameControlsProps> = ({ themeColors, onEdit, gameName }) => (
  <SGameControls>
    <ControlButton
      color={themeColors.themeColor2}
      title={gameName || 'Edit Game'}
      onClick={onEdit}
      icon={<GearIcon />}
    />
  </SGameControls>
)

export const AddSectionButton: React.FC<AddSectionButtonProps> = ({ colors, onClick }) => (
  <SAddSectionButton $colors={colors} onClick={onClick}>
    <GearIcon /> Add New Section
  </SAddSectionButton>
)
