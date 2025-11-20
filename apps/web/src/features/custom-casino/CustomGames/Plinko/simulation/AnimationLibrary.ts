// @ts-nocheck
import { type BallAnimation, type SimulationConfig } from './types'
import { PhysicsSimulator } from './PhysicsSimulator'
import { calculateLayout, BOARD_MARGIN } from './constants'

/**
 * Manages the library of pre-generated ball animations
 * Now with improved quality checking and JSON export functionality
 */
export class AnimationLibraryManager {
  private library: { [rowCount: number]: { [bucket: number]: BallAnimation[] } } = {}
  private readonly STORAGE_KEY = 'plinko_animation_library'
  private loadedRows = new Set<number>()

  constructor() {
    this.loadFromStorage()
  }

  /**
   * Generate animations for a specific configuration
   */
  public async generateAnimations(config: SimulationConfig): Promise<void> {
    console.log(
      `Generating ${config.animationsPerBucket} animations per bucket for ${config.rowCount} rows (risk-agnostic)`
    )

    const simulator = new PhysicsSimulator(config)
    const bucketCount = config.rowCount + 1

    // Initialize library structure if needed (removed risk level)
    if (!this.library[config.rowCount]) {
      this.library[config.rowCount] = {}
    }

    // Generate animations for each bucket
    for (let bucket = 0; bucket < bucketCount; bucket++) {
      if (!this.library[config.rowCount][bucket]) {
        this.library[config.rowCount][bucket] = []
      }

      const bucketAnimations = this.library[config.rowCount][bucket]

      // const maxAttemptsPerAnim = 2000 // allow more tries for tricky buckets
      const maxAttemptsPerAnim = 10000 // allow more tries for tricky buckets

      while (bucketAnimations.length < config.animationsPerBucket) {
        const animIndex = bucketAnimations.length + 1
        let attempts = 0

        while (attempts < maxAttemptsPerAnim) {
          const seed = Date.now() + Math.random() * 1000000 + attempts * 1000
          const result = simulator.simulateBallDrop(bucket, seed)

          if (result.success && result.animation) {
            // Quality check with separate wall hit tracking
            if (this.passesQualityCheck(result, config)) {
              result.animation.quality = 'approved'
              bucketAnimations.push(result.animation)

              break
            } else {
              result.animation.quality = 'rejected'
            }
          }

          attempts++
        }

        if (attempts >= maxAttemptsPerAnim) {
          console.warn(
            `Failed to create animation ${animIndex} for bucket ${bucket} after ${maxAttemptsPerAnim} attempts`
          )
          // Give up on this bucket if we're spending too much time
          break
        }

        // Small delay every 5 approved animations to keep UI responsive
        if (bucketAnimations.length % 5 === 0) {
          await new Promise(resolve => setTimeout(resolve, 10))
        }
      }
    }

    this.saveToStorage()
    console.log('Animation generation complete!')
  }

  /**
   * Get a random approved animation for a specific bucket
   */
  public getAnimation(rowCount: number, bucket: number): BallAnimation | null {
    const animations = this.library[rowCount]?.[bucket]
    if (!animations || animations.length === 0) {
      return null
    }

    const approvedAnimations = animations.filter(anim => anim.quality === 'approved')
    if (approvedAnimations.length === 0) {
      return null
    }

    const randomIndex = Math.floor(Math.random() * approvedAnimations.length)
    return approvedAnimations[randomIndex]
  }

  /**
   * Export animations as JSON for download and version control
   */
  public exportAnimationsAsJSON(rowCount: number): string {
    const animations = this.library[rowCount] || {}

    // Create export object with metadata
    const exportData = {
      __metadata: {
        version: '1.0.0',
        generated: new Date().toISOString(),
        rowCount,
        totalAnimations: Object.values(animations).reduce((sum, bucket) => sum + bucket.length, 0),
        approvedAnimations: Object.values(animations).reduce(
          (sum, bucket) => sum + bucket.filter(anim => anim.quality === 'approved').length,
          0
        ),
      },
      animations,
    }

    return JSON.stringify(exportData, null, 2)
  }

  /**
   * Generate filename for animation export
   */
  public getExportFilename(rowCount: number): string {
    return `plinko_animations_rows${rowCount}.json`
  }

