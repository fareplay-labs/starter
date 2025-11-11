# Modular Sound Synthesizer Architecture

## Overview
This directory contains a lightweight, modular sound synthesizer system focused on generating real-time click and whirr sounds for the Slots game. The architecture is clean, maintainable, and optimized for performance.

## Architecture

### Directory Structure
```
synthesizer/
├── index.ts                    # Main exports
├── SoundSynthesizer.ts         # Main synthesizer interface
├── core/                       # Core audio functionality
│   ├── AudioEngine.ts          # Web Audio API management
│   ├── OscillatorFactory.ts    # Oscillator creation
│   └── NoiseGenerator.ts       # Noise generation
├── effects/                    # Audio effects processing
│   ├── Filters.ts              # Filter utilities
│   └── Envelope.ts             # ADSR envelopes
├── generators/                 # Sound generators
│   ├── ClickGenerator.ts       # Click sounds (classic, modern, minimal)
│   └── ReelGenerator.ts        # Whirr/ambient sounds
├── config/                     # Configuration
│   └── NoteFrequencies.ts      # Musical notes for click pitches
└── types.ts                    # TypeScript types
```

## Key Features

### 1. Focused Functionality
- **Click Sounds**: Real-time clicking as reels spin
- **Whirr Sounds**: Ambient mechanical whirring during spins
- **Performance Optimized**: Lightweight and efficient

### 2. Style-Based Click Generation
- **Classic**: Mechanical typewriter-like click
- **Modern**: Electronic beep (default)
- **Minimal**: Soft, subtle tick

### 3. Customizable Parameters
- **Click Configuration**:
  - Enable/disable (default: enabled)
  - Style selection
  - Pitch adjustment (-1 to 1)
  - Volume control (0 to 1)
- **Whirr Configuration**:
  - Enable/disable (default: disabled)
  - Pitch adjustment (default: 0.5 for softer sound)
  - Volume control (default: 0.05 for subtle effect)

### 4. Audio Optimizations
- Lazy initialization of audio context
- Efficient resource management
- Automatic cleanup to prevent memory leaks
- Soft, pleasant default sounds

## Usage

### Basic Usage
```typescript
import { SoundSynthesizer } from './SoundSynthesizer'

// Create instance
const synthesizer = new SoundSynthesizer()

// Initialize (called once on user interaction)
synthesizer.init()

// Apply configuration
synthesizer.applyConfig({
  clickEnabled: true,
  clickStyle: 'modern',
  clickPitch: 0,
  clickVolume: 0.5,
  whirrEnabled: false,
  whirrPitch: 0.5,
  whirrVolume: 0.05
})

// Play click sounds
await synthesizer.playClick(600, 0.3)
await synthesizer.playMechanicalClick(400, 0.3)
await synthesizer.playElectronicClick(800, 0.3)
await synthesizer.playSoftTick(600, 0.2)

// Manage whirr sounds
synthesizer.startAmbientWhirr('reel_1', 150, 0.1)
synthesizer.modulateAmbientWhirr('reel_1', 200, 0.15)
synthesizer.fadeOutAmbientWhirr('reel_1', 500)
synthesizer.stopAmbientWhirr('reel_1')
```

## Benefits

### Maintainability
- **File Size**: Reduced from 958 lines to max 523 lines per module
- **Focused Modules**: Each module is easy to understand and modify
- **Clear Dependencies**: Import structure shows relationships

### Testability
- Each module can be tested independently
- Mock dependencies easily
- Better test coverage possible

### Extensibility
- Easy to add new sound styles
- Simple to create new generators
- Can extend without modifying existing code

### Performance
- Lazy loading of generators
- Efficient audio graph creation
- Better resource management
- Memory leak prevention

## Integration with Slots Game

The synthesizer is integrated into the Slots game through:

1. **SpinSoundManager**: Orchestrates click and whirr sounds during reel spins
2. **Configuration**: Controlled via the game's parameter editor
3. **Real-time Control**: Sounds respond to game events (spin start, reel stop, etc.)

## Configuration

### SynthConfig Interface
```typescript
interface SynthConfig {
  // Click sounds configuration
  clickEnabled?: boolean        // Enable click sounds during reel spin
  clickStyle?: 'classic' | 'modern' | 'minimal'  // Style for reel click sounds
  clickPitch?: number           // -1 to 1 (low to high)
  clickVolume?: number          // 0 to 1 volume multiplier

  // Whirr sound configuration
  whirrEnabled?: boolean        // Enable ambient whirr sound
  whirrPitch?: number          // -1 to 1 (low to high)
  whirrVolume?: number         // 0 to 1 volume multiplier
}
```

### Style Descriptions

#### Click Styles
- **classic**: Mechanical typewriter-like click (default)
- **modern**: Electronic beep with harmonics
- **minimal**: Subtle, soft tick

#### Whirr Sound
- Ambient mechanical whirring sound during reel spins
- Soft sine wave with minimal noise for pleasant background ambience
- Pitch and volume adjustable for customization

## Technical Details

### Web Audio API Usage
- Proper audio context management
- Automatic resume on user interaction
- Volume control integration
- Memory leak prevention

### Sound Generation Techniques
- **Oscillators**: Multiple waveforms (sine, square, sawtooth, triangle)
- **Noise**: White, pink, brown noise generation
- **Filters**: Low-pass, high-pass, band-pass, notch
- **Envelopes**: ADSR, percussion, pluck, swell
- **Effects**: Tremolo, filter sweeps, distortion

### Performance Optimizations
- Reused audio nodes where possible
- Efficient scheduling of sounds
- Proper cleanup of finished sounds
- Minimal CPU usage

## Future Enhancements

### Potential Additions
- Additional click sound styles
- More reel sound variations
- Reverb and delay effects for atmosphere
- Dynamic pitch modulation based on spin speed
- Spatial audio for multi-reel positioning

### Extension Points
- Custom click sound generators
- Theme-based sound presets
- Speed-adaptive sound modulation
- Multi-layered ambient sounds

## Conclusion

This modular architecture provides a solid foundation for all synthesized sound needs while maintaining complete backward compatibility. The system is extensible, maintainable, and performant, making it suitable for both current use and future enhancements.