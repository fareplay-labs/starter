// @ts-nocheck
import { styled } from 'styled-components'

export const SpinContainer = styled.div<{ $wheelRadius: number }>`
  position: relative;
  width: ${props => props.$wheelRadius * 2}px;
  height: ${props => props.$wheelRadius * 2}px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
`

export const ResponsiveSpinContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
`

export const WheelSVG = styled.svg<{
  $isSpinning: boolean
  $isResetting: boolean
  $spinDuration: number
  $resetDuration: number
}>`
  width: 100%;
  height: 100%;
  transition: ${props =>
    props.$isSpinning ? `transform ${props.$spinDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`
    : props.$isResetting ?
      `transform ${props.$resetDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`
    : 'none'};
`

export const WheelPointer = styled.div<{ $color: string; $scaleFactor?: number }>`
  position: absolute;
  top: ${props => 10 * (props.$scaleFactor || 1)}px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: ${props => 15 * (props.$scaleFactor || 1)}px solid transparent;
  border-right: ${props => 15 * (props.$scaleFactor || 1)}px solid transparent;
  border-top: ${props => 25 * (props.$scaleFactor || 1)}px solid ${props => props.$color};
  z-index: 10;
`

export const CircularImageBackground = styled.div<{ $radius: number }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: ${props => props.$radius * 2}px;
  height: ${props => props.$radius * 2}px;
  border-radius: 50%;
  overflow: hidden;
  z-index: 1;
`

export const WheelText = styled.text<{ $wheelRadius: number }>`
  font-size: ${props => Math.max(12, Math.min(28, props.$wheelRadius / 12))}px !important;
  font-weight: bold !important;
  text-anchor: middle;
  dominant-baseline: central;
`
