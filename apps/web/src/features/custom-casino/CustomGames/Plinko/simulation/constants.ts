// @ts-nocheck
/**
 * Single source of truth for all Plinko physics and layout constants
 * Used by both live physics (PlinkoScene) and simulation (PhysicsSimulator)
 */

// Canvas dimensions
export const CANVAS_WIDTH = 600
export const CANVAS_HEIGHT = 500
export const BOARD_MARGIN = 50
export const BOARD_WIDTH = CANVAS_WIDTH - BOARD_MARGIN * 2

// Physics constants - must match between live and simulation
export const GRAVITY = 0.006 // Matches PlinkoScene
export const BOUNCE_DAMPING = 0.6 // Matches PlinkoScene
export const FRICTION = 0.998 // Matches PlinkoScene
export const MIN_VELOCITY = 0.02 // Matches PlinkoScene
export const TARGET_FPS = 60
export const FRAME_TIME = 1000 / TARGET_FPS // 16.67ms per frame

// Layout calculations
export const calculateLayout = (rowCount: number) => {
  const bucketCount = rowCount + 1
  const bucketWidth = BOARD_WIDTH / bucketCount
  const rowHeight = (CANVAS_HEIGHT - 120) / (rowCount + 1)

  return {
    canvasWidth: CANVAS_WIDTH,
    canvasHeight: CANVAS_HEIGHT,
    boardMargin: BOARD_MARGIN,
    boardWidth: BOARD_WIDTH,
    bucketWidth,
    bucketCount,
    rowHeight,
    pegRadius: Math.max(3, Math.min(5, 25 / rowCount)),
    ballRadius: Math.max(4, Math.min(7, 30 / rowCount)),
    startY: 60,
    bucketY: CANVAS_HEIGHT - 60,
    bucketHeight: 30,
  }
}

// Peg generation - consistent between live and simulation
export const generatePegs = (rowCount: number, layout: ReturnType<typeof calculateLayout>) => {
  const pegs: Array<{ x: number; y: number; radius: number }> = []

  for (let row = 0; row < rowCount; row++) {
    const pegsInRow = row + 3 // Classic Plinko: start with 3, add 1 per row
    const y = layout.startY + (row + 1) * layout.rowHeight
    const rowWidth = (pegsInRow - 1) * (layout.boardWidth / (rowCount + 2))
    const startX = layout.boardMargin + (layout.boardWidth - rowWidth) / 2
    const pegSpacing = rowWidth / (pegsInRow - 1)

    for (let col = 0; col < pegsInRow; col++) {
      const x = startX + col * pegSpacing
      pegs.push({
        x,
        y,
        radius: layout.pegRadius,
      })
    }
  }

  return pegs
}

// Quality thresholds - updated based on realistic expectations
export const QUALITY_THRESHOLDS = {
  development: {
    minBounces: 2,
    maxBounces: 40, // Increased for realistic runs
    smoothnessCheck: false,
  },
  production: {
    minBounces: 3,
    maxBounces: 40, // Increased for realistic runs
    smoothnessCheck: true,
  },
} as const

// How long (ms) to keep bucket highlight before resetting
export const AUTO_RESET_DELAY = 500 // 0.5 s after last ball lands
