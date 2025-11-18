// @ts-nocheck
import React from 'react'
import { styled } from 'styled-components'
import { type ParameterControlProps } from './types'
import { getImageUrl } from '../../../shared/utils/cropDataUtils'

// Import individual control components
import SliderControl from './controls/SliderControl'
import ColorControl from './controls/ColorControl'
import SelectControl from './controls/SelectControl'
import MultiSelectControl from './controls/MultiSelectControl'
import ToggleControl from './controls/ToggleControl'
import PayoutControl from './controls/PayoutControl'
import SlotIconsControl from './controls/SlotIconControl'
import SoundControl from './controls/SoundControl'
import { CatalogControl } from './controls/CatalogControl'
import { AssignmentsControl } from './controls/AssignmentsControl'
import { KeyValueListControl } from './controls/KeyValueListControl'
import { ObjectArrayControl } from './controls/ObjectArrayControl'
import { PackConfigurationControl } from './controls/PackConfigurationControl'
import { ArrayControl } from './controls/ArrayControl'
import { SlotSymbolsControl } from './controls/SlotSymbolsControl'

/**
 * Dynamic parameter control that renders the appropriate control component
 * based on the parameter type
 */
const ParameterControl: React.FC<ParameterControlProps> = ({
  definition,
  value,
  onChange,
  parameters,
  gameType,
  userAddress,
  onSave,
}) => {
  // Use a default value if none is provided
  const actualValue = value !== undefined ? value : definition.defaultValue

  // Debug onChange
  const handleChange = (newValue: any) => {
    onChange(newValue)
  }

  // Render the appropriate control based on the parameter type
  const renderControl = () => {
    switch (definition.type) {
      case 'number':
        return (
          <SliderControl
            value={actualValue}
            onChange={handleChange}
            min={definition.constraints?.min || 0}
            max={definition.constraints?.max || 100}
            step={definition.constraints?.step || 1}
            label={definition.label}
          />
        )

      case 'color': {
        const allowImage = !!definition.colorOptions?.allowImage
        const valueForControl = allowImage ? getImageUrl(actualValue) : actualValue
        return (
          <ColorControl
            value={valueForControl}
            onChange={onChange}
            label={definition.label}
            parameterId={definition.id}
            allowSolid={definition.colorOptions?.allowSolid}
            allowGradient={definition.colorOptions?.allowGradient}
            allowAlpha={definition.colorOptions?.allowAlpha}
            allowLinearGradient={definition.colorOptions?.allowLinearGradient}
            allowRadialGradient={definition.colorOptions?.allowRadialGradient}
            allowGradientDirection={definition.colorOptions?.allowGradientDirection}
            allowImage={allowImage}
            allowAIGen={definition.colorOptions?.allowAIGen}
            imageAspectRatio={definition.colorOptions?.imageAspectRatio}
            imageType={definition.colorOptions?.imageType}
            cropShape={definition.colorOptions?.cropShape}
            gameType={gameType}
            userAddress={userAddress}
            onSave={onSave}
          />
        )
      }

      case 'select':
        return (
          <SelectControl
            value={actualValue}
            onChange={handleChange}
            options={definition.options || []}
            label={definition.label}
          />
        )

      case 'multiselect':
        return (
          <MultiSelectControl
            value={actualValue || []}
            onChange={handleChange}
            options={definition.options || []}
            label={definition.label}
          />
        )

      case 'boolean':
        return (
          <ToggleControl value={actualValue} onChange={handleChange} label={definition.label} />
        )

      case 'string':
        return (
          <SStringInputContainer>
            <SControlHeader>
              <SLabel>{definition.label}</SLabel>
            </SControlHeader>
            <SStringInput
              type='text'
              value={actualValue}
              onChange={e => handleChange(e.target.value)}
              disabled={definition.disabled}
              placeholder={definition.disabled ? 'Coming soon...' : ''}
            />
          </SStringInputContainer>
        )

      case 'payoutTable':
        return (
          <STableControlContainer>
            <SLabel>Slots Game</SLabel>
            <PayoutControl payoutTable={value} parameters={parameters} onChange={handleChange} />
          </STableControlContainer>
        )

      case 'slotIcons':
        return (
          <STableControlContainer>
            <SLabel>Slot Symbols</SLabel>
            <SlotIconsControl value={value} parameters={parameters} onChange={handleChange} />
          </STableControlContainer>
        )

      case 'sound':
        return (
          <SoundControl
            value={actualValue}
            onChange={handleChange}
            label={definition.label}
            parameterId={definition.id}
            soundContext={definition.soundOptions?.soundContext || definition.label}
          />
        )

      case 'catalog':
        return (
          <CatalogControl
            value={actualValue}
            onChange={handleChange}
            label={definition.label}
            fields={definition.catalogOptions?.fields}
            allowAdd={definition.catalogOptions?.allowAdd}
            allowRemove={definition.catalogOptions?.allowRemove}
            seedDefaults={definition.catalogOptions?.seedDefaults}
            packNames={parameters?.packNames}
          />
        )

      case 'assignments':
        return (
          <AssignmentsControl
            value={actualValue}
            onChange={handleChange}
            label={definition.label}
            catalogRef={definition.assignmentsOptions?.catalogRef}
            packTypes={definition.assignmentsOptions?.packTypes}
            allParameters={parameters}
          />
        )

      case 'keyValueList':
        return (
          <KeyValueListControl
            value={actualValue}
            onChange={handleChange}
            label={definition.label}
            keyLabel={definition.keyValueOptions?.keyLabel}
            valueLabel={definition.keyValueOptions?.valueLabel}
            valueType={definition.keyValueOptions?.valueType}
          />
        )

      case 'objectArray':
        return (
          <ObjectArrayControl
            value={actualValue}
            onChange={handleChange}
            label={definition.label}
            fields={definition.objectArrayOptions?.fields || []}
            allowAdd={definition.objectArrayOptions?.allowAdd}
            allowRemove={definition.objectArrayOptions?.allowRemove}
            minItems={definition.objectArrayOptions?.minItems}
          />
        )

      case 'packConfiguration':
        return (
          <PackConfigurationControl
            value={actualValue}
            onChange={handleChange}
            label={definition.label}
            allParameters={parameters}
          />
        )

      case 'array':
        return (
          <ArrayControl
            value={actualValue}
            onChange={handleChange}
            label={definition.label}
            itemType={definition.arrayOptions?.itemType || 'string'}
            fixedLength={definition.arrayOptions?.fixedLength}
            itemLabels={definition.arrayOptions?.itemLabels}
          />
        )

      case 'slotSymbols':
        return (
          <SlotSymbolsControl
            value={actualValue}
            onChange={handleChange}
            label={definition.label}
          />
        )

      default:
        const unhandledType: string = (definition as any).type
        return <SErrorContainer>Unsupported parameter type: {unhandledType}</SErrorContainer>
    }
  }

  return (
    <SControlContainer>
      {renderControl()}
      {definition.description && <SDescription>{definition.description}</SDescription>}
    </SControlContainer>
  )
}