  /**
   * Download animations as JSON file
   */
  public downloadAnimations(rowCount: number): void {
    const jsonData = this.exportAnimationsAsJSON(rowCount)
    const filename = this.getExportFilename(rowCount)

    const blob = new Blob([jsonData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)

    console.log(`Downloaded ${filename}`)
  }

  /**
   * Get all animations for preview/management
   * Returns animations in consistent order (sorted by ID)
   */
  public getAllAnimations(rowCount: number): { [bucket: number]: BallAnimation[] } {
    const animations = this.library[rowCount] || {}

    // Sort animations within each bucket by ID for consistent ordering
    const sortedAnimations: { [bucket: number]: BallAnimation[] } = {}
    for (const bucket in animations) {
      sortedAnimations[bucket] = [...animations[bucket]].sort((a, b) => a.id.localeCompare(b.id))
    }

    return sortedAnimations
  }

  /**
   * Update animation quality status
   */
  public updateAnimationQuality(
    animationId: string,
    quality: 'approved' | 'pending' | 'rejected'
  ): boolean {
    for (const rowCount in this.library) {
      for (const bucket in this.library[rowCount]) {
        const animations = this.library[rowCount][bucket]
        const animation = animations.find(anim => anim.id === animationId)
        if (animation) {
          animation.quality = quality
          this.saveToStorage()
          return true
        }
      }
    }
    return false
  }

  /**
   * Delete an animation
   */
  public deleteAnimation(animationId: string): boolean {
    for (const rowCount in this.library) {
      for (const bucket in this.library[rowCount]) {
        const animations = this.library[rowCount][bucket]
        const index = animations.findIndex(anim => anim.id === animationId)
        if (index !== -1) {
          animations.splice(index, 1)
          this.saveToStorage()
          return true
        }
      }
    }
    return false
  }

  /**
   * Get library statistics
   */
  public getStats(): any {
    const stats: any = {
      totalAnimations: 0,
      byRowCount: {},
      byQuality: { approved: 0, pending: 0, rejected: 0 },
    }

    for (const rowCount in this.library) {
      stats.byRowCount[rowCount] = {}
      for (const bucket in this.library[rowCount]) {
        stats.byRowCount[rowCount][bucket] = {
          total: this.library[rowCount][bucket].length,
          approved: this.library[rowCount][bucket].filter(a => a.quality === 'approved').length,
          pending: this.library[rowCount][bucket].filter(a => a.quality === 'pending').length,
          rejected: this.library[rowCount][bucket].filter(a => a.quality === 'rejected').length,
        }

        stats.totalAnimations += this.library[rowCount][bucket].length
        this.library[rowCount][bucket].forEach(anim => {
          stats.byQuality[anim.quality]++
        })
      }
    }

    return stats
  }

  /**
   * Clear all animations (for testing)
   */
  public clearLibrary(): void {
    this.library = {}
    this.loadedRows.clear()
    localStorage.removeItem(this.STORAGE_KEY)
    console.log('Animation library cleared')
  }

  /**
   * Clear local storage cache to force reload of risk-agnostic animations
   */
  public clearStorageCache(): void {
    localStorage.removeItem(this.STORAGE_KEY)
    console.log('Animation storage cache cleared')
  }

  private passesQualityCheck(result: any, config: SimulationConfig): boolean {
    const { bounces, duration, wallHit } = result.stats
    const { minBounces, maxBounces } = config.qualityThreshold

    // Reject immediately if ball hit wall
    if (wallHit) {
      console.log(`❌ Animation rejected: Ball hit wall`)
      return false
    }

    // Check bounce count with realistic thresholds
    if (bounces < minBounces || bounces > maxBounces) {
      console.log(
        `❌ Animation rejected: ${bounces} bounces (expected ${minBounces}-${maxBounces})`
      )
      return false
    }

    // Check duration is reasonable
    if (duration < 1000 || duration > config.maxDuration) {
      console.log(`❌ Animation rejected: ${duration}ms duration (max ${config.maxDuration}ms)`)
      return false
    }

    // Reject if the ball path leaves the peg pyramid envelope (even if it doesn't hit walls)
    const layout = calculateLayout(config.rowCount)
    const envelopeBuffer = 4 // px tolerance outside envelope

    for (const kf of result.animation?.keyframes ?? []) {
      // Progress from startY to bucketY (0..1)
      const progress = Math.max(
        0,
        Math.min(1, (kf.y - layout.startY) / (layout.bucketY - layout.startY))
      )
      // Left/right bounds expand from a narrow top (approx first peg spacing) to full board width
      const halfWidthTop = layout.boardWidth / (config.rowCount + 2) // width of first peg row /2
      const halfWidthBottom = layout.boardWidth / 2
      const halfWidthAtY = halfWidthTop + (halfWidthBottom - halfWidthTop) * progress
      const leftBound = layout.canvasWidth / 2 - halfWidthAtY
      const rightBound = layout.canvasWidth / 2 + halfWidthAtY

      if (kf.x < leftBound - envelopeBuffer || kf.x > rightBound + envelopeBuffer) {
        console.log(
          `❌ Animation rejected: left pyramid envelope at y=${Math.round(kf.y)} (x=${Math.round(kf.x)})`
        )
        return false
      }
    }

    // Ensure the ball keeps zig-zagging: require a minimum number of horizontal direction changes
    if (result.animation) {
      const keyframes = result.animation.keyframes
      let dirChanges = 0
      let prevSign = Math.sign(keyframes[0].vx ?? 0)
      for (let i = 1; i < keyframes.length; i++) {
        const vx = keyframes[i].vx ?? 0
        if (Math.abs(vx) < 0.02) continue // ignore small drift
        const sign = Math.sign(vx)
        if (sign !== 0 && prevSign !== 0 && sign !== prevSign) {
          dirChanges++
          prevSign = sign
        } else if (prevSign === 0 && sign !== 0) {
          prevSign = sign
        }
      }

      const minDirChanges = Math.max(2, Math.ceil(config.rowCount / 3))
      if (dirChanges < minDirChanges) {
        console.log(
          `❌ Animation rejected: only ${dirChanges} direction changes (min ${minDirChanges})`
        )
        return false
      }
    }

    // Check for smoothness (no huge jumps between keyframes)
    if (config.qualityThreshold.smoothnessCheck && result.animation) {
      const keyframes = result.animation.keyframes
      for (let i = 1; i < keyframes.length; i++) {
        const prev = keyframes[i - 1]
        const curr = keyframes[i]
        const distance = Math.sqrt(Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2))
        const timeStep = curr.time - prev.time

        // Check for unreasonable jumps (more than 50 pixels per frame)
        if (distance > 50 && timeStep < 100) {
          console.log(
            `❌ Animation rejected: Large jump detected (${Math.round(distance)}px in ${timeStep}ms)`
          )
          return false
        }
      }
    }

    return true
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.library))
    } catch (error) {
      console.warn('Failed to save animation library to storage:', error)
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        this.library = JSON.parse(stored)
      }
    } catch (error) {
      console.warn('Failed to load animation library from storage:', error)
    }
  }

  /**
   * Scan entire library and move any animation whose final key-frame bucket
   * doesn't match its declared targetBucket. Returns a summary object.
   *
   * This implements Options B + C from the quality-control plan.
   */
  public scrubAndReassignMismatched(): {
    checked: number
    moved: number
    unchanged: number
    details: Array<{ id: string; from: number; to: number; row: number; risk: number }>
  } {
    const summary = { checked: 0, moved: 0, unchanged: 0, details: [] as Array<any> }

    for (const rowKey of Object.keys(this.library)) {
      const rowCount = Number(rowKey)
      const layout = calculateLayout(rowCount)
      for (const bucketKey of Object.keys(this.library[rowCount])) {
        const bucket = Number(bucketKey)
        const animations = this.library[rowCount][bucket]

        // Iterate **backwards** so we can splice safely while iterating
        for (let i = animations.length - 1; i >= 0; i--) {
          const anim = animations[i]
          summary.checked++

          if (!anim.keyframes || anim.keyframes.length === 0) {
            continue // skip malformed
          }

          const lastKF = anim.keyframes[anim.keyframes.length - 1]
          const finalBucket = Math.max(
            0,
            Math.min(
              layout.bucketCount - 1,
              Math.floor((lastKF.x - BOARD_MARGIN) / layout.bucketWidth)
            )
          )

          if (finalBucket !== anim.targetBucket) {
            // Remove from current bucket
            animations.splice(i, 1)

            // Ensure destination bucket array exists
            if (!this.library[rowCount][finalBucket]) {
              this.library[rowCount][finalBucket] = []
            }

            // Update metadata and push
            anim.targetBucket = finalBucket
            this.library[rowCount][finalBucket].push(anim)

            summary.moved++
            summary.details.push({
              id: anim.id,
              from: bucket,
              to: finalBucket,
              row: rowCount,
              risk: 'agnostic',
            })
          } else {
            summary.unchanged++
          }
        }
      }
    }

    if (summary.moved > 0) {
      this.saveToStorage()
    }

    return summary
  }

  public async generateAnimationsForBucket(
    config: SimulationConfig,
    bucket: number
  ): Promise<void> {
    console.log(`Generating animations for single bucket ${bucket} (row ${config.rowCount})`)

    const simulator = new PhysicsSimulator(config)

    // Ensure library structure exists
    if (!this.library[config.rowCount]) this.library[config.rowCount] = {}
    if (!this.library[config.rowCount][bucket]) this.library[config.rowCount][bucket] = []

    const bucketAnimations = this.library[config.rowCount][bucket]
    const maxAttemptsPerAnim = 10000

    while (bucketAnimations.length < config.animationsPerBucket) {
      const animIndex = bucketAnimations.length + 1
      let attempts = 0

      while (attempts < maxAttemptsPerAnim) {
        const seed = Date.now() + Math.random() * 1000000 + attempts * 1000
        const result = simulator.simulateBallDrop(bucket, seed)

        if (result.success && result.animation) {
          if (this.passesQualityCheck(result, config)) {
            result.animation.quality = 'approved'
            bucketAnimations.push(result.animation)
            break
          } else {
            // Animation rejected - try again
          }
        }
        attempts++
      }

      if (attempts >= maxAttemptsPerAnim) {
        console.warn(
          `Failed to generate animation ${animIndex} for bucket ${bucket} after ${maxAttemptsPerAnim} attempts`
        )
        break
      }
    }

    this.saveToStorage()
  }

  public importAnimationsFromJSON(jsonData: any): void {
    if (!jsonData || !jsonData.animations) return

    // Handle various import formats
    if (jsonData.__metadata && jsonData.__metadata.rowCount) {
      //  B) single row+risk file: metadata contains rowCount/riskLevel, animations[bucket][]
      // This is the old format, but we'll import it as risk-agnostic
      const rowCount = jsonData.__metadata.rowCount

      if (jsonData.animations) {
        // New format: animations[bucket][] (already risk-agnostic)
        const bucketsObj = jsonData.animations as {
          [bucket: string]: import('./types').BallAnimation[]
        }

        if (!this.library[rowCount]) this.library[rowCount] = {}

        for (const bucketKey in bucketsObj) {
          const bucket = Number(bucketKey)
          if (!this.library[rowCount][bucket]) this.library[rowCount][bucket] = []

          const existing = this.library[rowCount][bucket]
          const incoming: import('./types').BallAnimation[] = bucketsObj[bucketKey]
          const existingIds = new Set(existing.map(a => a.id))
          incoming.forEach(anim => {
            if (!existingIds.has(anim.id)) existing.push(anim)
          })
        }
      } else {
        // Old format: animations[risk][bucket][] - convert to risk-agnostic
        const animations = jsonData as any
        for (const riskKey in animations) {
          if (riskKey === '__metadata') continue
          const buckets = animations[riskKey] as {
            [bucket: string]: import('./types').BallAnimation[]
          }

          for (const bucketKey in buckets) {
            const bucket = Number(bucketKey)
            if (!this.library[rowCount][bucket]) this.library[rowCount][bucket] = []

            const existing = this.library[rowCount][bucket]
            const incoming: import('./types').BallAnimation[] = buckets[bucketKey]
            const existingIds = new Set(existing.map(a => a.id))
            incoming.forEach(anim => {
              if (!existingIds.has(anim.id)) existing.push(anim)
            })
          }
        }
      }

      this.loadedRows.add(rowCount)
    } else {
      // A) multi-row file: animations[rowCount][bucket][]
      const animations = jsonData as any
      for (const rowKey in animations) {
        if (rowKey === '__metadata') continue
        const rowCount = Number(rowKey)
        if (!this.library[rowCount]) this.library[rowCount] = {}

        for (const bucketKey in animations[rowKey]) {
          const bucket = Number(bucketKey)
          if (!this.library[rowCount][bucket]) this.library[rowCount][bucket] = []

          const existing = this.library[rowCount][bucket]
          const incoming: import('./types').BallAnimation[] = animations[rowKey][bucket]
          const existingIds = new Set(existing.map(a => a.id))
          incoming.forEach(anim => {
            if (!existingIds.has(anim.id)) existing.push(anim)
          })
        }
        this.loadedRows.add(rowCount)
      }
    }
    this.saveToStorage()
  }

  public hasRowLoaded(rowCount: number): boolean {
    return this.loadedRows.has(rowCount)
  }
}
