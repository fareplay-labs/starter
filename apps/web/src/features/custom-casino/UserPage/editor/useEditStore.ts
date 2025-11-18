// @ts-nocheck
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { createSelectors } from '../../../../store/helpers/createSelectors'
import { type IPageConfigData } from '../../config/PageConfig'

// Define types for modals
export type ModalType =
  | 'color'
  | 'font'
  | 'gameSelect'
  | 'text'
  | 'image'
  | 'link'
  | 'sectionCreate'
  | 'socials'

// Types for modal state
export interface ModalState {
  imageModal: {
    isOpen: boolean
    fieldName: string
  }
  linkModal: {
    isOpen: boolean
    fieldName: string
  }
  textModal: {
    isOpen: boolean
    fieldName: string
  }
  colorModal: {
    isOpen: boolean
    fieldName: string
  }
  fontModal: {
    isOpen: boolean
    fieldName: string
  }
  gameSelectModal: {
    isOpen: boolean
    sectionId: string
    selectedGames: string[]
    currentLayout?: 'carousel' | 'smallTiles' | 'largeTiles'
  }
  sectionCreateModal: {
    isOpen: boolean
    title: string
  }
  socialsModal: {
    isOpen: boolean
  }
}

// Map modal types to IDs
export const MODAL_TYPE_TO_ID: Record<ModalType, string> = {
  image: 'image-edit',
  link: 'link-edit',
  text: 'text-edit',
  color: 'color-edit',
  font: 'font-edit',
  gameSelect: 'game-select',
  sectionCreate: 'section-create',
  socials: 'socials-edit',
}

// Map IDs to modal types
export const ID_TO_MODAL_TYPE: Record<string, ModalType> = {
  'image-edit': 'image',
  'link-edit': 'link',
  'text-edit': 'text',
  'color-edit': 'color',
  'font-edit': 'font',
  'game-select': 'gameSelect',
  'section-create': 'sectionCreate',
  'socials-edit': 'socials',
}

// Generic modal actions
export interface GenericModalActions {
  // Generic modal handlers
  openModal: (modalType: ModalType, fieldName?: string) => void
  closeModal: (modalType?: ModalType) => void
  updateModalData: <K extends keyof ModalState>(
    modalType: ModalType,
    data: Partial<ModalState[K]>
  ) => void
}

// State and actions for edit mode
export type EditState = {
  isEditMode: boolean
  activeModal: string | null
  activeField: string | null
  casinoConfig: IPageConfigData | null
  originalConfig: IPageConfigData | null
  isDirty: boolean
  pendingChanges: Record<string, any>
  // Add modal state
  modalState: ModalState
}

export type EditActions = {
  // Edit mode control
  setEditMode: (isEditMode: boolean) => void

  // Configuration management
  setCasinoConfig: (config: IPageConfigData) => void
  updateConfig: (field: keyof IPageConfigData | 'sections', value: any) => void
  updateSocialLink: (platform: string, value: string) => void

  // Changes management
  savePendingChanges: () => void
  discardPendingChanges: () => void

  // Local storage synchronization
  saveToLocalStorage: () => void
  loadFromLocalStorage: () => void

  // New section methods
  addSection: (section: {
    id: string
    title: string
    layout: 'carousel' | 'smallTiles' | 'largeTiles'
  }) => void
  removeSection: (sectionId: string) => void
  updateSection: (sectionId: string, field: string, value: any) => void
  updateSectionGames: (sectionId: string, gameIds: string[]) => void
  reorderSections: (sectionIds: string[]) => void
} & GenericModalActions

export type EditStore = EditState & EditActions

// Initial state for modals
const initialModalState: ModalState = {
  imageModal: { isOpen: false, fieldName: '' },
  linkModal: { isOpen: false, fieldName: '' },
  textModal: { isOpen: false, fieldName: '' },
  colorModal: { isOpen: false, fieldName: '' },
  fontModal: { isOpen: false, fieldName: '' },
  gameSelectModal: { isOpen: false, sectionId: '', selectedGames: [], currentLayout: 'carousel' },
  sectionCreateModal: { isOpen: false, title: '' },
  socialsModal: { isOpen: false },
}

