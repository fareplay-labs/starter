// @ts-nocheck
import React, { useState, useEffect } from 'react'
import { styled } from 'styled-components'
import { type StoredSound, type SoundData } from '../../../types/sound.types'
import { createSoundService } from '../../../services/soundService'
import { addAppNoti } from '@/store/useNotiStore'
import { SPACING } from '@/design'

interface SoundLibraryProps {
  onSoundSelect: (sound: SoundData) => void
  currentSound?: SoundData
  selectedSound?: SoundData
  userId: string
  refreshTrigger?: number // Used to refresh library after uploads
  searchTerm?: string
  hideSearchControls?: boolean
  onFilteredCountChange?: (count: number) => void
}

const SoundLibrary: React.FC<SoundLibraryProps> = ({
  onSoundSelect,
  currentSound,
  selectedSound,
  userId,
  refreshTrigger,
  searchTerm: externalSearchTerm,
  hideSearchControls = false,
  onFilteredCountChange,
}) => {
  const [sounds, setSounds] = useState<StoredSound[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [previewingSound, setPreviewingSound] = useState<string | null>(null)
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)

  const soundService = createSoundService()

  const loadSounds = async () => {
    try {
      setLoading(true)
      setError(null)
      const userSounds = await soundService.getUserSounds()
      setSounds(userSounds)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sounds')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSounds()
  }, [refreshTrigger])

  useEffect(() => {
    // Cleanup audio when component unmounts
    return () => {
      if (currentAudio) {
        currentAudio.pause()
        currentAudio.src = ''
      }
    }
  }, [currentAudio])

  const activeSearchTerm = externalSearchTerm !== undefined ? externalSearchTerm : searchTerm

  const filteredSounds = sounds.filter(
    sound =>
      sound.data.name?.toLowerCase().includes(activeSearchTerm.toLowerCase()) ||
      sound.filename.toLowerCase().includes(activeSearchTerm.toLowerCase())
  )

  // Update filtered count when it changes
  useEffect(() => {
    if (onFilteredCountChange) {
      onFilteredCountChange(filteredSounds.length)
    }
  }, [filteredSounds.length, onFilteredCountChange])

  const handlePreview = (sound: StoredSound) => {
    // Stop current audio if playing
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.src = ''
    }

    if (previewingSound === sound.id) {
      // Stop preview
      setPreviewingSound(null)
      setCurrentAudio(null)
      return
    }

    try {
      const audio = new Audio(sound.data.url)
      audio.volume = sound.data.volume || 0.7

      audio.onended = () => {
        setPreviewingSound(null)
        setCurrentAudio(null)
      }

      audio.onerror = e => {
        console.error('Audio playback error:', e)
        setPreviewingSound(null)
        setCurrentAudio(null)
        // Only show alert for actual errors, not user interactions
      }

      audio
        .play()
        .then(() => {
          setPreviewingSound(sound.id)
          setCurrentAudio(audio)
        })
        .catch(error => {
          console.error('Audio play() failed:', error)
          setPreviewingSound(null)
          setCurrentAudio(null)
          // Only show alert for permission/autoplay issues, not other errors
          if (error.name === 'NotAllowedError') {
            console.warn('Audio autoplay was prevented by browser')
          }
        })
    } catch (error) {
      console.error('Audio creation failed:', error)
      setPreviewingSound(null)
      setCurrentAudio(null)
    }
  }

  const handleDelete = async (sound: StoredSound) => {
    if (!confirm(`Are you sure you want to delete "${sound.data.name || sound.filename}"?`)) {
      return
    }

    try {
      await soundService.deleteSound(sound.id)
      setSounds(prev => prev.filter(s => s.id !== sound.id))

      // Stop preview if this sound was playing
      if (previewingSound === sound.id) {
        setPreviewingSound(null)
        if (currentAudio) {
          currentAudio.pause()
          currentAudio.src = ''
          setCurrentAudio(null)
        }
      }
    } catch (error) {
      console.error('[SoundLibrary] Delete failed:', error)
      addAppNoti({
        type: 'error',
        msg: `Failed to delete sound${error instanceof Error ? ': ' + error.message : ''}`,
      })
    }
  }

  const formatDuration = (duration?: number) => {
    if (!duration) return 'Unknown'
    const minutes = Math.floor(duration / 60)
    const seconds = Math.floor(duration % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const formatFileSize = (size?: number) => {
    if (!size) return 'Unknown'
    if (size < 1024 * 1024) {
      return `${Math.round(size / 1024)}KB`
    }
    return `${(size / 1024 / 1024).toFixed(1)}MB`
  }

  const isCurrentSound = (sound: StoredSound) => {
    return currentSound?.url === sound.data.url
  }

  const isSelectedSound = (sound: StoredSound) => {
    return selectedSound?.url === sound.data.url
  }

  if (loading) {
    return (
      <SLoadingContainer>
        <SLoadingSpinner>⏳</SLoadingSpinner>
        <div>Loading your sounds...</div>
      </SLoadingContainer>
    )
  }

  if (error) {
    return (
      <SErrorContainer>
        <div>Failed to load sounds: {error}</div>
        <SRetryButton onClick={loadSounds}>Retry</SRetryButton>
      </SErrorContainer>
    )
  }

  return (
    <SLibraryContainer>
      {!hideSearchControls && (
        <SSearchContainer>
          <SSearchInput
            type='text'
            placeholder='Search sounds...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <SSoundCount>
            {filteredSounds.length} sound{filteredSounds.length !== 1 ? 's' : ''}
          </SSoundCount>
        </SSearchContainer>
      )}

      {filteredSounds.length === 0 ?
        <SEmptyState>
          {activeSearchTerm ?
            <>
              <SEmptyIcon>🔍</SEmptyIcon>
              <div>No sounds match your search</div>
              <SEmptySubtext>Try a different search term</SEmptySubtext>
            </>
          : <>
              <SEmptyIcon>🎵</SEmptyIcon>
              <div>No sounds uploaded yet</div>
              <SEmptySubtext>Upload some audio files to get started</SEmptySubtext>
            </>
          }
        </SEmptyState>
      : <SSoundGrid>
          {filteredSounds.map(sound => (
            <SSoundCard
              key={sound.id}
              $isSelected={isSelectedSound(sound)}
              onClick={() => onSoundSelect(sound.data)}
            >
              <SRadioButton
                type='radio'
                name='sound-selection'
                checked={isSelectedSound(sound)}
                onChange={() => onSoundSelect(sound.data)}
                onClick={e => e.stopPropagation()}
              />

              <SSoundMainInfo>
                <SSoundName title={sound.data.name || sound.filename}>
                  {sound.data.name || sound.filename.replace(/\.[^/.]+$/, '')}
                </SSoundName>
                <SSoundMeta>
                  <SSoundMetaItem>{formatDuration(sound.data.duration)}</SSoundMetaItem>
                  <SSeparator>|</SSeparator>
                  <SSoundMetaItem>{formatFileSize(sound.data.fileSize)}</SSoundMetaItem>
                  <SSeparator>|</SSeparator>
                  <SSoundMetaItem>{Math.round((sound.data.volume || 0.7) * 100)}%</SSoundMetaItem>
                </SSoundMeta>
              </SSoundMainInfo>

              <SSoundTags>
                {isCurrentSound(sound) && <SCurrentTag>(current)</SCurrentTag>}
                <SSoundFormat>{sound.data.format?.toUpperCase() || 'Unknown'}</SSoundFormat>
              </SSoundTags>

              <SSoundActions>
                <SActionButton
                  onClick={e => {
                    e.stopPropagation()
                    handlePreview(sound)
                  }}
                  title='Preview sound'
                  $isActive={previewingSound === sound.id}
                >
                  {previewingSound === sound.id ? '⏸' : '▶'}
                </SActionButton>
                <SActionButton
                  onClick={e => {
                    e.stopPropagation()
                    handleDelete(sound)
                  }}
                  title='Delete sound'
                  $isDelete
                >
                  🗑️
                </SActionButton>
              </SSoundActions>
            </SSoundCard>
          ))}
        </SSoundGrid>
      }
    </SLibraryContainer>
  )
}

const SLibraryContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`

const SSearchContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${SPACING.md}px;
  gap: ${SPACING.md}px;
`

const SSearchInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  font-size: 14px;

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
`

const SLoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #aaa;
  gap: ${SPACING.md}px;
`

const SLoadingSpinner = styled.div`
  font-size: 24px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`

const SErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #ff6666;
  gap: ${SPACING.md}px;
  text-align: center;
`

const SRetryButton = styled.button`
  padding: 8px 16px;
  background-color: #5f5fff;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background-color: #7f7fff;
  }
