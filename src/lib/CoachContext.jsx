import { createContext, useContext, useState, useCallback } from 'react'

const CoachCtx = createContext(null)

export function CoachProvider({ children }) {
  const [coachContext, setCoachContextState] = useState({ type: 'general', id: null, data: null })
  const [isCoachOpen, setIsCoachOpen] = useState(false)
  const [isCoachDisabled, setIsCoachDisabled] = useState(false)

  const setCoachContext = useCallback((type, id = null, data = null) => {
    setCoachContextState({ type, id, data })
  }, [])

  const openCoach = useCallback(() => { if (!isCoachDisabled) setIsCoachOpen(true) }, [isCoachDisabled])
  const closeCoach = useCallback(() => setIsCoachOpen(false), [])
  const toggleCoach = useCallback(() => { if (!isCoachDisabled) setIsCoachOpen((p) => !p) }, [isCoachDisabled])

  const disableCoach = useCallback(() => {
    setIsCoachOpen(false)
    setIsCoachDisabled(true)
  }, [])

  const enableCoach = useCallback(() => {
    setIsCoachDisabled(false)
  }, [])

  return (
    <CoachCtx.Provider value={{ coachContext, setCoachContext, isCoachOpen, isCoachDisabled, openCoach, closeCoach, toggleCoach, disableCoach, enableCoach }}>
      {children}
    </CoachCtx.Provider>
  )
}

export function useCoach() {
  return useContext(CoachCtx)
}
