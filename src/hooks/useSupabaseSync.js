import { useEffect, useRef, useState, useCallback } from 'react'
import { auth, database } from '../lib/supabase'

export const useSupabaseSync = (
  milestones,
  customMoods,
  customCategories,
  selectedWeeks,
  pinnedWeeks,
  selectedColor,
  goals
) => {
  // Cache authenticated user to avoid redundant auth calls
  const [cachedUser, setCachedUser] = useState(null)
  const userFetchedRef = useRef(false)

  // Use refs to track timeouts for proper cleanup
  const milestonesTimeoutRef = useRef(null)
  const selectionsTimeoutRef = useRef(null)
  const goalsTimeoutRef = useRef(null)

  // Fetch and cache user on mount, listen for auth changes
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { user } = await auth.getCurrentUser()
        setCachedUser(user)
        userFetchedRef.current = true
      } catch (error) {
        console.error('[Viventiva Sync] Error fetching user:', error)
        setCachedUser(null)
      }
    }

    fetchUser()

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setCachedUser(session.user)
      } else if (event === 'SIGNED_OUT') {
        setCachedUser(null)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  // Helper to get current user (uses cache, avoids redundant calls)
  const getUser = useCallback(async () => {
    if (cachedUser) return cachedUser
    if (!userFetchedRef.current) {
      const { user } = await auth.getCurrentUser()
      setCachedUser(user)
      userFetchedRef.current = true
      return user
    }
    return null
  }, [cachedUser])

  // Sync milestones, customMoods, and customCategories
  useEffect(() => {
    if (milestonesTimeoutRef.current) {
      clearTimeout(milestonesTimeoutRef.current)
    }

    // Don't sync if no cached user yet (wait for auth)
    if (!cachedUser) return

    milestonesTimeoutRef.current = setTimeout(async () => {
      try {
        const user = await getUser()
        if (!user) return

        const milestoneData = {
          milestones: milestones || {},
          customMoods: customMoods || {},
          customCategories: customCategories || {},
        }

        const { error } = await database.saveMilestones(user.id, milestoneData)
        if (error) {
          console.error('[Viventiva Sync] Error saving milestones:', error)
          try {
            const { toast } = await import('../utils/toast')
            const { getUserFriendlyError } = await import('../utils/errorMessages')
            toast.error(`Failed to save: ${getUserFriendlyError(error)}`)
          } catch {
            /* ignore toast errors */
          }
        }
      } catch (error) {
        console.error('[Viventiva Sync] Error syncing milestones:', error)
      }
    }, 500)

    return () => {
      if (milestonesTimeoutRef.current) {
        clearTimeout(milestonesTimeoutRef.current)
      }
    }
  }, [milestones, customMoods, customCategories, cachedUser, getUser])

  // Sync selections
  useEffect(() => {
    if (selectionsTimeoutRef.current) {
      clearTimeout(selectionsTimeoutRef.current)
    }

    if (!cachedUser) return

    selectionsTimeoutRef.current = setTimeout(async () => {
      try {
        const user = await getUser()
        if (!user) return

        const selectionsData = {
          selectedWeeks: Array.from(selectedWeeks || new Set()),
          pinnedWeeks: Array.from(pinnedWeeks || new Set()),
          selectedColor: selectedColor,
        }

        const { error } = await database.saveSelections(user.id, selectionsData)
        if (error) {
          console.error('[Viventiva Sync] Error saving selections:', error)
          try {
            const { toast } = await import('../utils/toast')
            const { getUserFriendlyError } = await import('../utils/errorMessages')
            toast.error(`Failed to save selections: ${getUserFriendlyError(error)}`)
          } catch {
            /* ignore toast errors */
          }
        }
      } catch (error) {
        console.error('[Viventiva Sync] Error syncing selections:', error)
      }
    }, 500)

    return () => {
      if (selectionsTimeoutRef.current) {
        clearTimeout(selectionsTimeoutRef.current)
      }
    }
  }, [selectedWeeks, pinnedWeeks, selectedColor, cachedUser, getUser])

  // Sync goals
  useEffect(() => {
    if (goalsTimeoutRef.current) {
      clearTimeout(goalsTimeoutRef.current)
    }

    if (!cachedUser) return

    goalsTimeoutRef.current = setTimeout(async () => {
      try {
        const user = await getUser()
        if (!user) return

        const { error } = await database.saveGoals(user.id, goals)
        if (error) {
          console.error('[Viventiva Sync] Error saving goals:', error)
          try {
            const { toast } = await import('../utils/toast')
            const { getUserFriendlyError } = await import('../utils/errorMessages')
            toast.error(`Failed to save goals: ${getUserFriendlyError(error)}`)
          } catch {
            /* ignore toast errors */
          }
        }
      } catch (error) {
        console.error('[Viventiva Sync] Error syncing goals:', error)
      }
    }, 500)

    return () => {
      if (goalsTimeoutRef.current) {
        clearTimeout(goalsTimeoutRef.current)
      }
    }
  }, [goals, cachedUser, getUser])
}
