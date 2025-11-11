// @ts-nocheck
import React, { useMemo, useRef, useEffect, useState } from 'react'
import { Canvas, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { type CoinAnimationPreset, type CoinSide } from '../types'
import { CoinFlipSelection } from '@/components/CustomUserCasinos/lib/crypto/coinFlip'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – GLTFLoader types may not be available depending on three version
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

import { type Area } from 'react-easy-crop'

// Import the custom coin model – Vite will convert this to a URL string
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – vite query
import customCoinUrl from '@/components/CustomUserCasinos/assets/glb/custom-coin.glb?url'

interface ThreeCoinProps {
  size: number
  coinColor: string
  headsCustomImage?: string
  tailsCustomImage?: string
  animationPreset: CoinAnimationPreset
  animationDuration: number
  // Number of full flips/spins to perform during animation
  flipCount: number
  flipResult: CoinSide | null
  isFlipping: boolean
  onAnimationComplete: () => void
  playerChoice: CoinSide | null
  onCoinClick?: () => void
}

// Face map removed - only custom images are now supported

// New helper to measure UV bounds of a mesh
function getUVBounds(mesh: THREE.Mesh) {
  const uvAttr = mesh.geometry.getAttribute('uv')
  let uMin = 1,
    uMax = 0,
    vMin = 1,
    vMax = 0
  for (let i = 0; i < uvAttr.count; i++) {
    const u = uvAttr.getX(i),
      v = uvAttr.getY(i)
    uMin = Math.min(uMin, u)
    uMax = Math.max(uMax, u)
    vMin = Math.min(vMin, v)
    vMax = Math.max(vMax, v)
  }
  return { uMin, uMax, vMin, vMax }
}

// New helper to apply crop data to a texture using proper UV bounds
function applyCropToTexture(
  texture: THREE.Texture,
  crop: Area,
  image: HTMLImageElement,
  uv: { uMin: number; uMax: number; vMin: number; vMax: number }
) {
  if (!texture || !crop || !image) return

  const { naturalWidth: W, naturalHeight: H } = image

  // Size of the model's UV island
  const uSpan = uv.uMax - uv.uMin
  const vSpan = uv.vMax - uv.vMin

  // Fraction of the bitmap that the crop represents
  const uRepeat = crop.width / W / uSpan
  const vRepeat = crop.height / H / vSpan

  // UV origin is *top-left* when flipY === false
  const uOffset = crop.x / W - uv.uMin * uRepeat
  const vOffset = crop.y / H - uv.vMin * vRepeat

  // Prevent sampling outside the island
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping

  texture.flipY = false // Keep if faces would be upside-down otherwise
  texture.repeat.set(uRepeat, vRepeat)
  texture.offset.set(uOffset, vOffset)

  texture.needsUpdate = true
}

// New helper to create a canvas texture with icon centered on colored background
function createIconTexture(
  iconUrl: string,
  backgroundColor: string,
  iconSize = 0.5 // Scale factor for icon size (0.5 = 50% to account for UV island)
): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      reject(new Error('Could not get canvas context'))
      return
    }

    // Set canvas size - use 512x512 for good quality
    canvas.width = 512
    canvas.height = 512

    // Clear canvas first
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Ensure the background color is properly formatted and applied
    let bgColor = backgroundColor
    if (backgroundColor.startsWith('#')) {
      bgColor = backgroundColor // Already hex format
    } else if (backgroundColor.startsWith('rgb')) {
      bgColor = backgroundColor // Already RGB format
    } else {
      // If it's a named color or other format, use it as-is
      bgColor = backgroundColor
    }

    // Fill background with coin color - ensure it's fully opaque
    ctx.globalAlpha = 1.0
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Load the icon image
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      // Calculate centered position and size
      const iconPixelSize = canvas.width * iconSize
      const x = (canvas.width - iconPixelSize) / 2
      const y = (canvas.height - iconPixelSize) / 2

      // Enable smooth rendering for better quality
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'

      // Ensure we're drawing at full opacity
      ctx.globalAlpha = 1.0

      // Draw the icon centered and scaled
      ctx.drawImage(img, x, y, iconPixelSize, iconPixelSize)

      // Create texture from canvas
      const texture = new THREE.CanvasTexture(canvas)
      texture.flipY = false // Important for GLTF models
      texture.generateMipmaps = false
      texture.minFilter = THREE.LinearFilter
      texture.magFilter = THREE.LinearFilter
      texture.wrapS = THREE.ClampToEdgeWrapping
      texture.wrapT = THREE.ClampToEdgeWrapping
      texture.format = THREE.RGBAFormat
      texture.needsUpdate = true

      resolve(texture)
    }
    img.onerror = () => {
      reject(new Error(`Failed to load icon: ${iconUrl}`))
    }
    img.src = iconUrl
  })
}

