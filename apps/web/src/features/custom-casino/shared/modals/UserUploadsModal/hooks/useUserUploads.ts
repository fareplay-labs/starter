// @ts-nocheck
import { useState, useCallback, useMemo } from 'react'
import { createImageService } from '../../../services/imageService'

interface UserFile {
  id: string
  filename: string
  url: string
  tags?: string[]
}

/**
 * Custom hook to manage user uploads data and operations
 */
const useUserUploads = () => {
  const [userFiles, setUserFiles] = useState<UserFile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const imageService = useMemo(() => createImageService(), [])

  const fetchUserFiles = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const images = await imageService.getUserImages()
      const files: UserFile[] = images.map(img => ({
        id: img.id,
        filename: img.filename,
        url: img.data.url,
        tags: img.data.tags,
      }))
      setUserFiles(files)
    } catch (err) {
      console.error('Error fetching user images:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch user images'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteUserFile = useCallback(
    async (filenameOrId: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const fileToDelete = userFiles.find(
          f => f.filename === filenameOrId || f.id === filenameOrId
        )
        if (!fileToDelete) {
          throw new Error('File not found')
        }

        await imageService.deleteImage(fileToDelete.id)
        setUserFiles(prev => prev.filter(file => file.id !== fileToDelete.id))
      } catch (err) {
        console.error('Error deleting image:', err)
        setError(err instanceof Error ? err : new Error(`Failed to delete image: ${filenameOrId}`))
        await fetchUserFiles()
      } finally {
        setIsLoading(false)
      }
    },
    [fetchUserFiles, userFiles, imageService]
  )

  const uploadFile = useCallback(
    async (file: File, tags: string[] = ['general']) => {
      setIsLoading(true)
      setError(null)

      try {
        await imageService.uploadImages([file], { tags })

        await fetchUserFiles()
      } catch (err) {
        console.error('Error uploading image:', err)
        setError(err instanceof Error ? err : new Error('Failed to upload image'))
      } finally {
        setIsLoading(false)
      }
    },
    [fetchUserFiles, imageService]
  )

  const refreshFiles = useCallback(() => {
    fetchUserFiles()
  }, [fetchUserFiles])

  return {
    userFiles,
    isLoading,
    error,
    fetchUserFiles,
    deleteUserFile,
    uploadFile,
    refreshFiles,
  }
}

export default useUserUploads
