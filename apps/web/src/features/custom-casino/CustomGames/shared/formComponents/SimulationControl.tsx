// @ts-nocheck
import React from 'react'
import { SSimulationButton, SSimulationButtonsContainer } from './styled'

interface SimulationControlProps {
  onSimulateWin: () => void
  onSimulateLoss: () => void
  disabled?: boolean
}

export const SimulationControl: React.FC<SimulationControlProps> = ({
  onSimulateWin,
  onSimulateLoss,
  disabled = false,
}) => {
  return (
    <SSimulationButtonsContainer>
      <SSimulationButton $type='win' onClick={onSimulateWin} disabled={disabled}>
        SIMULATE WIN
      </SSimulationButton>
      <SSimulationButton $type='loss' onClick={onSimulateLoss} disabled={disabled}>
        SIMULATE LOSS
      </SSimulationButton>
    </SSimulationButtonsContainer>
  )
}
