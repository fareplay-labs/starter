// @ts-nocheck
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export const easeOutQuad = (t: number) => 1 - (1 - t) * (1 - t)

export const shuffleArray = (arr: number[]): number[] => {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

// Create column-wise waterfall order for roulette grid
const createWaterfallOrder = (): number[] => {
  const waterfall: number[] = [0] // Start with 0
  
  // Grid layout is 6 rows × 6 columns:
  // Row 1: 1-6, Row 2: 7-12, Row 3: 13-18, Row 4: 19-24, Row 5: 25-30, Row 6: 31-36
  // Column-wise: 0, 1,7,13,19,25,31, then 2,8,14,20,26,32, etc.
  for (let col = 0; col < 6; col++) {
    for (let row = 0; row < 6; row++) {
      const number = 1 + (row * 6) + col // Calculate based on 6x6 grid
      waterfall.push(number)
    }
  }
  
  return waterfall
}

export const createSpinSequence = (
  target: number,
  animationPattern: 'sequential' | 'random' | 'waterfall',
  gridNumbers: number[],
  waterfallOrder: number[],
  indexMap: Map<number, number>
): number[] => {
  const sequence: number[] = []

  if (animationPattern === 'random') {
    // Generate 20-50 random steps instead of full loops
    const numSteps = Math.floor(Math.random() * 31) + 20 // 20-50 steps
    const shuffled = shuffleArray(gridNumbers)
    
    for (let i = 0; i < numSteps - 1; i++) {
      sequence.push(shuffled[i % shuffled.length])
    }
    sequence.push(target)
  } else if (animationPattern === 'waterfall') {
    // Use proper column-wise waterfall order
    const columnWaterfall = createWaterfallOrder()
    const targetIndex = columnWaterfall.indexOf(target)
    if (targetIndex === -1) return []

    const stepsToTarget = targetIndex + 1 // +1 because we include the target
    
    // Always do at least 1 cycle for waterfall, then add random extra cycles
    let extraCycles: number = 1 + Math.floor(Math.random() * 2) // 1 or 2 cycles

    // Add the extra full cycles
    for (let loop = 0; loop < extraCycles; loop++) {
      sequence.push(...columnWaterfall)
    }

    // Add steps up to and including target
    for (let i = 0; i <= targetIndex; i++) {
      sequence.push(columnWaterfall[i])
    }
  } else {
    // Sequential pattern: calculate steps to target and add extra cycles
    const targetIndex = indexMap.get(target) ?? -1
    if (targetIndex === -1) return []

    const stepsToTarget = targetIndex + 1 // +1 because we include the target
    
    // Always do at least 1 cycle for sequential, then add random extra cycles  
    let extraCycles: number = 1 + Math.floor(Math.random() * 3) // 1, 2, or 3 cycles

    // Add the extra full cycles
    for (let loop = 0; loop < extraCycles; loop++) {
      sequence.push(...gridNumbers)
    }

    // Add steps up to and including target
    for (let i = 0; i <= targetIndex; i++) {
      sequence.push(gridNumbers[i])
    }
  }

  return sequence
}

export const getAnimationDelays = () => ({
  startDelay: 100,
  steadyDelay: 90,
  endDelay: 280,
})
