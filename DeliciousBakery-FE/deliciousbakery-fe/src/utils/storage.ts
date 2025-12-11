// Safe storage wrapper that handles tracking prevention and other storage errors
const isStorageAvailable = (): boolean => {
  try {
    const test = '__storage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

export const safeStorage = {
  get<T>(key: string, fallback: T): T {
    if (!isStorageAvailable()) return fallback
    try {
      const raw = window.localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : fallback
    } catch {
      return fallback
    }
  },
  set<T>(key: string, value: T) {
    if (!isStorageAvailable()) return
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      // Silently fail if storage is blocked (tracking prevention, etc.)
      console.warn('Storage access blocked:', error)
    }
  },
  remove(key: string) {
    if (!isStorageAvailable()) return
    try {
      window.localStorage.removeItem(key)
    } catch (error) {
      // Silently fail if storage is blocked
      console.warn('Storage access blocked:', error)
    }
  },
}

// Zustand persist storage adapter that handles errors gracefully
export const createSafeStorage = () => ({
  getItem: (name: string): string | null => {
    try {
      if (!isStorageAvailable()) return null
      return localStorage.getItem(name)
    } catch {
      return null
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      if (!isStorageAvailable()) return
      localStorage.setItem(name, value)
    } catch (error) {
      // Silently fail if storage is blocked
      console.warn('Storage access blocked for', name, error)
    }
  },
  removeItem: (name: string): void => {
    try {
      if (!isStorageAvailable()) return
      localStorage.removeItem(name)
    } catch (error) {
      // Silently fail if storage is blocked
      console.warn('Storage access blocked for', name, error)
    }
  },
})

// SessionStorage adapter for tab-specific storage (doesn't sync across tabs)
// Use this for authentication to prevent cross-tab login synchronization
export const createSessionStorage = () => ({
  getItem: (name: string): string | null => {
    try {
      if (!isStorageAvailable()) return null
      return sessionStorage.getItem(name)
    } catch {
      return null
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      if (!isStorageAvailable()) return
      sessionStorage.setItem(name, value)
    } catch (error) {
      // Silently fail if storage is blocked
      console.warn('SessionStorage access blocked for', name, error)
    }
  },
  removeItem: (name: string): void => {
    try {
      if (!isStorageAvailable()) return
      sessionStorage.removeItem(name)
    } catch (error) {
      // Silently fail if storage is blocked
      console.warn('SessionStorage access blocked for', name, error)
    }
  },
})