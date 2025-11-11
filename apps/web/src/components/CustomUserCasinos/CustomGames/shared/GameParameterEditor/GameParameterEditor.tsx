// @ts-nocheck
import React, { useMemo } from 'react'
import { styled } from 'styled-components'
import { type GameParameterEditorProps } from '@/components/CustomUserCasinos/CustomGames/shared/GameParameterEditor/types'
import { type BaseGameParameters } from '@/components/CustomUserCasinos/CustomGames/shared/types'
import ParameterSection from '@/components/CustomUserCasinos/CustomGames/shared/GameParameterEditor/ParameterSection'
import { gameRegistry } from '@/components/CustomUserCasinos/config/GameRegistry'

/**
 * Main editor component for game parameters
 * Uses metadata to dynamically generate controls for editing game parameters
 */
function GameParameterEditor<T extends BaseGameParameters>({
  parameters,
  gameType,
  onChange,
  userAddress,
  onSave,
}: GameParameterEditorProps<T>) {
  // Get metadata for this game type from the registry
  const metadata = useMemo(() => gameRegistry.getGameMetadata(gameType), [gameType])

  // Handle parameter change
  const handleParameterChange = (paramName: string, value: any) => {
    onChange({
      ...parameters,
      [paramName]: value,
    } as Partial<T>)
  }

  // If no metadata found, show a message
  if (!metadata) {
    return (
      <SErrorContainer>
        <SErrorTitle>Editor Not Available</SErrorTitle>
        <SErrorMessage>No editor configuration found for {gameType} game type.</SErrorMessage>
      </SErrorContainer>
    )
  }

  return (
    <SEditorContainer>
      <SSectionsContainer>
        {metadata.sections.map(section => (
          <ParameterSection
            key={section.id}
            title={section.title}
            parameters={parameters || {}}
            allParameters={parameters || {}}
            parameterDefs={section.parameters}
            collapsible={section.collapsible !== false}
            onChange={handleParameterChange}
            gameType={gameType}
            userAddress={userAddress}
            onSave={onSave}
          />
        ))}
      </SSectionsContainer>

      <SActionButtons>
        <SResetButton
          onClick={() => {
            const defaults: Record<string, any> = {}
            metadata.sections.forEach(section => {
              section.parameters.forEach(param => {
                defaults[param.id] = param.defaultValue
              })
            })
            onChange(defaults as Partial<T>)
          }}
        >
          <SResetIcon />
          Reset to Defaults
        </SResetButton>
      </SActionButtons>
    </SEditorContainer>
  )
}

// Styled components
const SEditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  padding: 0;
  position: relative;
`

const SSectionsContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;

  /* Improved scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(95, 95, 255, 0.2);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(95, 95, 255, 0.3);
  }

  /* Hide scrollbar when not hovering */
  &:not(:hover)::-webkit-scrollbar-thumb {
    background: transparent;
  }
`

const SErrorContainer = styled.div`
  width: 100%;
  padding: 20px;
  background-color: rgba(255, 0, 0, 0.1);
  border: 1px solid #ff3333;
  color: #ff3333;
  border-radius: 8px;
  margin-bottom: 20px;
`

const SErrorTitle = styled.h3`
  font-size: 16px;
  margin: 0 0 10px 0;
`

const SErrorMessage = styled.p`
  font-size: 14px;
  margin: 0;
`

const SActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
`

const SResetIcon = styled.div`
  width: 14px;
  height: 14px;
  margin-right: 6px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23aaaaaa'%3E%3Cpath d='M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z'/%3E%3C/svg%3E");
  background-size: contain;
`

const SResetButton = styled.button`
  padding: 8px 16px;
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #aaa;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  font-weight: 500;
  display: flex;
  align-items: center;

  &:hover {
    background-color: rgba(95, 95, 255, 0.1);
    border-color: rgba(95, 95, 255, 0.3);
    color: white;

    ${SResetIcon} {
      filter: brightness(2);
    }
  }
`

export default GameParameterEditor
