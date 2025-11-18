// @ts-nocheck
/**
 * Emoji utilities for the color control component
 */

// Common emoji collection organized by categories
export const EMOJI_LIST = [
  // Game items and objects (added for Cards game defaults)
  '💎', '💠', '🔮', '🪙', '🏺', '📜', '📚', '👑',
  '🗝️', '🃏', '🎴', '🎲', '🎯', '🏆', '🥇', '🥈',
  '🥉', '🏅', '🎖️', '⚔️', '🗡️', '🛡️', '🔱', '🪄',
  // Cards game emojis
  '🍜', '🍀', '🚀', '🐸', '🎶', '🌙', '🏢', '🏛️', '🌴', '👤',
  // Slot machine emojis
  '🍒', '🍋', '🍊', '🍇', '7️⃣', '🎰', '💰', '🔔',
  
  // Faces - Happy
  '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊',
  '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘',
  '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪',
  
  // Faces - Neutral/Thoughtful
  '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒',
  '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬',
  '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴',
  
  // Faces - Sad/Negative
  '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖',
  '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡',
  '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥',
  '😓', '🤗', '🤤', '😪', '😵', '🤐', '🥴',
  
  // Faces - Sick/Special
  '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠',
  '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀',
  '☠️', '👽', '👾', '🤖', '🎃',
  
  // Cat faces
  '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾',
  
  // Hearts and symbols
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
  '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖',
  '💘', '💝', '💟', '♥️', '💌',
  
  // Objects and symbols
  '💤', '💢', '💣', '💥', '💦', '💨', '💫', '💬',
  '👁️‍🗨️', '🗨️', '🗯️', '💭', '🕳️', '🔥',
  
  // Nature and weather
  '⭐', '🌟', '✨', '⚡', '☄️', '🌠', '🌈',
  '☀️', '🌤️', '⛅', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️',
  '❄️', '☃️', '⛄', '🌬️', '🌪️', '🌫️', '🌊'
]

/**
 * Helper function to detect if a string contains only emoji characters
 * Uses a simplified approach that checks for common emoji ranges
 */
export const isEmojiValue = (v: string): boolean => {
  if (!v || typeof v !== 'string') return false
  
  // Trim the value and check if it's in our emoji list (simple but reliable)
  const trimmed = v.trim()
  return EMOJI_LIST.includes(trimmed)
}

/**
 * Get a random emoji from the list
 */
export const getRandomEmoji = (): string => {
  return EMOJI_LIST[Math.floor(Math.random() * EMOJI_LIST.length)]
}

/**
 * Get emojis by category (simple categorization based on index ranges)
 */
export const getEmojisByCategory = () => {
  return {
    games: EMOJI_LIST.slice(0, 41), // Game items, Cards game emojis, and Slot machine emojis
    happy: EMOJI_LIST.slice(41, 57),
    neutral: EMOJI_LIST.slice(57, 83),
    sad: EMOJI_LIST.slice(83, 112),
    special: EMOJI_LIST.slice(112, 134),
    cats: EMOJI_LIST.slice(134, 143),
    hearts: EMOJI_LIST.slice(143, 162),
    objects: EMOJI_LIST.slice(162, 176),
    nature: EMOJI_LIST.slice(176)
  }
}