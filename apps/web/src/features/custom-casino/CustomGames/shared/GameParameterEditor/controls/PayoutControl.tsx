// @ts-nocheck
import React, { useState } from 'react'
import {
  type PayoutTableEntry,
  type SymbolCount,
} from '@/features/custom-casino/CustomGames/Slots/types'
import { type PayoutTableProps } from '../types'
import {
  SAddComboButton,
  SAddInputButton,
  SButtonContainer,
  SCombinationRow,
  SContainer,
  SDropdownButton,
  SDropdownContainer,
  SDropdownIcon,
  SDropdownMenu,
  SDropdownOption,
  SInput,
  SPayoutWrapper,
  SRemoveComboButton,
  SRemovePayoutIcon,
  SSymbolImage,
  STable,
  STbody,
  STd,
  STh,
  SThead,
  STr,
} from './styles'

/**
 * Payout table component with editable payouts and symbol-count combinations
 */
const PayoutControl: React.FC<PayoutTableProps> = ({ payoutTable, onChange, parameters }) => {
  // Default payoutTable if input is invalid
  const defaultPayoutTable: PayoutTableEntry[] = [
    {
      payout: '10',
      combinations: [{ symbolId: '0', count: '1' }],
    },
  ]

  // Validate payoutTable format
  const isValidPayoutTable = (table: any): table is PayoutTableEntry[] => {
    if (!Array.isArray(table) || table.length === 0) return false
    return table.every(
      entry =>
        typeof entry === 'object' &&
        typeof entry.payout === 'string' &&
        entry.payout !== '' &&
        Array.isArray(entry.combinations) &&
        entry.combinations.length > 0 &&
        entry.combinations.every(
          (combo: any) =>
            typeof combo === 'object' &&
            typeof combo.symbolId === 'string' &&
            combo.symbolId !== '' &&
            typeof combo.count === 'string' &&
            combo.count !== '' &&
            !isNaN(parseInt(combo.count))
        )
    )
  }

  // Use default if payoutTable is invalid
  const initialPayoutTable = isValidPayoutTable(payoutTable) ? payoutTable : defaultPayoutTable
  const [editingTable, setEditingTable] = useState<PayoutTableEntry[]>(initialPayoutTable)

  // Default image for invalid URLs
  const defaultImageUrl =
    'https://fareplay-metaverse.s3.us-east-2.amazonaws.com/builds/testingSlotsFrontend/customSlotsDefault/DefaultSlotsBlank.png'

  // Map slotsSymbols to symbolOptions
  const symbolOptions = (parameters.slotsSymbols || []).map((image, index) => ({
    id: index.toString(),
    image: image && typeof image === 'string' && image.startsWith('http') ? image : defaultImageUrl,
  }))

  // State for dropdown visibility
  const [openDropdown, setOpenDropdown] = useState<{
    payoutIndex: number
    comboIndex: number
  } | null>(null)

  // Handle payout change
  const handlePayoutChange = (index: number, value: string) => {
    const updatedTable = [...editingTable]
    updatedTable[index] = { ...updatedTable[index], payout: value }
    setEditingTable(updatedTable)
    onChange(updatedTable)
  }

  // Handle symbol-count change
  const handleCombinationChange = (
    payoutIndex: number,
    comboIndex: number,
    field: keyof SymbolCount,
    value: string
  ) => {
    const updatedTable = [...editingTable]
    const updatedCombinations = [...updatedTable[payoutIndex].combinations]
    updatedCombinations[comboIndex] = { ...updatedCombinations[comboIndex], [field]: value }
    updatedTable[payoutIndex] = { ...updatedTable[payoutIndex], combinations: updatedCombinations }
    setEditingTable(updatedTable)
    onChange(updatedTable)
  }

  // Add a new payout row
  const handleAddPayoutRow = () => {
    const newRow: PayoutTableEntry = {
      payout: '10',
      combinations: [{ symbolId: '0', count: '1' }],
    }
    const updatedTable = [...editingTable, newRow]
    setEditingTable(updatedTable)
    onChange(updatedTable)
  }

  // Remove a payout row
  const handleRemovePayoutRow = (index: number) => {
    if (editingTable.length <= 1) return
    const updatedTable = editingTable.filter((_, i) => i !== index)
    setEditingTable(updatedTable)
    onChange(updatedTable)
  }

  // Add a new combination to a payout
  const handleAddCombination = (payoutIndex: number) => {
    const updatedTable = [...editingTable]
    const updatedCombinations = [
      ...updatedTable[payoutIndex].combinations,
      { symbolId: '0', count: '1' },
    ]
    updatedTable[payoutIndex] = { ...updatedTable[payoutIndex], combinations: updatedCombinations }
    setEditingTable(updatedTable)
    onChange(updatedTable)
  }

  // Remove a combination from a payout
  const handleRemoveCombination = (payoutIndex: number, comboIndex: number) => {
    const updatedTable = [...editingTable]
    const updatedCombinations = updatedTable[payoutIndex].combinations.filter(
      (_, i) => i !== comboIndex
    )
    if (updatedCombinations.length === 0) return
    updatedTable[payoutIndex] = { ...updatedTable[payoutIndex], combinations: updatedCombinations }
    setEditingTable(updatedTable)
    onChange(updatedTable)
  }

  return (
    <SContainer>
      <STable>
        <SThead>
          <STr>
            <STh>Payout</STh>
            <STh>Combinations</STh>
          </STr>
        </SThead>
        <STbody>
          {editingTable.map((entry, payoutIndex) => (
            <STr key={payoutIndex} $isEven={payoutIndex % 2 === 0}>
              <STd>
                <SPayoutWrapper>
                  <SInput
                    type='number'
                    value={entry.payout}
                    onChange={e => handlePayoutChange(payoutIndex, e.target.value)}
                    min='0'
                    step='0.1'
                  />
                  <SRemovePayoutIcon
                    onClick={() => handleRemovePayoutRow(payoutIndex)}
                    disabled={editingTable.length <= 1}
                  >
                    ✕
                  </SRemovePayoutIcon>
                </SPayoutWrapper>
              </STd>
              <STd>
                {entry.combinations.map((combo, comboIndex) => (
                  <SCombinationRow key={comboIndex}>
                    <SDropdownContainer>
                      <SDropdownButton
                        onClick={() =>
                          setOpenDropdown(
                            (
                              openDropdown?.payoutIndex === payoutIndex &&
                                openDropdown?.comboIndex === comboIndex
                            ) ?
                              null
                            : { payoutIndex, comboIndex }
                          )
                        }
                      >
                        <SSymbolImage
                          src={
                            symbolOptions.find(opt => opt.id === combo.symbolId)?.image ||
                            defaultImageUrl
                          }
                          alt='Selected Symbol'
                          onError={e => {
                            console.warn(
                              `Failed to load image for symbolId ${combo.symbolId}: ${e.currentTarget.src}`
                            )
                            e.currentTarget.src = defaultImageUrl
                          }}
                        />
                        <SDropdownIcon />
                      </SDropdownButton>
                      {openDropdown?.payoutIndex === payoutIndex &&
                        openDropdown?.comboIndex === comboIndex && (
                          <SDropdownMenu>
                            {symbolOptions.map(option => (
                              <SDropdownOption
                                key={option.id}
                                onClick={() => {
                                  handleCombinationChange(
                                    payoutIndex,
                                    comboIndex,
                                    'symbolId',
                                    option.id
                                  )
                                  setOpenDropdown(null)
                                }}
                              >
                                <SSymbolImage
                                  src={option.image}
                                  alt='Symbol Option'
                                  onError={e => {
                                    e.currentTarget.src = defaultImageUrl
                                  }}
                                />
                              </SDropdownOption>
                            ))}
                          </SDropdownMenu>
                        )}
                    </SDropdownContainer>
                    <SInput
                      type='number'
                      value={combo.count}
                      onChange={e =>
                        handleCombinationChange(payoutIndex, comboIndex, 'count', e.target.value)
                      }
                      min='1'
                      width='40px'
                    />
                    <SRemoveComboButton
                      onClick={() => handleRemoveCombination(payoutIndex, comboIndex)}
                      disabled={entry.combinations.length <= 1}
                    >
                      -
                    </SRemoveComboButton>
                  </SCombinationRow>
                ))}
                <SAddComboButton onClick={() => handleAddCombination(payoutIndex)}>
                  + Add Combination
                </SAddComboButton>
              </STd>
            </STr>
          ))}
        </STbody>
      </STable>
      <SButtonContainer>
        <SAddInputButton onClick={handleAddPayoutRow}>Add Payout</SAddInputButton>
      </SButtonContainer>
    </SContainer>
  )
}

export default PayoutControl
