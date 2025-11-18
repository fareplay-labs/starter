// @ts-nocheck
import React from 'react'
import { styled, keyframes } from 'styled-components'
import { BORDER_COLORS, BREAKPOINTS, TEXT_COLORS } from '@/design'
import { RouletteBetForm } from './RouletteBetForm'
import { useIsBreakpoint } from '@/hooks/common/useIsBreakpoint'
import { useRouletteGameStore } from '../RouletteGameStore'

const subtlePulse = keyframes`
  0% {
    opacity: 0.6;
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.3);
  }
  50% {
    opacity: 0.9;
    box-shadow: 0 0 8px 2px rgba(255, 255, 255, 0.2);
  }
  100% {
    opacity: 0.6;
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.3);
  }
`

const DrawerToggle = styled.button<{ $isOpen: boolean }>`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-50%, -100%);
  background: ${props => props.$isOpen ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.7)'};
  border: 1px solid ${props => props.$isOpen ? BORDER_COLORS.one : 'rgba(255, 255, 255, 0.3)'};
  border-radius: 4px 4px 0 0;
  padding: 2px 16px;
  color: ${props => props.$isOpen ? TEXT_COLORS.two : 'rgba(255, 255, 255, 0.9)'};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  backdrop-filter: blur(5px);
  font-size: 8px;
  animation: ${props => props.$isOpen ? 'none' : subtlePulse} 3s ease-in-out infinite;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.$isOpen ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.9)'};
    opacity: 1;
    animation: none;
  }

  @media (max-width: ${BREAKPOINTS.sm}px) and (orientation: landscape) {
    display: ${props => (props.$isOpen ? 'flex' : 'none')};
    font-size: 20px;
    color: white;
  }
`

const DrawerContainer = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${props => (props.$isOpen ? 'rgba(0, 0, 0, 0.8)' : 'transparent')};
  backdrop-filter: ${props => (props.$isOpen ? 'blur(10px)' : 'none')};
  border-top: ${props => (props.$isOpen ? `1px solid ${BORDER_COLORS.one}` : 'none')};
  z-index: 10;
  transform: translateY(${props => (props.$isOpen ? '0' : '100%')});
  transition: transform 0.3s ease-in-out;
  padding: 16px;
  z-index: ${props => (props.$isOpen ? '10000' : '0')};
  user-select: none;

  @media (max-width: ${BREAKPOINTS.sm}px) and (orientation: landscape) {
    top: 5%;
    height: 100%;
    margin-block: 16px;
    background: rgba(0, 0, 0, 0.8);
    padding-bottom: 20%;
  }
`

export const RouletteDrawer: React.FC = () => {
  const { isDrawerOpen, setDrawerOpen } = useRouletteGameStore()
  const isMobileScreen = useIsBreakpoint('xs')

  return (
    <DrawerContainer $isOpen={isDrawerOpen}>
      {!isMobileScreen && (
        <DrawerToggle onClick={() => setDrawerOpen(!isDrawerOpen)} $isOpen={isDrawerOpen}>
          <span style={{ fontSize: '12px', color: TEXT_COLORS.three }}>
            {isDrawerOpen ? '▼' : '▲'}
          </span>
          {isDrawerOpen ? 'Hide' : 'Show'}
          <span style={{ fontSize: '12px', color: TEXT_COLORS.three }}>
            {isDrawerOpen ? '▼' : '▲'}
          </span>
        </DrawerToggle>
      )}
      <RouletteBetForm />
    </DrawerContainer>
  )
}
