// @ts-nocheck
import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { type StoredSound, type SoundData } from '../../../types/sound.types'
import { createSoundService } from '../../../services/soundService'
import { addAppNoti } from '@/store/useNotiStore'

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
      <div className="flex flex-col items-center justify-center h-[200px] text-[#aaa] gap-4">
        <div className="text-2xl animate-spin">⏳</div>
        <div>Loading your sounds...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[200px] text-[#ff6666] gap-4 text-center">
        <div>Failed to load sounds: {error}</div>
        <button
          onClick={loadSounds}
          className="py-2 px-4 bg-[#5f5fff] border-none rounded text-white cursor-pointer text-sm hover:bg-[#7f7fff]"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search Container (when not hidden) */}
      {!hideSearchControls && (
        <div className="flex justify-between items-center mb-4 gap-4">
          <input
            type='text'
            placeholder='Search sounds...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={cn(
              'flex-1 py-2 px-3 bg-black/30 border border-white/20 rounded-md',
              'text-white text-sm',
              'focus:outline-none focus:border-[#5f5fff]',
              'placeholder:text-[#aaa]'
            )}
          />
          <div className="text-[#aaa] text-xs whitespace-nowrap">
            {filteredSounds.length} sound{filteredSounds.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredSounds.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[200px] text-[#aaa] text-center gap-3">
          {activeSearchTerm ? (
            <>
              <div className="text-5xl mb-4">🔍</div>
              <div>No sounds match your search</div>
              <div className="text-xs text-[#777]">Try a different search term</div>
            </>
          ) : (
            <>
              <div className="text-5xl mb-4">🎵</div>
              <div>No sounds uploaded yet</div>
              <div className="text-xs text-[#777]">Upload some audio files to get started</div>
            </>
          )}
        </div>
      ) : (
        /* Sound Grid */
        <div className="flex flex-col gap-0.5 overflow-y-auto p-0.5 scrollbar-thin">
          {filteredSounds.map(sound => (
            <div
              key={sound.id}
              onClick={() => onSoundSelect(sound.data)}
              className={cn(
                'flex items-center gap-4 py-3 px-4 rounded-md',
                'transition-all duration-200 cursor-pointer',
                isSelectedSound(sound)
                  ? 'bg-[rgba(95,95,255,0.1)]'
                  : 'bg-transparent hover:bg-white/5'
              )}
            >
              {/* Radio Button */}
              <input
                type='radio'
                name='sound-selection'
                checked={isSelectedSound(sound)}
                onChange={() => onSoundSelect(sound.data)}
                onClick={e => e.stopPropagation()}
                className={cn(
                  'w-4 h-4 mr-4 cursor-pointer appearance-none',
                  'border-2 border-white/30 rounded-full bg-transparent relative',
                  'checked:border-[#5f5fff] checked:bg-[#5f5fff]',
                  'checked:after:content-[""] checked:after:absolute checked:after:top-1/2 checked:after:left-1/2',
                  'checked:after:-translate-x-1/2 checked:after:-translate-y-1/2',
                  'checked:after:w-1.5 checked:after:h-1.5 checked:after:rounded-full checked:after:bg-white',
                  'hover:border-white/50',
                  'focus:outline-none focus:shadow-[0_0_0_2px_rgba(95,95,255,0.3)]'
                )}
              />

              {/* Sound Main Info */}
              <div className="flex-1 min-w-0">
                <div
                  className="text-white text-sm font-medium overflow-hidden text-ellipsis whitespace-nowrap mb-0.5"
                  title={sound.data.name || sound.filename}
                >
                  {sound.data.name || sound.filename.replace(/\.[^/.]+$/, '')}
                </div>
                <div className="flex items-center gap-2 text-xs text-[#aaa]">
                  <span className="whitespace-nowrap">{formatDuration(sound.data.duration)}</span>
                  <span className="text-white/30 font-light">|</span>
                  <span className="whitespace-nowrap">{formatFileSize(sound.data.fileSize)}</span>
                  <span className="text-white/30 font-light">|</span>
                  <span className="whitespace-nowrap">{Math.round((sound.data.volume || 0.7) * 100)}%</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex gap-2 items-center">
                {isCurrentSound(sound) && (
                  <div className="text-[#ffa500] text-[10px] font-medium lowercase whitespace-nowrap">
                    (current)
                  </div>
                )}
                <div className="bg-[rgba(95,95,255,0.2)] text-[#5f5fff] py-1 px-2 rounded text-[10px] font-semibold uppercase whitespace-nowrap">
                  {sound.data.format?.toUpperCase() || 'Unknown'}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 items-center">
                <button
                  onClick={e => {
                    e.stopPropagation()
                    handlePreview(sound)
                  }}
                  title='Preview sound'
                  className={cn(
                    'bg-transparent border-none cursor-pointer p-1.5 rounded',
                    'text-base font-semibold transition-all duration-200',
                    'flex items-center justify-center w-8 h-8 flex-shrink-0',
                    previewingSound === sound.id
                      ? 'text-[#5f5fff]'
                      : 'text-[#aaa]',
                    'hover:bg-[rgba(95,95,255,0.1)] hover:text-[#5f5fff]',
                    'focus:outline-none focus:bg-[rgba(95,95,255,0.1)]',
                    'active:scale-95'
                  )}
                >
                  {previewingSound === sound.id ? '⏸' : '▶'}
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation()
                    handleDelete(sound)
                  }}
                  title='Delete sound'
                  className={cn(
                    'bg-transparent border-none cursor-pointer p-1.5 rounded',
                    'text-[#ff6666] text-base font-semibold transition-all duration-200',
                    'flex items-center justify-center w-8 h-8 flex-shrink-0',
                    'hover:bg-[rgba(255,59,48,0.1)]',
                    'focus:outline-none focus:bg-[rgba(255,59,48,0.1)]',
                    'active:scale-95'
                  )}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SoundLibrary
