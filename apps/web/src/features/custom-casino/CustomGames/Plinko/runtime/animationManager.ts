// @ts-nocheck
import { getAnimationLibrary } from '../simulation'

// Central runtime-facing animation manager.
const library = getAnimationLibrary()

// Track loaded row JSONs so we don't import twice.
const loadedRows = new Set<number>()

// vite-glob for JSONs – relative to this file's parent dir.
const jsonImports = import.meta.glob('../animations/plinko_animations_rows*.json')

export async function ensureRowLoaded(rowCount: number): Promise<void> {
  if (loadedRows.has(rowCount)) return
  const path = `../animations/plinko_animations_rows${rowCount}.json`
  const importer = jsonImports[path]
  if (!importer) {
    console.warn(`No prebuilt animations JSON for ${rowCount} rows`)
    loadedRows.add(rowCount)
    return
  }
  const mod: any = await importer()
  const data = mod.default ?? mod
  library.importAnimationsFromJSON(data)
  loadedRows.add(rowCount)
}

export const hasRowLoaded = (row: number) => loadedRows.has(row)

export const getRandomAnimation = (row: number, bucket: number) => library.getAnimation(row, bucket)

export const animationStats = () => library.getStats()
