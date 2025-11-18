// @ts-nocheck
import React from 'react'
import { styled } from 'styled-components'

// --- Styles --- Moved from SimulationControl.Styles.tsx
const SimulationButtonsContainer = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
`

const SimulationButton = styled.button<{ $type: 'win' | 'loss' }>`
  flex: 1;
  height: 40px;
  border: none;
  border-radius: 4px;
  background-color: ${({ $type }) => ($type === 'win' ? '#4caf50' : '#f44336')};
  color: white;
  font-weight: bold;
  cursor: pointer;
  font-family: 'Courier New', monospace;
  font-size: 12px;

  &:hover {
    background-color: ${({ $type }) => ($type === 'win' ? '#45a049' : '#e53935')};
  }

  &:disabled {
    background-color: #888;
    cursor: not-allowed;
  }
`
// --- End Styles ---

interface SlotsSimulationControlProps {
  onSimulateLoss: () => void
  onSimulatePayout: () => void
  disabled?: boolean
}

export const SlotsSimulationControl: React.FC<SlotsSimulationControlProps> = ({
  onSimulateLoss,
  onSimulatePayout,
  disabled = false,
}) => {
  return (
    <SimulationButtonsContainer>
      <SimulationButton $type='win' onClick={onSimulatePayout} disabled={disabled}>
        SIMULATE PAYOUT
      </SimulationButton>
      <SimulationButton $type='loss' onClick={onSimulateLoss} disabled={disabled}>
        SIMULATE LOSS
      </SimulationButton>
    </SimulationButtonsContainer>
  )
}
