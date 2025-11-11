import { parseEther, parseUnits } from 'viem'

export const unit = parseEther('1')
export const qUnit = parseUnits('1', 60)

interface IQK {
  q: bigint[]
  k: bigint[]
}

function productRange(a: bigint, b: bigint) {
  let prd = a
  let i = a

  while (i < b) {
    i += unit
    prd *= i
    prd = prd / unit
  }
  return prd
}

export function combinations(n: bigint, r: bigint) {
  if (n === r || r === 0n) {
    return unit
  } else {
    r = r < n - r ? n - r : r
    return (productRange(r + unit, n) * unit) / productRange(unit, n - r)
  }
}

export function factorial(num: bigint): bigint {
  if (num === 0n) return 1n
  else return num * factorial(num - 1n)
}

export function nestedForLoops(n: bigint, maxValue: bigint, callback: (indices: bigint[]) => void) {
  const indices = new Array(n).fill(0n)

  function loop(index: bigint) {
    if (index === n) {
      callback(indices)
    } else {
      for (let i = 0n; i <= maxValue; i++) {
        indices[Number(index)] = i
        loop(index + 1n)
      }
    }
  }

  loop(0n)
}

export function generatePermutations(length: number, values: number[]): number[][] {
  const start = Date.now()
  const permutations: number[][] = []
  const totalPermutations = Math.pow(values.length, length) // values.length ^ length
  for (let i = 0; i < totalPermutations; i++) {
    const permutation: number[] = []
    let index = i
    for (let j = 0; j < length; j++) {
      permutation.push(values[index % values.length])
      index = Math.floor(index / values.length)
    }
    permutations.push(permutation.reverse())
  }
  const timeTaken = Date.now() - start
  console.log('qk: Total time taken to create perm: ' + timeTaken + ' milliseconds')
  return permutations
}

export const calculateQSumForQK = (qk: IQK): bigint => {
  return qk.q.reduce((qSum, newValue) => qSum + newValue)
}

export const calculateEVForQK = (qk: IQK): bigint => {
  return qk.q
    .map((qi, index) => (qi * qk.k[index]) / unit)
    .reduce((sum, newEvSlice) => sum + newEvSlice)
}

export const getEffectiveQK = (qk: IQK, feeLoss: bigint, feeMint: bigint): IQK => {
  const effectiveK = qk.k.map(ki => (ki === 0n ? feeLoss : (ki * (unit + feeMint)) / unit))
  return { q: qk.q, k: effectiveK }
}

// Filling means adding an entry with k = 0 or increasing the q of the k = 0 element, to make qSum = 1
export const fillQK = (qk: IQK): IQK => {
  const { q: providedQ, k: providedK } = qk
  // Check if q's sum up to 1, if not, place another entry to the end to complete it to 1 with k = 0
  const qSum = calculateQSumForQK(qk)
  if (qSum < qUnit) {
    // If there is an entry with k = 0, increase it's q value rather than adding a new entry
    if (providedK.includes(0n)) {
      const indexOf0 = providedK.indexOf(0n)
      providedQ[indexOf0] += qUnit - qSum
    } else {
      providedQ.push(qUnit - qSum)
      providedK.push(0n)
    }
  }
  return { q: providedQ, k: providedK }
}

// @NOTE: This minimize do not remove k = 0 pair, it only merges multiple pairs for same k values
export const minimizeQK = (qk: IQK): IQK => {
  const { q, k } = qk
  if (q.length !== k.length) {
    throw new Error('Cannot minimize q and k arrays, if they are not the same length')
  }
  const minimizedQ: bigint[] = []
  const minimizedK = k.reduce((acc: bigint[], current, currentIndex) => {
    if (!acc.includes(current)) {
      acc.push(current)
      minimizedQ.push(q[currentIndex])
    } else {
      const firstIndexOfSameK = acc.indexOf(current)
      minimizedQ[firstIndexOfSameK] += q[currentIndex]
    }
    return acc
  }, [])
  return { q: minimizedQ, k: minimizedK }
}

// @NOTE: Will work for bigint type qk arrays, not sure about if type is decimal
// @NOTE: It sorts it so that k values are increasing
// @NOTE: Reason to indicate that it is BigInt is, in the backend realm, there is Decimal type qks as well because of db, so in the backend we have sortDecimalQK function as well and we have to differentiate them
export const sortBigIntQK = (qk: IQK): IQK => {
  const { q, k } = qk
  if (k.length !== q.length) {
    throw new Error('Arrays must have the same length')
  }

  // Create an array of indices
  const indices = k.map((_, i) => i)

  // Sort the indices based on the values in k
  indices.sort((a, b) => {
    if (k[a] < k[b]) return -1
    if (k[a] > k[b]) return 1
    return 0
  })

  // Create new sorted arrays
  const sortedK = indices.map(i => k[i])
  const sortedQ = indices.map(i => q[i])

  return { q: sortedQ, k: sortedK }
}
