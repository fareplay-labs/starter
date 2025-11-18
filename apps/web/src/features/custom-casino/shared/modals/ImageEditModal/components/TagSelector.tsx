// @ts-nocheck
import React, { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  TagSection,
  TagItem,
  AddTagButton,
  InlineTagInput,
  VerticalDivider,
} from '../styles/uploadSectionStyles'
import { useTagSelectorState } from '../hooks/useTagSelectorState'

// Determine tag type based on the tag content for styling purposes
export const getTagType = (tag: string): string => {
  const lowerTag = tag.toLowerCase()

  if (['icon', 'background', 'banner', 'asset'].includes(lowerTag)) {
    return 'image-type'
  }
  if (['bombs', 'general', 'casino', 'games'].includes(lowerTag)) {
    return 'game-or-general'
  }
  if (lowerTag.startsWith('user-')) {
    return 'user-tag'
  }
  return 'element'
}

interface TagSelectorProps {
  initialSelectedTags: string[] // Pre-selected tags based on context
  suggestedTags: string[] // Contextual suggestions (excluding initialSelected)
  availableTags: string[] // All other available predefined tags
  maxUserTags?: number
  onChange: (selectedTags: string[]) => void
}

// Create styled motion version of TagItem
const MotionTagItem = motion(TagItem)

const TagSelector: React.FC<TagSelectorProps> = ({
  initialSelectedTags,
  suggestedTags,
  availableTags,
  maxUserTags = 2,
  onChange,
}) => {
  const {
    selectedTags,
    userTags,
    newUserTag,
    isAddingCustomTag,
    customTagInputRef,
    handleTagToggle,
    handleAddTagClick,
    handleCustomTagKeyDown,
    handleCustomTagChange,
    handleCustomTagBlur,
    handleRemoveUserTag,
  } = useTagSelectorState(initialSelectedTags, maxUserTags, onChange)

  // Derive the tag sections
  const selected = useMemo(() => [...selectedTags, ...userTags], [selectedTags, userTags])
  const suggested = useMemo(
    () => suggestedTags.filter(t => !selected.includes(t)),
    [suggestedTags, selected]
  )
  const all = useMemo(
    () => availableTags.filter(t => !selected.includes(t) && !suggested.includes(t)),
    [availableTags, selected, suggested]
  )
  const canAddMoreUserTags = userTags.length < maxUserTags

  // Animation configuration
  const springTransition = {
    type: 'spring',
    stiffness: 500,
    damping: 30,
  }

  // Height-correction style for motion divs
  const tagWrapperStyle = {
    display: 'flex',
    alignItems: 'center',
    height: '24px', // Match the height of tag items
  }

  return (
    <TagSection>
      {/* Selected Tags */}
      {selected.length > 0 &&
        selected.map(tag => (
          <motion.div
            key={tag}
            layout
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={springTransition}
            style={tagWrapperStyle}
          >
            <TagItem
              $isSelected={true}
              $type={getTagType(tag)}
              onClick={() =>
                tag.startsWith('user-') ? handleRemoveUserTag(tag) : handleTagToggle(tag)
              }
            >
              {tag.startsWith('user-') ? tag.replace('user-', '') : tag}
            </TagItem>
          </motion.div>
        ))}

      {/* Divider + Suggested Tags - only if both selected and suggested have items */}
      {suggested.length > 0 && (
        <>
          {/* Only show divider if there are selected tags */}
          {selected.length > 0 && (
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={springTransition}
              style={tagWrapperStyle}
            >
              <VerticalDivider />
            </motion.div>
          )}

          {suggested.map(tag => (
            <motion.div
              key={tag}
              layout
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={springTransition}
              style={tagWrapperStyle}
            >
              <TagItem
                $isSelected={false}
                $type={getTagType(tag)}
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
              </TagItem>
            </motion.div>
          ))}
        </>
      )}

      {/* Divider + Available Tags - only if previous sections have items */}
      {all.length > 0 && (
        <>
          {/* Only show divider if there are previous tags */}
          {(selected.length > 0 || suggested.length > 0) && (
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={springTransition}
              style={tagWrapperStyle}
            >
              <VerticalDivider />
            </motion.div>
          )}

          {all.map(tag => (
            <motion.div
              key={tag}
              layout
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={springTransition}
              style={tagWrapperStyle}
            >
              <TagItem
                $isSelected={false}
                $type={getTagType(tag)}
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
              </TagItem>
            </motion.div>
          ))}
        </>
      )}

      {/* Divider + Add Tag Button/Input - only if previous sections have items */}
      {canAddMoreUserTags && (
        <>
          {/* Only show divider if there are tags in any previous section */}
          {(selected.length > 0 || suggested.length > 0 || all.length > 0) && (
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={springTransition}
              style={tagWrapperStyle}
            >
              <VerticalDivider />
            </motion.div>
          )}

          {!isAddingCustomTag ?
            <motion.div
              layout
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={springTransition}
              style={tagWrapperStyle}
            >
              <AddTagButton onClick={handleAddTagClick} $type='user-tag'>
                +
              </AddTagButton>
            </motion.div>
          : <motion.div
              layout
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={springTransition}
              style={{ minWidth: '80px', height: '28px' }}
            >
              <InlineTagInput
                ref={customTagInputRef}
                value={newUserTag}
                onChange={handleCustomTagChange}
                onKeyDown={handleCustomTagKeyDown}
                onBlur={handleCustomTagBlur}
                placeholder='Tag name'
                maxLength={15}
              />
            </motion.div>
          }
        </>
      )}
    </TagSection>
  )
}

export default memo(TagSelector)
