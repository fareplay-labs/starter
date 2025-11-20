// @ts-nocheck
import React, { useState } from 'react'
import UserUploadsModal from '@/features/custom-casino/shared/modals/UserUploadsModal'
import { type SlotsParameters, type SlotSymbol } from '@/features/custom-casino/CustomGames/Slots/types'
import { SVGS } from '@/assets'
import {
  SAddInputButton,
  SButtonContainer,
  SContainer,
  SImagePickerButton,
  SRemoveButton,
  SSymbolImage,
  STable,
  STbody,
  STd,
  STh,
  SThead,
  STr,
} from './styles'

interface SlotIconsControlProps {
  value: string[]
  onChange: (value: string[]) => void
  parameters: SlotsParameters
}

/**
 * Slot icons control component for selecting symbol images via modal
 */
const SlotIconsControl: React.FC<SlotIconsControlProps> = ({ value, onChange, parameters }) => {
  // Default slotsSymbols if input is invalid
  const defaultSlotIcons: string[] = parameters.slotsSymbols?.map((symbol: SlotSymbol) => {
    if (typeof symbol === 'string') {
      return symbol
    } else if (symbol && typeof symbol === 'object' && 'url' in symbol) {
      return symbol.url
    }
    return 'https://fareplay-metaverse.s3.us-east-2.amazonaws.com/builds/testingSlotsFrontend/customSlotsDefault/DefaultSlotsBlank.png'
  }) || [
    'https://fareplay-metaverse.s3.us-east-2.amazonaws.com/builds/testingSlotsFrontend/customSlotsDefault/DefaultSlotsBlank.png',
  ]

  // Validate slotsSymbols format
  const isValidSlotIcons = (icons: any): icons is string[] => {
    return Array.isArray(icons) && icons.every(icon => typeof icon === 'string' && icon !== '')
  }

  // Use default if value is invalid
  const initialSlotIcons = isValidSlotIcons(value) ? value : defaultSlotIcons
  const [editingIcons, setEditingIcons] = useState<string[]>(initialSlotIcons)
  const [isUploadsModalOpen, setIsUploadsModalOpen] = useState<number | null>(null)

  // Handle image selection
  const handleImageSelect = (index: number, imageUrl: string) => {
    const updatedIcons = [...editingIcons]
    updatedIcons[index] = imageUrl
    setEditingIcons(updatedIcons)
    onChange(updatedIcons)
    setIsUploadsModalOpen(null)
  }

  // Add a new symbol
  const handleAddSymbol = () => {
    const newSymbol =
      'https://fareplay-metaverse.s3.us-east-2.amazonaws.com/builds/testingSlotsFrontend/customSlotsDefault/DefaultSlotsBlank.png'
    const updatedIcons = [...editingIcons, newSymbol]
    setEditingIcons(updatedIcons)
    onChange(updatedIcons)
  }

  // Remove a symbol
  const handleRemoveSymbol = (index: number) => {
    if (editingIcons.length <= 1) return
    const updatedIcons = editingIcons.filter((_, i) => i !== index)
    setEditingIcons(updatedIcons)
    onChange(updatedIcons)
  }

  return (
    <SContainer>
      <STable>
        <SThead>
          <STr>
            <STh>Image</STh>
            <STh>Actions</STh>
          </STr>
        </SThead>
        <STbody>
          {editingIcons.map((url, index) => (
            <STr key={index} $isEven={index % 2 === 0}>
              <STd>
                <SSymbolImage src={url} alt={`Symbol ${index}`} />
              </STd>
              <STd>
                <SImagePickerButton onClick={() => setIsUploadsModalOpen(index)}>
                  {url && url.startsWith('http') ? 'Change Image' : 'Choose Image'}
                </SImagePickerButton>
                <SRemoveButton
                  onClick={() => handleRemoveSymbol(index)}
                  disabled={editingIcons.length <= 1}
                >
                  <img src={SVGS.trashIcon} alt='Remove' width={12} />
                </SRemoveButton>
              </STd>
            </STr>
          ))}
        </STbody>
      </STable>
      <SButtonContainer>
        <SAddInputButton onClick={handleAddSymbol}>Add Symbol</SAddInputButton>
      </SButtonContainer>

      {isUploadsModalOpen !== null && (
        <UserUploadsModal
          isOpen={isUploadsModalOpen !== null}
          onClose={() => setIsUploadsModalOpen(null)}
          onSelect={imageUrl => handleImageSelect(isUploadsModalOpen, imageUrl)}
          allowedTags={['background', 'icon', 'asset']}
        />
      )}
    </SContainer>
  )
}

export default SlotIconsControl
