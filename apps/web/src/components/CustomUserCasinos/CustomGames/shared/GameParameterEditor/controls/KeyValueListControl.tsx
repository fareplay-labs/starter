// @ts-nocheck
import React from 'react'
import { styled } from 'styled-components'

interface KeyValuePair {
  key: string
  value: any
}

interface KeyValueListControlProps {
  value?: KeyValuePair[]
  onChange: (value: KeyValuePair[]) => void
  label: string
  keyLabel?: string
  valueLabel?: string
  valueType?: 'string' | 'number' | 'boolean'
}

export const KeyValueListControl: React.FC<KeyValueListControlProps> = ({
  value,
  onChange,
  label,
  keyLabel = 'Key',
  valueLabel = 'Value',
  valueType = 'string',
}) => {
  const pairs = Array.isArray(value) ? value : []

  const addPair = () => {
    const defaultValue = valueType === 'number' ? 0 : valueType === 'boolean' ? false : ''
    onChange([...pairs, { key: '', value: defaultValue }])
  }

  const removePair = (index: number) => {
    onChange(pairs.filter((_, i) => i !== index))
  }

  const updatePair = (index: number, field: 'key' | 'value', newValue: any) => {
    const updated = [...pairs]
    updated[index] = { ...updated[index], [field]: newValue }
    onChange(updated)
  }

  const renderValueInput = (pair: KeyValuePair, index: number) => {
    switch (valueType) {
      case 'number':
        return (
          <Input
            type="number"
            value={pair.value}
            onChange={e => updatePair(index, 'value', parseFloat(e.target.value) || 0)}
          />
        )
      case 'boolean':
        return (
          <Checkbox
            type="checkbox"
            checked={pair.value}
            onChange={e => updatePair(index, 'value', e.target.checked)}
          />
        )
      default:
        return (
          <Input
            type="text"
            value={pair.value}
            onChange={e => updatePair(index, 'value', e.target.value)}
            placeholder={valueLabel}
          />
        )
    }
  }

  return (
    <Container>
      <Header>
        <Label>{label}</Label>
        <AddButton onClick={addPair}>Add Pair</AddButton>
      </Header>

      {pairs.length > 0 && (
        <Table>
          <TableHeader>
            <HeaderCell>{keyLabel}</HeaderCell>
            <HeaderCell>{valueLabel}</HeaderCell>
            <HeaderCell width="50px">Actions</HeaderCell>
          </TableHeader>
          <TableBody>
            {pairs.map((pair, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Input
                    type="text"
                    value={pair.key}
                    onChange={e => updatePair(index, 'key', e.target.value)}
                    placeholder={keyLabel}
                  />
                </TableCell>
                <TableCell>
                  {renderValueInput(pair, index)}
                </TableCell>
                <TableCell>
                  <RemoveButton onClick={() => removePair(index)}>
                    ✕
                  </RemoveButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {pairs.length === 0 && (
        <EmptyState>No key-value pairs. Click "Add Pair" to get started.</EmptyState>
      )}
    </Container>
  )
}

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
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
  border: 1px solid rgba(0, 255, 0, 0.3);
  background: rgba(0, 255, 0, 0.1);
  color: #51cf66;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 255, 0, 0.2);
    border-color: rgba(0, 255, 0, 0.5);
  }
`

const Table = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  overflow: hidden;
`

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 50px;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`

const TableBody = styled.div`
  display: flex;
  flex-direction: column;
`

const HeaderCell = styled.div<{ width?: string }>`
  padding: 12px;
  color: #aaa;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  ${props => props.width && `width: ${props.width};`}
`

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 50px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  &:last-child {
    border-bottom: none;
  }
`

const TableCell = styled.div`
  padding: 8px 12px;
  display: flex;
  align-items: center;
`

const Input = styled.input`
  width: 100%;
  padding: 6px 8px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid #444;
  border-radius: 3px;
  color: #fff;
  font-size: 12px;

  &:focus {
    outline: none;
    border-color: #5f5fff;
    box-shadow: 0 0 0 2px rgba(95, 95, 255, 0.2);
  }

  &::placeholder {
    color: #666;
  }
`

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  accent-color: #5f5fff;
  cursor: pointer;
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
  padding: 32px 16px;
  font-style: italic;
`

export default KeyValueListControl