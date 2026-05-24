import { useState, useEffect } from 'react'
import { auth } from '../lib/supabase'

export const useEngagement = (
  milestones,
  goals,
  selectedWeeks,
  incrementStreak,
  checkBadges,
  loadEngagementFromSupabase
) => {
  const [newBadge, setNewBadge] = useState(null)
  const [showAchievements, setShowAchievements] = useState(false)

  useEffect(() => {
    const initEngagement = async () => {
      const { user } = await auth.getCurrentUser()
      if (user) {
        await loadEngagementFromSupabase(user.id)
        const unlocked = checkBadges(milestones, goals, selectedWeeks)
        if (unlocked.length > 0) {
          const lastBadgeId = unlocked[unlocked.length - 1]
          const badgeTitles = {
            first_paint: {
              title: 'First Steps',
              description: 'Paint your first week on the grid.',
            },
            time_traveler: {
              title: 'Time Traveler',
              description: 'Fill in 10 weeks from the past.',
            },
            goal_setter: { title: 'Goal Setter', description: 'Set your first life goal.' },
            streak_master: { title: 'Consistency is Key', description: 'Reach a 4-week streak.' },
            rainbow_life: {
              title: 'Rainbow Life',
              description: 'Use 5 different colors on your grid.',
            },
          }
          setNewBadge(badgeTitles[lastBadgeId])
        }
      }
    }
    initEngagement()
  }, [milestones, goals, selectedWeeks, loadEngagementFromSupabase, checkBadges])

  useEffect(() => {
    if (Object.keys(milestones).length > 0) {
      incrementStreak()
    }
  }, [milestones, incrementStreak])

  return {
    newBadge,
    setNewBadge,
    showAchievements,
    setShowAchievements,
  }
}
