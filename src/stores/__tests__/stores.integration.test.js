import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLifeStore, useMilestoneStore, useSelectionStore, useUIStore } from '../index'

describe('Stores Integration', () => {
  beforeEach(() => {
    // Reset all stores before each test
    act(() => {
      useLifeStore.getState().setBirthData(1, 1, 2000)
      useLifeStore.getState().setLifeExpectancy(80)
      useMilestoneStore.getState().setMilestones({})
      useMilestoneStore.getState().setCustomCategories({})
      useSelectionStore.getState().clearAllSelections()
      useUIStore.getState().setDarkMode(false)
      useUIStore.getState().setCurrentTab('grid')
    })
  })

  it('should initialize life store correctly', () => {
    const { result } = renderHook(() => useLifeStore())

    act(() => {
      result.current.setBirthData(15, 6, 1990)
      result.current.setLifeExpectancy(85)
    })

    expect(result.current.birthDay).toBe(15)
    expect(result.current.birthMonth).toBe(6)
    expect(result.current.birthYear).toBe(1990)
    expect(result.current.lifeExpectancy).toBe(85)
    expect(result.current.getTotalWeeks()).toBe(85 * 52)
  })

  it('should handle milestone management', () => {
    const { result } = renderHook(() => useMilestoneStore())

    act(() => {
      result.current.updateMilestone(100, {
        title: 'Test Milestone',
        category: 'happy',
      })
    })

    expect(result.current.milestones[100]).toEqual({
      title: 'Test Milestone',
      category: 'happy',
    })

    act(() => {
      result.current.deleteMilestone(100)
    })

    expect(result.current.milestones[100]).toBeUndefined()
  })

  it('should manage week selections', () => {
    const { result } = renderHook(() => useSelectionStore())

    act(() => {
      result.current.setSelectedColor('happy')
      result.current.addToSelectedWeeks(52)
      result.current.addToSelectedWeeks(53)
    })

    expect(result.current.selectedColor).toBe('happy')
    expect(result.current.selectedWeeks.has(52)).toBe(true)
    expect(result.current.selectedWeeks.has(53)).toBe(true)
    expect(result.current.getSelectionCount()).toBe(2)

    act(() => {
      result.current.clearAllSelections()
    })

    expect(result.current.selectedWeeks.size).toBe(0)
    expect(result.current.selectedColor).toBe(null)
  })

  it('should handle UI state changes', () => {
    const { result } = renderHook(() => useUIStore())

    act(() => {
      result.current.setDarkMode(true)
      result.current.setCurrentTab('stats')
      result.current.setIsMobile(true)
    })

    expect(result.current.darkMode).toBe(true)
    expect(result.current.currentTab).toBe('stats')
    expect(result.current.isMobile).toBe(true)

    const themeClasses = result.current.getThemeClasses()
    expect(themeClasses.bg).toBe('bg-gray-900')
    expect(themeClasses.text).toBe('text-white')
  })

  it('should calculate current week correctly', () => {
    const { result } = renderHook(() => useLifeStore())

    act(() => {
      // Set birth date to approximately 2 years ago
      const twoYearsAgo = new Date()
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)

      result.current.setBirthData(
        twoYearsAgo.getDate(),
        twoYearsAgo.getMonth() + 1,
        twoYearsAgo.getFullYear()
      )
    })

    const currentWeek = result.current.calculateCurrentWeek()
    expect(currentWeek).toBeGreaterThan(100) // Should be around week 104 (2 * 52)
    expect(currentWeek).toBeLessThan(120) // But not too much more
  })

  it('should provide color options with custom categories', () => {
    const { result } = renderHook(() => useMilestoneStore())

    act(() => {
      result.current.addCustomCategory('custom1', {
        color: 'bg-purple-500',
        label: 'Custom Mood',
        icon: 'Star',
      })
    })

    const colorOptions = result.current.getColorOptions()
    expect(colorOptions.custom1).toBeDefined()
    expect(colorOptions.custom1.label).toBe('Custom Mood')
    expect(colorOptions.happy).toBeDefined() // Default categories should still be there
  })

  it('should persist selectedWeeks and pinnedWeeks to localStorage', () => {
    // Clear localStorage before test
    localStorage.clear()

    const { result } = renderHook(() => useSelectionStore())

    // Add selections
    act(() => {
      result.current.setSelectedColor('happy')
      result.current.addToSelectedWeeks(100)
      result.current.addToSelectedWeeks(200)
      result.current.addToPinnedWeeks(300)
    })

    // Verify selections are set
    expect(result.current.selectedWeeks.has(100)).toBe(true)
    expect(result.current.selectedWeeks.has(200)).toBe(true)
    expect(result.current.pinnedWeeks.has(300)).toBe(true)
    expect(result.current.selectedColor).toBe('happy')

    // Check localStorage has the data
    const stored = localStorage.getItem('memento-vivere-selections')
    expect(stored).toBeTruthy()

    const parsedData = JSON.parse(stored)
    expect(parsedData.state.selectedColor).toBe('happy')
    expect(Array.isArray(parsedData.state.selectedWeeks)).toBe(true)
    expect(parsedData.state.selectedWeeks).toContain(100)
    expect(parsedData.state.selectedWeeks).toContain(200)
    expect(Array.isArray(parsedData.state.pinnedWeeks)).toBe(true)
    expect(parsedData.state.pinnedWeeks).toContain(300)

    // Simulate a fresh page load by getting a new instance of the store
    const { result: newResult } = renderHook(() => useSelectionStore())

    // Verify the data was restored from localStorage
    expect(newResult.current.selectedWeeks.has(100)).toBe(true)
    expect(newResult.current.selectedWeeks.has(200)).toBe(true)
    expect(newResult.current.pinnedWeeks.has(300)).toBe(true)
    expect(newResult.current.selectedColor).toBe('happy')
  })
})
