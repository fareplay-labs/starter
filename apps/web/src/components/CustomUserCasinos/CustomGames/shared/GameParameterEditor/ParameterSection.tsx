// @ts-nocheck
import React, { useState } from 'react'
import { styled } from 'styled-components'
import { type ParameterSectionProps } from './types'
import ParameterControl from './ParameterControl'

/**
 * Section component for grouping related parameters
 */
const ParameterSection: React.FC<ParameterSectionProps> = ({
  title,
  parameters,
  allParameters,
  parameterDefs,
  onChange,
  collapsible = true,
  gameType,
  userAddress,
  onSave,
}) => {
  const [collapsed, setCollapsed] = useState(false)

  const visibleDefs = parameterDefs.filter(def => {
    if (!def.condition) return true
    const controllingValue = parameters[def.condition.param]

    // Check equals condition
    if (def.condition.equals !== undefined) {
      return controllingValue === def.condition.equals
    }

    // Check notEquals condition
    if (def.condition.notEquals !== undefined) {
      return controllingValue !== def.condition.notEquals
    }

    return true
  })

  if (visibleDefs.length === 0) return null

  return (
    <SSectionContainer>
      <SSectionTitle
        $clickable={collapsible}
        onClick={collapsible ? () => setCollapsed(c => !c) : undefined}
      >
        <SSectionIcon />
        {title}
        {collapsible && <SArrow $open={!collapsed} />}
      </SSectionTitle>
      {!collapsed && (
        <SParameterList>
          {visibleDefs.map(def => (
            <ParameterControl
              key={def.id}
              definition={def}
              value={parameters[def.id]}
              allParameters={allParameters}
              onChange={value => onChange(def.id, value)}
              parameters={parameters}
              gameType={gameType}
              userAddress={userAddress}
              onSave={onSave}
            />
          ))}
        </SParameterList>
      )}
    </SSectionContainer>
  )
}

// Styled components (unchanged)
export const SSectionContainer = styled.div`
  background: rgba(20, 20, 24, 0.6);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease-in-out;

  &:hover {
    border-color: rgba(255, 255, 255, 0.12);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  &:last-child {
    margin-bottom: 0;
  }
`

const SSectionIcon = styled.div`
  width: 16px;
  height: 16px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%235f5fff'%3E%3Cpath d='M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z'%3E%3C/path%3E%3C/svg%3E");
  background-size: contain;
  margin-right: 8px;
  opacity: 0.7;
`

export const SSectionTitle = styled.h3<{ $clickable: boolean }>`
  font-size: 13px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #ffffff;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  border-bottom: 1px solid rgba(95, 95, 255, 0.3);
  padding-bottom: 8px;
  display: flex;
  align-items: center;
  cursor: ${p => (p.$clickable ? 'pointer' : 'default')};
`

const SArrow = styled.span<{ $open: boolean }>`
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 6px solid #5f5fffc0;
  margin-left: auto;
  transform: rotate(${p => (p.$open ? '0deg' : '-90deg')});
  transition: transform 0.2s;
`

const SParameterList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

export default ParameterSection