// Remove CoinEdge and CoinFaces generation – replaced by model

const CoinMesh: React.FC<{
  size: number
  coinColor: string
  headsUrl: string
  tailsUrl: string
  headsCustomImage?: string // Pass raw custom image data
  tailsCustomImage?: string // Pass raw custom image data
  coinGroup: React.RefObject<THREE.Group>
}> = ({ size, coinColor, headsUrl, tailsUrl, headsCustomImage, tailsCustomImage, coinGroup }) => {
  // Load textures for heads and tails faces
  const [headsTexture, setHeadsTexture] = useState<THREE.Texture | null>(null)
  const [tailsTexture, setTailsTexture] = useState<THREE.Texture | null>(null)

  useEffect(() => {
    const loadImageAndApplyCrop = (
      url: string,
      customImageData: string | undefined,
      setTexture: (texture: THREE.Texture) => void
    ) => {
      if (!url) {
        setTexture(new THREE.Texture()) // Set empty texture if no URL
        return
      }

      // Check if this is a custom image with crop data
      const isCustomWithCrop = customImageData?.trim().startsWith('{')

      // For default icons AND custom images without crop data, create a canvas texture with background
      if (!isCustomWithCrop) {
        createIconTexture(url, coinColor, 0.4) // 40% size to account for UV island
          .then(texture => {
            setTexture(texture)
          })
          .catch(error => {
            console.error('[ThreeCoin] Failed to create icon texture:', error)
            setTexture(new THREE.Texture()) // Set empty texture on error
          })
        return
      }

      // For custom images, use the original logic
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        // Create texture directly from the loaded image (eliminates double network request)
        const texture = new THREE.Texture(img)
        // Set flipY=false for GLTF models (prevents upside-down images)
        texture.flipY = false
        texture.generateMipmaps = false // Don't mipmap huge SVG→PNG faces
        texture.minFilter = THREE.LinearFilter

        if (customImageData?.trim().startsWith('{')) {
          try {
            const parsed = JSON.parse(customImageData)
            if (parsed.crop) {
              // Store crop data on the texture for later application
              ;(texture as any).cropData = parsed.crop
            }
          } catch (e) {
            console.error('Failed to parse crop data:', e)
          }
        }

        texture.needsUpdate = true
        setTexture(texture)
      }
      img.onerror = () => {
        console.error('Failed to load image for texture:', url)
        setTexture(new THREE.Texture()) // Set empty texture on error
      }
      img.src = url
    }

    // Load heads texture
    loadImageAndApplyCrop(headsUrl, headsCustomImage, setHeadsTexture)

    // Load tails texture
    loadImageAndApplyCrop(tailsUrl, tailsCustomImage, setTailsTexture)
  }, [headsUrl, tailsUrl, headsCustomImage, tailsCustomImage, coinColor])

  // Load the GLB model once (cached by useLoader)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const gltf = useLoader(GLTFLoader, customCoinUrl)

  // Clone and inject materials when all assets are ready
  const coinScene = useMemo(() => {
    if (!headsTexture || !tailsTexture || !gltf) return null

    const cloned = gltf.scene.clone(true) as THREE.Group

    // Measure UV bounds for face materials
    let headsFaceUV = { uMin: 0, uMax: 1, vMin: 0, vMax: 1 }
    let tailsFaceUV = { uMin: 0, uMax: 1, vMin: 0, vMax: 1 }

    // Clone textures to avoid shared state issues
    const headsTextureClone = headsTexture.clone()
    const tailsTextureClone = tailsTexture.clone()

    // Traverse to replace materials and measure UV bounds
    cloned.traverse(obj => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh
        const mat = mesh.material as THREE.MeshBasicMaterial | THREE.MeshStandardMaterial
        const matName = mat.name || mesh.name

        if (matName === 'HeadsFaceMat') {
          headsFaceUV = getUVBounds(mesh)
          // Check if texture has actual image content
          const hasHeadsImage = headsTextureClone.image && headsTextureClone.image.width > 0
          mesh.material = new THREE.MeshBasicMaterial({
            map: hasHeadsImage ? headsTextureClone : undefined,
            color: hasHeadsImage ? undefined : coinColor, // Use coin color if no image
            transparent: hasHeadsImage, // Only transparent if we have an image
            opacity: 1.0,
            alphaTest: hasHeadsImage ? 0.1 : 0, // Only use alpha test with images
            side: THREE.DoubleSide,
            depthWrite: true,
            depthTest: true,
          })
        } else if (matName === 'TailsFaceMat') {
          tailsFaceUV = getUVBounds(mesh)
          // Check if texture has actual image content
          const hasTailsImage = tailsTextureClone.image && tailsTextureClone.image.width > 0
          mesh.material = new THREE.MeshBasicMaterial({
            map: hasTailsImage ? tailsTextureClone : undefined,
            color: hasTailsImage ? undefined : coinColor, // Use coin color if no image
            transparent: hasTailsImage, // Only transparent if we have an image
            opacity: 1.0,
            alphaTest: hasTailsImage ? 0.1 : 0, // Only use alpha test with images
            side: THREE.DoubleSide,
            depthWrite: true,
            depthTest: true,
          })
        } else if (matName === 'RimMat') {
          mesh.material = new THREE.MeshBasicMaterial({
            color: coinColor,
            side: THREE.DoubleSide,
            transparent: false,
            opacity: 1.0,
          })
        }
      }
    })

    // Apply crop data if available - use cloned textures to avoid interference
    if ((headsTexture as any).cropData) {
      // Copy crop data to cloned texture
      ;(headsTextureClone as any).cropData = (headsTexture as any).cropData
      applyCropToTexture(
        headsTextureClone,
        (headsTextureClone as any).cropData,
        headsTextureClone.image as HTMLImageElement,
        headsFaceUV
      )
    } else if (headsTextureClone.image) {
      // Calculate UV island mapping
      const uSpan = headsFaceUV.uMax - headsFaceUV.uMin
      const vSpan = headsFaceUV.vMax - headsFaceUV.vMin

      // Apply UV island mapping
      headsTextureClone.flipY = false
      headsTextureClone.wrapS = headsTextureClone.wrapT = THREE.ClampToEdgeWrapping
      headsTextureClone.repeat.set(uSpan, vSpan)
      headsTextureClone.offset.set(headsFaceUV.uMin, headsFaceUV.vMin)
      headsTextureClone.needsUpdate = true
    }

    if ((tailsTexture as any).cropData) {
      // Copy crop data to cloned texture
      ;(tailsTextureClone as any).cropData = (tailsTexture as any).cropData
      applyCropToTexture(
        tailsTextureClone,
        (tailsTextureClone as any).cropData,
        tailsTextureClone.image as HTMLImageElement,
        tailsFaceUV
      )
    } else if (tailsTextureClone.image) {
      // Calculate UV island mapping
      const uSpan = tailsFaceUV.uMax - tailsFaceUV.uMin
      const vSpan = tailsFaceUV.vMax - tailsFaceUV.vMin

      // Apply UV island mapping (same logic as heads)
      tailsTextureClone.flipY = false
      tailsTextureClone.wrapS = tailsTextureClone.wrapT = THREE.ClampToEdgeWrapping
      tailsTextureClone.repeat.set(uSpan, vSpan)
      tailsTextureClone.offset.set(tailsFaceUV.uMin, tailsFaceUV.vMin)
      tailsTextureClone.needsUpdate = true
    }

    return { scene: cloned, headsFaceUV, tailsFaceUV }
  }, [gltf, headsTexture, tailsTexture, coinColor])

  if (!coinScene) return null

  // Scale model based on size parameter
  // With fixed orthographic camera, we need to scale the model to achieve desired size
  const baseSize = 1
  const scaleFactor = size / baseSize

  return (
    <group ref={coinGroup} scale={[scaleFactor, scaleFactor, scaleFactor]}>
      {/* eslint-disable-next-line react/no-unknown-property */}
      <primitive object={coinScene.scene} />
    </group>
  )
}

