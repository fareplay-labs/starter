export interface TradingParametersWithoutBetAmount {
  startPrice: number
  minSellPrice: number
  dayToStartSelling: number
  daysToSell: number
}

export interface TradingParameters extends TradingParametersWithoutBetAmount {
  betAmount: number
}

export interface CurveParameters {
  totalDays: number
  curveCount: number
  minAlpha: number
  maxAlpha: number
  minBeta: number
  maxBeta: number
  noiseLevel: number
}

export const PRICE_COLORS = {
  LOW: { h: 0, s: 0.9, l: 0.4 }, // Bright Red
  HIGH: { h: 0.12, s: 0.9, l: 0.6 }, // Gold
} as const

export const DEFAULT_TRADING_PARAMS: TradingParameters = {
  betAmount: 1,
  startPrice: 1,
  minSellPrice: 5,
  dayToStartSelling: 60,
  daysToSell: 180,
}

export const DEFAULT_CURVE_PARAMS: CurveParameters = {
  totalDays: 365,
  curveCount: 8,
  minAlpha: 1.5,
  maxAlpha: 3,
  minBeta: 1.5,
  maxBeta: 4,
  noiseLevel: 12,
}
