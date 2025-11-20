// @ts-nocheck
import { FARE_COLORS, TEXT_COLORS } from '@/design'
import { styled } from 'styled-components'

export const CheckboxContainer = styled.div`
  position: absolute;
  right: 0;
  bottom: -15px;
  display: flex;
  align-items: center;

  &.roulette-checkbox {
    bottom: 0px;
  }
`

export const StyledCheckbox = styled.input`
  margin-right: 4px;
  transform: scale(0.8);
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  width: 16px;
  height: 16px;
  border: 2px solid ${FARE_COLORS.gray};
  border-radius: 3px;
  background-color: transparent;
  cursor: pointer;
  position: relative;

  &:checked {
    background-color: ${FARE_COLORS.gray};

    &::after {
      content: '✓';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #fff;
      font-size: 12.8px;
    }
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5);
  }
`

export const CheckboxLabel = styled.label`
  font-family: 'Gohu';
  font-size: 10px;
  color: ${TEXT_COLORS.two};
`