// Styled components
const SControlContainer = styled.div`
  width: 100%;
  padding-bottom: 0px;
  background: rgba(20, 20, 24, 0.6);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease-in-out;

  &:hover {
    border-color: rgba(255, 255, 255, 0.12);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`

const SStringInputContainer = styled.div`
  width: auto;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  padding: 8px;
`

const STableControlContainer = styled.div`
  padding: 10px;
`

const SControlHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`

const SLabel = styled.label`
  font-size: 12px;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  font-weight: 600;
`

const SStringInput = styled.input`
  width: auto;
  padding: 8px;
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid #444;
  border-radius: 4px;
  color: white;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #5f5fff;
  }

  &:disabled {
    opacity: 0.6;
    background-color: #2a2a2a;
    color: #999999;
  }
`

const SDescription = styled.div`
  font-size: 12px;
  color: #777;
  margin-top: -8px;
  margin-bottom: 12px;
  margin-left: 4px;
  padding-left: 4px;
`

const SErrorContainer = styled.div`
  width: 100%;
  padding: 8px;
  background-color: rgba(255, 0, 0, 0.1);
  border: 1px solid #ff3333;
  color: #ff3333;
  border-radius: 4px;
  margin-bottom: 16px;
  font-size: 12px;
`

export default ParameterControl
