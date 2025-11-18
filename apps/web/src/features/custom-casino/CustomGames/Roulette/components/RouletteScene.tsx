// @ts-nocheck
// import React, { useMemo } from 'react'
// import { type RouletteSceneProps } from '../types'
// import { styled } from 'styled-components'

// const SceneContainer = styled.div<{ $backgroundColor: string }>`
//   width: 100%;
//   height: 100%;
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   justify-content: center;
//   background-color: ${props => props.$backgroundColor};
//   position: relative;
//   overflow: hidden;
// `

// const NumberTile = styled.div<{
//   $isActive: boolean
//   $isWinning: boolean
//   $tileColor: string
//   $winningColor: string
//   $textColor: string
// }>`
//   width: 40px;
//   height: 40px;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   background-color: ${props => (props.$isWinning ? props.$winningColor : props.$tileColor)};
//   color: ${props => props.$textColor};
//   border-radius: 4px;
//   margin: 2px;
//   font-weight: bold;
//   cursor: pointer;
//   transition: all 0.3s ease;

//   ${props =>
//     props.$isActive &&
//     `
//     box-shadow: 0 0 10px ${props.$winningColor};
//     transform: scale(1.1);
//   `}

//   &:hover {
//     opacity: 0.8;
//     transform: scale(1.05);
//   }
// `

// const NumberGrid = styled.div`
//   display: flex;
//   flex-wrap: wrap;
//   gap: 4px;
//   max-width: 600px;
//   justify-content: center;
//   padding: 20px;
// `

// const StatusDisplay = styled.div<{ $textColor: string }>`
//   position: absolute;
//   top: 20px;
//   left: 50%;
//   transform: translateX(-50%);
//   color: ${props => props.$textColor};
//   font-size: 18px;
//   font-weight: bold;
//   text-align: center;
// `

// // const WinningNumberDisplay = styled.div<{
// //   $textColor: string
// //   $winningColor: string
// // }>`
// //   position: absolute;
// //   top: 60px;
// //   left: 50%;
// //   transform: translateX(-50%);
// //   color: ${props => props.$winningColor};
// //   font-size: 24px;
// //   font-weight: bold;
// //   text-align: center;
// //   animation: pulse 1s infinite;

// //   @keyframes pulse {
// //     0% {
// //       opacity: 1;
// //     }
// //     50% {
// //       opacity: 0.7;
// //     }
// //     100% {
// //       opacity: 1;
// //     }
// //   }
// // `

// export const RouletteScene: React.FC<RouletteSceneProps> = ({
//   parameters,
//   winningNumber,
//   isSpinning,
//   placedBets,
//   onBetPlaced,
// }) => {
//   const numbers = useMemo(() => Array.from({ length: 37 }, (_, i) => i), [])

//   console.log('winningNumber', winningNumber)

//   const handleTileClick = (number: number) => {
//     if (isSpinning) return

//     const bet = {
//       type: 'straight' as const,
//       numbers: [number],
//       amount: 1, // Default bet amount
//       position: `straight-${number}`,
//     }

//     onBetPlaced(bet)
//   }

//   const isNumberActive = (_number: number) => {
//     return isSpinning && Math.random() > 0.8 // Simple random highlight for now
//   }

//   const formatNumber = (num: number) => num.toString()

//   return (
//     <SceneContainer $backgroundColor={parameters.backgroundColor || '#000'}>
//       <StatusDisplay $textColor={parameters.textColor}>
//         {isSpinning && 'Spinning...'}
//         {!isSpinning && placedBets.length === 0 && 'Place your bets!'}
//         {!isSpinning && placedBets.length > 0 && 'Ready to spin!'}
//       </StatusDisplay>

//       {/* {winningNumber !== null && !isSpinning && (
//         <WinningNumberDisplay
//           $textColor={parameters.textColor || '#fff'}
//           $winningColor={parameters.winningTileColor || '#ffd700'}
//         >
//           Winning Number: {formatNumber(winningNumber)}
//         </WinningNumberDisplay>
//       )} */}

//       <NumberGrid>
//         {numbers.map(number => (
//           <NumberTile
//             key={number}
//             $isActive={isNumberActive(number)}
//             $isWinning={winningNumber === number}
//             $tileColor={parameters.tileColor || '#2a2a2a'}
//             $winningColor={parameters.winningTileColor || '#ffd700'}
//             $textColor={parameters.textColor || '#fff'}
//             onClick={() => handleTileClick(number)}
//           >
//             {formatNumber(number)}
//           </NumberTile>
//         ))}
//       </NumberGrid>
//     </SceneContainer>
//   )
// }
