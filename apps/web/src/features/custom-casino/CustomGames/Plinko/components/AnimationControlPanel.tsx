// @ts-nocheck
import React, { useState } from 'react'
import {
  getAnimationLibrary,
  generateAnimationsForConfig,
  downloadAnimationsAsJSON,
  DEFAULT_SIMULATION_CONFIGS,
} from '../simulation'

interface AnimationControlPanelProps {
  rowCount: number
  riskLevel: number
}

export const AnimationControlPanel: React.FC<AnimationControlPanelProps> = ({
  rowCount,
  riskLevel,
}) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationMode, setGenerationMode] = useState<'development' | 'production'>('development')
  const [stats, setStats] = useState<any>(null)

  const library = getAnimationLibrary()

  const updateStats = () => {
    const currentStats = library.getStats()
    setStats(currentStats)
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      await generateAnimationsForConfig(rowCount, generationMode)
      updateStats()
    } catch (error) {
      console.error('Animation generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    try {
      downloadAnimationsAsJSON(rowCount)
    } catch (error) {
      console.error('Animation download failed:', error)
    }
  }

  const handleClearLibrary = () => {
    if (confirm('Are you sure you want to clear all animations? This cannot be undone.')) {
      library.clearLibrary()
      updateStats()
    }
  }

  useEffect(() => {
    updateStats()
  }, [rowCount, riskLevel, updateStats])

  const currentConfig = DEFAULT_SIMULATION_CONFIGS[generationMode]
  const currentAnimations = library.getAllAnimations(rowCount)
  const bucketCount = rowCount + 1
  const totalAnimations = Object.values(currentAnimations).reduce(
    (sum, bucket) => sum + bucket.length,
    0
  )
  const approvedAnimations = Object.values(currentAnimations).reduce(
    (sum, bucket) => sum + bucket.filter(anim => anim.quality === 'approved').length,
    0
  )

  return (
    <div
      style={{
        padding: '16px',
        border: '1px solid #333',
        borderRadius: '8px',
        backgroundColor: '#1a1a2e',
        color: '#ffffff',
        fontFamily: 'monospace',
        fontSize: '12px',
      }}
    >
      <h3 style={{ margin: '0 0 16px 0', color: '#4ade80' }}>Animation Control Panel</h3>

      <div style={{ marginBottom: '16px' }}>
        <strong>Configuration:</strong> {rowCount} rows, risk level {riskLevel}
        <br />
        <strong>Buckets:</strong> {bucketCount}
        <br />
        <strong>Current animations:</strong> {totalAnimations} total, {approvedAnimations} approved
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>
          Generation Mode:
          <select
            value={generationMode}
            onChange={e => setGenerationMode(e.target.value as 'development' | 'production')}
            style={{
              marginLeft: '8px',
              padding: '4px',
              backgroundColor: '#333',
              color: '#fff',
              border: '1px solid #555',
              borderRadius: '4px',
            }}
          >
            <option value='development'>
              Development ({currentConfig.animationsPerBucket} per bucket)
            </option>
            <option value='production'>
              Production ({currentConfig.animationsPerBucket} per bucket)
            </option>
          </select>
        </label>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          style={{
            padding: '8px 16px',
            backgroundColor: isGenerating ? '#555' : '#4ade80',
            color: '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: isGenerating ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
          }}
        >
          {isGenerating ? 'Generating...' : 'Generate Animations'}
        </button>

        <button
          onClick={handleDownload}
          disabled={totalAnimations === 0}
          style={{
            padding: '8px 16px',
            backgroundColor: totalAnimations === 0 ? '#555' : '#fbbf24',
            color: '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: totalAnimations === 0 ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
          }}
        >
          Download JSON
        </button>

        <button
          onClick={handleClearLibrary}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Clear Library
        </button>
      </div>

      {isGenerating && (
        <div
          style={{
            padding: '8px',
            backgroundColor: '#333',
            borderRadius: '4px',
            marginBottom: '16px',
          }}
        >
          <div>Generating animations... Check console for progress.</div>
          <div style={{ fontSize: '10px', color: '#888', marginTop: '4px' }}>
            This may take a few seconds. The UI might be unresponsive during generation.
          </div>
        </div>
      )}

      <div style={{ fontSize: '10px', color: '#888' }}>
        <strong>Instructions:</strong>
        <br />
        1. Click &quot;Generate Animations&quot; to create new animations
        <br />
        2. Click &quot;Download JSON&quot; to save animations as a file
        <br />
        3. Place the downloaded file in:{' '}
        <code>src/components/CustomUserCasinos/CustomGames/Plinko/animations/</code>
        <br />
        4. Commit the file to version control for team sharing
      </div>

      {stats && (
        <details style={{ marginTop: '16px' }}>
          <summary style={{ cursor: 'pointer', color: '#4ade80' }}>Library Statistics</summary>
          <pre
            style={{
              fontSize: '10px',
              backgroundColor: '#333',
              padding: '8px',
              borderRadius: '4px',
              marginTop: '8px',
              overflow: 'auto',
            }}
          >
            {JSON.stringify(stats, null, 2)}
          </pre>
        </details>
      )}
    </div>
  )
}
