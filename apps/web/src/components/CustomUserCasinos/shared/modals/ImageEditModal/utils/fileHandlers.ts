// @ts-nocheck
/**
 * Validates if the file is a PNG image (the only allowed type per API documentation)
 */
export const isValidImageFile = (file: File): boolean => {
  return file.type === 'image/png'
}

/**
 * Validates if the file size is within limits (5MB)
 */
export const isValidFileSize = (file: File, maxSizeMB = 5): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}

/**
 * Reads a file and returns a Promise with data URL
 */
export const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = e => {
      const result = e.target?.result as string
      if (result) {
        resolve(result)
      } else {
        reject(new Error('Failed to read file'))
      }
    }

    reader.onerror = () => {
      reject(new Error('Error reading file'))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Get error message for file validation failures
 */
export const getFileErrorMessage = (file: File, maxSizeMB = 5): string | null => {
  if (!isValidImageFile(file)) {
    return 'Only PNG files are allowed. Please select a PNG image.'
  }

  if (!isValidFileSize(file, maxSizeMB)) {
    return `File size should be less than ${maxSizeMB}MB`
  }

  return null
}

/**
 * Handle file upload validation and return the File with any error message
 * Uses a small timeout to ensure UI has time to update between states
 */
export const handleFileUpload = async (
  file: File,
  maxSizeMB = 5
): Promise<{ file: File; url: string; error: string | null }> => {
  try {
    // Validate file
    const errorMessage = getFileErrorMessage(file, maxSizeMB)
    if (errorMessage) {
      return { file, url: '', error: errorMessage }
    }

    // Add a small delay to ensure UI state updates properly
    await new Promise(resolve => setTimeout(resolve, 50))

    // Read the file
    const dataUrl = await readFileAsDataURL(file)

    // Add another small delay before returning to prevent rapid state transitions
    await new Promise(resolve => setTimeout(resolve, 50))

    return { file, url: dataUrl, error: null }
  } catch (error) {
    return {
      file,
      url: '',
      error: error instanceof Error ? error.message : 'Failed to process file',
    }
  }
}
