// @ts-nocheck
import React, { useState } from 'react'
import { styled } from 'styled-components'
import { ModalBase } from '../shared/ModalBase'
import { type SoundData } from '../../types/sound.types'
import { SPACING } from '@/design'
import SoundLibrary from './components/SoundLibrary'
import SoundUpload from './components/SoundUpload'
import VolumeControl from './components/VolumeControl'
import { useActiveWallet } from '@/lib/privy/hooks'
import { useAuthWallet } from '@/lib/privy/hooks/useAuthWallet'

interface SoundEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (sound: SoundData) => void
  currentSound?: SoundData
  context: string // e.g., "Dice Roll Start"
}

const SoundEditModal: React.FC<SoundEditModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  currentSound,
  context,
}) => {
  const [selectedSound, setSelectedSound] = useState<SoundData | undefined>(currentSound)
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library')
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredCount, setFilteredCount] = useState(0)

  const { walletAddress, privyWallet, externalWallet, readyAndAuth } = useActiveWallet() as any
  const { sessionVerifyState } = useAuthWallet()
  const isVerified = sessionVerifyState === 'verified'
  const publicAddress = (privyWallet?.address || externalWallet?.address || walletAddress || '').toLowerCase()

  const handleSelect = () => {
    if (selectedSound) {
      onSelect(selectedSound)
    }
    onClose()
  }

  const handleSoundSelect = (sound: SoundData) => {
    setSelectedSound(sound)
  }

  const handleVolumeChange = (volume: number) => {
    if (selectedSound) {
      setSelectedSound({
        ...selectedSound,
        volume,
      })
    }
  }

  const handleUploadComplete = (_soundIds: string[]) => {
    setRefreshTrigger(prev => prev + 1)
    setActiveTab('library')
  }

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title='' maxWidth='800px'>
      <SModalContent>
        <STitleSection>
          <SMainTitle>Choose Sound</SMainTitle>
          <SSubtitle>{context}</SSubtitle>
        </STitleSection>
        <STabAndSearchContainer>
          <STabContainer>
            <STab
              className={activeTab === 'library' ? 'active' : ''}
              onClick={() => setActiveTab('library')}
            >
              Library
            </STab>
            <STab
              className={activeTab === 'upload' ? 'active' : ''}
              onClick={() => setActiveTab('upload')}
            >
              Upload
            </STab>
          </STabContainer>

          {activeTab === 'library' && (
            <SSearchControls>
              <SSearchInput
                type='text'
                placeholder='Search sounds...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <SSoundCount>
                {filteredCount} sound{filteredCount !== 1 ? 's' : ''}
              </SSoundCount>
            </SSearchControls>
          )}
        </STabAndSearchContainer>

        <SContentArea>
          {activeTab === 'library' ? (
            readyAndAuth && isVerified && publicAddress ? (
              <SoundLibrary
                onSoundSelect={handleSoundSelect}
                currentSound={currentSound}
                selectedSound={selectedSound}
                userId={publicAddress}
                refreshTrigger={refreshTrigger}
                searchTerm={searchTerm}
                hideSearchControls={true}
                onFilteredCountChange={setFilteredCount}
              />
            ) : (
              <SUnauthedMsg>Connect your wallet to browse your sounds.</SUnauthedMsg>
            )
          ) : readyAndAuth && isVerified && publicAddress ? (
            <SoundUpload onUploadComplete={handleUploadComplete} userId={publicAddress} />
          ) : (
            <SUnauthedMsg>Connect your wallet to upload sounds.</SUnauthedMsg>
          )}
        </SContentArea>

        {selectedSound && (
          <SVolumeSection>
            <SVolumeHeader>
              <SSoundName>Selected: {selectedSound.name || 'Unknown'}</SSoundName>
            </SVolumeHeader>
            <VolumeControl
              volume={selectedSound.volume || 0.7}
              onChange={handleVolumeChange}
              label='Sound Volume'
            />
          </SVolumeSection>
        )}

        <SFooter>
          <SCancelButton onClick={onClose}>Cancel</SCancelButton>
          <SSelectButton onClick={handleSelect} disabled={!selectedSound}>
            Select Sound
          </SSelectButton>
        </SFooter>
      </SModalContent>
    </ModalBase>
  )
}

const SModalContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 500px;
  width: 100%;
`

const STitleSection = styled.div`
  text-align: center;
  margin-bottom: ${SPACING.md}px;
`

const SMainTitle = styled.h1`
  color: #ffffff;
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0 0 4px 0;
  line-height: 1.2;
`

const SSubtitle = styled.div`
  color: #aaa;
  font-size: 1rem;
  font-weight: 400;
  margin: 0;
`

const STabAndSearchContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: ${SPACING.md}px;
`

const STabContainer = styled.div`
  display: flex;
`

const SSearchControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING.md}px;
  padding-bottom: 6px;
`

const SSearchInput = styled.input`
  padding: 8px 12px;
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  font-size: 14px;
  width: 200px;

  &:focus {
    outline: none;
    border-color: #5f5fff;
  }

  &::placeholder {
    color: #aaa;
  }
`

const SSoundCount = styled.div`
  color: #aaa;
  font-size: 12px;
  white-space: nowrap;
  min-width: 60px;
  text-align: right;
`

const STab = styled.button`
  background: transparent;
  border: none;
  color: #aaa;
  padding: 12px 24px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;

  &:hover {
    color: white;
  }

  &.active {
    color: #5f5fff;
    border-bottom-color: #5f5fff;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(95, 95, 255, 0.3);
  }
`

const SContentArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 4px;
`

const SVolumeSection = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: ${SPACING.md}px 0;
`

const SVolumeHeader = styled.div`
  margin-bottom: ${SPACING.md}px;
`

const SSoundName = styled.div`
  color: white;
  font-size: 14px;
  font-weight: 500;
`

const SFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: ${SPACING.md}px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`

const SUnauthedMsg = styled.div`
  color: #aaa;
  text-align: center;
  padding: ${SPACING.md}px 0;
`

const SCancelButton = styled.button`
  padding: 10px 20px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: #aaa;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.4);
    color: white;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
  }
`

const SSelectButton = styled.button<{ disabled: boolean }>`
  padding: 10px 20px;
  background-color: ${props => (props.disabled ? 'rgba(95, 95, 255, 0.3)' : '#5f5fff')};
  border: none;
  border-radius: 6px;
  color: ${props => (props.disabled ? '#aaa' : 'white')};
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: #7f7fff;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(95, 95, 255, 0.5);
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }
`

export default SoundEditModal
