// @ts-nocheck
// Animation delay constants for auto-open feature
// All values are in milliseconds

export const ANIMATION_DELAYS = {
  // Delay before starting auto-open sequence after buying pack
  INITIAL_DELAY: 500,
  
  // Sleeve animation timings
  SLEEVE_APPEAR_DELAY: 1500, // Time for sleeve to slide up into view
  SLEEVE_CUT_DURATION: 300, // Time for the auto-cut animation
  POST_CUT_DELAY: 1450, // Time for sleeve removal after cut (fall + slide)
  
  // Card animation timings
  PRE_FLIP_DELAY: 400, // Delay before starting to flip cards
  CARD_FLIP_INTERVAL: 1100, // Time between each card flip (must be >= total animation time of 1000ms)
  
  // Additional delays
  POST_REVEAL_DELAY: 1000, // Delay after all cards are revealed
}

// Calculate total animation duration for auto-open
export const getTotalAnimationDuration = (numberOfCards: number): number => {
  return (
    ANIMATION_DELAYS.INITIAL_DELAY +
    ANIMATION_DELAYS.SLEEVE_APPEAR_DELAY +
    ANIMATION_DELAYS.SLEEVE_CUT_DURATION +
    ANIMATION_DELAYS.POST_CUT_DELAY +
    ANIMATION_DELAYS.PRE_FLIP_DELAY +
    ANIMATION_DELAYS.CARD_FLIP_INTERVAL * numberOfCards +
    ANIMATION_DELAYS.POST_REVEAL_DELAY
  )
}
