// @TODO: Consider using web workers for this part because this could get complicated pretty easily
// @TODO: What I could also do is, cache outcomes. Rather than creating all 1 million of outcomes and process one by one, create 10k outcomes and process those and afterwards create the new 10k outcomes and process them
// @TODO: For above thing to make sense (because it basically decreases the RAM needed), we probably have to add q and ks in a smart manner rather than creating q and k arrays in length of the total outcome count
// @TODO: First line is about improving CPU usage, Line 2 and 3 are about using less RAM. I dont directly know the bottle neck yet. Also, it is not worth to implement these imporvements yet because we are not sure about the decision of using this yet
// @TODO: Looks like if we play rps with 20 count, it actually runs out of memory, so that is a bottle neck for sure
// const processOutcomesAndBuildQK = (
//   outcomes: number[][],
//   providedQ: bigint[],
//   // @TODO: Make sure providedK has k for 0 and does not have any same values. Because, kToMs work on the k indexes
//   providedK: bigint[],
//   stopLossCoefficient: bigint, // should be provided in terms of c (cost per flip) so if entry cost is 100, with 5 flips, c (cost of flip) is 20. If you want to stop after one loss, you should provide 1
//   stopGainCoefficient: bigint // same as above // @TODO: maybe consider doing that conversion inside this? not sure
// ) => {
//   const start = Date.now()
//   // if stopGainCoefficient or stopLossCoefficient is 0, understand that it is not used
//   const deltaK = providedK.map(val => val - unit)
//   const q: bigint[] = Array(outcomes.length).fill(unit)
//   const k: bigint[] = []
//   const kToMs: IKToMs = {}
//   for (let outcomeCount = 0; outcomeCount < outcomes.length; outcomeCount++) {
//     const m: number[] = Array(providedK.length).fill(0)
//     const outcome = outcomes[outcomeCount]
//     let delta = 0n
//     for (
//       let flipCountToProcessForOutcome = 0;
//       flipCountToProcessForOutcome < outcome.length;
//       flipCountToProcessForOutcome++
//     ) {
//       const flipsResultIndex = outcome[flipCountToProcessForOutcome]
//       // console.log('qk: flipResultIndex: ', flipsResultIndex)
//       // @TODO: Test this
//       if (stopGainCoefficient !== 0n) {
//         if (delta >= stopGainCoefficient) {
//           // if it triggered after processing the last one, do not process the stop
//           // Continue building the q[i] before breaking
//           for (let l = flipCountToProcessForOutcome; l < outcome.length; l++) {
//             q[outcomeCount] *= providedQ[flipsResultIndex]
//             delta -= unit / 100n
//             // @TODO: Fill the m array as if it is stopped lossed (maybe, we understand that there is a stop loss or stop gain, when m values do not add up to the length of a permutation?)
//           }
//           break
//         }
//       }
//       // @TODO: Test this
//       if (stopLossCoefficient !== 0n) {
//         // @TODO: Looks like this if is wrong because these are negative values check flipping twice with amount = 100, stop loss = 15 and stop loss = 25 (I believe stop loss = 25 is not working properly)
//         // @TODO: Maybe if it is the last one, skip stop loss check? would that work? Maybe not
//         if (delta <= stopLossCoefficient) {
//           // if it triggered after processing the last one, do not process the stop
//           // Continue building the q[i] and delta before breaking
//           for (let l = flipCountToProcessForOutcome; l < outcome.length; l++) {
//             q[outcomeCount] *= providedQ[flipsResultIndex]
//             delta -= unit / 100n
//             // @TODO: Fill the m array as if it is stopped lossed (maybe, we understand that there is a stop loss or stop gain, when m values do not add up to the length of a permutation?)
//           }
//           break
//         }
//       }
//       // @TODO: Problem is that we are adding the q k for again
//       q[outcomeCount] *= providedQ[flipsResultIndex]
//       delta += deltaK[flipsResultIndex]
//       m[flipsResultIndex]++
//     }
//     // console.log('qk: m: ', m)
//     k[outcomeCount] = (delta + unit * BigInt(outcome.length)) / BigInt(outcome.length)
//     // kToMs[String(k[outcomeCount])] ?
//     //   kToMs[String(k[outcomeCount])].push(m)
//     // : (kToMs[String(k[outcomeCount])][0] = m)
//     const existingMs = kToMs[String(k[outcomeCount])]
//     if (existingMs) {
//       kToMs[String(k[outcomeCount])].push(m)
//     } else {
//       kToMs[String(k[outcomeCount])] = Array.from({ length: 1 }, () => m)
//     }
//     q[outcomeCount] /= unit ** BigInt(outcome.length)
//   }
//   console.log('qk: kToMs: ', kToMs)
//   const { q: minimizedQ, k: minimizedK } = minimizeQK(q, k)
//   const readableQ = minimizedQ.map(qi => formatEther(String(qi)))
//   const readableK = minimizedK.map(ki => formatEther(String(ki)))
//   // const readableQ = minimizedQ.reverse().map(qi => formatEther(String(qi)))
//   // const readableK = minimizedK.reverse().map(ki => formatEther(String(ki)))
//   let evSum = 0n
//   for (let i = 0; i < minimizedQ.length; i++) {
//     evSum += (minimizedQ[i] * minimizedK[i]) / unit
//   }
//   // @TODO: probably require evSum to be below 0.99 (or the value received from the smart contract)
//   // @TODO: probably check the qSum as well
//   console.log('qk: rough ', readableQ, readableK)
//   console.log('qk: rough evSum: ', formatEther(evSum))
//   const timeTaken = Date.now() - start
//   console.log('qk: Total time taken : ' + timeTaken + ' milliseconds')
//   return { q: minimizedQ, k: minimizedK, kToMs }
// }
//
// @NOTE: Maybe, if stopLoss and stopGain are 0, consider using `updateQKForMultipleFlips()` to come up with the q and k values faster than `processOutcomesAndBuildQK` but not sure if it makes sense to keep 2 different versions for this gain of speed (probably does not)
// const { q: filledQ, k: filledK } = fillProvidedQK(q, k)
// @TODO: Make sure `fillProvidedQK()` return q and k so that k does not have duplicate values (not minimized tho, because we want the 0 to be there)
// console.log(
//   'qk: generated permutations: ',
//   generatePermutations(
//     Number(count),
//     Array.from({ length: filledK.length }, (_, i) => i)
//   )
// )
// return processOutcomesAndBuildQK(
//   generatePermutations(
//     Number(count),
//     Array.from({ length: filledK.length }, (_, i) => i)
//   ),
//   filledQ,
//   filledK,
//   stopLoss,
//   stopGain
// )
//
// For coin flip if you play with the following counts, the evSum will not be exactly 0.99, it will be just a little less
// 7, 13, 14, 17, 18, 19, 20
// What we can technically do to resolve this is, maybe find highest K value, try increasing it's Q value by one and check if evSum exceeds 0.99, if it exceeds, try with next highest K value. If it does not, update the Q array and re call this
// }

// @NOTE: Is more efficient than `processOutcomesAndBuildQK` which processes each permutation
// @NOTE: But this does not support stop gain or stop loss, because it does not care about the order when calculating
// @NOTE: It only takes in consideration the amount of outcomes for a specific set of result
// @NOTE: So, it does not simulate and find the result as `processOutcomesAndBuildQK`, this uses a formula to quickly come up with the result
