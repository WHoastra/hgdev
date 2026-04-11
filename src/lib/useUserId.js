import { useUser } from '@clerk/clerk-react'

export function useUserId() {
  try {
    const { user, isLoaded } = useUser()
    return { userId: user?.id || null, isLoaded }
  } catch {
    return { userId: null, isLoaded: true }
  }
}
