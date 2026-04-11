import { createContext, useContext, useState, useCallback } from 'react'

const CoachCtx = createContext(null)

export function CoachProvider({ children }) {
  const [coachContext, setCoachContextState] = useState({ type: 'general', id: null, data: null })
  const [isCoachOpen, setIsCoachOpen] = useState(false)

  const setCoachContext = useCallback((type, id = null, data = null) => {
    setCoachContextState({ type, id, data })
  }, [])

  const openCoach = useCallback(() => setIsCoachOpen(true), [])
  const closeCoach = useCallback(() => setIsCoachOpen(false), [])
  const toggleCoach = useCallback(() => setIsCoachOpen((p) => !p), [])

  return (
    <CoachCtx.Provider value={{ coachContext, setCoachContext, isCoachOpen, openCoach, closeCoach, toggleCoach }}>
      {children}
    </CoachCtx.Provider>
  )
}

export function useCoach() {
  return useContext(CoachCtx)
}
