import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { checkAllBadges, getUserBadges } from './badges'
import { useUserId } from './useUserId'
import BadgeToast from '../components/BadgeToast'

const BadgeCtx = createContext(null)

export function BadgeProvider({ children }) {
  const { userId } = useUserId()
  const [userBadges, setUserBadges] = useState([])
  const [toastQueue, setToastQueue] = useState([])
  const debounceRef = useRef(null)

  // Load badges on mount
  useEffect(() => {
    if (!userId) return
    getUserBadges(userId).then(setUserBadges)
  }, [userId])

  const triggerBadgeCheck = useCallback(() => {
    if (!userId) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const newBadges = await checkAllBadges(userId)
      if (newBadges.length > 0) {
        setToastQueue((prev) => [...prev, ...newBadges])
        getUserBadges(userId).then(setUserBadges)
      }
    }, 2000)
  }, [userId])

  const dismissToast = useCallback(() => {
    setToastQueue((prev) => prev.slice(1))
  }, [])

  return (
    <BadgeCtx.Provider value={{ triggerBadgeCheck, userBadges, badgeCount: userBadges.length }}>
      {children}
      {toastQueue.length > 0 && (
        <BadgeToast badge={toastQueue[0]} onClose={dismissToast} />
      )}
    </BadgeCtx.Provider>
  )
}

export function useBadges() {
  return useContext(BadgeCtx)
}
