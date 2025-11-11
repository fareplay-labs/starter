const emojiIcon = (emoji: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-size="48">${emoji}</text></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export const SVGS = {
  coin: emojiIcon('🪙'),
  diceIcon: emojiIcon('🎲'),
  scissorIcon: emojiIcon('✂️'),
  bombIcon: emojiIcon('💣'),
  crashIcon: emojiIcon('📈'),
  plinkoIcon: emojiIcon('🔵'),
  rouletteIcon: emojiIcon('🎰'),
  cardsIcon: emojiIcon('🃏'),
  cryptoLaunchIcon: emojiIcon('🚀'),
  slotsIcon: emojiIcon('🎰'),
  questionMarkIcon: emojiIcon('❓'),
  discordIcon: emojiIcon('💬'),
  telegramIcon: emojiIcon('📨'),
  xIcon: emojiIcon('𝕏'),
  docsIcon: emojiIcon('📘'),
  shareIcon: emojiIcon('🔗'),
  spinIcon: emojiIcon('🎰'),
  xMarkIcon: emojiIcon('✖️'),
}
