// @ts-nocheck
import { getAnimationLibrary } from './index'

// Dynamically import compiled JSON animations generated offline.
// Uses Vite glob import to only bundle referenced files.
const animationImports = import.meta.glob('../animations/plinko_animations_rows*.json')

const loaded: Set<number> = new Set()

export async function loadAnimationsForRow(rowCount: number): Promise<void> {
  if (loaded.has(rowCount)) return
  const path = `../animations/plinko_animations_rows${rowCount}.json`
  const importer = animationImports[path]
  if (!importer) {
    console.warn(`No animation JSON found for row count ${rowCount}`)
    loaded.add(rowCount)
    return
  }
  try {
    const mod: any = await importer()
    const jsonData = mod.default ?? mod
    const library = getAnimationLibrary()
    library.importAnimationsFromJSON(jsonData)
    loaded.add(rowCount)
    console.log(`Animations for ${rowCount} rows loaded`)
  } catch (err) {
    console.error('Failed to load animations JSON', err)
  }
}
