// @ts-nocheck
import React, { useState, useCallback, useRef, useEffect } from 'react'
import { type ColorControlProps } from '../types'
import {
  isImageValue,
  parseImageValue,
  buildImageValue,
} from '@/features/custom-casino/CustomGames/shared/utils/backgroundUtils'
import ImageEditModal from '@/features/custom-casino/shared/modals/ImageEditModal/ImageEditModal'
import {
  EMOJI_LIST,
  isEmojiValue,
} from '@/features/custom-casino/CustomGames/shared/utils/emojiUtils'
import { ImageGeneratorButton } from '@/features/custom-casino/AIService/frontend/components/ImageGeneratorButton'
import {
  SControlContainer,
  SControlHeader,
  SLabel,
  SControlOptions,
  SColorInput,
  SColorPickerIcon,
  SColorPreview,
  SColorPickerContainer,
  SColorInputContainer,
  SColorPickerOverlay,
  SColorPicker,
  SPaletteLabel,
  SCommonColors,
  SColorSwatch,
  SGradientDirectionControl,
  SGradientDirectionOptions,
  SGradientDirectionButton,
  SAddColorButton,
  SAddColorIcon,
  SGradientStopsContainer,
  SGradientSwapButton,
  SModeToggleBar,
  SModeButton,
  SImagePath,
  SImageControlsContainer,
  SImagePickerButton,
  SEmojiDisplay,
  SEmojiPickerButton,
  SEmojiGrid,
  SEmojiSwatch,
} from './ColorControl.styles'

const GRADIENT_DIRECTIONS = [
  { value: '90deg', label: '→', description: 'Left to right' },
  { value: '0deg', label: '↑', description: 'Bottom to top' },
  { value: '45deg', label: '↗', description: 'Bottom-left to top-right' },
  { value: '135deg', label: '↘', description: 'Top-left to bottom-right' },
  { value: '180deg', label: '↓', description: 'Top to bottom' },
  { value: '270deg', label: '←', description: 'Right to left' },
]

const RADIAL_DIRECTIONS = [{ value: 'center', label: '◉', description: 'Radial gradient' }]

// Helper functions for gradient handling
const isGradientValue = (v: string): boolean =>
  v.trim().startsWith('linear-gradient') || v.trim().startsWith('radial-gradient')
const isLinearGradientValue = (v: string): boolean => v.trim().startsWith('linear-gradient')
const isRadialGradientValue = (v: string): boolean => v.trim().startsWith('radial-gradient')

const getGradientType = (gradientValue: string): 'linear' | 'radial' => {
  if (isRadialGradientValue(gradientValue)) return 'radial'
  return 'linear'
}

const getGradientDirection = (gradientValue: string): string => {
  if (!isGradientValue(gradientValue)) return '90deg'

  const inside = gradientValue.substring(
    gradientValue.indexOf('(') + 1,
    gradientValue.lastIndexOf(')')
  )
  const parts = inside.split(',').map(p => p.trim())

  if (isLinearGradientValue(gradientValue)) {
    return parts[0]?.includes('deg') ? parts[0] : '90deg'
  } else if (isRadialGradientValue(gradientValue)) {
    // For radial gradients, look for position keywords
    const positionPart = parts[0]
    if (positionPart && !positionPart.startsWith('#') && !positionPart.startsWith('rgb')) {
      return positionPart.replace(/^(circle|ellipse)\s+at\s+/, '').trim()
    }
    return 'center'
  }

  return '90deg'
}

const parseGradientColors = (v: string): string[] => {
  if (!isGradientValue(v)) return []
  const inside = v.substring(v.indexOf('(') + 1, v.lastIndexOf(')'))
  const parts = inside.split(',').map(p => p.trim())

  // Remove direction/position part
  if (isLinearGradientValue(v) && parts[0].includes('deg')) {
    parts.shift()
  } else if (
    isRadialGradientValue(v) &&
    parts[0] &&
    !parts[0].startsWith('#') &&
    !parts[0].startsWith('rgb')
  ) {
    parts.shift()
  }

  return parts
}

const buildGradientValue = (
  colors: string[],
  direction = '90deg',
  type: 'linear' | 'radial' = 'linear'
): string => {
  if (type === 'radial') {
    // For radial gradients, we always use center position for CSS compatibility
    return `radial-gradient(circle, ${colors.join(', ')})`
  }
  return `linear-gradient(${direction}, ${colors.join(', ')})`
}

