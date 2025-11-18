// @ts-nocheck
import { useState, useEffect, useCallback, useRef } from 'react'
interface TagSelectorState {
  selectedTags: string[]
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>
  userTags: string[]
  setUserTags: React.Dispatch<React.SetStateAction<string[]>>
  newUserTag: string
  setNewUserTag: React.Dispatch<React.SetStateAction<string>>
  isAddingCustomTag: boolean
  setIsAddingCustomTag: React.Dispatch<React.SetStateAction<boolean>>
  customTagInputRef: React.RefObject<HTMLInputElement>
  handleTagToggle: (tag: string) => void
  handleAddTagClick: () => void
  handleAddUserTag: () => void
  handleCustomTagKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  handleCustomTagChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleCustomTagBlur: () => void
  handleRemoveUserTag: (tag: string) => void
}

export function useTagSelectorState(
  initialSelectedTags: string[],
  maxUserTags: number,
  onChange: (selectedTags: string[]) => void
): TagSelectorState {
  // State management for selected tags and user tags
  const [selectedTags, setSelectedTags] = useState<string[]>(initialSelectedTags)
  const [userTags, setUserTags] = useState<string[]>([])
  const [newUserTag, setNewUserTag] = useState<string>('')
  const [isAddingCustomTag, setIsAddingCustomTag] = useState(false)

  // Refs
  const initialSelectedTagsRef = useRef<string[]>(initialSelectedTags)
  const customTagInputRef = useRef<HTMLInputElement>(null)

  // Update selectedTags if initialSelectedTags changes
  useEffect(() => {
    const hasInitialTagsChanged =
      initialSelectedTags.length !== initialSelectedTagsRef.current.length ||
      initialSelectedTags.some(tag => !initialSelectedTagsRef.current.includes(tag))

    if (hasInitialTagsChanged) {
      initialSelectedTagsRef.current = [...initialSelectedTags]
      setSelectedTags(initialSelectedTags)
    }
  }, [initialSelectedTags])

  // Notify parent when tags change
  useEffect(() => {
    onChange([...selectedTags, ...userTags])
  }, [selectedTags, userTags, onChange])

  // Focus on input when adding a custom tag
  useEffect(() => {
    if (isAddingCustomTag && customTagInputRef.current) {
      customTagInputRef.current.focus()
    }
  }, [isAddingCustomTag])

  // Toggle a tag between selected and unselected
  const handleTagToggle = useCallback((tag: string) => {
    // Prevent deselecting the 'all' tag
    if (tag === 'all') {
      setSelectedTags(prev => 
        prev.includes('all') ? prev : [...prev, 'all']
      )
      return
    }
    
    setSelectedTags(
      prev =>
        prev.includes(tag) ?
          prev.filter(t => t !== tag) // remove
        : [...prev, tag] // append to end instead of prepend
    )
  }, [])

  // Show the input for adding a custom tag
  const handleAddTagClick = useCallback(() => {
    setIsAddingCustomTag(true)
  }, [])

  // Add a new user tag
  const handleAddUserTag = useCallback(() => {
    const trimmedTag = newUserTag
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')

    if (
      trimmedTag &&
      userTags.length < maxUserTags &&
      !selectedTags.includes(trimmedTag) &&
      !userTags.includes(trimmedTag)
    ) {
      setUserTags(prev => [...prev, `user-${trimmedTag}`]) // append to end
      setNewUserTag('')
      setIsAddingCustomTag(false)
    } else {
      setNewUserTag('')
      setIsAddingCustomTag(false)
    }
  }, [newUserTag, userTags, maxUserTags, selectedTags])

  // Handle keyboard events for custom tag input
  const handleCustomTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddUserTag()
    } else if (e.key === 'Escape') {
      setNewUserTag('')
      setIsAddingCustomTag(false)
    }
  }

  // Handle change event for custom tag input - restrict to lowercase alphanumeric + dash
  const handleCustomTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
    setNewUserTag(value)
  }

  // Handle blur event for custom tag input
  const handleCustomTagBlur = () => {
    if (newUserTag.trim()) {
      handleAddUserTag()
    } else {
      setIsAddingCustomTag(false)
    }
  }

  // Remove a user tag
  const handleRemoveUserTag = useCallback((tag: string) => {
    setUserTags(prev => prev.filter(t => t !== tag))
  }, [])

  return {
    selectedTags,
    setSelectedTags,
    userTags,
    setUserTags,
    newUserTag,
    setNewUserTag,
    isAddingCustomTag,
    setIsAddingCustomTag,
    customTagInputRef,
    handleTagToggle,
    handleAddTagClick,
    handleAddUserTag,
    handleCustomTagKeyDown,
    handleCustomTagChange,
    handleCustomTagBlur,
    handleRemoveUserTag,
  }
}
