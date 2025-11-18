// @ts-nocheck
import React, { useCallback, useEffect, useMemo, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import { styled } from 'styled-components'
import { useCardsSound } from '../hooks/useCardsSound'

interface PackSleeveProps {
  packType: number
  isVisible: boolean
  isOpen: boolean
  onClick?: () => void // fallback simple open
  onCutComplete?: () => void // called after successful slice gesture
}

export interface PackSleeveHandle {
  triggerAutoCut: () => void
}

const SleeveContainer = styled.div<{ $isVisible: boolean; $isOpen: boolean; $hide?: boolean }>`
  position: absolute;
  bottom: ${props =>
    props.$isOpen ? '-100%'
    : props.$isVisible ? '-25%'
    : '-100%'};
  left: 50%;
  transform: translateX(-50%);
  width: 240px;
  height: 320px;
  transition: bottom 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  z-index: 10;
  /* Hide completely after animations */
  display: ${props => (props.$hide ? 'none' : 'block')};
`

const SleeveBody = styled.div<{ $packType: number }>`
  width: 100%;
  height: 100%;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  /* No background or shadow - let the top and bottom sections handle it */

  &:hover {
    transform: scale(1.02);
    transition: transform 0.2s ease;
  }
`

const BaseCutLine = styled.div`
  position: absolute;
  top: -2px; /* Position at the top edge of BottomSection */
  left: 0;
  right: 0;
  height: 2px;
  border-radius: 1px;
  pointer-events: none;
  opacity: 0.8;
  background: repeating-linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.9) 0 10px,
    rgba(0, 0, 0, 0) 10px 16px
  );
`

const saberGlow = `
  0 0 6px rgba(255, 255, 255, 0.9),
  0 0 14px rgba(78, 197, 255, 0.8),
  0 0 22px rgba(172, 0, 230, 0.6),
  inset 0 0 6px rgba(255, 255, 255, 0.6)
`

const saberAnim = `
  background-size: 200% 100%;
  animation: saberMove 1.2s linear infinite;
  @keyframes saberMove {
    0% { background-position: 0% 0; }
    100% { background-position: -200% 0; }
  }
`

const CutOverlay = styled.div<{
  $side: 'left' | 'right'
  $progress: number // 0..1
  $active: boolean
  $animated: boolean
}>`
  position: absolute;
  top: -3px; /* Position at the top edge of BottomSection, overlapping the cut line */
  ${p => (p.$side === 'left' ? 'left: 0;' : 'right: 0;')}
  width: ${p => `${Math.max(0, Math.min(1, p.$progress)) * 100}%`};
  height: 4px;
  border-radius: 3px;
  pointer-events: none;
  opacity: ${p => (p.$active ? 1 : 0)};
  background: ${p =>
    p.$animated ?
      'linear-gradient(90deg, rgba(160,220,255,0.1), rgba(255,255,255,1), rgba(160,220,255,0.1))'
    : 'linear-gradient(90deg, rgba(200,240,255,0.7), rgba(255,255,255,0.95), rgba(200,240,255,0.7))'};
  box-shadow: ${p =>
    p.$animated ? saberGlow : '0 0 6px rgba(255,255,255,0.85), 0 0 10px rgba(160,220,255,0.6)'};
  ${p => (p.$animated ? saberAnim : '')}
  transition: opacity 120ms ease;
`

const TopSection = styled.div<{
  $packType: number
  $cutProgress: number // 0 to 1
  $dissolving: boolean
}>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 66px; /* Just above the cut line at 64px */
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  pointer-events: none;
  z-index: 2;
  overflow: hidden; /* Prevent content from showing outside bounds */

  /* Base background matching the pack */
  background: ${p => {
    switch (p.$packType) {
      case 0:
        return 'linear-gradient(135deg, #4a5568, #2d3748)'
      case 1:
        return 'linear-gradient(135deg, #9f7aea, #805ad5)'
      case 2:
        return 'linear-gradient(135deg, #f6e05e, #ecc94b)'
      default:
        return 'linear-gradient(135deg, #4a5568, #2d3748)'
    }
  }};

  box-shadow: none;

  /* Smooth transition when not dissolving, animation when dissolving */
  transition: ${p => (p.$dissolving ? 'none' : 'opacity 150ms ease-out')};
  transform-origin: 50% 100%; /* pivot around the “feet” */
  will-change: transform, opacity;

  ${p =>
    p.$dissolving ?
      `
  animation: fallBounce 1.05s forwards;
  z-index: 15;
`
    : ''}

  @keyframes fallBounce {
    0% {
      transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
      opacity: 1;
    }
    100% {
      transform: translate3d(0, 220px, 0) rotate(-14deg) scale(1);
      opacity: 1;
    }
  }

  /* Texture overlay */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.095) 45%,
      transparent 45%,
      transparent 55%,
      rgba(255, 255, 255, 0.1) 55%,
      rgba(255, 255, 255, 0.125)
    );
    background-size: 20px 20px;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
  }

  /* Light border overlay */
  &::after {
    content: '';
    position: absolute;
    top: 4px;
    left: 4px;
    right: 4px;
    bottom: 4px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 10px;
    pointer-events: none;
    z-index: 1;
  }
