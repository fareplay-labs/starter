// @ts-nocheck
import React from 'react'
import styled from 'styled-components'
import { useGameStore } from '../CustomGamePage/GameStoreContext'

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  margin-bottom: 20px;
`

const ModeLabel = styled.span`
  color: #4caf50;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
`

const HelperText = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
`

export const DemoModeToggle: React.FC = () => {
  const { isDemoMode, setDemoMode } = useGameStore(state => ({
    isDemoMode: state.isDemoMode,
    setDemoMode: state.setDemoMode,
  }))

  return (
    <ToggleContainer>
      <ModeLabel>Demo Mode</ModeLabel>
      <HelperText>Blockchain betting coming soon. Demo is always enabled.</HelperText>
    </ToggleContainer>
  )
}
