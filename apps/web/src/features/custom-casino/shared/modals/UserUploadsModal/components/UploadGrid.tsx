// @ts-nocheck
import React from 'react'
import { cn } from '@/lib/utils'
import UploadItem from './UploadItem'

interface UserFile {
  id: string
  filename: string
  url: string
  tags?: string[]
}

interface UploadGridProps {
  files: UserFile[]
  selectedUrl: string | null
  onSelect: (url: string) => void
  onDelete: (filenameOrId: string) => void
}

/**
 * Grid display of user uploaded images
 */
const UploadGrid: React.FC<UploadGridProps> = ({ files, selectedUrl, onSelect, onDelete }) => {
  return (
    <div
      className={cn(
        'grid grid-cols-3 gap-2 p-2',
        'min-[992px]:grid-cols-4',
        'min-[1200px]:grid-cols-5',
        'min-[1440px]:grid-cols-6'
      )}
    >
      {files.map(file => (
        <UploadItem
          key={file.id}
          file={file}
          isSelected={selectedUrl === file.url}
          onSelect={() => onSelect(file.url)}
          onDelete={() => onDelete(file.id)}
        />
      ))}
    </div>
  )
}

export default UploadGrid
