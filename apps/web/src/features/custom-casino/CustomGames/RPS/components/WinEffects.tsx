// @ts-nocheck
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { styled } from 'styled-components'

interface WinEffectsProps {
  isVisible: boolean
  isWin: boolean | null
  isDraw?: boolean
  winColor: string
  loseColor: string
  payout?: number
  showResultText?: boolean
  showParticles?: boolean
}

const EffectContainer = styled(motion.div)`
  position: absolute;
  top: 15%;
  left: 50%;
  transform: translate(-50%, 0);
  pointer-events: none;
  z-index: 20;
`

const ResultText = styled(motion.div)<{ $isWin: boolean }>`
  font-size: 72px;
  font-weight: bold;
  color: ${props => props.$isWin ? props.theme?.winColor || '#2ecc71' : props.theme?.loseColor || '#e74c3c'};
  text-shadow: 0 0 20px currentColor;
  text-align: center;
  user-select: none;
`

const PayoutText = styled(motion.div)`
  font-size: 32px;
  font-weight: bold;
  color: white;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  text-align: center;
  margin-top: 16px;
`

const Particle = styled(motion.div)<{ $color: string }>`
  position: absolute;
  width: 8px;
  height: 8px;
  background: ${props => props.$color};
  border-radius: 50%;
`

const particleVariants = {
  initial: { scale: 0, opacity: 1 },
  animate: (i: number) => ({
    scale: [0, 1, 0],
    opacity: [1, 1, 0],
    x: Math.cos((i / 12) * Math.PI * 2) * 150,
    y: Math.sin((i / 12) * Math.PI * 2) * 150,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
    },
  }),
}

export const WinEffects: React.FC<WinEffectsProps> = ({
  isVisible,
  isWin,
  isDraw,
  winColor,
  loseColor,
  payout,
  showResultText = true,
  showParticles = true,
}) => {
  const isDrawResult = Boolean(isDraw)
  const resultColor = isDrawResult ? '#ffffff' : (isWin ? winColor : loseColor)
  const resultText = isDrawResult ? 'DRAW' : (isWin ? 'WIN' : 'LOSE')

  return (
    <AnimatePresence>
      {isVisible && (
        <EffectContainer>
          {/* Result Text (optional) */}
          {showResultText && (
            <ResultText
              $isWin={isWin ?? false}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1.2, 1],
                opacity: 1,
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{ color: resultColor }}
            >
              {resultText}
            </ResultText>
          )}

          {/* Payout Text */}
          {payout !== undefined && payout > 0 && (
            <PayoutText
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              +{payout}
            </PayoutText>
          )}

          {/* Particles for win (toggleable) */}
          {isWin && showParticles && (
            <>
              {Array.from({ length: 12 }).map((_, i) => (
                <Particle
                  key={i}
                  $color={winColor}
                  custom={i}
                  initial="initial"
                  animate="animate"
                  variants={particleVariants}
                  style={{
                    top: '50%',
                    left: '50%',
                    marginLeft: -4,
                    marginTop: -4,
                  }}
                />
              ))}
            </>
          )}
        </EffectContainer>
      )}
    </AnimatePresence>
  )
}
