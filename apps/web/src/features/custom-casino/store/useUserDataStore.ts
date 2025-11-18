// @ts-nocheck
import { create } from 'zustand'

const useUserDataStore = create(() => ({
  userData: null,
  setUserData: () => {},
}))

export default useUserDataStore
