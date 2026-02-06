import { useState, useCallback } from 'react'
import { auth, database } from '../lib/supabase'
import { useLifeStore } from '../stores/useLifeStore'
import { useMilestoneStore } from '../stores/useMilestoneStore'
import { useSelectionStore } from '../stores/useSelectionStore'
import { useUIStore } from '../stores/useUIStore'

const isDev = process.env.NODE_ENV === 'development'

/**
 * Shared logout hook used by TabNavigation and SettingsPage.
 * Handles: force sync → clear stores → clear localStorage → sign out → redirect
 */
export const useLogout = () => {
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = useCallback(async () => {
    setLoggingOut(true)
    if (isDev) console.log('[Viventiva] Logout initiated')

    // Step 1: Force sync all pending data before logout
    const syncPromise = (async () => {
      try {
        const { user } = await auth.getCurrentUser()
        if (!user) {
          console.warn('[Viventiva] No user found, skipping sync')
          return
        }

        if (isDev) console.log('[Viventiva] Force syncing data before logout...')

        const milestoneStore = useMilestoneStore.getState()
        const selectionStore = useSelectionStore.getState()

        // Sync milestones
        const milestoneData = {
          milestones: milestoneStore.milestones || {},
          customMoods: milestoneStore.customMoods || {},
          customCategories: milestoneStore.customCategories || {},
        }
        await database.saveMilestones(user.id, milestoneData)

        // Sync selections
        const selectionsData = {
          selectedWeeks: Array.from(selectionStore.selectedWeeks || new Set()),
          pinnedWeeks: Array.from(selectionStore.pinnedWeeks || new Set()),
          selectedColor: selectionStore.selectedColor,
        }
        await database.saveSelections(user.id, selectionsData)

        // Sync goals
        const goals = milestoneStore.goals || []
        await database.saveGoals(user.id, goals)

        // Sync settings
        await useUIStore.getState().syncSettingsToSupabase()

        if (isDev) console.log('[Viventiva] All data synced successfully')
      } catch (error) {
        console.error('[Viventiva] Error syncing before logout:', error)
      }
    })()

    // Wait up to 5 seconds for sync, then proceed regardless
    await Promise.race([syncPromise, new Promise(resolve => setTimeout(resolve, 5000))])

    // Step 2: Set logout flag to prevent auth listener re-authentication
    sessionStorage.setItem('viventiva_logging_out', 'true')

    // Step 3: Clear localStorage
    localStorage.removeItem('viventiva_authenticated')
    localStorage.removeItem('viventiva_profile_complete')
    localStorage.removeItem('viventiva_just_logged_in')
    localStorage.removeItem('memento-vivere-life')
    localStorage.removeItem('memento-vivere-milestones')
    localStorage.removeItem('memento-vivere-selections')
    localStorage.removeItem('viventiva-premium')

    // Step 4: Clear Zustand stores
    try {
      useMilestoneStore.getState().clearMilestones()
      useMilestoneStore.getState().setCustomMoods({})
      useMilestoneStore.getState().setCustomCategories({})
      useSelectionStore.getState().clearAllSelections()
      useLifeStore.getState().setUserName?.('')
    } catch (e) {
      console.warn('[Viventiva] Could not clear stores:', e)
    }

    // Step 5: Clear Supabase auth keys from localStorage
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (
        key &&
        (key.includes('sb-') || key.includes('supabase.auth') || key.includes('viventiva-auth'))
      ) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))

    // Step 6: Sign out and redirect
    auth.signOut().catch(console.error)
    setTimeout(() => {
      window.location.href = '/'
    }, 100)
  }, [])

  return { handleLogout, loggingOut }
}
