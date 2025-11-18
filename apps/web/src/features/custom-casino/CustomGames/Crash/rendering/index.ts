// @ts-nocheck
/**
 * Crash game rendering utilities
 * Centralized exports for all rendering functions
 */

// Core canvas utilities
export {
  setupCanvas,
  calculateViewportParams,
  getCanvasCoordinates,
  resetLineStyle,
  type CanvasConfig,
  type ViewportParams,
} from './CanvasRenderer'

// Grid and axes rendering
export { drawGridlines, drawAxes, type GridConfig } from './GridRenderer'

// Curve rendering
export {
  generateCurvePoints,
  drawCrashCurve,
  drawTargetLine,
  type CurvePoint,
  type CurveConfig,
} from './CurveRenderer'

// Text rendering
export {
  drawGridLabels,
  drawCurrentMultiplier,
  drawGameStateText,
  type TextConfig,
  type GameTextConfig,
} from './TextRenderer'
