// @ts-nocheck
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { ModalBase } from '../shared/ModalBase'
import { ModalActions } from '../shared/ModalActions'
import CombinedUpload from '../../../shared/modals/ImageEditModal/components/CombinedUpload'
import { createImageService } from '../../services/imageService'
import { MediaStorageApi } from '../../services/mediaStorageApi'
import UserUploadsMini from '../../../shared/modals/ImageEditModal/components/UserUploadsMini'
import { type Area } from 'react-easy-crop'
import EasyCropImageCropper from '../../../shared/modals/ImageEditModal/components/EasyCropImageCropper'
import { useActiveWallet } from '@/lib/privy/hooks'
import { useAuthWallet } from '@/lib/privy/hooks/useAuthWallet'

// Define aspect ratio locally
const DEFAULT_ASPECT_RATIO = 16 / 5 // Or adjust if needed

interface ImageEditModalProps {
  isOpen: boolean
  onClose: () => void
  fieldName: string
  onSave: (fieldName: string, value: string) => void
  currentValue?: string
  title?: string
  imageType: string
  contextKey: string
  elementIdentifier: string
  targetAspectRatio?: number
  cropShape?: 'rect' | 'round'
}

// Minimum loading state duration in ms
const MIN_LOADING_DURATION = 300

/**
 * Modal for editing images with URL input, file upload, and non-destructive cropping.
 */
