// @ts-nocheck
import { styled } from 'styled-components'

const borderColor = '#5f5fff'

export const SContainer = styled.div`
  margin-bottom: 20px;
  padding: 0;
  background-color: rgba(249, 249, 249, 0);
  border-color: ${borderColor};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`

export const STable = styled.table`
  width: 100%;
  border-collapse: collapse;
`

export const SThead = styled.thead`
  background-color: rgb(95, 95, 255, 0.2);
  border-color: ${borderColor};
`

export const STh = styled.th`
  padding: 12px;
  text-align: center;
  color: white;
  font-weight: bold;
  border: 1px solid ${borderColor};
`

export const STbody = styled.tbody``

export const STr = styled.tr<{ $isEven?: boolean }>`
  background-color: ${props => (props.$isEven ? 'rgba(95, 95, 255, 0.1)' : 'transparent')};
  &:hover {
    background-color: ${props =>
      props.$isEven ? 'rgba(95, 95, 255, 0.2)' : 'rgba(95, 95, 255, 0.1)'};
  }
`

export const STd = styled.td`
  padding: 12px;
  text-align: center;
  border: 1px solid ${borderColor};
  vertical-align: middle;
`

export const SSymbolImage = styled.img`
  width: 30px;
  height: 30px;
  object-fit: contain;
  vertical-align: middle;
`

export const SButtonContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
  justify-content: center;
`

export const SAddInputButton = styled.button`
  padding: 6px 12px;
  border: 1px solid ${borderColor};
  border-radius: 4px;
  background-color: rgba(95, 95, 255, 0.2);
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  width: 100%;
  &:hover {
    background-color: rgba(95, 95, 255, 0.3);
  }
`

export const SImagePickerButton = styled.button`
  padding: 6px 12px;
  margin-right: 8px;
  border: 1px solid ${borderColor};
  border-radius: 4px;
  background-color: rgba(95, 95, 255, 0.2);
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  &:hover {
    background-color: rgba(95, 95, 255, 0.3);
  }
`

export const SRemoveButton = styled.button`
  padding: 6px 12px;
  border: 1px solid ${borderColor};
  border-radius: 4px;
  background-color: rgba(95, 95, 255, 0.2);
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  opacity: ${props => (props.disabled ? 0.5 : 1)};
  &:hover:not(:disabled) {
    background-color: rgba(95, 95, 255, 0.3);
  }

  img {
    vertical-align: middle;
  }
`
export const SPayoutWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`

export const SDropdownContainer = styled.div`
  position: relative;
  width: 60px;
`

export const SDropdownButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px;
  border: 1px solid ${borderColor};
  border-radius: 4px;
  background-color: rgba(95, 95, 255, 0.1);
  cursor: pointer;
  &:hover {
    border-color: #7b7bff;
  }
`

export const SDropdownIcon = styled.div`
  width: 12px;
  height: 12px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffffff'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
  background-size: contain;
  margin-left: 4px;
`

export const SDropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background-color: rgba(20, 20, 24, 0.9);
  border: 1px solid ${borderColor};
  border-radius: 4px;
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
`

export const SDropdownOption = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
  cursor: pointer;
  &:hover {
    background-color: rgba(95, 95, 255, 0.2);
  }
`

export const SInput = styled.input`
  padding: 4px;
  border: 1px solid ${borderColor};
  border-radius: 4px;
  background-color: rgba(95, 95, 255, 0.1);
  color: #fff;
  height: 30px;
  font-size: 14px;
  width: 40px;
  text-align: center;
  &:focus {
    outline: none;
    border-color: #7b7bff;
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`

export const SCombinationRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`

export const SAddComboButton = styled.button`
  padding: 4px 8px;
  border: 1px solid ${borderColor};
  border-radius: 4px;
  background-color: rgba(95, 95, 255, 0.2);
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  width: 100%;
  &:hover {
    background-color: rgba(95, 95, 255, 0.3);
  }
`

export const SRemoveComboButton = styled.button`
  padding: 4px 8px;
  border: 1px solid ${borderColor};
  border-radius: 4px;
  background-color: rgba(95, 95, 255, 0.2);
  color: #fff;
  font-size: 12px;
  height: 40px;
  width: 100%;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  opacity: ${props => (props.disabled ? 0.5 : 1)};
  &:hover:not(:disabled) {
    background-color: rgba(95, 95, 255, 0.3);
  }
`

export const SRemovePayoutIcon = styled.button<{ disabled?: boolean }>`
  width: 16px;
  height: 16px;
  padding: 0;
  border: none;
  background: none;
  color: #fff;
  font-size: 12px;
  line-height: 16px;
  text-align: center;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  opacity: ${props => (props.disabled ? 0.5 : 1)};
  &:hover:not(:disabled) {
    color: #ff5555;
  }
`