`

const SEmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #aaa;
  text-align: center;
  gap: ${SPACING.sm}px;
`

const SEmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: ${SPACING.md}px;
`

const SEmptySubtext = styled.div`
  font-size: 12px;
  color: #777;
`

const SSoundGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
  padding: 2px;
`

const SSoundCard = styled.div<{ $isSelected: boolean }>`
  display: flex;
  align-items: center;
  gap: ${SPACING.md}px;
  padding: 12px ${SPACING.md}px;
  background-color: ${props => (props.$isSelected ? 'rgba(95, 95, 255, 0.1)' : 'transparent')};
  border-radius: 6px;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    background-color: ${props =>
      props.$isSelected ? 'rgba(95, 95, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)'};
  }
`

const SSoundMainInfo = styled.div`
  flex: 1;
  min-width: 0;
`

const SSoundName = styled.div`
  color: white;
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 2px;
`

const SSoundMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #aaa;
`

const SSoundMetaItem = styled.span`
  white-space: nowrap;
`

const SSeparator = styled.span`
  color: rgba(255, 255, 255, 0.3);
  font-weight: 300;
`

const SRadioButton = styled.input`
  width: 16px;
  height: 16px;
  margin-right: ${SPACING.md}px;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  background-color: transparent;
  position: relative;

  &:checked {
    border-color: #5f5fff;
    background-color: #5f5fff;
  }

  &:checked::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: white;
  }

  &:hover {
    border-color: rgba(255, 255, 255, 0.5);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(95, 95, 255, 0.3);
  }
