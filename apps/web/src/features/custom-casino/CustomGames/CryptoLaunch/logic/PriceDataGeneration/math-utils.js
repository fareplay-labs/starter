/**
 * Math utility functions for statistical distributions
 */

/**
 * Beta PDF function
 * BetaPDF(t; alpha, beta) = [t^(alpha-1) * (1-t)^(beta-1)] / B(alpha,beta)
 */
export function betaPdf(t, alpha, beta) {
  if (t < 0 || t > 1) {
    return 0
  }
  const numerator = Math.pow(t, alpha - 1) * Math.pow(1 - t, beta - 1)
  const denominator = betaFunction(alpha, beta)
  return numerator / denominator
}

/**
 * Beta function B(a, b) = Gamma(a) * Gamma(b) / Gamma(a + b)
 */
function betaFunction(a, b) {
  return Math.exp(logGamma(a) + logGamma(b) - logGamma(a + b))
}

/**
 * Log gamma (Γ) approximation
 */
function logGamma(z) {
  const p = [
    676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059,
    12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ]
  const g = 7

  if (z < 0.5) {
    return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * z)) - logGamma(1 - z)
  } else {
    z -= 1
    let x = 0.99999999999980993
    for (let i = 0; i < p.length; i++) {
      x += p[i] / (z + i + 1)
    }
    const t = z + g + 0.5
    return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x) - Math.log(z + 1)
  }
}

/**
 * Quick utility for sampling from a normal distribution
 * using the Box-Muller transform.
 */
export function randNormal(mean, stdDev) {
  const u1 = Math.random()
  const u2 = Math.random()
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2)
  return z0 * stdDev + mean
}

/**
 * Random number between min and max
 */
export function randBetween(min, max) {
  return Math.random() * (max - min) + min
}
