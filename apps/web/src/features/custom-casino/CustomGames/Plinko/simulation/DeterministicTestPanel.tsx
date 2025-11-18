// @ts-nocheck
import React, { useState, useEffect } from 'react'
import {
  getAnimationLibrary,
  generateAnimationsForConfig,
  generateAnimationsForBucket as genBucket,
  downloadAnimationsAsJSON,
  type BallAnimation,
  DEFAULT_SIMULATION_CONFIGS,
} from '.'
import { usePlinkoGameStore } from '../store/PlinkoGameStore'
import {
  STestPanelContainer,
  SHeaderSection,
  SHeaderContent,
  SHeaderIcon,
  SHeaderTextContainer,
  STitle,
  SPlayAllProgress,
  SProgressHeader,
  SProgressDot,
  SProgressLabel,
  SProgressBarContainer,
  SProgressBar,
  SSection,
  SSectionTitle,
  SFormGrid,
  SFormField,
  SLabel,
  SSelect,
  SButtonGrid,
  SButton,
  SProgressDisplay,
  SBucketGrid,
  SBucketButton,
  SBucketStats,
  SEmptyState,
  SAnimationInfo,
  SAnimationHeader,
  SAnimationTitle,
  SAnimationId,
  SAnimationDetails,
  SNavigationControls,
  SNavButton,
  SIndexDisplay,
  SControlsGrid,
  SIconButton,
  SStatsGrid,
  SStatCard,
  SStatLabel,
  SStatValue,
  SStatValueSmall,
  SHorizontalButtonGrid,
} from './DeterministicTestPanel.styles'

interface DeterministicTestPanelProps {
  editMode?: boolean
}

