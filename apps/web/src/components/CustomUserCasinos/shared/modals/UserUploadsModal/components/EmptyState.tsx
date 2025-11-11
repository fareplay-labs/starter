// @ts-nocheck
import React from 'react'

interface EmptyStateProps {
  onRefresh: () => void
}

/**
 * Component displayed when the user has no uploaded images
 */
const EmptyState: React.FC<EmptyStateProps> = ({ onRefresh }) => {
  return (
    <div className='flex flex-col items-center justify-center h-64 text-center'>
      <svg
        className='w-16 h-16 text-gray-400 mb-4'
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={1.5}
          d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
        />
      </svg>

      <h3 className='text-lg font-medium text-gray-700 mb-2'>No Images Found</h3>

      <p className='text-gray-500 mb-4'>
        You haven&apos;t uploaded any images yet. Upload an image from the Image Edit modal.
      </p>

      <button
        onClick={onRefresh}
        className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors'
      >
        Refresh
      </button>
    </div>
  )
}

export default EmptyState
