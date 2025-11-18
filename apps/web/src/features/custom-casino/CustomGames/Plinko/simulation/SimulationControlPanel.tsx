// @ts-nocheck
import React, { useState, useEffect } from 'react'
import {
  getAnimationLibrary,
  generateAnimationsForConfig,
  DEFAULT_SIMULATION_CONFIGS,
} from '../simulation'

interface SimulationControlPanelProps {
  currentRowCount: number
  currentRiskLevel: number
}

export const SimulationControlPanel: React.FC<SimulationControlPanelProps> = ({
  currentRowCount,
  currentRiskLevel,
}) => {
  const [isVisible, setIsVisible] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState('')
  const [stats, setStats] = useState<any>(null)
  const [selectedRowCount, setSelectedRowCount] = useState(currentRowCount)
  const [selectedRiskLevel, setSelectedRiskLevel] = useState(currentRiskLevel)
  const [mode, setMode] = useState<'development' | 'production'>('development')

  const library = getAnimationLibrary()

  // Update stats periodically
  useEffect(() => {
    const updateStats = () => {
      const libraryStats = library.getStats()
      setStats(libraryStats)
    }

    updateStats()
    const interval = setInterval(updateStats, 2000) // Update every 2 seconds

    return () => clearInterval(interval)
  }, [library])

  const handleGenerateAnimations = async () => {
    setIsGenerating(true)
    setProgress('Starting generation...')

    try {
      const config = {
        ...DEFAULT_SIMULATION_CONFIGS[mode],
        rowCount: selectedRowCount,
        riskLevel: selectedRiskLevel,
      }

      setProgress(
        `Generating ${config.animationsPerBucket} animations per bucket for ${selectedRowCount} rows, risk ${selectedRiskLevel}...`
      )

      await generateAnimationsForConfig(selectedRowCount, selectedRiskLevel, mode)

      setProgress('Generation complete!')
      setTimeout(() => setProgress(''), 3000)
    } catch (error) {
      console.error('Generation failed:', error)
      setProgress('Generation failed!')
      setTimeout(() => setProgress(''), 3000)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleClearLibrary = () => {
    if (confirm('Clear entire animation library? This cannot be undone.')) {
      library.clearLibrary()
      setProgress('Library cleared!')
      setTimeout(() => setProgress(''), 2000)
    }
  }

  const getCurrentConfigStats = () => {
    if (!stats) return null
    return stats.byRowCount?.[selectedRowCount]?.[selectedRiskLevel]
  }

  const currentStats = getCurrentConfigStats()

  if (!isVisible) {
    return (
      <div className='fixed top-4 left-4 z-50'>
        <button
          onClick={() => setIsVisible(true)}
          className='px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-lg text-sm'
        >
          🎬 Simulation Panel
        </button>
      </div>
    )
  }

  return (
    <div className='fixed top-4 left-4 z-50 bg-gray-900 text-white p-4 rounded-lg shadow-2xl border border-gray-700 max-w-sm'>
      {/* Header */}
      <div className='flex justify-between items-center mb-4'>
        <h3 className='text-lg font-bold text-purple-400'>🎬 Animation Control</h3>
        <button
          onClick={() => setIsVisible(false)}
          className='text-gray-400 hover:text-white text-lg'
        >
          ×
        </button>
      </div>

      {/* Configuration */}
      <div className='space-y-3 mb-4'>
        <div>
          <label className='block text-sm font-medium mb-1'>Row Count</label>
          <select
            value={selectedRowCount}
            onChange={e => setSelectedRowCount(Number(e.target.value))}
            className='w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-sm'
          >
            {Array.from({ length: 9 }, (_, i) => i + 8).map(rows => (
              <option key={rows} value={rows}>
                {rows} rows
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className='block text-sm font-medium mb-1'>Risk Level</label>
          <select
            value={selectedRiskLevel}
            onChange={e => setSelectedRiskLevel(Number(e.target.value))}
            className='w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-sm'
          >
            <option value={0}>Low Risk</option>
            <option value={1}>Medium Risk</option>
            <option value={2}>High Risk</option>
          </select>
        </div>

        <div>
          <label className='block text-sm font-medium mb-1'>Quality Mode</label>
          <select
            value={mode}
            onChange={e => setMode(e.target.value as 'development' | 'production')}
            className='w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-sm'
          >
            <option value='development'>Development (3 per bucket)</option>
            <option value='production'>Production (10 per bucket)</option>
          </select>
        </div>
      </div>

      {/* Current Config Stats */}
      {currentStats && (
        <div className='mb-4 p-3 bg-gray-800 rounded'>
          <div className='text-sm font-medium mb-2'>Current Config Stats</div>
          <div className='text-xs space-y-1'>
            {Object.entries(currentStats).map(([bucket, bucketStats]: [string, any]) => (
              <div key={bucket} className='flex justify-between'>
                <span>Bucket {bucket}:</span>
                <span className='text-green-400'>{bucketStats.approved}</span>
                <span className='text-yellow-400'>{bucketStats.pending}</span>
                <span className='text-red-400'>{bucketStats.rejected}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Global Stats */}
      {stats && (
        <div className='mb-4 p-3 bg-gray-800 rounded'>
          <div className='text-sm font-medium mb-2'>Global Library Stats</div>
          <div className='grid grid-cols-2 gap-2 text-xs'>
            <div>
              <div className='text-gray-400'>Total</div>
              <div className='font-bold'>{stats.totalAnimations}</div>
            </div>
            <div>
              <div className='text-gray-400'>Approved</div>
              <div className='font-bold text-green-400'>{stats.byQuality.approved}</div>
            </div>
          </div>
        </div>
      )}

      {/* Generation Controls */}
      <div className='space-y-2 mb-4'>
        <button
          onClick={handleGenerateAnimations}
          disabled={isGenerating}
          className='w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded text-sm font-medium transition-colors'
        >
          {isGenerating ? 'Generating...' : 'Generate Animations'}
        </button>

        <div className='text-xs text-gray-400'>
          Will generate {DEFAULT_SIMULATION_CONFIGS[mode].animationsPerBucket} animations per bucket
        </div>
      </div>

      {/* Progress */}
      {progress && (
        <div className='mb-4 p-2 bg-blue-900 bg-opacity-50 rounded text-sm'>{progress}</div>
      )}

      {/* Quick Actions */}
      <div className='space-y-2'>
        <button
          onClick={() => {
            // Generate for all common configurations
            const configs = [
              { rows: 8, risk: 1 },
              { rows: 12, risk: 1 },
              { rows: 16, risk: 1 },
              { rows: 8, risk: 0 },
              { rows: 12, risk: 0 },
              { rows: 16, risk: 0 },
              { rows: 8, risk: 2 },
              { rows: 12, risk: 2 },
              { rows: 16, risk: 2 },
            ]

            const generateAll = async () => {
              setIsGenerating(true)
              for (const config of configs) {
                setProgress(`Generating ${config.rows} rows, risk ${config.risk}...`)
                await generateAnimationsForConfig(config.rows, config.risk, 'development')
              }
              setProgress('All configurations complete!')
              setIsGenerating(false)
              setTimeout(() => setProgress(''), 3000)
            }

            generateAll()
          }}
          disabled={isGenerating}
          className='w-full px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded text-sm transition-colors'
        >
          Generate All Common Configs
        </button>

        <button
          onClick={handleClearLibrary}
          className='w-full px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors'
        >
          Clear Library
        </button>
      </div>

      {/* Instructions */}
      <div className='mt-4 p-2 bg-gray-800 rounded text-xs text-gray-400'>
        <div className='font-medium mb-1'>Quick Start:</div>
        <div>1. Select config above</div>
        <div>2. Click Generate Animations</div>
        <div>3. Animations auto-approve if quality is good</div>
        <div>4. Use Generate All for complete library</div>
      </div>
    </div>
  )
}