type ColorMode = 'solid' | 'gradient' | 'emoji' | 'image'
type GradientType = 'linear' | 'radial'

/**
 * Color picker control for color parameters
 * Supports solid colors, gradients, and image backgrounds using ImageEditModal
 */
const ColorControl: React.FC<ColorControlProps> = ({
  value,
  onChange,
  label,
  parameterId,
  allowSolid = true,
  allowGradient,
  allowAlpha,
  allowLinearGradient,
  allowRadialGradient,
  allowGradientDirection, // deprecated, fallback to allowLinearGradient
  allowEmoji = false,
  allowImage,
  allowAIGen,
  imageAspectRatio,
  imageType,
  cropShape,
  gameType,
  userAddress,
  onSave,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isImageEditModalOpen, setIsImageEditModalOpen] = useState(false)

  // --- State for ImageEditModal ---
  const [imageEditConfig, setImageEditConfig] = useState<{
    fieldName: string
    currentValue: string
    imageType: string
    contextKey: string
    elementIdentifier: string
    targetAspectRatio?: number
    cropShape?: 'rect' | 'round'
  } | null>(null)
  // --- End State for ImageEditModal ---

  // Determine initial mode based on value
  const determineInitialMode = (): ColorMode => {
    if (allowEmoji && isEmojiValue(value)) return 'emoji'
    if (allowImage && isImageValue(value)) return 'image'
    if (allowGradient && isGradientValue(value)) return 'gradient'
    if (allowSolid) return 'solid'
    // If solid is disabled, default to first available mode
    if (allowEmoji) return 'emoji'
    if (allowImage) return 'image'
    if (allowGradient) return 'gradient'
    return 'solid' // Fallback
  }

  const [colorMode, setColorMode] = useState<ColorMode>(determineInitialMode)

  // Gradient state - determine type and direction
  const [gradientType, setGradientType] = useState<GradientType>(() =>
    isGradientValue(value) ? getGradientType(value) : 'linear'
  )

  const [gradientDirection, setGradientDirection] = useState<string>(() =>
    isGradientValue(value) ? getGradientDirection(value) : '90deg'
  )

  const [gradientColors, setGradientColors] = useState<string[]>(() => {
    return isGradientValue(value) ? parseGradientColors(value) : [value]
  })

  // Backward compatibility: if allowGradientDirection is true but new props not set, default to linear
  const effectiveAllowLinear = allowLinearGradient ?? allowGradientDirection ?? false
  const effectiveAllowRadial = allowRadialGradient ?? false

  // Alpha handling
  const getAlphaPct = (): number => {
    if (!allowAlpha) return 100
    if (colorMode === 'gradient') return 100
    if (colorMode === 'image') {
      const { opacity } = parseImageValue(value)
      return Math.round(opacity * 100)
    }
    const hex = value.replace('#', '')
    if (hex.length === 8) {
      const a = parseInt(hex.slice(6, 8), 16)
      return Math.round((a / 255) * 100)
    }
    return 100
  }

  const [alphaPct, setAlphaPct] = useState<number>(getAlphaPct)

  // Debouncing for rapid color changes
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const debouncedOnChange = useCallback(
    (newValue: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      debounceRef.current = setTimeout(() => {
        onChange(newValue)
      }, 16) // 60fps throttling - fires at most every 16ms
    },
    [onChange]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  // Event handlers
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let finalValue = e.target.value

    // If in image mode and allowAlpha is true, preserve the opacity
    if (colorMode === 'image' && allowAlpha && isImageValue(value)) {
      const { opacity } = parseImageValue(value)
      finalValue = buildImageValue(finalValue, opacity)
    }

    onChange(finalValue) // Text input doesn't need debouncing
  }

  // --- New handler to open ImageEditModal ---
  const handleOpenImageEditor = useCallback(() => {
    setImageEditConfig({
      fieldName: parameterId,
      currentValue: value,
      imageType: imageType || 'asset',
      contextKey: 'game-parameter',
      elementIdentifier: parameterId,
      targetAspectRatio: imageAspectRatio,
      cropShape: cropShape,
    })
    setIsImageEditModalOpen(true)
  }, [parameterId, value, imageType, imageAspectRatio, cropShape])
  // --- End New handler ---

  // --- New save handler for ImageEditModal ---
  const handleImageSave = useCallback(
    (fieldName: string, newValue: string) => {
      // Pass the complete structured data (JSON string) to onChange
      // This preserves crop data for components that need it
      onChange(newValue)
      setIsImageEditModalOpen(false) // Close the modal
      setImageEditConfig(null) // Clear config
    },
    [onChange]
  )
  // --- End New save handler ---

  const handleAIImageGenerated = (imageUrl: string) => {
    const finalValue = allowAlpha ? buildImageValue(imageUrl, alphaPct / 100) : imageUrl
    onChange(finalValue)
    // Optionally switch mode if needed, though AI gen usually implies image mode
    setColorMode('image')
  }

  const handleSingleColorChange = (newColor: string) => {
    let finalColor = newColor
    if (allowAlpha) {
      const alphaHex = Math.round((alphaPct / 100) * 255)
        .toString(16)
        .padStart(2, '0')
      finalColor = `${newColor}${alphaHex}`
    }
    debouncedOnChange(finalColor)
  }

  const handleGradientColorChange = (index: number, newColor: string) => {
    const updated = [...gradientColors]
    updated[index] = newColor
    setGradientColors(updated)
    debouncedOnChange(buildGradientValue(updated, gradientDirection, gradientType))
  }

  const handleSwapColors = (index1: number, index2: number) => {
    const updated = [...gradientColors]
    const temp = updated[index1]
    updated[index1] = updated[index2]
    updated[index2] = temp
    setGradientColors(updated)
    onChange(buildGradientValue(updated, gradientDirection, gradientType))
  }

  const handleModeChange = (newMode: ColorMode) => {
    setColorMode(newMode)

    if (newMode === 'solid' && colorMode === 'gradient') {
      onChange(gradientColors[0] || '#ffffff')
    } else if (newMode === 'gradient' && colorMode !== 'gradient') {
      const baseColor = value.startsWith('#') ? value : '#ffffff'
      const colors = [baseColor, '#000000']
      setGradientColors(colors)
      // Use default gradient type based on available options
      const defaultType =
        effectiveAllowLinear ? 'linear'
        : effectiveAllowRadial ? 'radial'
        : 'linear'
      const defaultDirection = defaultType === 'linear' ? '90deg' : 'center'
      setGradientType(defaultType)
      setGradientDirection(defaultDirection)
      onChange(buildGradientValue(colors, defaultDirection, defaultType))
    }
  }

  const handleAlphaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pct = Number(e.target.value)
    setAlphaPct(pct)

    if (colorMode === 'image') {
      const { url } = parseImageValue(value)
      const finalValue = buildImageValue(url, pct / 100)

      debouncedOnChange(finalValue)
    } else {
      const hexAlpha = Math.round((pct / 100) * 255)
        .toString(16)
        .padStart(2, '0')
      const baseHex = value.slice(0, 7)
      debouncedOnChange(`${baseHex}${hexAlpha}`)
    }
  }

  return (
    <SControlContainer>
      <SControlHeader>
        <SLabel>{label}</SLabel>
      </SControlHeader>

      <SModeToggleBar>
        {allowSolid && (
          <SModeButton $active={colorMode === 'solid'} onClick={() => handleModeChange('solid')}>
            Solid
          </SModeButton>
        )}
        {allowGradient && (
          <SModeButton
            $active={colorMode === 'gradient'}
            onClick={() => handleModeChange('gradient')}
          >
            Gradient
          </SModeButton>
        )}
        {allowEmoji && (
          <SModeButton $active={colorMode === 'emoji'} onClick={() => handleModeChange('emoji')}>
            Emoji
          </SModeButton>
        )}
        {allowImage && (
          <SModeButton $active={colorMode === 'image'} onClick={() => handleModeChange('image')}>
            Image
          </SModeButton>
        )}
      </SModeToggleBar>

      <SControlOptions>
        {colorMode === 'emoji' ?
          <SEmojiDisplay>{isEmojiValue(value) ? value : 'No emoji selected'}</SEmojiDisplay>
        : colorMode === 'image' ?
          <SImagePath>
            {(
              value &&
              !value.startsWith('#') &&
              !value.startsWith('linear-gradient') &&
              !value.startsWith('radial-gradient')
            ) ?
              parseImageValue(value).url.split('/').pop()
            : 'No image selected'}
          </SImagePath>
        : <SColorInput
            type='text'
            value={value}
            onChange={handleTextChange}
            placeholder='#RRGGBB'
          />
        }
      </SControlOptions>

      {colorMode === 'emoji' ?
        <SEmojiPickerButton onClick={() => setIsOpen(!isOpen)}>Choose Emoji</SEmojiPickerButton>
      : colorMode === 'image' ?
        <>
          <SImageControlsContainer>
            <SImagePickerButton onClick={handleOpenImageEditor} $hasAIGen={allowAIGen}>
              {value && isImageValue(value) ? 'Change Image' : 'Choose Image'}
            </SImagePickerButton>
            {allowAIGen && (
              <ImageGeneratorButton
                buttonType='icon'
                gameType={gameType}
                parameterId={parameterId}
                userAddress={userAddress}
                onImageGenerated={handleAIImageGenerated}
                onSave={onSave}
                showHistory={false}
              />
            )}
          </SImageControlsContainer>
          {allowAlpha && (
            <div style={{ marginTop: 8 }}>
              <SPaletteLabel>Opacity: {alphaPct}%</SPaletteLabel>
              <input
                type='range'
                min={0}
                max={100}
                value={alphaPct}
                onChange={handleAlphaChange}
                style={{ width: '100%' }}
              />
            </div>
          )}
        </>
      : <SColorPreview $color={value} onClick={() => setIsOpen(!isOpen)}>
          <SColorPickerIcon />
        </SColorPreview>
      }

      {isOpen && (
        <SColorPickerContainer>
          <SColorPickerOverlay onClick={() => setIsOpen(false)} />
          <SColorPicker>
            {colorMode === 'gradient' ?
              <>
                {/* Unified Direction Control - show linear and/or radial based on configuration */}
                {(effectiveAllowLinear || effectiveAllowRadial) && (
                  <SGradientDirectionControl>
                    <SPaletteLabel>Direction</SPaletteLabel>
                    <SGradientDirectionOptions>
                      {/* Linear Gradient Directions */}
                      {effectiveAllowLinear &&
                        GRADIENT_DIRECTIONS.map(dir => (
                          <SGradientDirectionButton
                            key={dir.value}
                            type='button'
                            title={dir.description}
                            $isActive={gradientType === 'linear' && gradientDirection === dir.value}
                            onClick={() => {
                              setGradientType('linear')
                              setGradientDirection(dir.value)
                              onChange(buildGradientValue(gradientColors, dir.value, 'linear'))
                            }}
                          >
                            {dir.label}
                          </SGradientDirectionButton>
                        ))}

                      {/* Radial Gradient Positions */}
                      {effectiveAllowRadial &&
                        RADIAL_DIRECTIONS.map(dir => (
                          <SGradientDirectionButton
                            key={dir.value}
                            type='button'
                            title={dir.description}
                            $isActive={gradientType === 'radial' && gradientDirection === dir.value}
                            onClick={() => {
                              setGradientType('radial')
                              setGradientDirection(dir.value)
                              onChange(buildGradientValue(gradientColors, dir.value, 'radial'))
                            }}
                          >
                            {dir.label}
                          </SGradientDirectionButton>
                        ))}
                    </SGradientDirectionOptions>
                  </SGradientDirectionControl>
                )}

                <SPaletteLabel>Color Stops</SPaletteLabel>
                <SGradientStopsContainer>
                  {gradientColors.map((c, idx) => (
                    <React.Fragment key={idx}>
                      <SColorInputContainer style={{ marginBottom: 6, position: 'relative' }}>
                        <SColorInput
                          type='color'
                          value={c}
                          onChange={e => handleGradientColorChange(idx, e.target.value)}
                          className='color-input'
                        />
                      </SColorInputContainer>
                      {idx < gradientColors.length - 1 && (
                        <SGradientSwapButton
                          type='button'
                          onClick={() => handleSwapColors(idx, idx + 1)}
                          style={{
                            top: `${idx * 42 + 28}px`, // Position between color inputs
                            left: '50%',
                            transform: 'translateX(-50%)',
                          }}
                          title={`Swap colors ${idx + 1} and ${idx + 2}`}
                        >
                          ⇅
                        </SGradientSwapButton>
                      )}
                    </React.Fragment>
                  ))}
                </SGradientStopsContainer>
                {gradientColors.length < 3 && (
                  <SAddColorButton
                    onClick={() => {
                      const updated = [...gradientColors, '#ffffff']
                      setGradientColors(updated)
                      onChange(buildGradientValue(updated, gradientDirection, gradientType))
                    }}
                  >
                    <SAddColorIcon>+</SAddColorIcon> Add color stop
                  </SAddColorButton>
                )}
                <SPaletteLabel>Gradient Presets</SPaletteLabel>
                <SCommonColors>
                  {[
                    { colors: ['#FF5555', '#FFFF55'] },
                    { colors: ['#55FF55', '#55FFFF'] },
                    { colors: ['#5555FF', '#FF55FF'] },
                    { colors: ['#FFFFFF', '#AAAAAA'] },
                    { colors: ['#000000', '#555555'] },
                  ].map((preset, index) => {
                    const presetValue = buildGradientValue(
                      preset.colors,
                      gradientDirection,
                      gradientType
                    )
                    return (
                      <SColorSwatch
                        key={`${gradientType}-${index}`}
                        $color={presetValue}
                        onClick={() => {
                          onChange(presetValue)
                          setGradientColors(preset.colors)
                          setIsOpen(false)
                        }}
                      />
                    )
                  })}
                </SCommonColors>
              </>
            : colorMode === 'emoji' ?
              <>
                <SPaletteLabel>Choose Emoji</SPaletteLabel>
                <SEmojiGrid>
                  {EMOJI_LIST.map(emoji => (
                    <SEmojiSwatch
                      key={emoji}
                      $isSelected={value === emoji}
                      onClick={() => {
                        onChange(emoji)
                        setIsOpen(false)
                      }}
                    >
                      {emoji}
                    </SEmojiSwatch>
                  ))}
                </SEmojiGrid>
              </>
            : colorMode === 'image' ?
              <>
                <SPaletteLabel>Image Controls</SPaletteLabel>
                <SImageControlsContainer style={{ marginBottom: 8 }}>
                  <SImagePickerButton onClick={handleOpenImageEditor} $hasAIGen={allowAIGen}>
                    {value && isImageValue(value) ? 'Change Image' : 'Choose Image'}
                  </SImagePickerButton>
                  {allowAIGen && (
                    <ImageGeneratorButton
                      buttonType='icon'
                      gameType={gameType}
                      parameterId={parameterId}
                      userAddress={userAddress}
                      onImageGenerated={handleAIImageGenerated}
                      onSave={onSave}
                      showHistory={false}
                    />
                  )}
                </SImageControlsContainer>
              </>
            : <>
                <SColorInputContainer>
                  <SColorInput
                    type='color'
                    value={value.slice(0, 7)}
                    onChange={e => handleSingleColorChange(e.target.value)}
                    className='color-input'
                  />
                </SColorInputContainer>
                {allowAlpha && (
                  <div style={{ marginBottom: 8 }}>
                    <SPaletteLabel>Alpha: {alphaPct}%</SPaletteLabel>
                    <input
                      type='range'
                      min={0}
                      max={100}
                      value={alphaPct}
                      onChange={handleAlphaChange}
                      style={{ width: '100%' }}
                    />
                  </div>
                )}
                <SPaletteLabel>Quick Colors</SPaletteLabel>
                <SCommonColors>
                  {[
                    '#FF5555',
                    '#FF9955',
                    '#FFFF55',
                    '#55FF55',
                    '#55FFFF',
                    '#5555FF',
                    '#FF55FF',
                    '#FFFFFF',
                    '#AAAAAA',
                    '#555555',
                    '#000000',
                    '#AA7744',
                  ].map(color => (
                    <SColorSwatch
                      key={color}
                      $color={color}
                      onClick={() => {
                        handleSingleColorChange(color)
                        setIsOpen(false)
                      }}
                    />
                  ))}
                </SCommonColors>
              </>
            }
          </SColorPicker>
        </SColorPickerContainer>
      )}

      {allowImage && imageEditConfig && (
        <ImageEditModal
          isOpen={isImageEditModalOpen}
          onClose={() => {
            setIsImageEditModalOpen(false)
            setImageEditConfig(null)
          }}
          onSave={handleImageSave}
          fieldName={imageEditConfig.fieldName}
          currentValue={parseImageValue(imageEditConfig.currentValue).url}
          title={`Edit ${label} Image`}
          imageType={imageEditConfig.imageType}
          contextKey={imageEditConfig.contextKey}
          elementIdentifier={imageEditConfig.elementIdentifier}
          targetAspectRatio={imageEditConfig.targetAspectRatio}
          cropShape={imageEditConfig.cropShape}
        />
      )}
    </SControlContainer>
  )
}

export default ColorControl
