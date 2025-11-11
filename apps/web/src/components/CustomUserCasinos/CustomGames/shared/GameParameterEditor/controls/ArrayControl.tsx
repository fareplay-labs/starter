// @ts-nocheck
import React from 'react'
import { styled } from 'styled-components'

interface ArrayControlProps {
  value?: string[]
  onChange: (value: string[]) => void
  label: string
  itemType?: 'string' | 'number'
  fixedLength?: number
  itemLabels?: string[]
}

export const ArrayControl: React.FC<ArrayControlProps> = ({
  value = [],
  onChange,
  label,
  itemType = 'string',
  fixedLength,
  itemLabels = [],
}) => {
  const items = Array.isArray(value) ? value : []
  
  // Ensure we have the right number of items for fixed length
  React.useEffect(() => {
    if (fixedLength !== undefined && items.length !== fixedLength) {
      const newItems = [...items]
      while (newItems.length < fixedLength) {
        newItems.push('')
      }
      if (newItems.length > fixedLength) {
        newItems.length = fixedLength
      }
      onChange(newItems)
    }
  }, [fixedLength, items.length, onChange])

  const updateItem = (index: number, newValue: string) => {
    const updatedItems = [...items]
    updatedItems[index] = newValue
    onChange(updatedItems)
  }

  const addItem = () => {
    if (fixedLength === undefined || items.length < fixedLength) {
      onChange([...items, ''])
    }
  }

  const removeItem = (index: number) => {
    if (fixedLength === undefined) {
      const updatedItems = items.filter((_, i) => i !== index)
      onChange(updatedItems)
    }
  }

  return (
    <Container>
      <Header>
        <Label>{label}</Label>
        {fixedLength === undefined && (
          <AddButton onClick={addItem}>Add Item</AddButton>
        )}
      </Header>
      
      <ItemsContainer>
        {items.map((item, index) => (
          <ItemRow key={index}>
            <ItemLabel>
              {itemLabels[index] || `Item ${index + 1}`}
            </ItemLabel>
            <InputContainer>
              <Input
                type={itemType === 'number' ? 'number' : 'text'}
                value={item}
                onChange={e => updateItem(index, e.target.value)}
                placeholder={itemLabels[index] || `Enter ${itemType}`}
              />
              {fixedLength === undefined && (
                <RemoveButton onClick={() => removeItem(index)}>
                  ✕
                </RemoveButton>
              )}
            </InputContainer>
          </ItemRow>
        ))}
      </ItemsContainer>
      
      {items.length === 0 && (
        <EmptyState>No items. Click "Add Item" to get started.</EmptyState>
      )}
    </Container>
  )
}

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 10px;
  width: 100%;
  box-sizing: border-box;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const Label = styled.h3`
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
`

const AddButton = styled.button`
  padding: 6px 12px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.25);
  }
`

const ItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const ItemRow = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  padding: 8px;
`

const ItemLabel = styled.div`
  color: #bbb;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
`

const InputContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`

const Input = styled.input`
  flex: 1;
  padding: 6px 8px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid #444;
  border-radius: 3px;
  color: #fff;
  font-size: 12px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #5f5fff;
    box-shadow: 0 0 0 2px rgba(95, 95, 255, 0.2);
  }

  &::placeholder {
    color: #666;
  }
`

const RemoveButton = styled.button`
  padding: 4px 8px;
  border: 1px solid rgba(255, 0, 0, 0.3);
  background: rgba(255, 0, 0, 0.1);
  color: #ff6b6b;
  border-radius: 3px;
  cursor: pointer;
  font-size: 10px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 0, 0, 0.2);
    border-color: rgba(255, 0, 0, 0.5);
  }
`

const EmptyState = styled.div`
  text-align: center;
  color: #666;
  font-size: 14px;
  padding: 24px 16px;
  font-style: italic;
`

export default ArrayControl