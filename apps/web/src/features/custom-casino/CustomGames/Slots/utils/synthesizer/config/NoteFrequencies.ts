// @ts-nocheck
/**
 * Musical note frequency mappings
 */

// Standard A440 tuning
export const NOTES = {
  C: [16.35, 32.7, 65.41, 130.81, 261.63, 523.25, 1046.5, 2093.0, 4186.01],
  Cs: [17.32, 34.65, 69.3, 138.59, 277.18, 554.37, 1108.73, 2217.46, 4434.92],
  D: [18.35, 36.71, 73.42, 146.83, 293.66, 587.33, 1174.66, 2349.32, 4698.63],
  Ds: [19.45, 38.89, 77.78, 155.56, 311.13, 622.25, 1244.51, 2489.02, 4978.03],
  E: [20.6, 41.2, 82.41, 164.81, 329.63, 659.25, 1318.51, 2637.02, 5274.04],
  F: [21.83, 43.65, 87.31, 174.61, 349.23, 698.46, 1396.91, 2793.83, 5587.65],
  Fs: [23.12, 46.25, 92.5, 185.0, 369.99, 739.99, 1479.98, 2959.96, 5919.91],
  G: [24.5, 49.0, 98.0, 196.0, 392.0, 783.99, 1567.98, 3135.96, 6271.93],
  Gs: [25.96, 51.91, 103.83, 207.65, 415.3, 830.61, 1661.22, 3322.44, 6644.88],
  A: [27.5, 55.0, 110.0, 220.0, 440.0, 880.0, 1760.0, 3520.0, 7040.0],
  As: [29.14, 58.27, 116.54, 233.08, 466.16, 932.33, 1864.66, 3729.31, 7458.62],
  B: [30.87, 61.74, 123.47, 246.94, 493.88, 987.77, 1975.53, 3951.07, 7902.13],
} as const

// Common scales
export const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  pentatonic: [0, 2, 4, 7, 9],
  blues: [0, 3, 5, 6, 7, 10],
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  wholetone: [0, 2, 4, 6, 8, 10],
  diminished: [0, 2, 3, 5, 6, 8, 9, 11],
} as const

// Chord intervals
export const CHORDS = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
  augmented: [0, 4, 8],
  major7: [0, 4, 7, 11],
  minor7: [0, 3, 7, 10],
  dominant7: [0, 4, 7, 10],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
} as const

/**
 * Get frequency for a specific note
 */
export function getNoteFrequency(note: keyof typeof NOTES, octave: number): number {
  const noteFreqs = NOTES[note]
  return noteFreqs[Math.max(0, Math.min(octave, noteFreqs.length - 1))]
}

/**
 * Get frequencies for a scale starting from a root note
 */
export function getScaleFrequencies(
  rootNote: keyof typeof NOTES,
  rootOctave: number,
  scaleName: keyof typeof SCALES
): number[] {
  const scale = SCALES[scaleName]
  const frequencies: number[] = []
  const noteNames = Object.keys(NOTES) as Array<keyof typeof NOTES>
  const rootIndex = noteNames.indexOf(rootNote)

  for (const interval of scale) {
    const noteIndex = (rootIndex + interval) % 12
    const octaveOffset = Math.floor((rootIndex + interval) / 12)
    frequencies.push(getNoteFrequency(noteNames[noteIndex], rootOctave + octaveOffset))
  }

  return frequencies
}

/**
 * Get frequencies for a chord
 */
export function getChordFrequencies(
  rootNote: keyof typeof NOTES,
  rootOctave: number,
  chordType: keyof typeof CHORDS
): number[] {
  const intervals = CHORDS[chordType]
  const frequencies: number[] = []
  const noteNames = Object.keys(NOTES) as Array<keyof typeof NOTES>
  const rootIndex = noteNames.indexOf(rootNote)

  for (const interval of intervals) {
    const noteIndex = (rootIndex + interval) % 12
    const octaveOffset = Math.floor((rootIndex + interval) / 12)
    frequencies.push(getNoteFrequency(noteNames[noteIndex], rootOctave + octaveOffset))
  }

  return frequencies
}

/**
 * Convert MIDI note number to frequency
 */
export function midiToFrequency(midiNote: number): number {
  return 440 * Math.pow(2, (midiNote - 69) / 12)
}

/**
 * Apply pitch adjustment to frequency
 */
export function adjustPitch(frequency: number, semitones: number): number {
  return frequency * Math.pow(2, semitones / 12)
}
