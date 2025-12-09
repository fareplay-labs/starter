import React, { useState, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { ModalBase } from './shared/ModalBase'
import { ModalActions } from './shared/ModalActions'
import { type FieldEditModalProps } from './shared/modalTypes'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

type ColorMode = 'solid' | 'linear' | 'radial'

interface GradientStop {
  color: string
  position: number
}

/**
 * Validates if a string is a valid color format (hex, rgb, rgba)
 */
const isValidColor = (color: string): boolean => {
  if (!color || color.trim() === '') return false

  // Check for hex format (#fff or #ffffff)
  const hexRegex = /^#([A-Fa-f0-9]{3}){1,2}$/
  if (hexRegex.test(color)) return true

  // Check for rgb format
  const rgbRegex = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/
  if (rgbRegex.test(color)) return true

  // Check for rgba format
  const rgbaRegex = /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*(?:0(?:\.\d+)?|1(?:\.0+)?)\s*\)$/
  if (rgbaRegex.test(color)) return true

  return false
}

/**
 * Validates if a string is a valid gradient
 */
const isValidGradient = (value: string): boolean => {
  return /^(linear|radial)-gradient\(.+\)$/.test(value)
}

/**
 * Parse existing value to determine mode and settings
 */
const parseValue = (value: string): {
  mode: ColorMode
  solidColor: string
  angle: number
  stops: GradientStop[]
  radialShape: 'circle' | 'ellipse'
} => {
  const defaults = {
    mode: 'solid' as ColorMode,
    solidColor: value || '#0a0a0a',
    angle: 135,
    stops: [
      { color: '#667eea', position: 0 },
      { color: '#764ba2', position: 100 },
    ],
    radialShape: 'circle' as const,
  }

  if (!value) return defaults

  // Check if it's a linear gradient
  const linearMatch = value.match(/^linear-gradient\((\d+)deg,\s*(.+)\)$/)
  if (linearMatch) {
    const angle = parseInt(linearMatch[1], 10)
    const stopsStr = linearMatch[2]
    const stops = parseGradientStops(stopsStr)
    return { ...defaults, mode: 'linear', angle, stops }
  }

  // Check if it's a radial gradient
  const radialMatch = value.match(/^radial-gradient\((circle|ellipse),\s*(.+)\)$/)
  if (radialMatch) {
    const radialShape = radialMatch[1] as 'circle' | 'ellipse'
    const stopsStr = radialMatch[2]
    const stops = parseGradientStops(stopsStr)
    return { ...defaults, mode: 'radial', radialShape, stops }
  }

  // It's a solid color
  if (isValidColor(value)) {
    return { ...defaults, solidColor: value }
  }

  return defaults
}

/**
 * Parse gradient color stops from string
 */
