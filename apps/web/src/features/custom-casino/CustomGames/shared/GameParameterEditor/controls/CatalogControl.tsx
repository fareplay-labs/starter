// @ts-nocheck
import React from 'react'
import { styled } from 'styled-components'
import ColorControl from './ColorControl'

interface CatalogItem {
  id: number
  name: string
  iconUrl?: string
  description?: string
  tier?: 'common' | 'rare' | 'epic' | 'legendary'
  [key: string]: any
}

interface CatalogField {
  key: string
  label: string
  type: 'string' | 'url' | 'select' | 'number'
  required?: boolean
  options?: Array<{ value: string; label: string }>
  imageAspectRatio?: number
  imageType?: 'background' | 'tile' | 'icon' | 'asset'
  cropShape?: 'rect' | 'round'
  allowAIGen?: boolean
  allowEmoji?: boolean
}

interface CatalogControlProps {
  value?: CatalogItem[]
  onChange: (value: CatalogItem[]) => void
  label: string
  fields?: CatalogField[]
  allowAdd?: boolean
  allowRemove?: boolean
  seedDefaults?: CatalogItem[]
  packNames?: string[]
}

const defaultFields: CatalogField[] = [
  { key: 'name', label: 'Name', type: 'string', required: true },
  { key: 'description', label: 'Description', type: 'string' },
]

const defaultSeedData: CatalogItem[] = [
  { id: 1, name: 'Nova Chip', iconUrl: '', description: 'A common token.', tier: 'common' },
  { id: 2, name: 'Quantum Gem', iconUrl: '', description: 'Rare energy crystal.', tier: 'rare' },
  { id: 3, name: 'Stellar Crown', iconUrl: '', description: 'Legend whispers.', tier: 'legendary' },
]

export const CatalogControl: React.FC<CatalogControlProps> = ({
  value,
  onChange,
  label,
  fields = defaultFields,
  allowAdd = true,
  allowRemove = true,
  seedDefaults = defaultSeedData,
  packNames = [],
}) => {
  const items = Array.isArray(value) ? value : []
  
  // Force re-render when packNames change
  const packNamesKey = React.useMemo(() => {
    return packNames?.join(',') || ''
  }, [packNames])

  // Auto-initialize with defaults if no items and add/remove are disabled (fixed catalog)
  React.useEffect(() => {
    if (!allowAdd && !allowRemove && items.length === 0 && seedDefaults.length > 0) {
      onChange(seedDefaults)
    }
  }, [allowAdd, allowRemove, items.length, seedDefaults, onChange])

  const addSeedDefaults = () => {
    onChange(items.length ? items : seedDefaults)
  }

  const addItem = () => {
    const id = Date.now()
    const newItem: CatalogItem = { id, name: `Item ${id}` }
    
    // Initialize with default values based on field types
    fields.forEach(field => {
      if (field.type === 'number') {
        newItem[field.key] = 0
      } else if (field.type === 'select' && field.options?.length) {
        newItem[field.key] = field.options[0].value
      } else {
        newItem[field.key] = field.key === 'name' ? `Item ${id}` : ''
      }
    })

    onChange([...items, newItem])
  }

  const removeItem = (id: number) => {
    onChange(items.filter(item => item.id !== id))
  }

  const updateItem = (index: number, key: string, newValue: any) => {
    const updatedItems = [...items]
    updatedItems[index] = { ...updatedItems[index], [key]: newValue }
    onChange(updatedItems)
  }

  const renderField = (item: CatalogItem, field: CatalogField, index: number) => {
    const value = item[field.key] ?? ''

    switch (field.type) {
      case 'url':
        // Special handling for URL fields - use ColorControl configured for image-only mode
        // Note: We don't pass a label since the FieldContainer already provides one
        return (
          <ColorControl
            value={value}
            onChange={newValue => updateItem(index, field.key, newValue)}
            label=""
            parameterId={`${field.key}_${index}`}
            allowSolid={false}
            allowGradient={false}
            allowLinearGradient={false}
            allowRadialGradient={false}
            allowAlpha={false}
            allowEmoji={field.allowEmoji ?? false}
            allowImage={true}
            allowAIGen={field.allowAIGen ?? true}
            imageAspectRatio={field.imageAspectRatio ?? 1}
            imageType={field.imageType ?? 'icon'}
            cropShape={field.cropShape ?? 'round'}
          />
        )
      case 'select':
        return (
          <Select
            value={value}
            onChange={e => updateItem(index, field.key, e.target.value)}
            required={field.required}
          >
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        )
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={e => updateItem(index, field.key, parseFloat(e.target.value) || 0)}
            required={field.required}
          />
        )
      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={e => updateItem(index, field.key, e.target.value)}
            placeholder={field.label}
            required={field.required}
          />
        )
    }
  }

  return (
    <Container>
      <Header>
        <Label>{label}</Label>
        {(allowAdd || allowRemove) && (
          <ButtonGroup>
            <Button onClick={addSeedDefaults}>Seed Defaults</Button>
            {allowAdd && <Button onClick={addItem}>Add Item</Button>}
          </ButtonGroup>
        )}
      </Header>
      
      <ItemsContainer>
        {items.map((item, index) => (
          <ItemRow key={`${item.id}-${packNamesKey}`}>
            <ItemHeader>
              <ItemIndex>
                #{index + 1}
                {item.tier && ` | ${item.tier.charAt(0).toUpperCase() + item.tier.slice(1)}`}
                {item.packId !== undefined && packNames && packNames[item.packId] && ` | ${packNames[item.packId]}`}
              </ItemIndex>
              {allowRemove && (
                <RemoveButton onClick={() => removeItem(item.id)}>
                  ✕
                </RemoveButton>
              )}
            </ItemHeader>
            <FieldsGrid>
              {fields.map(field => (
                <FieldContainer key={field.key}>
                  <FieldLabel>{field.label}</FieldLabel>
                  {renderField(item, field, index)}
                </FieldContainer>
              ))}
            </FieldsGrid>
          </ItemRow>
        ))}
      </ItemsContainer>
      
      {items.length === 0 && (
        <EmptyState>No items in catalog. Click "Add Item" or "Seed Defaults" to get started.</EmptyState>
      )}
    </Container>
  )
}

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 10px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`

const Button = styled.button`
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

  &:active {
    transform: translateY(1px);
  }
`

const ItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const ItemRow = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  padding: 10px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
`

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`

const ItemIndex = styled.span`
  color: #aaa;
  font-size: 12px;
  font-weight: 600;
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

const FieldsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
  align-items: start;
  width: 100%;
  box-sizing: border-box;
`

const FieldContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
`

const FieldLabel = styled.label`
  color: #bbb;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const Input = styled.input`
  width: 100%;
  max-width: 100%;
  min-width: 0;
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

const Select = styled.select`
  width: 100%;
  max-width: 100%;
  min-width: 0;
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

  option {
    background: #2a2a2a;
    color: #fff;
  }
`

const EmptyState = styled.div`
  text-align: center;
  color: #666;
  font-size: 14px;
  padding: 32px 16px;
  font-style: italic;
`

export default CatalogControl