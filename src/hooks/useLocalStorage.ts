import { useState, useEffect, useCallback } from 'react'

type Setter<T> = (value: T) => void

const subscribers = new Map<string, Set<Setter<unknown>>>()

function notifySubscribers<T>(key: string, value: T) {
  const setters = subscribers.get(key)
  if (!setters) return
  setters.forEach(setter => setter(value as unknown))
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  migrate?: (stored: unknown) => T
): [T, (value: T | ((prev: T) => T)) => void] {
  const getInitialValue = useCallback((): T => {
    try {
      const item = window.localStorage.getItem(key)
      if (!item) return initialValue
      const parsed = JSON.parse(item) as unknown
      return migrate ? migrate(parsed) : (parsed as T)
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  }, [key, initialValue, migrate])

  const [storedValue, setStoredValue] = useState<T>(getInitialValue)

  useEffect(() => {
    if (!subscribers.has(key)) {
      subscribers.set(key, new Set())
    }
    const setters = subscribers.get(key)!
    const setter = (value: unknown) => setStoredValue(value as T)
    setters.add(setter)
    return () => {
      setters.delete(setter)
    }
  }, [key])

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
        setStoredValue(valueToStore)
        notifySubscribers(key, valueToStore)
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key, storedValue]
  )

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as unknown
          const value = migrate ? migrate(parsed) : (parsed as T)
          setStoredValue(value)
        } catch {
          // ignore
        }
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [key, migrate])

  return [storedValue, setValue]
}
