// @ts-nocheck
import React, { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useTagSelectorState } from '../hooks/useTagSelectorState'

// Tag color mapping
const TAG_COLORS = {
  'image-type': '#ffcd9e',    // peach
  'game-or-general': '#d900d5', // pink
  'element': '#410dff',        // blue
  'user-tag': '#4af5d3',       // aqua
}

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

// Tag Item Component
const TagItem: React.FC<{
  tag: string
  isSelected: boolean
  type: string
  onClick: () => void
}> = ({ tag, isSelected, type, onClick }) => {
  const color = TAG_COLORS[type as keyof typeof TAG_COLORS] || '#f1f1f1'

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center justify-center leading-[1.5] min-w-auto w-auto',
        'bg-transparent text-white rounded py-0 px-[7px] text-[0.9em]',
        'cursor-pointer transition-all duration-200 select-none',
        'relative z-[1] border',
        'hover:brightness-105 active:scale-[0.98]'
      )}
      style={{
        borderColor: color,
      }}
    >
      {/* Background pseudo-element replacement */}
      <div
        className="absolute inset-0 rounded -z-[1]"
        style={{
          backgroundColor: color,
          opacity: isSelected ? 1 : 0.5,
        }}
      />
      {tag.startsWith('user-') ? tag.replace('user-', '') : tag}
    </div>
  )
}

// Add Tag Button Component
const AddTagButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <div
    onClick={onClick}
    className={cn(
      'flex items-center justify-center leading-[1.5] min-w-[20px]',
      'bg-transparent text-[#aaaaaa] rounded py-0 px-[7px] text-[0.9em]',
      'cursor-pointer transition-all duration-200 select-none',
      'border border-[#3a4052]',
      'hover:bg-[rgba(61,54,68,0.57)] hover:border-[#999]'
    )}
  >
    +
  </div>
)

// Inline Tag Input Component
const InlineTagInput: React.FC<{
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onBlur: () => void
  inputRef: React.RefObject<HTMLInputElement>
}> = ({ value, onChange, onKeyDown, onBlur, inputRef }) => (
  <input
    ref={inputRef}
    value={value}
    onChange={onChange}
    onKeyDown={onKeyDown}
    onBlur={onBlur}
    placeholder='Tag name'
    maxLength={15}
    className={cn(
      'min-w-[10px] w-auto h-6 px-2 text-[0.9em] leading-[1.5]',
      'bg-transparent border border-[#4af5d3] rounded outline-none',
      'text-white text-center',
      'placeholder:text-white/50',
      'focus:border-[#4af5d3] focus:shadow-[0_0_0_2px_rgba(0,255,255,0.2)]'
    )}
  />
)

// Vertical Divider Component
const VerticalDivider = () => (
  <div className="w-0.5 h-5 bg-[#3a4052] mx-2.5 opacity-50 self-center" />
)

interface TagSelectorProps {
  initialSelectedTags: string[] // Pre-selected tags based on context
  suggestedTags: string[] // Contextual suggestions (excluding initialSelected)
  availableTags: string[] // All other available predefined tags
  maxUserTags?: number
  onChange: (selectedTags: string[]) => void
}

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
    <div className="flex flex-wrap gap-1 my-3">
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
              tag={tag}
              isSelected={true}
              type={getTagType(tag)}
              onClick={() =>
                tag.startsWith('user-') ? handleRemoveUserTag(tag) : handleTagToggle(tag)
              }
            />
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
                tag={tag}
                isSelected={false}
                type={getTagType(tag)}
                onClick={() => handleTagToggle(tag)}
              />
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
                tag={tag}
                isSelected={false}
                type={getTagType(tag)}
                onClick={() => handleTagToggle(tag)}
              />
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

          {!isAddingCustomTag ? (
            <motion.div
              layout
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={springTransition}
              style={tagWrapperStyle}
            >
              <AddTagButton onClick={handleAddTagClick} />
            </motion.div>
          ) : (
            <motion.div
              layout
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={springTransition}
              style={{ minWidth: '80px', height: '28px' }}
            >
              <InlineTagInput
                inputRef={customTagInputRef}
                value={newUserTag}
                onChange={handleCustomTagChange}
                onKeyDown={handleCustomTagKeyDown}
                onBlur={handleCustomTagBlur}
              />
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}

export default memo(TagSelector)