`

const BottomSection = styled.div<{
  $packType: number
  $cutProgress: number
  $slideDown: boolean
}>`
  position: absolute;
  /* When no cut progress, fill entire sleeve. When cutting, start below the cut line */
  top: ${p => (p.$cutProgress > 0.1 ? '66px' : '0')};
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: ${p => (p.$cutProgress > 0.1 ? '0 0 12px 12px' : '12px')};
  overflow: hidden;

  /* Shadow only on the full sleeve, not when split */
  box-shadow: ${p => (p.$cutProgress > 0.1 ? 'none' : '0 8px 24px rgba(0, 0, 0, 0.4)')};

  ${p =>
    p.$slideDown ?
      `
    animation: slideDown 0.6s ease-out forwards;
    animation-delay: 0.8s;
  `
    : ''}

  @keyframes slideDown {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(120%);
      opacity: 0;
    }
  }

  /* Match the pack gradient */
  background: ${p => {
    switch (p.$packType) {
      case 0:
        return 'linear-gradient(135deg, #4a5568, #2d3748)'
      case 1:
        return 'linear-gradient(135deg, #9f7aea, #805ad5)'
      case 2:
        return 'linear-gradient(135deg, #f6e05e, #ecc94b)'
      default:
        return 'linear-gradient(135deg, #4a5568, #2d3748)'
    }
  }};

  /* Texture overlay */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.095) 45%,
      transparent 45%,
      transparent 55%,
      rgba(255, 255, 255, 0.1) 55%,
      rgba(255, 255, 255, 0.125)
    );
    background-size: 20px 20px;
  }

  /* Light border overlay */
  &::after {
    content: '';
    position: absolute;
    top: 4px;
    left: 4px;
    right: 4px;
    bottom: 4px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    /* border-radius: ${p => (p.$cutProgress > 0.1 ? '0 0 10px 10px' : '10px')}; */
    border-radius: 10px;
    pointer-events: none;
    z-index: 1;
  }
`

const PackLabel = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
  letter-spacing: 0.05em;
  z-index: 2;
`

const packNames = {
  0: 'EXPLORER',
  1: 'CHALLENGER',
  2: 'CRYPTONAUGHT',
}

