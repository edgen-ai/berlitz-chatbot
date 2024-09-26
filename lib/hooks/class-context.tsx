'use client'

import * as React from 'react'

interface ClassContextType {
  selectedClass: string
  setSelectedClass: (id: string) => void
}

const ClassContext = React.createContext<ClassContextType | undefined>(
  undefined
)

export function useClass() {
  const context = React.useContext(ClassContext)
  if (!context) {
    throw new Error('useClass must be used within a ClassProvider')
  }
  return context
}

interface ClassProviderProps {
  children: React.ReactNode
}

export function ClassProvider({ children }: ClassProviderProps) {
  const [selectedClass, setSelectedClass] = React.useState<string | null>(null)
  const [initialStoredClass, setInitialStoredClass] = React.useState<
    string | null
  >(null)
  const isInitialRender = React.useRef(true)

  // On initial render, set the selectedClass from localStorage
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedClass = localStorage.getItem('selectedClass')
      if (storedClass) {
        setSelectedClass(storedClass)
        setInitialStoredClass(storedClass)
        console.log('Loaded stored class', storedClass)
      } else {
        setSelectedClass('1') // Default to '1' if no class is stored
        setInitialStoredClass('1') // Also set as initialStoredClass
        console.log('Set default class to 1')
      }
    }
  }, [])

  // Only reload if the selectedClass changes from the initialStoredClass
  React.useEffect(() => {
    if (!isInitialRender.current && selectedClass !== initialStoredClass) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedClass', selectedClass || '1')
        console.log('Saving new class and reloading', selectedClass)
        window.location.reload()
      }
    } else if (isInitialRender.current) {
      isInitialRender.current = false
    }
  }, [selectedClass, initialStoredClass])

  // Optionally render a loading indicator while selectedClass is being set
  if (selectedClass === null) {
    return <div>Loading...</div>
  }

  return (
    <ClassContext.Provider value={{ selectedClass, setSelectedClass }}>
      {children}
    </ClassContext.Provider>
  )
}