export const DeterministicTestPanel: React.FC<DeterministicTestPanelProps> = () => {
  const store = usePlinkoGameStore()
  const { parameters, isDropping, testSpecificAnimation, updateParameters, resetGame } = store

  // Animation library state
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState('')
  const [stats, setStats] = useState<any>(null)
  const [mode, setMode] = useState<'development' | 'production'>('development')

  // Testing state
  const [selectedBucket, setSelectedBucket] = useState(0)
  const [currentAnimationIndex, setCurrentAnimationIndex] = useState(0)
  const [availableAnimations, setAvailableAnimations] = useState<BallAnimation[]>([])
  const [currentAnimation, setCurrentAnimation] = useState<BallAnimation | null>(null)
  const [isPlayingAll, setIsPlayingAll] = useState(false)
  const [playAllProgress, setPlayAllProgress] = useState({ current: 0, total: 0 })

  // Use store parameters directly
  const selectedRowCount = parameters?.rowCount || 12

  const library = getAnimationLibrary()

  // Update stats periodically
  useEffect(() => {
    const updateStats = () => {
      const libraryStats = library.getStats()
      setStats(libraryStats)
    }

    updateStats()
    const interval = setInterval(updateStats, 2000)
    return () => clearInterval(interval)
  }, [library])

  // Update available animations when bucket, config, or stats change
  useEffect(() => {
    const bucketAnimations = library.getAllAnimations(selectedRowCount)
    const animations = bucketAnimations[selectedBucket] || []
    const approvedAnimations = animations.filter(anim => anim.quality === 'approved')

    setAvailableAnimations(approvedAnimations)
    setCurrentAnimationIndex(0)
    setCurrentAnimation(approvedAnimations[0] || null)
  }, [selectedBucket, selectedRowCount, stats, library])

  // Update current animation when index changes
  useEffect(() => {
    if (availableAnimations.length > 0) {
      setCurrentAnimation(availableAnimations[currentAnimationIndex])
    }
  }, [currentAnimationIndex, availableAnimations])

  const handleGenerateAnimations = async () => {
    setIsGenerating(true)
    try {
      const config = {
        ...DEFAULT_SIMULATION_CONFIGS[mode],
        rowCount: selectedRowCount,
      }

      setProgress(`Generating ${config.animationsPerBucket} animations per bucket...`)
      await generateAnimationsForConfig(selectedRowCount, mode)
      setProgress('Generation complete!')
      setTimeout(() => setProgress(''), 3000)
    } catch (error) {
      console.error('Generation failed:', error)
      setProgress('Generation failed')
      setTimeout(() => setProgress(''), 3000)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadAnimations = () => {
    try {
      downloadAnimationsAsJSON(selectedRowCount)
      setProgress(`Downloaded animations for ${selectedRowCount} rows`)
      setTimeout(() => setProgress(''), 3000)
    } catch (error) {
      console.error('Download failed:', error)
      setProgress('Download failed')
      setTimeout(() => setProgress(''), 3000)
    }
  }

  const playAnimation = async (animation: BallAnimation | null) => {
    if (!animation) return

    try {
      resetGame()
      await new Promise(resolve => setTimeout(resolve, 100))

      await testSpecificAnimation(animation)

      const buffer = 500
      setTimeout(() => {
        resetGame()
      }, animation.duration + buffer)
    } catch (error) {
      console.error('Error playing animation:', error)
    }
  }

  const handlePreviousAnimation = async () => {
    if (availableAnimations.length === 0) return
    const newIndex =
      currentAnimationIndex === 0 ? availableAnimations.length - 1 : currentAnimationIndex - 1
    setCurrentAnimationIndex(newIndex)
    await playAnimation(availableAnimations[newIndex])
  }

  const handleNextAnimation = async () => {
    if (availableAnimations.length === 0) return
    const newIndex = (currentAnimationIndex + 1) % availableAnimations.length
    setCurrentAnimationIndex(newIndex)
    await playAnimation(availableAnimations[newIndex])
  }

  const handleTestAnimation = async () => {
    await playAnimation(currentAnimation)
  }

  const handleDeleteAnimation = async () => {
    if (!currentAnimation) return

    if (confirm(`Delete animation ${currentAnimation.id.slice(-8)}? This cannot be undone.`)) {
      library.deleteAnimation(currentAnimation.id)

      // Update the animation index to stay in bounds
      const newLength = availableAnimations.length - 1
      if (newLength === 0) {
        setCurrentAnimationIndex(0)
      } else if (currentAnimationIndex >= newLength) {
        setCurrentAnimationIndex(newLength - 1)
      }
    }
  }

  const handlePlayAll = async () => {
    if (isPlayingAll) {
      setIsPlayingAll(false)
      return
    }

    setIsPlayingAll(true)

    // Get all animations for current row count
    const allBucketAnimations: BallAnimation[] = []
    const bucketCount = selectedRowCount + 1

    for (let bucket = 0; bucket < bucketCount; bucket++) {
      const bucketAnimations = library.getAllAnimations(selectedRowCount)
      const animations = bucketAnimations[bucket] || []
      const approvedAnimations = animations.filter(anim => anim.quality === 'approved')
      if (approvedAnimations.length > 0) {
        // Add one random animation from each bucket
        const randomIndex = Math.floor(Math.random() * approvedAnimations.length)
        allBucketAnimations.push(approvedAnimations[randomIndex])
      }
    }

    setPlayAllProgress({ current: 0, total: allBucketAnimations.length })

    try {
      for (let i = 0; i < allBucketAnimations.length && isPlayingAll; i++) {
        const animation = allBucketAnimations[i]
        setPlayAllProgress({ current: i + 1, total: allBucketAnimations.length })

        // Set the bucket and play animation
        setSelectedBucket(animation.targetBucket)

        // Small delay to let UI update
        await new Promise(resolve => setTimeout(resolve, 200))

        // Play the animation
        resetGame()
        await new Promise(resolve => setTimeout(resolve, 100))
        await testSpecificAnimation(animation)

        // Wait for animation to complete + viewing time
        const buffer = 500
        await new Promise(resolve => setTimeout(resolve, animation.duration + buffer))

        if (!isPlayingAll) break // Check if cancelled
      }
    } catch (error) {
      console.error('Play all failed:', error)
    } finally {
      setIsPlayingAll(false)
      setPlayAllProgress({ current: 0, total: 0 })
    }
  }

  const bucketCount = selectedRowCount + 1
  const currentBucketStats = stats?.byRowCount?.[selectedRowCount]?.[selectedBucket]

  return (
    <STestPanelContainer>
      <SHeaderSection>
        <SHeaderContent>
          <SHeaderIcon>🎬</SHeaderIcon>
          <SHeaderTextContainer>
            <STitle>Deterministic Test Panel</STitle>
          </SHeaderTextContainer>
        </SHeaderContent>

        {isPlayingAll && (
          <SPlayAllProgress>
            <SProgressHeader>
              <SProgressDot />
              <SProgressLabel>
                Playing All ({playAllProgress.current}/{playAllProgress.total})
              </SProgressLabel>
            </SProgressHeader>
            <SProgressBarContainer>
              <SProgressBar $progress={(playAllProgress.current / playAllProgress.total) * 100} />
            </SProgressBarContainer>
          </SPlayAllProgress>
        )}
      </SHeaderSection>

      {/* Configuration Section */}
      <SSection $variant='config'>
        <SSectionTitle $variant='config'>⚙️ Config</SSectionTitle>
        <SFormGrid>
          <SFormField>
            <SLabel>Rows</SLabel>
            <SSelect
              value={selectedRowCount}
              onChange={e => updateParameters({ rowCount: Number(e.target.value) })}
            >
              {Array.from({ length: 9 }, (_, i) => i + 8).map(rows => (
                <option key={rows} value={rows}>
                  {rows}
                </option>
              ))}
            </SSelect>
          </SFormField>

          <SFormField>
            <SLabel>Mode</SLabel>
            <SSelect
              value={mode}
              onChange={e => setMode(e.target.value as 'development' | 'production')}
            >
              <option value='development'>Dev (3)</option>
              <option value='production'>Prod (10)</option>
            </SSelect>
          </SFormField>
        </SFormGrid>
      </SSection>

      {/* Generation Controls */}
      <SSection $variant='generation'>
        <SSectionTitle $variant='generation'>🔧 Generate</SSectionTitle>
        <SHorizontalButtonGrid>
          <SButton $variant='primary' $disabled={isGenerating} onClick={handleGenerateAnimations}>
            {isGenerating ?
              'Generating...'
            : `Gen ${DEFAULT_SIMULATION_CONFIGS[mode].animationsPerBucket}/Bucket`}
          </SButton>

          <SButton
            $variant='success'
            $disabled={isGenerating}
            onClick={async () => {
              setIsGenerating(true)
              setProgress(`Gen bucket ${selectedBucket}...`)
              await genBucket(selectedRowCount, selectedBucket, mode)
              setProgress('Complete!')
              setIsGenerating(false)
              setTimeout(() => setProgress(''), 3000)
            }}
          >
            Gen Bucket
          </SButton>

          <SButton
            $variant='warning'
            $disabled={isGenerating || stats?.totalAnimations === 0}
            onClick={handleDownloadAnimations}
            title='Download current configuration as JSON'
          >
            📥 JSON
          </SButton>
        </SHorizontalButtonGrid>

        {progress && <SProgressDisplay>{progress}</SProgressDisplay>}
      </SSection>

      {/* Bucket Selection */}
      <SSection $variant='bucket'>
        <SSectionTitle $variant='bucket'>🎯 Buckets</SSectionTitle>
        <SBucketGrid>
          {Array.from({ length: bucketCount }, (_, i) => (
            <SBucketButton
              key={i}
              $isSelected={selectedBucket === i}
              onClick={() => setSelectedBucket(i)}
            >
              {i}
            </SBucketButton>
          ))}
        </SBucketGrid>

        {currentBucketStats && (
          <SBucketStats>
            #{selectedBucket}: {currentBucketStats.approved}✓ {currentBucketStats.pending}⏳{' '}
            {currentBucketStats.rejected}✗
          </SBucketStats>
        )}
      </SSection>

      {/* Animation Testing */}
      <SSection $variant='testing'>
        <SSectionTitle $variant='testing'>🎮 Test</SSectionTitle>

        {availableAnimations.length === 0 ?
          <SEmptyState>No animations for bucket {selectedBucket}</SEmptyState>
        : <div>
            {/* Current Animation Info */}
            <SAnimationInfo>
              <SAnimationHeader>
                <SAnimationTitle>
                  {currentAnimationIndex + 1}/{availableAnimations.length}
                </SAnimationTitle>
                <SAnimationId>#{currentAnimation?.id.slice(-8)}</SAnimationId>
              </SAnimationHeader>

              {currentAnimation && (
                <SAnimationDetails>
                  <div>
                    {Math.round(currentAnimation.duration)}ms • {currentAnimation.keyframes.length}{' '}
                    frames
                  </div>
                </SAnimationDetails>
              )}
            </SAnimationInfo>

            {/* Navigation Controls */}
            <SNavigationControls>
              <SNavButton
                $disabled={availableAnimations.length <= 1}
                onClick={handlePreviousAnimation}
              >
                ←
              </SNavButton>

              <SIndexDisplay>{currentAnimationIndex}</SIndexDisplay>

              <SNavButton $disabled={availableAnimations.length <= 1} onClick={handleNextAnimation}>
                →
              </SNavButton>
            </SNavigationControls>

            {/* Test Controls */}
            <SButtonGrid>
              <SControlsGrid>
                <SButton
                  $variant='gradient'
                  $disabled={isDropping || !currentAnimation || isPlayingAll}
                  onClick={handleTestAnimation}
                  style={{ flex: 1 }}
                >
                  {isDropping ? '⏳' : '▶️'}
                </SButton>

                <SIconButton $variant='secondary' $disabled={isPlayingAll} onClick={resetGame}>
                  🔄
                </SIconButton>

                <SIconButton
                  $variant='error'
                  $disabled={!currentAnimation || isPlayingAll}
                  onClick={handleDeleteAnimation}
                >
                  🗑️
                </SIconButton>
              </SControlsGrid>

              <SButton
                $variant={isPlayingAll ? 'error' : 'gradient'}
                $disabled={isDropping}
                onClick={handlePlayAll}
              >
                {isPlayingAll ? '⏹️ Stop' : '🎬 Play All'}
              </SButton>
            </SButtonGrid>
          </div>
        }
      </SSection>

      {/* Library Statistics */}
      {stats && (
        <SSection $variant='stats'>
          <SSectionTitle $variant='stats'>📊 Stats</SSectionTitle>

          <SStatsGrid>
            <SStatCard $variant='default'>
              <SStatLabel>Total</SStatLabel>
              <SStatValue $variant='default'>{stats.totalAnimations}</SStatValue>
            </SStatCard>

            <SStatCard $variant='success'>
              <SStatLabel>Approved</SStatLabel>
              <SStatValue $variant='success'>{stats.byQuality.approved}</SStatValue>
            </SStatCard>
          </SStatsGrid>

          <SStatsGrid>
            <SStatCard $variant='warning'>
              <SStatLabel>Pending</SStatLabel>
              <SStatValueSmall $variant='warning'>{stats.byQuality.pending}</SStatValueSmall>
            </SStatCard>

            <SStatCard $variant='error'>
              <SStatLabel>Rejected</SStatLabel>
              <SStatValueSmall $variant='error'>{stats.byQuality.rejected}</SStatValueSmall>
            </SStatCard>
          </SStatsGrid>

          <SButton
            $variant='error'
            $disabled={isPlayingAll}
            onClick={() => {
              if (confirm('Clear library?')) {
                library.clearLibrary()
                setProgress('Cleared!')
                setTimeout(() => setProgress(''), 2000)
              }
            }}
          >
            🧹 Clear
          </SButton>

          <SButton
            $variant='warning'
            $disabled={isPlayingAll}
            onClick={() => {
              const summary = library.scrubAndReassignMismatched()
              setProgress(`Scrubbed: moved ${summary.moved}/${summary.checked}`)
              setTimeout(() => setProgress(''), 4000)
            }}
          >
            🧹 Scrub
          </SButton>
        </SSection>
      )}
    </STestPanelContainer>
  )
}
