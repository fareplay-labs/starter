// @ts-nocheck
import React from 'react'
import { styled } from 'styled-components'
import ColorControl from './ColorControl'
import { KeepSelectionCheckbox } from '@/components/CustomUserCasinos/shared/KeepSelectionCheckbox'

interface ObjectArrayField {
  key: string
  label: string
  type: 'string' | 'number' | 'boolean' | 'select' | 'url'
  required?: boolean
  options?: Array<{ value: string; label: string }>
  imageAspectRatio?: number
  imageType?: 'background' | 'tile' | 'icon' | 'asset'
  cropShape?: 'rect' | 'round'
  allowAIGen?: boolean
  allowEmoji?: boolean
}

interface ObjectArrayControlProps {
  value?: Record<string, any>[]
  onChange: (value: Record<string, any>[]) => void
  label: string
  fields: ObjectArrayField[]
  allowAdd?: boolean
  allowRemove?: boolean
  minItems?: number
}

export const ObjectArrayControl: React.FC<ObjectArrayControlProps> = ({
  value,
  onChange,
  label,
  fields,
  allowAdd = true,
  allowRemove = true,
  minItems = 0,
}) => {
  const objects = Array.isArray(value) ? value : []

  const addObject = () => {
    const newObject: Record<string, any> = {}

    // Initialize with default values based on field types
    fields.forEach(field => {
      if (field.type === 'number') {
        newObject[field.key] = 0
      } else if (field.type === 'boolean') {
        newObject[field.key] = false
      } else if (field.type === 'select' && field.options?.length) {
        newObject[field.key] = field.options[0].value
      } else {
        newObject[field.key] = ''
      }
    })

    onChange([...objects, newObject])
  }

  const removeObject = (index: number) => {
    if (objects.length <= minItems) return
    onChange(objects.filter((_, i) => i !== index))
  }

  const updateObject = (index: number, key: string, newValue: any) => {
    const updated = [...objects]
    updated[index] = { ...updated[index], [key]: newValue }
    onChange(updated)
  }

  const renderField = (obj: Record<string, any>, field: ObjectArrayField, index: number) => {
    const value =
      obj[field.key] ??
      (field.type === 'number' ? 0
      : field.type === 'boolean' ? false
      : '')

    switch (field.type) {
      case 'number':
        return (
          <Input
            type='number'
            value={value}
            onChange={e => updateObject(index, field.key, parseFloat(e.target.value) || 0)}
            required={field.required}
          />
        )
      case 'boolean':
        return (
          <KeepSelectionCheckbox
            checked={value}
            onChange={e => updateObject(index, field.key, e.target.checked)}
          >
            {value ? 'Yes' : 'No'}
          </KeepSelectionCheckbox>
        )
      case 'select':
        return (
          <Select
            value={value}
            onChange={e => updateObject(index, field.key, e.target.value)}
            required={field.required}
          >
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        )
      case 'url':
        // Use ColorControl for URL fields with emoji/image support
        return (
          <ColorControl
            value={value}
            onChange={newValue => updateObject(index, field.key, newValue)}
            label=''
            parameterId={`${field.key}_${index}`}
            allowSolid={false}
            allowGradient={false}
            allowLinearGradient={false}
            allowRadialGradient={false}
            allowAlpha={false}
            allowEmoji={field.allowEmoji ?? false}
            allowImage={true}
            allowAIGen={field.allowAIGen ?? false}
            imageAspectRatio={field.imageAspectRatio ?? 1}
            imageType={field.imageType ?? 'icon'}
            cropShape={field.cropShape ?? 'round'}
          />
        )
      default:
        return (
          <Input
            type='text'
            value={value}
            onChange={e => updateObject(index, field.key, e.target.value)}
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
        <HeaderActions>
          <ItemCount>
            {objects.length} item{objects.length !== 1 ? 's' : ''}
          </ItemCount>
          {allowAdd && <AddButton onClick={addObject}>Add Item</AddButton>}
        </HeaderActions>
      </Header>

      <ObjectsContainer>
        {objects.map((obj, index) => (
          <ObjectRow key={index}>
            <ObjectHeader>
              <ObjectIndex>#{index + 1}</ObjectIndex>
              {allowRemove && objects.length > minItems && (
                <RemoveButton onClick={() => removeObject(index)}>✕</RemoveButton>
              )}
            </ObjectHeader>

            <FieldsGrid $fieldCount={fields.length}>
              {fields.map(field => (
                <FieldContainer key={field.key}>
                  <FieldLabel>
                    {field.label}
                    {field.required && <RequiredMark>*</RequiredMark>}
                  </FieldLabel>
                  {renderField(obj, field, index)}
                </FieldContainer>
              ))}
            </FieldsGrid>
          </ObjectRow>
        ))}
      </ObjectsContainer>

      {objects.length === 0 && (
        <EmptyState>No items. Click &quot;Add Item&quot; to get started.</EmptyState>
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

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const ItemCount = styled.span`
  color: #aaa;
  font-size: 12px;
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

const ObjectsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const ObjectRow = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  padding: 16px;
`

const ObjectHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`

const ObjectIndex = styled.span`
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

const FieldsGrid = styled.div<{ $fieldCount: number }>`
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(${props => Math.max(200, 400 / props.$fieldCount)}px, 1fr)
  );
  gap: 16px;
`

const FieldContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const FieldLabel = styled.label`
  color: #bbb;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 4px;
`

const RequiredMark = styled.span`
  color: #ff6b6b;
  font-size: 12px;
`

const Input = styled.input`
  padding: 8px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid #444;
  border-radius: 3px;
  color: #fff;
  font-size: 13px;

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
  padding: 8px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid #444;
  border-radius: 3px;
  color: #fff;
  font-size: 13px;

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

export default ObjectArrayControl
