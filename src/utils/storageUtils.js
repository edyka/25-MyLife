import { validateAppData } from './validation.js'

export const exportData = (
  birthDay,
  birthMonth,
  birthYear,
  lifeExpectancy,
  milestones,
  customCategories = {},
  goals = []
) => {
  try {
    const data = validateAppData({
      birthDay,
      birthMonth,
      birthYear,
      lifeExpectancy,
      milestones,
      customCategories,
      goals,
    })

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `memento-vivere-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    return true
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Failed to export data:', error)
    }
    return false
  }
}

// One-shot cleanup of legacy crypto-js storage keys (removed 2026-05-23).
// Safe to remove this function and call site after a few release cycles.
export const cleanupLegacyStorage = () => {
  try {
    ;['lifeWeeksEncKey', 'lifeWeeksData', 'lifeWeeksData_checksum'].forEach(k =>
      localStorage.removeItem(k)
    )
  } catch {
    /* storage blocked — nothing to clean */
  }
}
