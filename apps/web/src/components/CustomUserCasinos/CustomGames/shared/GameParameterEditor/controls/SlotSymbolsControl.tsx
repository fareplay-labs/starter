// @ts-nocheck
import React from 'react'
import { styled } from 'styled-components'
import ColorControl from './ColorControl'
import {
  type SlotSymbol,
  DEFAULT_SLOTS_PARAMETERS,
} from '@/components/CustomUserCasinos/CustomGames/Slots/types'

interface SlotSymbolsControlProps {
  value?: SlotSymbol[]
  onChange: (value: SlotSymbol[]) => void
  label: string
}

export const SlotSymbolsControl: React.FC<SlotSymbolsControlProps> = ({
  value = [],
  onChange,
  label,
}) => {
  // Use default symbols from types.ts as single source of truth
  const defaultSymbols = DEFAULT_SLOTS_PARAMETERS.slotsSymbols
  const symbolCount = defaultSymbols.length // Dynamic based on defaults (currently 7)

  // Ensure we always have the correct number of symbols
  const symbols = React.useMemo(() => {
    const result = [...(value || [])]
    // Fill with default symbols if needed
    while (result.length < symbolCount) {
      result.push(defaultSymbols[result.length] || '❓')
    }
    return result.slice(0, symbolCount) // Ensure exactly the right amount
  }, [value, symbolCount, defaultSymbols])

  const updateSymbol = (index: number, newValue: string) => {
    const updated = [...symbols]
    // Store as string (emoji or URL) which is valid for SlotSymbol
    updated[index] = newValue as unknown as SlotSymbol
    onChange(updated)
  }

  return (
    <Container>
      <Header>
        <Label>{label}</Label>
        <Description>Lowest to highest</Description>
      </Header>

      <SymbolsGrid>
        {symbols.map((symbol, index) => (
          <React.Fragment key={index}>
            <SymbolItem>
              <ColorControl
                value={typeof symbol === 'string' ? symbol : symbol.url}
                onChange={newValue => updateSymbol(index, newValue)}
                label=''
                parameterId={`slot_symbol_${index}`}
                allowSolid={false}
                allowGradient={false}
                allowLinearGradient={false}
                allowRadialGradient={false}
                allowAlpha={false}
                allowEmoji={true}
                allowImage={true}
                allowAIGen={true}
                imageAspectRatio={1}
                imageType='icon'
                cropShape='round'
              />
            </SymbolItem>
            {index < symbolCount - 1 && <Divider />}
          </React.Fragment>
        ))}
      </SymbolsGrid>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
`

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #e0e0e0;
`

const Description = styled.span`
  font-size: 12px;
  color: #999;
  font-style: italic;
`

const SymbolsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const SymbolItem = styled.div`
  width: 100%;
  padding: 2px 0;
`

const Divider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 1px auto;
  width: 80%;
`
