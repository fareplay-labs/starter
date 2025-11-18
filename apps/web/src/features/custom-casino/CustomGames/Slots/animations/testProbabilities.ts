// @ts-nocheck
/**
 * Test script to verify animation probability distribution
 * Run this to see the distribution of animations over many spins
 */

import { type ResultAnalysis } from './strategies'
import {
  DEFAULT_ANIMATION_WEIGHTS,
  selectWeightedAnimation,
  createInitialContext,
  updateContext,
  type AnimationContext,
} from './animationProbabilities'

/**
 * Generate test result scenarios
 */
function generateTestResults(count: number): ResultAnalysis[] {
  const results: ResultAnalysis[] = []

  for (let i = 0; i < count; i++) {
    const random = Math.random()

    if (random < 0.6) {
      // 60% losses
      results.push({
        isWin: false,
        isJackpot: false,
        isNearMiss: Math.random() < 0.1, // 10% of losses are near misses
        winMultiplier: 0,
        matchingSymbols: Math.floor(Math.random() * 2) + 1,
        nearMissReels: [],
      })
    } else if (random < 0.85) {
      // 25% small wins
      results.push({
        isWin: true,
        isJackpot: false,
        isNearMiss: false,
        winMultiplier: Math.random() * 4 + 1, // 1-5x
        matchingSymbols: 3,
        nearMissReels: [],
      })
    } else if (random < 0.95) {
      // 10% medium wins
      results.push({
        isWin: true,
        isJackpot: false,
        isNearMiss: false,
        winMultiplier: Math.random() * 10 + 5, // 5-15x
        matchingSymbols: 4,
        nearMissReels: [],
      })
    } else if (random < 0.99) {
      // 4% big wins
      results.push({
        isWin: true,
        isJackpot: false,
        isNearMiss: false,
        winMultiplier: Math.random() * 40 + 15, // 15-55x
        matchingSymbols: 5,
        nearMissReels: [],
      })
    } else {
      // 1% jackpots
      results.push({
        isWin: true,
        isJackpot: true,
        isNearMiss: false,
        winMultiplier: Math.random() * 400 + 100, // 100-500x
        matchingSymbols: 5,
        nearMissReels: [],
      })
    }
  }

  return results
}

/**
 * Run simulation and collect statistics
 */
export function runProbabilityTest(spinCount = 1000): void {
  console.log(`\n🎰 Running animation probability test with ${spinCount} spins...\n`)

  const results = generateTestResults(spinCount)
  const strategyCount: Record<string, number> = {}
  let context = createInitialContext()

  // Simulate spins
  results.forEach((result, index) => {
    const strategy = selectWeightedAnimation(DEFAULT_ANIMATION_WEIGHTS, result, context)
    strategyCount[strategy] = (strategyCount[strategy] || 0) + 1
    context = updateContext(context, strategy, result.isWin)
  })

  // Calculate percentages and display results
  console.log('📊 Animation Distribution:')
  console.log('─'.repeat(50))

  const sortedStrategies = Object.entries(strategyCount).sort((a, b) => b[1] - a[1])

  let standardTotal = 0
  let specialTotal = 0

  sortedStrategies.forEach(([strategy, count]) => {
    const percentage = ((count / spinCount) * 100).toFixed(1)
    const bar = '█'.repeat(Math.round((count / spinCount) * 100))

    // Track standard vs special
    if (strategy.includes('Standard') || strategy === 'standard') {
      standardTotal += count
    } else {
      specialTotal += count
    }

    // Color code by type
    const emoji =
      strategy.includes('jackpot') ? '💰'
      : strategy.includes('bigWin') ? '🎉'
      : strategy.includes('nearMiss') ? '😮'
      : strategy.includes('cascade') ? '🌊'
      : strategy.includes('flourish') ? '✨'
      : strategy.includes('turbo') ? '⚡'
      : strategy.includes('basic') ? '▶️'
      : '🎲'

    console.log(`${emoji} ${strategy.padEnd(18)} ${percentage.padStart(5)}% ${bar}`)
  })

  console.log('─'.repeat(50))

  // Summary statistics
  const standardPercentage = ((standardTotal / spinCount) * 100).toFixed(1)
  const specialPercentage = ((specialTotal / spinCount) * 100).toFixed(1)

  console.log('\n📈 Summary:')
  console.log(`Standard animations: ${standardPercentage}% (target: ~75%)`)
  console.log(`Special animations:  ${specialPercentage}% (target: ~25%)`)

  // Check if within acceptable range
  const standardInRange = Math.abs(parseFloat(standardPercentage) - 75) < 5
  const specialInRange = Math.abs(parseFloat(specialPercentage) - 25) < 5

  if (standardInRange && specialInRange) {
    console.log('\n✅ Distribution is within target ranges!')
  } else {
    console.log('\n⚠️  Distribution is outside target ranges. Weights may need adjustment.')
  }

  // Context tracking test
  console.log('\n🔄 Context Tracking Test:')
  const testContext = createInitialContext()
  const updatedContext = updateContext(testContext, 'jackpot', true)
  console.log(`Spins since special after jackpot: ${updatedContext.spinsSinceSpecial}`)
  console.log(`Last animation tracked: ${updatedContext.lastAnimations[0]}`)

  console.log('\n✨ Test complete!\n')
}

// Export for use in other files or console
if (typeof window !== 'undefined') {
  ;(window as any).testAnimationProbabilities = runProbabilityTest
}

// Run test if this file is executed directly
if (require.main === module) {
  runProbabilityTest(10000)
}
