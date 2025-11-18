// @ts-nocheck
export const CONFIG = {
  animations: {
    // Base animation time in seconds
    totalAnimationTime: 3.5,

    // Animation sequence percentages (must add up to 100)
    sequence: {
      leftHandPercent: 32.5, // 0% - 32.5%
      laserPercent: 25, // 32.5% - 57.5%
      rightHandPercent: 32.5, // 57.5% - 90%
      completionPercent: 10, // 90% - 100%
    },

    // Calculate actual timings based on total time
    get timings() {
      const total = this.totalAnimationTime
      const seq = this.sequence

      return {
        leftHandDuration: (seq.leftHandPercent / 100) * total,
        laserDuration: (seq.laserPercent / 100) * total,
        rightHandDuration: (seq.rightHandPercent / 100) * total,
        completionDelay: (seq.completionPercent / 100) * total,
        laserStartDelay: ((seq.leftHandPercent - 15) / 100) * total,
        rightHandStartDelay: ((seq.leftHandPercent + seq.laserPercent - 25) / 100) * total,
        computerHandRevealDelay: ((seq.leftHandPercent + seq.laserPercent) / 100) * total,
      }
    },

    // Gradient mask settings
    gradientStart: 20,
    gradientEnd: 80,
    maskSize: 200,
  },
  layout: {
    laserStartDefault: 33,
    laserEndDefault: 67.5,
    laserWidth: 2,
    battleContainerWidth: '80%',
    battleContainerPadding: '1.5rem',
    borderRadius: 8,
    borderWidth: 2,
    strokeWidth: 3,
    svgSize: 120,
    cornerRadius: 18,
  },
}
