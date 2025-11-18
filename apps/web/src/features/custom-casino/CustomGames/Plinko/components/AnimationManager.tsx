// @ts-nocheck
import React, { useState, useEffect } from 'react'
import { getAnimationLibrary, generateAnimationsForConfig, type BallAnimation } from '../simulation'

interface AnimationManagerProps {
  rowCount: number
}

export const AnimationManager: React.FC<AnimationManagerProps> = ({ rowCount }) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [selectedBucket, setSelectedBucket] = useState<number>(0)
  const [animations, setAnimations] = useState<BallAnimation[]>([])
  const [previewAnimation, setPreviewAnimation] = useState<BallAnimation | null>(null)

  const library = getAnimationLibrary()

  // Load stats and animations
  useEffect(() => {
    updateStats()
    loadAnimations()
  }, [rowCount])

  const updateStats = () => {
    const libraryStats = library.getStats()
    setStats(libraryStats)
  }

  const loadAnimations = () => {
    const bucketAnimations = library.getAllAnimations(rowCount)
    const bucketAnims = bucketAnimations[selectedBucket] || []
    setAnimations(bucketAnims)
  }

  const handleGenerateAnimations = async () => {
    setIsGenerating(true)
    try {
      await generateAnimationsForConfig(rowCount, 'development')
      updateStats()
      loadAnimations()
    } catch (error) {
      console.error('Failed to generate animations:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleUpdateQuality = (
    animationId: string,
    quality: 'approved' | 'pending' | 'rejected'
  ) => {
    library.updateAnimationQuality(animationId, quality)
    updateStats()
    loadAnimations()
  }

  const handleDeleteAnimation = (animationId: string) => {
    if (confirm('Are you sure you want to delete this animation?')) {
      library.deleteAnimation(animationId)
      updateStats()
      loadAnimations()
    }
  }

  const handleBucketChange = (bucket: number) => {
    setSelectedBucket(bucket)
    // Load animations for this bucket will be handled by useEffect
  }

  useEffect(() => {
    loadAnimations()
  }, [selectedBucket])

  const bucketCount = rowCount + 1
  const currentBucketStats = stats?.byRowCount?.[rowCount]?.[selectedBucket]

  return (
    <div className='p-6 bg-gray-800 text-white rounded-lg'>
      <div className='mb-6'>
        <h2 className='text-2xl font-bold mb-2'>Animation Library Manager</h2>
        <p className='text-gray-300'>Managing animations for {rowCount} rows (risk-agnostic)</p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className='mb-6 p-4 bg-gray-700 rounded'>
          <h3 className='text-lg font-semibold mb-2'>Library Statistics</h3>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
            <div>
              <div className='text-gray-400'>Total Animations</div>
              <div className='text-xl font-bold'>{stats.totalAnimations}</div>
            </div>
            <div>
              <div className='text-gray-400'>Approved</div>
              <div className='text-xl font-bold text-green-400'>{stats.byQuality.approved}</div>
            </div>
            <div>
              <div className='text-gray-400'>Pending</div>
              <div className='text-xl font-bold text-yellow-400'>{stats.byQuality.pending}</div>
            </div>
            <div>
              <div className='text-gray-400'>Rejected</div>
              <div className='text-xl font-bold text-red-400'>{stats.byQuality.rejected}</div>
            </div>
          </div>
        </div>
      )}

      {/* Generation Controls */}
      <div className='mb-6 p-4 bg-gray-700 rounded'>
        <h3 className='text-lg font-semibold mb-2'>Generate Animations</h3>
        <p className='text-gray-300 text-sm mb-3'>
          Generate 3 animations per bucket for development testing (risk-agnostic)
        </p>
        <button
          onClick={handleGenerateAnimations}
          disabled={isGenerating}
          className='px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded transition-colors'
        >
          {isGenerating ? 'Generating...' : 'Generate Animations'}
        </button>
      </div>

      {/* Bucket Selection */}
      <div className='mb-6'>
        <h3 className='text-lg font-semibold mb-2'>Select Bucket</h3>
        <div className='flex flex-wrap gap-2'>
          {Array.from({ length: bucketCount }, (_, i) => (
            <button
              key={i}
              onClick={() => handleBucketChange(i)}
              className={`px-3 py-2 rounded text-sm transition-colors ${
                selectedBucket === i ? 'bg-blue-600 text-white' : (
                  'bg-gray-600 hover:bg-gray-500 text-gray-200'
                )
              }`}
            >
              Bucket {i}
            </button>
          ))}
        </div>

        {currentBucketStats && (
          <div className='mt-2 text-sm text-gray-400'>
            Bucket {selectedBucket}: {currentBucketStats.total} total ({currentBucketStats.approved}{' '}
            approved, {currentBucketStats.pending} pending, {currentBucketStats.rejected} rejected)
          </div>
        )}
      </div>

      {/* Animation List */}
      <div className='mb-6'>
        <h3 className='text-lg font-semibold mb-2'>Animations for Bucket {selectedBucket}</h3>

        {animations.length === 0 ?
          <div className='p-4 bg-gray-700 rounded text-center text-gray-400'>
            No animations available for this bucket. Generate some animations first.
          </div>
        : <div className='space-y-2'>
            {animations.map(animation => (
              <div
                key={animation.id}
                className='p-3 bg-gray-700 rounded flex items-center justify-between'
              >
                <div className='flex-1'>
                  <div className='flex items-center gap-3'>
                    <div
                      className={`px-2 py-1 rounded text-xs ${
                        animation.quality === 'approved' ? 'bg-green-600'
                        : animation.quality === 'pending' ? 'bg-yellow-600'
                        : 'bg-red-600'
                      }`}
                    >
                      {animation.quality}
                    </div>
                    <div className='text-sm'>
                      {Math.round(animation.duration)}ms, {animation.keyframes.length} keyframes
                    </div>
                  </div>
                  <div className='text-xs text-gray-400 mt-1'>ID: {animation.id.slice(-8)}</div>
                </div>

                <div className='flex items-center gap-2'>
                  <button
                    onClick={() => setPreviewAnimation(animation)}
                    className='px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs'
                  >
                    Preview
                  </button>

                  {animation.quality !== 'approved' && (
                    <button
                      onClick={() => handleUpdateQuality(animation.id, 'approved')}
                      className='px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs'
                    >
                      Approve
                    </button>
                  )}

                  {animation.quality !== 'rejected' && (
                    <button
                      onClick={() => handleUpdateQuality(animation.id, 'rejected')}
                      className='px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs'
                    >
                      Reject
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteAnimation(animation.id)}
                    className='px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded text-xs'
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        }
      </div>

      {/* Preview Modal */}
      {previewAnimation && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-lg font-semibold'>Animation Preview</h3>
              <button
                onClick={() => setPreviewAnimation(null)}
                className='text-gray-400 hover:text-white'
              >
                ✕
              </button>
            </div>

            <div className='space-y-2 text-sm'>
              <div>
                <strong>Target Bucket:</strong> {previewAnimation.targetBucket}
              </div>
              <div>
                <strong>Duration:</strong> {Math.round(previewAnimation.duration)}ms
              </div>
              <div>
                <strong>Keyframes:</strong> {previewAnimation.keyframes.length}
              </div>
              <div>
                <strong>Quality:</strong> {previewAnimation.quality}
              </div>
              <div>
                <strong>Created:</strong>{' '}
                {new Date(previewAnimation.metadata.created).toLocaleString()}
              </div>
            </div>

            <div className='mt-4 p-3 bg-gray-700 rounded'>
              <div className='text-xs text-gray-400 mb-2'>Keyframe Path (first 10):</div>
              <div className='text-xs font-mono'>
                {previewAnimation.keyframes.slice(0, 10).map((kf, i) => (
                  <div key={i}>
                    {Math.round(kf.time)}ms: ({Math.round(kf.x)}, {Math.round(kf.y)})
                  </div>
                ))}
                {previewAnimation.keyframes.length > 10 && (
                  <div className='text-gray-500'>
                    ... and {previewAnimation.keyframes.length - 10} more
                  </div>
                )}
              </div>
            </div>

            <div className='mt-4 flex gap-2'>
              <button
                onClick={() => {
                  handleUpdateQuality(previewAnimation.id, 'approved')
                  setPreviewAnimation(null)
                }}
                className='px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm'
              >
                Approve
              </button>
              <button
                onClick={() => {
                  handleUpdateQuality(previewAnimation.id, 'rejected')
                  setPreviewAnimation(null)
                }}
                className='px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm'
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Library (Danger Zone) */}
      <div className='mt-8 p-4 bg-red-900 bg-opacity-30 border border-red-700 rounded'>
        <h3 className='text-lg font-semibold mb-2 text-red-400'>Danger Zone</h3>
        <p className='text-sm text-gray-300 mb-3'>
          This will delete all animations in the library. Use for testing only.
        </p>
        <button
          onClick={() => {
            if (
              confirm(
                'Are you sure you want to clear the entire animation library? This cannot be undone.'
              )
            ) {
              library.clearLibrary()
              updateStats()
              loadAnimations()
            }
          }}
          className='px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm'
        >
          Clear Library
        </button>
      </div>
    </div>
  )
}
