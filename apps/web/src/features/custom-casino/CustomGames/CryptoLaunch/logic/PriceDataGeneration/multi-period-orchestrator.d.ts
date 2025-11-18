interface CurveParams {
  totalDays: number
  totalArea: number
  curveCount?: number
  minAlpha?: number
  maxAlpha?: number
  minBeta?: number
  maxBeta?: number
  noiseLevel?: number
}

interface TradingParams {
  startDay: number
  sellDuration: number
  startPrice: number
  minSellPrice: number
}

interface GenerationParams {
  curveParams: CurveParams
  tradingParams: TradingParams
}

interface PeriodMetadata {
  periodIndex: number
  dayOffset: number
  weight: number
  originalWeight: number
  weightAdjustment: number
  gapAfter: number
  length: number
  originalLength: number
  lengthAdjustment: number
  totalPeriodTarget: number
  floorArea: number
  targetAreaAboveMinSell: number
  actualAreaAboveMinSell: number
}

interface Period {
  prices: number[]
  metadata: PeriodMetadata
}

interface ValleyMetadata {
  startDay: number
  endDay: number
  lowestValue: number
  highestValue: number
}

interface Valley {
  prices: number[]
  metadata: ValleyMetadata
}

interface TailMetadata {
  startDay: number
  endDay: number
  lowestValue: number
  highestValue: number
}

interface Tail {
  prices: number[]
  metadata: TailMetadata
}

interface Stats {
  totalReturn: number
  targetReturn: number
  maxPrice: number
  minPrice: number
  avgPrice: number
  startPrices: number[]
  periodReturns: number[]
  periodWeights: string[]
  periodLengths: number[]
  gaps: number[]
  valleys: ValleyMetadata[]
  tails: Array<TailMetadata & { index: number }>
  debug: {
    totalDaysAboveMinSell: number
    percentTimeAboveMinSell: string
    totalFloorArea: number
    totalTargetAboveMinSell: number
    totalActualAboveMinSell: number
  }
}

interface GenerationResult {
  periods: Period[]
  valleys: Valley[]
  tails: Tail[]
  combinedPrices: number[]
  stats: Stats
  metadata: {
    totalDays: number
    periodCount: number
    periodLengths: number[]
    weights: number[]
    gaps: number[]
    offsets: number[]
  }
}

export function generateMultiPeriodSeries(params: GenerationParams): GenerationResult
