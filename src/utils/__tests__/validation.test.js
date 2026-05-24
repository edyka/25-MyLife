import { describe, it, expect } from 'vitest'
import { validateUserData, validateMilestone, validateAppData, sanitizeHtml } from '../validation'

describe('validation', () => {
  describe('validateUserData', () => {
    it('should validate correct user data', () => {
      const validData = {
        birthDay: '15',
        birthMonth: '6',
        birthYear: '1990',
        lifeExpectancy: '80',
      }

      expect(() => validateUserData(validData)).not.toThrow()
      const result = validateUserData(validData)
      expect(result).toEqual(validData)
    })

    it('should reject invalid user data', () => {
      const invalidData = {
        birthDay: 'invalid',
        birthMonth: '6',
        birthYear: '1990',
        lifeExpectancy: '80',
      }

      expect(() => validateUserData(invalidData)).toThrow()
    })
  })

  describe('validateMilestone', () => {
    it('should validate correct milestone', () => {
      const validMilestone = {
        title: 'Test milestone',
        category: 'happy',
        description: 'A test milestone',
        weekNum: 1000,
      }

      expect(() => validateMilestone(validMilestone)).not.toThrow()
      const result = validateMilestone(validMilestone)
      expect(result).toEqual(validMilestone)
    })

    it('should reject invalid milestone', () => {
      const invalidMilestone = {
        title: '',
        category: 'happy',
        weekNum: 1000,
      }

      expect(() => validateMilestone(invalidMilestone)).toThrow()
    })

    it('should reject milestone with invalid week number', () => {
      const invalidMilestone = {
        title: 'Test',
        category: 'happy',
        weekNum: -1,
      }

      expect(() => validateMilestone(invalidMilestone)).toThrow()
    })
  })

  describe('validateAppData', () => {
    it('should validate and return correct app data', () => {
      const validData = {
        birthDay: '15',
        birthMonth: '6',
        birthYear: '1990',
        lifeExpectancy: '80',
        milestones: {},
        customCategories: {},
        goals: [],
      }

      const result = validateAppData(validData)
      expect(result).toEqual(validData)
    })

    it('should provide defaults for missing data', () => {
      const incompleteData = {
        birthDay: '15',
        birthMonth: '6',
        birthYear: '1990',
        lifeExpectancy: '80',
      }

      const result = validateAppData(incompleteData)
      expect(result.milestones).toEqual({})
      expect(result.customCategories).toEqual({})
      expect(result.goals).toEqual([])
    })
  })

  describe('sanitizeHtml', () => {
    it('should sanitize HTML characters', () => {
      expect(sanitizeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
      )
      expect(sanitizeHtml('Hello & World')).toBe('Hello &amp; World')
      expect(sanitizeHtml("It's a 'test'")).toBe('It&#39;s a &#39;test&#39;')
    })

    it('should handle empty/null input', () => {
      expect(sanitizeHtml('')).toBe('')
      expect(sanitizeHtml(null)).toBe('')
      expect(sanitizeHtml(undefined)).toBe('')
    })
  })
})