const parseGradientStops = (stopsStr: string): GradientStop[] => {
  const stops: GradientStop[] = []
  // Match patterns like "#fff 0%" or "rgb(255,255,255) 50%"
  const stopRegex = /(#[a-fA-F0-9]{3,6}|rgba?\([^)]+\))\s*(\d+)%/g
  let match
  while ((match = stopRegex.exec(stopsStr)) !== null) {
    stops.push({
      color: match[1],
      position: parseInt(match[2], 10),
    })
  }
  return stops.length >= 2 ? stops : [
    { color: '#667eea', position: 0 },
    { color: '#764ba2', position: 100 },
  ]
}

/**
 * Build CSS gradient string from settings
 */
const buildGradientString = (
  mode: ColorMode,
  solidColor: string,
  angle: number,
  stops: GradientStop[],
  radialShape: 'circle' | 'ellipse'
): string => {
  if (mode === 'solid') {
    return solidColor
  }

  const stopsStr = stops
    .map(s => `${s.color} ${s.position}%`)
    .join(', ')

  if (mode === 'linear') {
    return `linear-gradient(${angle}deg, ${stopsStr})`
  }

  return `radial-gradient(${radialShape}, ${stopsStr})`
}

/**
 * Modal for editing color values with gradient support
 */
const ColorEditModal: React.FC<FieldEditModalProps> = ({
  isOpen,
  onClose,
  fieldName,
  onSave,
  currentValue = '#ffffff',
}) => {
  // Determine if this is a backgroundColor field (supports gradients)
  const supportsGradients = fieldName.includes('backgroundColor')

  // Parse initial value
  const parsed = useMemo(() => parseValue(currentValue), [currentValue])

  // State
  const [mode, setMode] = useState<ColorMode>(parsed.mode)
  const [solidColor, setSolidColor] = useState(parsed.solidColor)
  const [angle, setAngle] = useState(parsed.angle)
  const [stops, setStops] = useState<GradientStop[]>(parsed.stops)
  const [radialShape, setRadialShape] = useState<'circle' | 'ellipse'>(parsed.radialShape)
  const [isValid, setIsValid] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      const p = parseValue(currentValue)
      setMode(supportsGradients ? p.mode : 'solid')
      setSolidColor(p.solidColor)
      setAngle(p.angle)
      setStops(p.stops)
      setRadialShape(p.radialShape)
      setIsValid(true)
      setErrorMessage('')
    }
  }, [isOpen, currentValue, supportsGradients])

  // Computed output value
  const outputValue = useMemo(() => {
    return buildGradientString(mode, solidColor, angle, stops, radialShape)
  }, [mode, solidColor, angle, stops, radialShape])

  // Validate on changes
  useEffect(() => {
    if (mode === 'solid') {
      const valid = isValidColor(solidColor)
      setIsValid(valid)
      setErrorMessage(valid ? '' : 'Please enter a valid color format: #RGB, #RRGGBB, rgb(r,g,b), or rgba(r,g,b,a)')
    } else {
      // Validate all stop colors
      const allValid = stops.every(s => isValidColor(s.color))
      setIsValid(allValid)
      setErrorMessage(allValid ? '' : 'All gradient colors must be valid')
    }
  }, [mode, solidColor, stops])

  // Handle solid color change
  const handleSolidColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSolidColor(e.target.value)
  }

  // Handle stop color change
  const handleStopColorChange = (index: number, color: string) => {
    setStops(prev => prev.map((s, i) => i === index ? { ...s, color } : s))
  }

  // Handle stop position change
  const handleStopPositionChange = (index: number, position: number) => {
    setStops(prev => prev.map((s, i) => i === index ? { ...s, position } : s))
  }

  // Add a new stop
  const addStop = () => {
    if (stops.length >= 5) return
    const midPosition = Math.round((stops[0].position + stops[stops.length - 1].position) / 2)
    setStops(prev => [...prev, { color: '#888888', position: midPosition }].sort((a, b) => a.position - b.position))
  }

  // Remove a stop
  const removeStop = (index: number) => {
    if (stops.length <= 2) return
    setStops(prev => prev.filter((_, i) => i !== index))
  }

  // Get display name
  const getDisplayName = () => {
    if (fieldName.includes('.')) {
      const [_, colorName] = fieldName.split('.')
      return colorName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
    }
    return fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
  }

  // Handle save
  const handleSave = () => {
    if (isValid) {
      onSave(fieldName, outputValue)
      onClose()
    }
  }

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title={`Edit ${getDisplayName()}`}>
      <div className="flex flex-col gap-4 w-full mb-4">
        {/* Preview */}
        <div className="flex flex-col gap-2">
          <Label className="text-sm text-white/70">Preview</Label>
          <div
            className="w-full h-24 rounded-lg border-2 border-white/10 transition-all duration-200"
            style={{ background: isValid ? outputValue : '#ff5050' }}
          />
        </div>

        {/* Mode selector (only for backgroundColor) */}
        {supportsGradients && (
          <div className="flex flex-col gap-2">
            <Label className="text-sm text-white/70">Type</Label>
            <div className="flex gap-2">
              {(['solid', 'linear', 'radial'] as ColorMode[]).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={cn(
                    'flex-1 py-2 px-3 rounded-md border-2 transition-all duration-200 text-sm capitalize',
                    mode === m
                      ? 'border-secondary bg-secondary/20 text-white font-medium'
                      : 'border-border bg-transparent text-white/70 hover:bg-white/5'
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Solid color input */}
        {mode === 'solid' && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="color-input" className="text-sm text-white/70">
              Color
            </Label>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg border-2 border-white/10 flex-shrink-0"
                style={{ backgroundColor: isValidColor(solidColor) ? solidColor : '#ff5050' }}
              />
              <input
                id="color-input"
                type="text"
                value={solidColor}
                onChange={handleSolidColorChange}
                className={cn(
                  'flex-1 p-3 bg-black/30 rounded text-white font-mono',
                  'border transition-colors duration-200',
                  isValid ? 'border-white/10' : 'border-red-500/70'
                )}
              />
              <input
                type="color"
                value={isValidColor(solidColor) ? solidColor : '#000000'}
                onChange={handleSolidColorChange}
                className={cn(
                  'w-10 h-10 border-none rounded-lg cursor-pointer flex-shrink-0',
                  'appearance-none',
                  '[&::-webkit-color-swatch-wrapper]:p-0',
                  '[&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-lg'
                )}
              />
            </div>
          </div>
        )}

        {/* Linear gradient controls */}
        {mode === 'linear' && (
          <div className="flex flex-col gap-4">
            {/* Angle slider */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm text-white/70">Angle</Label>
                <span className="text-sm text-white/50">{angle}°</span>
              </div>
              <Slider
                value={[angle]}
                onValueChange={([v]) => setAngle(v)}
                min={0}
                max={360}
                step={5}
                className="w-full"
              />
            </div>

            {/* Color stops */}
            <GradientStopsEditor
              stops={stops}
              onStopColorChange={handleStopColorChange}
              onStopPositionChange={handleStopPositionChange}
              onAddStop={addStop}
              onRemoveStop={removeStop}
            />
          </div>
        )}

        {/* Radial gradient controls */}
        {mode === 'radial' && (
          <div className="flex flex-col gap-4">
            {/* Shape selector */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm text-white/70">Shape</Label>
              <div className="flex gap-2">
                {(['circle', 'ellipse'] as const).map(shape => (
                  <button
                    key={shape}
                    type="button"
                    onClick={() => setRadialShape(shape)}
                    className={cn(
                      'flex-1 py-2 px-3 rounded-md border-2 transition-all duration-200 text-sm capitalize',
                      radialShape === shape
                        ? 'border-secondary bg-secondary/20 text-white font-medium'
                        : 'border-border bg-transparent text-white/70 hover:bg-white/5'
                    )}
                  >
                    {shape}
                  </button>
                ))}
              </div>
            </div>

            {/* Color stops */}
            <GradientStopsEditor
              stops={stops}
              onStopColorChange={handleStopColorChange}
              onStopPositionChange={handleStopPositionChange}
              onAddStop={addStop}
              onRemoveStop={removeStop}
            />
          </div>
        )}

        {/* Error message */}
        {!isValid && (
          <div className="text-red-400/90 text-xs">
            {errorMessage}
          </div>
        )}

        {/* Output value display */}
        <div className="flex flex-col gap-2">
          <Label className="text-sm text-white/70">CSS Value</Label>
          <code className="p-2 bg-black/30 rounded text-xs text-white/60 font-mono break-all">
            {outputValue}
          </code>
        </div>
      </div>

      <ModalActions onCancel={onClose} onConfirm={handleSave} disabled={!isValid} />
    </ModalBase>
  )
}

/**
 * Gradient stops editor component
 */
interface GradientStopsEditorProps {
  stops: GradientStop[]
  onStopColorChange: (index: number, color: string) => void
  onStopPositionChange: (index: number, position: number) => void
  onAddStop: () => void
  onRemoveStop: (index: number) => void
}

const GradientStopsEditor: React.FC<GradientStopsEditorProps> = ({
  stops,
  onStopColorChange,
  onStopPositionChange,
  onAddStop,
  onRemoveStop,
}) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <Label className="text-sm text-white/70">Color Stops</Label>
        {stops.length < 5 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onAddStop}
            className="text-xs h-7 px-2"
          >
            + Add Stop
          </Button>
        )}
      </div>

      {stops.map((stop, index) => (
        <div key={index} className="flex items-center gap-2">
          {/* Color picker */}
          <input
            type="color"
            value={isValidColor(stop.color) ? stop.color : '#000000'}
            onChange={e => onStopColorChange(index, e.target.value)}
            className={cn(
              'w-8 h-8 border-none rounded cursor-pointer flex-shrink-0',
              'appearance-none',
              '[&::-webkit-color-swatch-wrapper]:p-0',
              '[&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded'
            )}
          />

          {/* Color text input */}
          <input
            type="text"
            value={stop.color}
            onChange={e => onStopColorChange(index, e.target.value)}
            className="w-24 p-2 bg-black/30 rounded text-white font-mono text-xs border border-white/10"
          />

          {/* Position slider */}
          <div className="flex-1 flex items-center gap-2">
            <Slider
              value={[stop.position]}
              onValueChange={([v]) => onStopPositionChange(index, v)}
              min={0}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-white/50 w-8 text-right">{stop.position}%</span>
          </div>

          {/* Remove button */}
          {stops.length > 2 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemoveStop(index)}
              className="text-xs h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              ×
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}

export default ColorEditModal
