// @ts-nocheck
import React from 'react'
import { styled } from 'styled-components'
import { SPACING, BREAKPOINTS } from '@/design'
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

// Styled components
const SGridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${SPACING.xs}px;
  padding: ${SPACING.xs}px;

  @media (min-width: ${BREAKPOINTS.sm}px) {
    grid-template-columns: repeat(4, 1fr);
  }

  @media (min-width: ${BREAKPOINTS.md}px) {
    grid-template-columns: repeat(5, 1fr);
  }

  @media (min-width: ${BREAKPOINTS.lg}px) {
    grid-template-columns: repeat(6, 1fr);
  }
`

/**
 * Grid display of user uploaded images
 */
const UploadGrid: React.FC<UploadGridProps> = ({ files, selectedUrl, onSelect, onDelete }) => {
  return (
    <SGridContainer>
      {files.map(file => (
        <UploadItem
          key={file.id}
          file={file}
          isSelected={selectedUrl === file.url}
          onSelect={() => onSelect(file.url)}
          onDelete={() => onDelete(file.id)}
        />
      ))}
    </SGridContainer>
  )
}

export default UploadGrid
