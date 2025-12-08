// @ts-nocheck
import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { ModalBase } from '../shared/ModalBase'
import { type SoundData } from '../../types/sound.types'
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
      <div className="flex flex-col h-[500px] w-full">
        {/* Title Section */}
        <div className="text-center mb-4">
          <h1 className="text-white text-[1.75rem] font-semibold m-0 mb-1 leading-tight">Choose Sound</h1>
          <div className="text-[#aaa] text-base font-normal m-0">{context}</div>
        </div>

        {/* Tab and Search Container */}
        <div className="flex justify-between items-end border-b border-white/10 mb-4">
          {/* Tabs */}
          <div className="flex">
            <button
              onClick={() => setActiveTab('library')}
              className={cn(
                'bg-transparent border-none text-[#aaa] py-3 px-6',
                'cursor-pointer text-sm font-medium border-b-2 border-transparent transition-all duration-200',
                'hover:text-white',
                'focus:outline-none focus:shadow-[0_0_0_2px_rgba(95,95,255,0.3)]',
                activeTab === 'library' && 'text-[#5f5fff] border-b-[#5f5fff]'
              )}
            >
              Library
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={cn(
                'bg-transparent border-none text-[#aaa] py-3 px-6',
                'cursor-pointer text-sm font-medium border-b-2 border-transparent transition-all duration-200',
                'hover:text-white',
                'focus:outline-none focus:shadow-[0_0_0_2px_rgba(95,95,255,0.3)]',
                activeTab === 'upload' && 'text-[#5f5fff] border-b-[#5f5fff]'
              )}
            >
              Upload
            </button>
          </div>

          {/* Search Controls (only for library tab) */}
          {activeTab === 'library' && (
            <div className="flex items-center gap-4 pb-1.5">
              <input
                type='text'
                placeholder='Search sounds...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={cn(
                  'py-2 px-3 bg-black/30 border border-white/20 rounded-md',
                  'text-white text-sm w-[200px]',
                  'focus:outline-none focus:border-[#5f5fff]',
                  'placeholder:text-[#aaa]'
                )}
              />
              <div className="text-[#aaa] text-xs whitespace-nowrap min-w-[60px] text-right">
                {filteredCount} sound{filteredCount !== 1 ? 's' : ''}
              </div>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-1 scrollbar-thin">
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
              <div className="text-[#aaa] text-center py-4">Connect your wallet to browse your sounds.</div>
            )
          ) : readyAndAuth && isVerified && publicAddress ? (
            <SoundUpload onUploadComplete={handleUploadComplete} userId={publicAddress} />
          ) : (
            <div className="text-[#aaa] text-center py-4">Connect your wallet to upload sounds.</div>
          )}
        </div>

        {/* Volume Section */}
        {selectedSound && (
          <div className="border-t border-white/10 py-4">
            <div className="mb-4">
              <div className="text-white text-sm font-medium">Selected: {selectedSound.name || 'Unknown'}</div>
            </div>
            <VolumeControl
              volume={selectedSound.volume || 0.7}
              onChange={handleVolumeChange}
              label='Sound Volume'
            />
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            className={cn(
              'py-2.5 px-5 bg-transparent border border-white/20 rounded-md',
              'text-[#aaa] text-sm cursor-pointer transition-all duration-200',
              'hover:border-white/40 hover:text-white',
              'focus:outline-none focus:shadow-[0_0_0_2px_rgba(255,255,255,0.3)]'
            )}
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedSound}
            className={cn(
              'py-2.5 px-5 border-none rounded-md text-sm font-medium transition-all duration-200',
              selectedSound
                ? 'bg-[#5f5fff] text-white cursor-pointer hover:bg-[#7f7fff] focus:shadow-[0_0_0_2px_rgba(95,95,255,0.5)] active:translate-y-px'
                : 'bg-[rgba(95,95,255,0.3)] text-[#aaa] cursor-not-allowed',
              'focus:outline-none'
            )}
          >
            Select Sound
          </button>
        </div>
      </div>
    </ModalBase>
  )
}

export default SoundEditModal