`

const SSoundTags = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`

const SCurrentTag = styled.div`
  color: #ffa500;
  font-size: 10px;
  font-weight: 500;
  text-transform: lowercase;
  white-space: nowrap;
`

const SSoundFormat = styled.div`
  background-color: rgba(95, 95, 255, 0.2);
  color: #5f5fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
`

const SSoundActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`

const SActionButton = styled.button<{ $isActive?: boolean; $isDelete?: boolean }>`
  background: transparent;
  border: none;
  color: ${props =>
    props.$isDelete ? '#ff6666'
    : props.$isActive ? '#5f5fff'
    : '#aaa'};
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  line-height: 1;
  flex-shrink: 0;

  &:hover {
    background-color: ${props =>
      props.$isDelete ? 'rgba(255, 59, 48, 0.1)'
      : props.$isActive ? 'rgba(95, 95, 255, 0.1)'
      : 'rgba(95, 95, 255, 0.1)'};
    color: ${props =>
      props.$isDelete ? '#ff6666'
      : props.$isActive ? '#5f5fff'
      : '#5f5fff'};
  }

  &:focus {
    outline: none;
    background-color: ${props =>
      props.$isDelete ? 'rgba(255, 59, 48, 0.1)' : 'rgba(95, 95, 255, 0.1)'};
  }

  &:active {
    transform: scale(0.95);
  }
`

export default SoundLibrary
