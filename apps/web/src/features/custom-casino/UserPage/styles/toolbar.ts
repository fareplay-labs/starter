// @ts-nocheck
import { styled } from 'styled-components'
import { BREAKPOINTS, SPACING, TEXT_COLORS } from '@/design'
import { fadeIn, fadeOut, expandHeight, collapseHeight } from './animations'

export const SEditToolbar = styled.div<{ $isEditMode?: boolean }>`
  height: fit-content;
  width: 40px;
  background-color: ${props =>
    props.$isEditMode ? 'rgba(20, 20, 20, 0.85)' : 'rgba(20, 20, 20, 0.5)'};
  border-radius: 12px;
  box-shadow: ${props =>
    props.$isEditMode ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.2)'};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${SPACING.md}px;
  z-index: 10;
  backdrop-filter: ${props => (props.$isEditMode ? 'blur(5px)' : 'blur(3px)')};
  border: 1px solid
    ${props => (props.$isEditMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)')};
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease,
    box-shadow 0.3s ease,
    backdrop-filter 0.3s ease;

  @media (max-width: ${BREAKPOINTS.xs}px) {
    position: absolute;
    left: 10px;
    top: 325px;
  }
`

export const SToolbarSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`

export const SToolbarLabel = styled.div`
  font-size: 12px;
  color: ${TEXT_COLORS.two};
  margin-bottom: ${SPACING.xs}px;
  white-space: nowrap;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 1;
`

export const SThemeLabel = styled(SToolbarLabel)`
  opacity: 0;
  animation: ${fadeIn} 0.3s ease-in-out 0.25s forwards;

  .closing & {
    animation: ${fadeOut} 0.2s ease-in forwards;
  }
`

export const SToolbarDivider = styled.div`
  width: 100%;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
  margin: ${SPACING.md}px 0;
  opacity: 0;
  animation: ${fadeIn} 0.3s ease-in-out 0.15s forwards;

  .closing & {
    animation: ${fadeOut} 0.2s ease-in forwards;
  }
`

export const SThemeSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation:
    ${expandHeight} 0.4s ease-out forwards,
    ${fadeIn} 0.3s ease-in-out 0.1s forwards;
  opacity: 0;
  overflow: hidden;

  &.closing {
    animation:
      ${collapseHeight} 0.3s ease-in forwards,
      ${fadeOut} 0.25s ease-in forwards;
  }
`

export const SColorControls = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${SPACING.sm}px;
  width: 100%;
`

export const SColorButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: ${SPACING.sm}px;
`

export const SColorButton = styled.button<{ $color: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.8);
  background-color: ${props => props.$color || '#ffffff'};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  margin: ${SPACING.xs}px 0;

  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 50%);
  }

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  }
`

export const SFontLabel = styled(SToolbarLabel)`
  opacity: 0;
  animation: ${fadeIn} 0.3s ease-in-out 0.25s forwards;

  .closing & {
    animation: ${fadeOut} 0.2s ease-in forwards;
  }
`

export const SFontButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.8);
  background-color: rgba(40, 40, 40, 0.85);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  margin: ${SPACING.xs}px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${TEXT_COLORS.one};
  font-size: 18px;
  font-weight: bold;

  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 50%);
  }

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  }
`