export const ThreeCoin: React.FC<ThreeCoinProps> = ({
  size,
  coinColor,
  headsCustomImage,
  tailsCustomImage,
  animationPreset,
  animationDuration,
  flipCount,
  flipResult,
  isFlipping,
  onAnimationComplete,
  playerChoice,
  onCoinClick,
}) => {
  const [isHovered, setIsHovered] = useState(false)

  // Parse custom image URLs (they can be direct URLs or JSON with crop data)
  const getImageUrl = (customImage?: string): string => {
    if (!customImage) return ''

    // Check if it's JSON format with crop data
    if (customImage.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(customImage)
        if (parsed && typeof parsed.url === 'string') {
          return parsed.url
        }
      } catch (e) {
        console.error('Failed to parse crop data:', e)
      }
    }

    // Otherwise treat as direct URL
    return customImage
  }

  const headsUrl = getImageUrl(headsCustomImage)
  const tailsUrl = getImageUrl(tailsCustomImage)

  const coinGroup = useRef<THREE.Group>(null)

  useEffect(() => {
    let frameId: number | null = null

    const startFlipAnimation = () => {
      if (!coinGroup.current) return

      const duration = animationDuration
      const startTime = Date.now()

      // Base rotation on Y axis to ensure the correct face is shown at the end
      const baseRotY = flipResult === CoinFlipSelection.Tails ? Math.PI : 0

      // Total rotation amount based on flipCount (full 360° spins)
      const totalRot = flipCount * 2 * Math.PI

      const animateFrame = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Ease-out cubic for natural deceleration
        const t = progress
        const eased = 1 - Math.pow(1 - t, 3)

        if (coinGroup.current) {
          switch (animationPreset) {
            case 'flip': {
              // Rotate around X axis while keeping Y fixed for face orientation
              const rotX = totalRot * (1 - eased)
              coinGroup.current.rotation.x = rotX
              coinGroup.current.rotation.y = baseRotY
              break
            }
            case 'twist': {
              // Combine X and Y rotations for a tumbling effect
              const rotY = baseRotY + totalRot * (1 - eased)
              const rotX = totalRot * 0.25 * (1 - eased) // quarter speed on X for subtle tumble
              coinGroup.current.rotation.y = rotY
              coinGroup.current.rotation.x = rotX
              break
            }
            case 'spin':
            default: {
              // Classic spin around Y axis
              const rotY = baseRotY + totalRot * (1 - eased)
              coinGroup.current.rotation.y = rotY
              coinGroup.current.rotation.x = 0
            }
          }

          if (progress < 1) {
            frameId = requestAnimationFrame(animateFrame)
          } else {
            // Ensure final orientation
            coinGroup.current.rotation.y = baseRotY
            coinGroup.current.rotation.x = 0
            onAnimationComplete()
          }
        }
      }

      frameId = requestAnimationFrame(animateFrame)
    }

    const orientToSide = () => {
      if (!coinGroup.current) return

      const sideToShow = flipResult ?? playerChoice
      if (!sideToShow) return

      const targetY = sideToShow === CoinFlipSelection.Tails ? Math.PI : 0
      const currentY = coinGroup.current.rotation.y

      let normalizedTarget = targetY
      let normalizedCurrent = currentY % (2 * Math.PI)
      if (normalizedCurrent < 0) normalizedCurrent += 2 * Math.PI

      // Choose shortest path
      if (Math.abs(normalizedTarget - normalizedCurrent) > Math.PI) {
        if (normalizedTarget > normalizedCurrent) {
          normalizedCurrent += 2 * Math.PI
        } else {
          normalizedTarget += 2 * Math.PI
        }
      }

      const startTime = Date.now()
      const duration = 300

      const animateToChoice = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)

        if (coinGroup.current) {
          const eased = 1 - Math.pow(1 - progress, 2)
          const currentRot = normalizedCurrent + (normalizedTarget - normalizedCurrent) * eased

          coinGroup.current.rotation.x = 0
          coinGroup.current.rotation.y = currentRot

          if (progress < 1) {
            frameId = requestAnimationFrame(animateToChoice)
          } else {
            coinGroup.current.rotation.y = targetY
          }
        }
      }

      frameId = requestAnimationFrame(animateToChoice)
    }

    if (isFlipping) {
      startFlipAnimation()
    } else {
      orientToSide()
    }

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId)
      }
    }
  }, [
    isFlipping,
    animationPreset,
    animationDuration,
    flipCount,
    flipResult,
    playerChoice,
    onAnimationComplete,
  ])

  // Use fixed orthographic zoom and scale the model instead
  // This ensures consistent sizing behavior
  const fixedZoom = 1.5 // Fixed zoom level for consistent viewport

  return (
    <Canvas
      style={{
        width: '100%',
        height: '100%',
        background: 'transparent',
        cursor: onCoinClick && !isFlipping ? 'pointer' : 'default',
      }}
      orthographic
      camera={{ position: [0, 0, 100], zoom: fixedZoom }}
      gl={{ alpha: true, antialias: true }}
      onClick={onCoinClick}
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => setIsHovered(false)}
    >
      <group scale={isHovered && !isFlipping ? 1.01 : 1}>
        <CoinMesh
          size={size}
          coinColor={coinColor}
          headsUrl={headsUrl}
          tailsUrl={tailsUrl}
          headsCustomImage={headsCustomImage}
          tailsCustomImage={tailsCustomImage}
          coinGroup={coinGroup}
        />
      </group>
      <ambientLight intensity={1} />
    </Canvas>
  )
}
