// @ts-nocheck
import React, { useState } from 'react'
import TagSelector from './TagSelector'

interface UploadPreviewProps {
  file: File
  suggestedTags: string[]
  availableTags: string[]
  onUpload: (selectedTags: string[]) => Promise<void>
  onCancel: () => void
  uploadStatus: 'idle' | 'uploading' | 'success' | 'error' // Added from parent state
}

const UploadPreview: React.FC<UploadPreviewProps> = ({
  file,
  suggestedTags,
  availableTags,
  onUpload,
  onCancel,
  uploadStatus,
}) => {
  const [selectedTags, setSelectedTags] = useState<string[]>(suggestedTags)

  const handleTagChange = (newTags: string[]) => {
    setSelectedTags(newTags)
  }

  const handleConfirmUpload = () => {
    onUpload(selectedTags)
  }

  return (
    <div>
      {/* Placeholder for Thumbnail - Main preview is now outside */}
      {/* <img src={URL.createObjectURL(file)} alt="Preview" width="100" /> */}

      <h4>Manage Tags</h4>
      {/* Placeholder for TagSelector component (Step 4) */}
      <div>
        <TagSelector
          initialSelectedTags={suggestedTags}
          suggestedTags={[]}
          availableTags={availableTags}
          onChange={handleTagChange}
          maxUserTags={2}
        />
      </div>

      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={handleConfirmUpload}
          disabled={uploadStatus === 'uploading' || selectedTags.length === 0}
        >
          {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload'}
        </button>
        <button onClick={onCancel} disabled={uploadStatus === 'uploading'}>
          Cancel
        </button>
      </div>
    </div>
  )
}

export default UploadPreview