const ImageEditModal: React.FC<ImageEditModalProps> = ({
  isOpen,
  onClose,
  fieldName,
  onSave,
  currentValue = '',
  title = 'Edit Image',
  imageType,
  targetAspectRatio,
  cropShape,
}) => {
  // Component state
  const [imageUrl, setImageUrl] = useState<string>(currentValue || '')
  const [imageError, setImageError] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingDebounced, setIsLoadingDebounced] = useState(false)
  const loadingTimerRef = useRef<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const backdropClickDisabledRef = useRef(false)
  const lastRenderTimeRef = useRef<number>(0) // Track last render time to prevent rapid remounting
  const imageService = createImageService()
  const { walletAddress, privyWallet, externalWallet, readyAndAuth } = useActiveWallet() as any
  const backendAddress = (privyWallet?.address || externalWallet?.address || walletAddress || '').toLowerCase()
  const { sessionVerifyState } = useAuthWallet()
  const isVerified = sessionVerifyState === 'verified'

  // -- New State for Refactor --
  const [_currentView, setCurrentView] = useState<'upload' | 'preview'>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>(
    'idle'
  )
  const [cropData, setCropData] = useState<Area | null>(null) // Current crop being edited
  const [initialCropArea, setInitialCropArea] = useState<Area | null>(null) // Parsed from currentValue
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [suggestedTags, _setSuggestedTags] = useState<string[]>([])

  // Define suggested and available tags for the selected context
  const availableTags = useMemo(
    () =>
      [
        'logo',
        'icon',
        'background',
        'banner',
        'asset',
        'bombs',
        'general',
        'casino',
        'button',
        'card',
        'frame',
        'tile',
      ]
        // Filter out any suggested tags from available tags
        .filter(tag => !suggestedTags.includes(tag)),
    [suggestedTags]
  )

  // Use provided cropShape or determine based on imageType - compatibility fallback
  const finalCropShape = cropShape || (imageType === 'profile-picture' ? 'round' : 'rect')

  // Memoize the callback handlers
  const handleCancelPreview = useCallback(() => {
    setCurrentView('upload')
    setSelectedFile(null)
  }, [])

  // Set loading state with minimum duration to prevent flickering
  const setDebouncedLoading = (loading: boolean) => {
    if (loading) {
      setIsLoading(true)
      setIsLoadingDebounced(true)

      // Clear any existing timer
      if (loadingTimerRef.current) {
        window.clearTimeout(loadingTimerRef.current)
        loadingTimerRef.current = null
      }
    } else {
      setIsLoading(false)
      // If turning off loading, ensure it stays visible for minimum duration
      if (isLoadingDebounced && !loadingTimerRef.current) {
        loadingTimerRef.current = window.setTimeout(() => {
          setIsLoadingDebounced(false)
          loadingTimerRef.current = null
        }, MIN_LOADING_DURATION)
      }
    }
  }

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) {
        window.clearTimeout(loadingTimerRef.current)
      }
    }
  }, [])

  // Handle modal open/close state changes
  useEffect(() => {
    if (isOpen) {
      // --- Logic when modal OPENS ---
      setImageUrl('') // Reset image URL
      setCropData(null) // Reset current crop editing state
      setInitialCropArea(null) // Reset initial crop area state
      setImageError(false)
      setIsLoadingDebounced(false)
      setCurrentView('upload')
      setSelectedFile(null)
      setUploadStatus('idle')
      setErrorMessage(null)

      // Parse currentValue to get URL and potential initial crop area
      if (currentValue) {
        try {
          const parsed = JSON.parse(currentValue)
          // Check if it's the structured format { url: ..., crop: Area }
          if (
            parsed &&
            typeof parsed === 'object' &&
            typeof parsed.url === 'string' &&
            parsed.crop &&
            typeof parsed.crop.x === 'number' &&
            typeof parsed.crop.y === 'number' &&
            typeof parsed.crop.width === 'number' &&
            typeof parsed.crop.height === 'number'
          ) {
            console.log('Loading modal with structured data:', parsed)
            setImageUrl(parsed.url)
            setInitialCropArea(parsed.crop as Area)
          } else {
            // If parsed but not the right structure, assume it's just a URL
            console.log('Loading modal with plain URL (parsed but wrong format):', currentValue)
            setImageUrl(currentValue) // Treat original string as URL
          }
        } catch (e) {
          // If JSON parsing fails, assume currentValue is just a URL string
          console.log('Loading modal with plain URL (parse failed):', currentValue)
          setImageUrl(currentValue)
        }
      } else {
        // Reset for new image (already done above)
      }

      // Focus input field after a short delay
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    } else {
      // --- Cleanup logic when modal CLOSES ---
      // Explicitly clear potentially large data URLs and crop state
      setImageUrl('')
      setCropData(null)
      setInitialCropArea(null) // Clear initial crop state on close
      setImageError(false)
      setIsLoading(false)
      setIsLoadingDebounced(false)
      setCurrentView('upload')
      setSelectedFile(null)
      setUploadStatus('idle')
      setErrorMessage(null)
      if (loadingTimerRef.current) {
        window.clearTimeout(loadingTimerRef.current)
        loadingTimerRef.current = null
      }
    }
  }, [isOpen, currentValue]) // Keep currentValue in deps for opening logic

  // Image event handlers
  const handleImageLoad = () => {
    setImageError(false)
    setDebouncedLoading(false)
  }

  const handleImageError = () => {
    setImageError(true)
    setDebouncedLoading(false)
  }

  // URL input handler
  const handleUrlChange = (value: string) => {
    setImageUrl(value)
    setCropData(null) // Reset crop data when URL changes

    if (value) {
      // Reset error state when URL changes
      setImageError(false)
      // Set loading to true - the img onLoad/onError handlers will update state
      setDebouncedLoading(true)
    }
  }

  // Handle image selection
  const handleSelectUpload = (imageUrl: string) => {
    // Ensure the URL uses the proper CDN path if it's a relative path
    let fullImageUrl = imageUrl
    if (imageUrl.startsWith('uploads/')) {
      fullImageUrl = `https://fp-game-assets.nyc3.cdn.digitaloceanspaces.com/${imageUrl}`
    }

    setImageUrl(fullImageUrl)
    setCropData(null) // Reset crop data for new image
    setDebouncedLoading(true)
  }

  // -- New File Selection Handler --
  const handleFileSelected = (file: File) => {
    // Basic validation (can be expanded)
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select an image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      setErrorMessage('File size exceeds 5MB limit.')
      return
    }

    setSelectedFile(file)
    setCurrentView('preview')
    setErrorMessage(null) // Clear previous errors
    // Don't update imageUrl here - we only modify once upload is complete
    // setImageUrl(URL.createObjectURL(file)) <- REMOVE THIS
    setUploadStatus('idle')
  }
  // -- End New Handler --

  // Handle crop data from EasyCrop
  const handleEasyCropComplete = useCallback((croppedAreaPixels: Area) => {
    setCropData(croppedAreaPixels) // Store the pixel area for the current edit session
  }, [])

  // Custom handler for starting crop interaction
  const handleCropStart = useCallback(() => {
    backdropClickDisabledRef.current = true
  }, [])

  // Custom handler for ending crop interaction with delay
  const handleCropEnd = useCallback(() => {
    // Delay setting the ref back to false to allow modal backdrop click
    // handler to read the 'true' state if the click finished outside.
    setTimeout(() => {
      backdropClickDisabledRef.current = false
    }, 0) // Delay by one event loop cycle
  }, [])

  // Save handler - REVERTED to save structured data (URL + Area)
  const handleSave = () => {
    // Removed async and loading state specific to getCroppedImg
    if (imageUrl && !imageError) {
      let saveData = imageUrl // Default to saving just the URL

      // If crop data exists, stringify it with the URL
      if (cropData) {
        try {
          const structuredData = {
            url: imageUrl,
            crop: cropData, // Save the Area object
          }
          saveData = JSON.stringify(structuredData)
          console.log('Saving structured crop data:', saveData)
        } catch (error) {
          console.error('Error stringifying crop data:', error)
          // Fallback to saving only the URL if stringify fails
          setErrorMessage('Could not save crop data. Saving original URL only.')
          saveData = imageUrl
        }
      }

      // Save the final data (stringified object or plain URL)
      onSave(fieldName, saveData)
      onClose()
    } else if (imageUrl === '') {
      // Save empty string to clear the image
      onSave(fieldName, '')
      onClose()
    }
    // Removed the try/catch/finally block related to getCroppedImg
  }

  // Determine which preview component to use based on whether an image is loaded
  const renderImageContent = () => {
    // Check if Croppie should be rendered (valid URL, no error)
    const showCropper = imageUrl && !imageError

    // Prevent rapid remounting by ensuring at least 300ms between renders
    const now = Date.now()
    const shouldUseKey = now - lastRenderTimeRef.current > 300
    if (shouldUseKey) {
      lastRenderTimeRef.current = now
    }

    // Conditionally render Croppie only when needed to allow
    // proper mounting/unmounting and cleanup.
    return (
      <>
        {/* Show Cropper only if conditions are met */}
        {showCropper && (
          <EasyCropImageCropper
            key={shouldUseKey ? imageUrl.split(':')[0] : 'stable-easy-crop-instance'}
            imageUrl={imageUrl}
            isLoading={isLoadingDebounced}
            aspect={finalCropShape === 'round' ? 1 : targetAspectRatio || DEFAULT_ASPECT_RATIO}
            cropShape={finalCropShape}
            initialCroppedAreaPixels={initialCropArea}
            onCropComplete={handleEasyCropComplete}
            onImageLoad={handleImageLoad}
            onImageError={handleImageError}
            onCropStart={handleCropStart}
            onCropEnd={handleCropEnd}
          />
        )}
      </>
    )
  }

  // Render different content based on view state
  const renderContent = () => {
    return (
      <CombinedUpload
        urlValue={imageUrl}
        onUrlChange={handleUrlChange}
        onFileSelected={handleFileSelected}
        onFileUpload={handlePreviewUpload}
        onCancel={handleCancelPreview}
        uploadStatus={uploadStatus}
        selectedFile={selectedFile}
        suggestedTags={suggestedTags}
        availableTags={availableTags}
        errorMessage={errorMessage}
        urlInputRef={inputRef}
        urlErrorMessage={imageError ? 'Invalid URL' : null}
        disabled={isLoading || uploadStatus === 'uploading'}
      />
    )
  }

  // Update handlePreviewUpload to update imageUrl with the uploaded file URL after upload
  const handlePreviewUpload = async (tags: string[]) => {
    if (!selectedFile) {
      setErrorMessage('No file selected for upload.')
      return
    }
    if (!backendAddress || !isVerified) {
      setErrorMessage('Please connect your wallet to upload images.')
      setUploadStatus('error')
      return
    }

    setUploadStatus('uploading')
    setErrorMessage(null) // Clear previous errors

    try {
      // Validate the image file
      const validation = MediaStorageApi.validateImageFile(selectedFile)
      if (!validation.valid) {
        setErrorMessage(validation.error || 'Invalid file')
        setUploadStatus('error')
        return
      }

      const uploadResults = await imageService.uploadImages([selectedFile], { tags })

      // Assuming success if no error is thrown and we get a result
      if (uploadResults && uploadResults.length > 0) {
        const uploadedImage = uploadResults[0] // Get the uploaded image object
        const uploadedFileUrl = uploadedImage.data.url // Extract the URL
        console.log('Upload successful, URL:', uploadedFileUrl)

        // Show successful upload status
        setUploadStatus('success')

        // Wait a moment to show success before resetting the UI
        setTimeout(() => {
          // Update imageUrl for the croppie preview after successful upload
          setImageUrl(uploadedFileUrl)
          setCropData(null) // Reset crop data for new image
          setSelectedFile(null) // Clear selected file
          setCurrentView('upload') // Reset to upload view
        }, 1000)
      } else {
        throw new Error('Upload completed but no URL was returned.')
      }
    } catch (error) {
      console.error('Upload failed:', error)
      setErrorMessage(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setUploadStatus('error')
    }
  }

  return (
    <>
      <ModalBase
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        backdropClickDisabledRef={backdropClickDisabledRef}
      >
        {/* Render Image Preview/Cropper always at the top */}
        {renderImageContent()}

        {/* Render the inputs/preview controls below */}
        {renderContent()}

        {/* Integrate UserUploadsMini component */}
        <UserUploadsMini
          onSelect={handleSelectUpload}
          allowedTags={[imageType, 'all', ...availableTags]}
        />

        <ModalActions
          onCancel={onClose}
          onConfirm={handleSave}
          disabled={!readyAndAuth || !isVerified || (imageUrl !== '' && imageError) || isLoading || uploadStatus === 'uploading'}
        />
      </ModalBase>
    </>
  )
}

export default ImageEditModal
