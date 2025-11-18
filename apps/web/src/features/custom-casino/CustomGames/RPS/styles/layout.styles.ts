// @ts-nocheck
import { styled } from 'styled-components'

export const SceneContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  padding: 1rem;
  border-radius: 8px;
  overflow: hidden;
`

export const GameArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: relative;
`

export const BattleContainer = styled.div<{ $isPlaying: boolean }>`
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 80%;
  padding: 1.5rem;
  margin: 0;
  border-radius: 8px;
  background-color: transparent;
  position: relative;
  overflow: hidden;
`

export const VersusText = styled.div<{ $color: string }>`
  font-size: 2rem;
  font-weight: bold;
  margin: 0 0.5rem;
  color: ${props => props.$color};
  z-index: 1;
`

export const ChoiceItem = styled.div<{
  $size: number
  $isPlaying: boolean
  $animationPreset: string
}>`
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: default;
  position: relative;
`
