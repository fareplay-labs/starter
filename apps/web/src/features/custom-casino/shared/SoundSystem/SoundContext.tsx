import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useMemo,
  memo,
  createRef,
  type ReactNode,
} from 'react'
import ReactHowler from 'react-howler'

type Sound = {
  src: string
  howl: React.RefObject<ReactHowler>
  loaded: boolean
  volume: number
}

type Sounds = {
  [key: string]: Sound
}

interface SoundContextType {
  loadSound: (name: string, src: string) => void
  unloadSound: (name: string) => void
  playSound: (name: string, volume?: number, pitch?: number) => void
  pauseSound: (name: string) => void
  stopSound: (name: string) => void
  setVolume: (volume: number) => void
  setSoundVolume: (name: string, volume: number) => void
  toggleMute: () => void
}

const defaultSoundContext: SoundContextType = {
  // loadSound: () => console.warn('DEBUG loadSound called outside of SoundProvider'),
  loadSound: () => {},
  unloadSound: () => {},
  playSound: () => {},
  pauseSound: () => {},
  stopSound: () => {},
  setVolume: () => {},
  setSoundVolume: () => {},
  toggleMute: () => {},
}

const SoundContext = createContext<SoundContextType>(defaultSoundContext)

const SoundProviderComponent: React.FC<{ children: ReactNode }> = ({ children }) => {
  const soundsRef = useRef<Sounds>({})
  const [globalVolume, setGlobalVolume] = useState<number>(1)
  const [muted, setMuted] = useState<boolean>(false)
  const [, forceUpdate] = useState({})
  // const renderCountRef = useRef(0)

  const loadSound = useCallback((name: string, src: string): void => {
    if (!soundsRef.current[name]) {
      soundsRef.current[name] = {
        src,
        howl: createRef<ReactHowler>(),
        loaded: false,
        volume: 1,
      }
      forceUpdate({})
    }
  }, [])

  const unloadSound = useCallback((name: string): void => {
    const sound = soundsRef.current[name]
    if (sound && sound.howl.current) {
      sound.howl.current.howler.unload()
    }
    delete soundsRef.current[name]
    forceUpdate({})
  }, [])

  const playSound = useCallback(
    (name: string, customVolume?: number, pitch?: number): void => {
      const sound = soundsRef.current[name]
      if (sound && sound.howl.current) {
        try {
          sound.howl.current.seek(0) // Reset to beginning
          const effectiveVolume = customVolume !== undefined ? customVolume : sound.volume
          sound.howl.current.howler.volume(effectiveVolume * globalVolume)
          if (pitch !== undefined) {
            sound.howl.current.howler.rate(pitch)
          }
          sound.howl.current.howler.play()
        } catch (error) {
          console.error(`Failed to play sound ${name}:`, error)
        }
      } else {
        console.warn(`Sound ${name} not found or not loaded.`)
      }
    },
    [globalVolume]
  )

  const pauseSound = useCallback((name: string): void => {
    const sound = soundsRef.current[name]
    if (sound && sound.howl.current) {
      sound.howl.current.howler.pause()
    }
  }, [])

  const stopSound = useCallback((name: string): void => {
    const sound = soundsRef.current[name]
    if (sound && sound.howl.current) {
      sound.howl.current.howler.stop()
    }
  }, [])

  const setVolume = useCallback((newVolume: number): void => {
    setGlobalVolume(Math.max(0, Math.min(1, newVolume))) // Clamp between 0 and 1

    Object.values(soundsRef.current).forEach(sound => {
      if (sound.howl.current) {
        sound.howl.current.howler.volume(sound.volume * newVolume)
      }
    })
  }, [])

  const setSoundVolume = useCallback(
    (name: string, newVolume: number): void => {
      const sound = soundsRef.current[name]
      if (sound) {
        sound.volume = Math.max(0, Math.min(1, newVolume))
        if (sound.howl.current) {
          sound.howl.current.howler.volume(sound.volume * globalVolume)
        }
        forceUpdate({})
      }
    },
    [globalVolume]
  )

  const toggleMute = useCallback((): void => {
    setMuted(prev => {
      const newMutedState = !prev
      Object.values(soundsRef.current).forEach(sound => {
        if (sound.howl.current) {
          sound.howl.current.howler.mute(newMutedState)
        }
      })
      return newMutedState
    })
  }, [])

  const value = useMemo(
    () => ({
      loadSound,
      unloadSound,
      playSound,
      pauseSound,
      stopSound,
      setVolume,
      setSoundVolume,
      toggleMute,
    }),
    [
      loadSound,
      unloadSound,
      playSound,
      pauseSound,
      stopSound,
      setVolume,
      setSoundVolume,
      toggleMute,
    ]
  )

  return (
    <SoundContext.Provider value={value}>
      {children}
      {Object.entries(soundsRef.current).map(([name, sound]) => (
        <ReactHowler
          key={name}
          src={sound.src}
          playing={false}
          volume={sound.volume * globalVolume}
          mute={muted}
          ref={sound.howl}
          onLoad={() => {
            if (soundsRef.current[name]) {
              soundsRef.current[name].loaded = true
              forceUpdate({})
            }
          }}
        />
      ))}
    </SoundContext.Provider>
  )
}

export const SoundProvider = memo(SoundProviderComponent)
SoundProvider.displayName = 'SoundProvider'

export const useSound = (): SoundContextType => {
  const context = useContext(SoundContext)
  if (process.env.NODE_ENV !== 'production' && context === defaultSoundContext) {
    console.warn(
      'useSound is being used outside of SoundProvider. Sound functionality will not work.'
    )
  }
  return context
}