// Helper function to get corresponding modal state key
const getModalStateKey = (modalType: ModalType): keyof ModalState =>
  `${modalType}Modal` as keyof ModalState

// Create the store with immer middleware for easier state updates
const useEditStoreBase = create<EditStore>()(
  immer((set, get) => ({
    // Initial state
    isEditMode: false,
    activeModal: null,
    activeField: null,
    casinoConfig: null,
    originalConfig: null,
    isDirty: false,
    pendingChanges: {},
    modalState: initialModalState,

    // Generic modal actions
    openModal: (modalType: ModalType, fieldName?: string) => {
      set(state => {
        // Reset modal state to initial
        state.modalState = { ...initialModalState }

        // Update the specific modal
        const modalKey = getModalStateKey(modalType)

        switch (modalType) {
          case 'image':
          case 'link':
          case 'text':
          case 'color':
          case 'font':
            // These modals just need fieldName
            ;(state.modalState[modalKey] as any) = {
              isOpen: true,
              fieldName: fieldName || '',
            }
            break

          case 'gameSelect':
            // Game select needs sectionId, selected games, and current layout
            let selectedGames: string[] = []
            let currentLayout: 'carousel' | 'smallTiles' | 'largeTiles' = 'carousel'
            if (fieldName && state.casinoConfig?.sections) {
              const section = state.casinoConfig.sections.find(s => s.id === fieldName)
              if (section) {
                if (section.gameIds) {
                  selectedGames = section.gameIds
                }
                if (section.layout) {
                  currentLayout = section.layout
                }
              }
            }
            state.modalState.gameSelectModal = {
              isOpen: true,
              sectionId: fieldName || '',
              selectedGames,
              currentLayout,
            }
            break

          case 'sectionCreate':
            // Section create just needs isOpen
            state.modalState.sectionCreateModal = {
              isOpen: true,
              title: '',
            }
            break

          case 'socials':
            // Socials just needs isOpen
            state.modalState.socialsModal = {
              isOpen: true,
            }
            break
        }

        // Also update legacy state
        state.activeModal = MODAL_TYPE_TO_ID[modalType]
        state.activeField = fieldName || null
      })
    },

    closeModal: (modalType?: ModalType) => {
      set(state => {
        if (modalType) {
          // Close just the specific modal
          const modalKey = getModalStateKey(modalType)
          // Reset the specific modal to initial state
          ;(state.modalState[modalKey] as any) = initialModalState[modalKey] as any

          // Only reset legacy state if we're closing the active modal
          if (state.activeModal === MODAL_TYPE_TO_ID[modalType]) {
            state.activeModal = null
            state.activeField = null
          }
        } else {
          // Close all modals
          state.modalState = { ...initialModalState }
          state.activeModal = null
          state.activeField = null
        }
      })
    },

    updateModalData: (modalType, data) => {
      set(state => {
        const modalKey = getModalStateKey(modalType)
        ;(state.modalState[modalKey] as any) = {
          ...(state.modalState[modalKey] as any),
          ...data,
        }
      })
    },

    // Edit mode control
    setEditMode: (isEditMode: boolean) => {
      set(state => {
        state.isEditMode = isEditMode
        // If exiting edit mode without saving, discard changes
        if (!isEditMode && state.isDirty) {
          state.pendingChanges = {}
          state.isDirty = false
          if (state.originalConfig) {
            state.casinoConfig = { ...state.originalConfig }
          }
        }
      })
    },

    // Configuration management
    setCasinoConfig: (config: IPageConfigData) => {
      set(state => {
        state.casinoConfig = config
        state.originalConfig = { ...config }
        state.pendingChanges = {}
        state.isDirty = false
      })
    },

    updateConfig: (field: keyof IPageConfigData | 'sections', value: any) => {
      set(state => {
        if (state.casinoConfig) {
          // Special handling for sections which we pass as JSON string
          if (field === 'sections' && typeof value === 'string') {
            try {
              const parsedSections = JSON.parse(value)
              state.casinoConfig.sections = parsedSections
            } catch (error) {
              console.error('Error parsing sections JSON:', error)
            }
          }
          // Special handling for section games
          else if (
            field.startsWith('section.') &&
            field.endsWith('.games') &&
            typeof value === 'string'
          ) {
            try {
              const parsedGameIds = JSON.parse(value)

              // Extract section ID from field name
              const sectionId = field.match(/section\.([^.]+)\.games/)?.[1]

              if (sectionId && state.casinoConfig.sections) {
                const section = state.casinoConfig.sections.find(s => s.id === sectionId)

                if (section) {
                  section.gameIds = parsedGameIds
                }
              }
            } catch (error) {
              console.error('Error parsing game IDs JSON:', error)
            }
          }
          // Special handling for section layout
          else if (field.startsWith('section.') && field.endsWith('.layout')) {
            // Extract section ID from field name
            const sectionId = field.match(/section\.([^.]+)\.layout/)?.[1]
            if (sectionId && state.casinoConfig.sections) {
              const section = state.casinoConfig.sections.find(s => s.id === sectionId)
              if (section) {
                section.layout = value as 'carousel' | 'smallTiles' | 'largeTiles'
              }
            }
          }
          // Special handling for section title
          else if (field.startsWith('section.') && field.endsWith('.title')) {
            // Extract section ID from field name
            const sectionId = field.match(/section\.([^.]+)\.title/)?.[1]
            if (sectionId && state.casinoConfig.sections) {
              const section = state.casinoConfig.sections.find(s => s.id === sectionId)
              if (section) {
                section.title = value
              } else {
                console.error('Section not found for title update:', sectionId)
              }
            } else {
              console.error('Invalid section ID for title update:', field)
            }
          }
          // Special handling for socialLinks which we may pass as JSON string
          else if (field === 'socialLinks' && typeof value === 'string') {
            try {
              const parsedSocialLinks = JSON.parse(value)

              state.casinoConfig.socialLinks = {
                ...state.casinoConfig.socialLinks,
                ...parsedSocialLinks,
              }
            } catch (error) {
              console.error('Error parsing socialLinks JSON:', error)
            }
          } else {
            // Cast field to keyof IPageConfigData to fix type error
            ;(state.casinoConfig as any)[field] = value
          }
          state.pendingChanges[field] = value
          state.isDirty = true
        }
      })
    },

    updateSocialLink: (platform, url) => {
      set(state => {
        if (state.casinoConfig?.socialLinks) {
          // Update the links array
          if (!state.casinoConfig.socialLinks.links) {
            state.casinoConfig.socialLinks.links = []
          }

          // Handle the special case of layoutType
          if (platform === 'layoutType') {
            state.casinoConfig.socialLinks.layoutType = url as
              | 'horizontal'
              | 'vertical'
              | 'showLinks'
          } else {
            // For normal links, we add or update the URL in the links array
            // We'll use platform as an index in the array for now
            const linkIndex = parseInt(platform as string, 10)
            if (!isNaN(linkIndex) && linkIndex >= 0) {
              // If it's a valid index, update or extend the array
              while (state.casinoConfig.socialLinks.links.length <= linkIndex) {
                state.casinoConfig.socialLinks.links.push('')
              }
              state.casinoConfig.socialLinks.links[linkIndex] = url
            }
          }

          // Update pendingChanges for the social links
          if (!state.pendingChanges.socialLinks) {
            state.pendingChanges.socialLinks = { ...state.casinoConfig.socialLinks }
          } else {
            state.pendingChanges.socialLinks = {
              ...state.pendingChanges.socialLinks,
              ...state.casinoConfig.socialLinks,
            }
          }
          state.isDirty = true
        }
      })
    },

    // Changes management
    savePendingChanges: () => {
      set(state => {
        state.isDirty = false
        state.pendingChanges = {}
        if (state.casinoConfig) {
          state.originalConfig = { ...state.casinoConfig }
        }
      })
    },

    discardPendingChanges: () => {
      set(state => {
        state.pendingChanges = {}
        state.isDirty = false
        if (state.originalConfig) {
          state.casinoConfig = { ...state.originalConfig }
        }
      })
    },

    // Local storage synchronization
    saveToLocalStorage: () => {
      const state = get()
      if (state.casinoConfig) {
        localStorage.setItem('casinoConfig', JSON.stringify(state.casinoConfig))
      }
    },

    loadFromLocalStorage: () => {
      const savedConfigJson = localStorage.getItem('casinoConfig')
      if (savedConfigJson) {
        try {
          const savedConfig = JSON.parse(savedConfigJson)
          set(state => {
            state.casinoConfig = savedConfig
            state.originalConfig = { ...savedConfig }
            state.pendingChanges = {}
            state.isDirty = false
          })
        } catch (error) {
          console.error('Error loading configuration from localStorage:', error)
        }
      }
    },

    // Section methods
    addSection: section => {
      set(state => {
        if (state.casinoConfig) {
          if (!state.casinoConfig.sections) {
            state.casinoConfig.sections = []
          }
          // Add the new section
          state.casinoConfig.sections.push({
            ...section,
            gameIds: [],
          })
          // Update pendingChanges
          state.pendingChanges.sections = [...state.casinoConfig.sections]
          state.isDirty = true
        }
      })
    },

    removeSection: sectionId => {
      set(state => {
        if (state.casinoConfig?.sections) {
          // Remove the section
          state.casinoConfig.sections = state.casinoConfig.sections.filter(s => s.id !== sectionId)
          // Update pendingChanges
          state.pendingChanges.sections = [...state.casinoConfig.sections]
          state.isDirty = true
        }
      })
    },

    updateSection: (sectionId, field, value) => {
      set(state => {
        if (state.casinoConfig?.sections) {
          // Find and update the section
          const section = state.casinoConfig.sections.find(s => s.id === sectionId)
          if (section) {
            ;(section as any)[field] = value
            // Update pendingChanges
            state.pendingChanges.sections = [...state.casinoConfig.sections]
            state.isDirty = true
          } else {
            console.error('updateSection - Section not found:', sectionId)
          }
        } else {
          console.error('updateSection - No sections array in casinoConfig')
        }
      })
    },

    updateSectionGames: (sectionId, gameIds) => {
      set(state => {
        if (state.casinoConfig?.sections) {
          // Find and update the section
          const section = state.casinoConfig.sections.find(s => s.id === sectionId)
          if (section) {
            section.gameIds = gameIds
            // Update pendingChanges
            state.pendingChanges.sections = [...state.casinoConfig.sections]
            state.isDirty = true
          }
        }
      })
    },

    reorderSections: sectionIds => {
      set(state => {
        if (state.casinoConfig?.sections) {
          // Create a new sorted array based on the order of sectionIds
          const reorderedSections = sectionIds
            .map(id => state.casinoConfig?.sections?.find(s => s.id === id))
            .filter(Boolean) as IPageConfigData['sections']

          if (
            reorderedSections &&
            reorderedSections.length === state.casinoConfig.sections.length
          ) {
            state.casinoConfig.sections = reorderedSections
            // Update pendingChanges
            state.pendingChanges.sections = [...state.casinoConfig.sections]
            state.isDirty = true
          }
        }
      })
    },
  }))
)

// Add selectors to the store
export const useEditStore = createSelectors(useEditStoreBase)
