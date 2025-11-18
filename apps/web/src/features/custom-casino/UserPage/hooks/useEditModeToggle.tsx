// @ts-nocheck
import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

export const useEditModeToggle = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const isEditMode = searchParams.get('mode') === 'edit'

  // Toggle edit mode function
  const toggleEditMode = useCallback(() => {
    if (isEditMode) {
      // Exit edit mode
      searchParams.delete('mode')
    } else {
      // Enter edit mode
      searchParams.set('mode', 'edit')
    }
    setSearchParams(searchParams)
  }, [isEditMode, searchParams, setSearchParams])

  return { toggleEditMode }
}