export const PackSleeve = forwardRef<PackSleeveHandle, PackSleeveProps>(({
  packType,
  isVisible,
  isOpen,
  onClick,
  onCutComplete,
}, ref) => {
  const bodyRef = useRef<HTMLDivElement | null>(null)
  const { playSound } = useCardsSound()
  const [isCutting, setIsCutting] = useState(false)
  const [activeSide, setActiveSide] = useState<'left' | 'right' | null>(null)
  const [leftProgress, setLeftProgress] = useState(0) // 0..1
  const [rightProgress, setRightProgress] = useState(0) // 0..1
  const [separated, setSeparated] = useState(false)
  const [slideBottom, setSlideBottom] = useState(false)
  const [hideSleeve, setHideSleeve] = useState(false)

  const computeNormX = useCallback((clientX: number): number | null => {
    const el = bodyRef.current
    if (!el) return null
    const rect = el.getBoundingClientRect()
    const norm = (clientX - rect.left) / rect.width
    return Math.max(0, Math.min(1, norm))
  }, [])

  const onWindowDown = useCallback(
    (e: PointerEvent) => {
      // Don't start cutting if sleeve is not visible, already open, hidden, or separated
      if (!isVisible || isOpen || hideSleeve || separated) return
      const norm = computeNormX(e.clientX)
      if (norm == null) return
      setIsCutting(true)
      setActiveSide(norm <= 0.5 ? 'left' : 'right')
    },
    [computeNormX, isVisible, isOpen, hideSleeve, separated]
  )

  const onWindowMove = useCallback(
    (e: PointerEvent) => {
      if (!isCutting) return
      const norm = computeNormX(e.clientX)
      if (norm == null) return
      if (activeSide === 'left') {
        setLeftProgress(prev => Math.max(prev, norm))
      } else if (activeSide === 'right') {
        setRightProgress(prev => Math.max(prev, 1 - norm))
      }
    },
    [isCutting, activeSide, computeNormX]
  )

  const onWindowUp = useCallback(
    (e: PointerEvent) => {
      // Don't process if not cutting or sleeve is already gone
      if (!isCutting || hideSleeve || separated) return

      // Check if this was just a click (no significant movement)
      const endNorm = computeNormX(e.clientX)
      const wasClick = leftProgress < 0.1 && rightProgress < 0.1

      setIsCutting(false)
      setActiveSide(null)

      // If it was a click, auto-complete the cut
      if (wasClick && endNorm !== null) {
        // Play pack open sound when cut starts
        playSound('packOpen')
        // Animate the cut progress quickly
        let progress = 0
        const animateInterval = setInterval(() => {
          progress += 0.15
          setLeftProgress(Math.min(0.5, progress * 0.5))
          setRightProgress(Math.min(0.5, progress * 0.5))

          if (progress >= 2) {
            clearInterval(animateInterval)
            // Trigger separation
            setSeparated(true)
            setSlideBottom(true)

            setTimeout(() => {
              setHideSleeve(true)
              onCutComplete?.()
              if (!onCutComplete && onClick) onClick()
            }, 1450)
          }
        }, 30)
      }
      // Otherwise check if manual cut is complete
      else if (leftProgress + rightProgress >= 1 || leftProgress >= 1 || rightProgress >= 1) {
        // Play pack open sound when cut completes
        playSound('packOpen')
        setSeparated(true)
        // Start bottom slide immediately (it has its own delay)
        setSlideBottom(true)

        setTimeout(() => {
          setHideSleeve(true)
          onCutComplete?.()
          if (!onCutComplete && onClick) onClick()
        }, 1450) // 1.05s fall + 0.8s delay + 0.6s slide
      }
    },
    [isCutting, leftProgress, rightProgress, onCutComplete, onClick, computeNormX, playSound, hideSleeve, separated]
  )

  // Attach global pointer listeners while sleeve is visible and not open or already cut
  useEffect(() => {
    // Don't attach listeners if sleeve is not visible, already open, hidden, or separated
    if (!isVisible || isOpen || hideSleeve || separated) return
    
    window.addEventListener('pointerdown', onWindowDown)
    window.addEventListener('pointermove', onWindowMove)
    window.addEventListener('pointerup', onWindowUp)
    return () => {
      window.removeEventListener('pointerdown', onWindowDown)
      window.removeEventListener('pointermove', onWindowMove)
      window.removeEventListener('pointerup', onWindowUp)
    }
  }, [isVisible, isOpen, hideSleeve, separated, onWindowDown, onWindowMove, onWindowUp])

  // Auto-trigger function for programmatic cut
  const triggerAutoCut = useCallback(() => {
    if (!isVisible || isOpen) return
    
    // Play pack open sound when auto-cut starts
    playSound('packOpen')
    
    // Animate the cut progress
    let progress = 0
    const animateInterval = setInterval(() => {
      progress += 0.15
      setLeftProgress(Math.min(0.5, progress * 0.5))
      setRightProgress(Math.min(0.5, progress * 0.5))

      if (progress >= 2) {
        clearInterval(animateInterval)
        // Trigger separation
        setSeparated(true)
        setSlideBottom(true)

        setTimeout(() => {
          setHideSleeve(true)
          onCutComplete?.()
          if (!onCutComplete && onClick) onClick()
        }, 1450)
      }
    }, 30)
  }, [isVisible, isOpen, onCutComplete, onClick, playSound])

  // Expose auto-trigger function via ref
  useImperativeHandle(ref, () => ({
    triggerAutoCut
  }), [triggerAutoCut])

  // Reset progress when sleeve becomes invisible or after open completes
  useEffect(() => {
    if (!isVisible || isOpen) {
      setLeftProgress(0)
      setRightProgress(0)
      setIsCutting(false)
      setActiveSide(null)
      setSeparated(false)
      setSlideBottom(false)
      setHideSleeve(false)
    }
  }, [isVisible, isOpen])

  const showLeftGlow = useMemo(() => leftProgress > 0, [leftProgress])
  const showRightGlow = useMemo(() => rightProgress > 0, [rightProgress])
  const cutProgress = useMemo(
    () => Math.min(1, leftProgress + rightProgress),
    [leftProgress, rightProgress]
  )

  return (
    <SleeveContainer $isVisible={isVisible} $isOpen={isOpen} $hide={hideSleeve}>
      <SleeveBody $packType={packType} ref={bodyRef} aria-label='Pack Sleeve' role='button'>
        {/* Top section that separates and dissolves */}
        <TopSection $packType={packType} $cutProgress={cutProgress} $dissolving={separated}>
          <PackLabel>{packNames[packType as 0 | 1 | 2]}</PackLabel>
        </TopSection>

        {/* Bottom section slides down after top fades */}
        <BottomSection $packType={packType} $cutProgress={cutProgress} $slideDown={slideBottom}>
          {/* Cut line and effects - move with the bottom section */}
          <BaseCutLine />
          <CutOverlay
            $side='left'
            $progress={leftProgress}
            $active={showLeftGlow}
            $animated={activeSide === 'left' && isCutting}
          />
          <CutOverlay
            $side='right'
            $progress={rightProgress}
            $active={showRightGlow}
            $animated={activeSide === 'right' && isCutting}
          />
        </BottomSection>
      </SleeveBody>
    </SleeveContainer>
  )
})
