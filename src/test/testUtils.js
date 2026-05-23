/**
 * Test utilities and helpers for the Viventiva week selection system
 * Provides mock data generators, custom matchers, and testing helpers
 */

import { vi } from 'vitest'
// import { render } from '@testing-library/react'; // unused
import { getAllCategories } from '../utils/constants'

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

/**
 * Generate mock milestone data
 */
export const generateMockMilestones = (count = 10, options = {}) => {
  const {
    startWeek = 1,
    categories = ['happy', 'sad', 'achievement', 'challenge'],
    includeMalformed = false,
  } = options

  const milestones = {}

  for (let i = 0; i < count; i++) {
    const weekNum = startWeek + i
    const category = categories[i % categories.length]

    milestones[weekNum] = {
      title: `Milestone ${i + 1}`,
      category,
      description: `Description for milestone ${i + 1}`,
      weekNum,
    }
  }

  // Add malformed data for testing edge cases
  if (includeMalformed) {
    milestones.invalid = null
    milestones[999999] = { title: 'Far future', category: 'nonexistent' }
    milestones[-1] = { title: 'Negative week' }
  }

  return milestones
}

/**
 * Generate large dataset for performance testing
 */
export const generateLargeMilestoneDataset = (totalWeeks = 4160) => {
  const milestones = {}
  const categories = ['happy', 'sad', 'achievement', 'challenge', 'neutral']

  // Fill 30% of weeks with milestones
  const milestoneCount = Math.floor(totalWeeks * 0.3)

  for (let i = 0; i < milestoneCount; i++) {
    const weekNum = Math.floor(Math.random() * totalWeeks) + 1
    const category = categories[Math.floor(Math.random() * categories.length)]

    milestones[weekNum] = {
      title: `Random Milestone ${i}`,
      category,
      description: `Generated milestone for week ${weekNum}`,
      weekNum,
    }
  }

  return milestones
}

/**
 * Generate mock goals data
 */
export const generateMockGoals = (count = 5) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `goal-${i + 1}`,
    title: `Goal ${i + 1}`,
    description: `Description for goal ${i + 1}`,
    completed: Math.random() > 0.5,
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
  }))
}

/**
 * Generate mock custom categories
 */
export const generateMockCustomCategories = (count = 3) => {
  const customCategories = {}
  const colors = ['bg-purple-300', 'bg-orange-300', 'bg-teal-300']

  for (let i = 0; i < count; i++) {
    const key = `custom${i + 1}`
    customCategories[key] = {
      label: `Custom ${i + 1}`,
      color: colors[i % colors.length],
      icon: () => <span>🎯</span>,
    }
  }

  return customCategories
}

// ============================================================================
// DEVICE SIMULATION HELPERS
// ============================================================================

export const DEVICE_PRESETS = {
  mobile: { width: 375, height: 667, touch: true },
  tablet: { width: 768, height: 1024, touch: true },
  desktop: { width: 1920, height: 1080, touch: false },
  smallMobile: { width: 320, height: 568, touch: true },
  largeMobile: { width: 414, height: 896, touch: true },
}

/**
 * Simulate device viewport and capabilities
 */
export const simulateDevice = deviceType => {
  const device = DEVICE_PRESETS[deviceType]
  if (!device) {
    throw new Error(`Unknown device type: ${deviceType}`)
  }

  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: device.width,
  })

  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: device.height,
  })

  Object.defineProperty(navigator, 'maxTouchPoints', {
    writable: true,
    configurable: true,
    value: device.touch ? 5 : 0,
  })

  window.TouchEvent = device.touch ? class TouchEvent extends Event {} : undefined

  // Trigger resize event
  window.dispatchEvent(new Event('resize'))

  return () => {
    // Cleanup function to restore defaults
    simulateDevice('desktop')
  }
}

// ============================================================================
// TOUCH EVENT HELPERS
// ============================================================================

/**
 * Create a mock touch object
 */
export const createMockTouch = (identifier, target, clientX, clientY) => ({
  identifier,
  target,
  clientX,
  clientY,
  pageX: clientX,
  pageY: clientY,
  screenX: clientX,
  screenY: clientY,
  radiusX: 10,
  radiusY: 10,
  rotationAngle: 0,
  force: 1,
})

/**
 * Create a touch event with specified touches
 */
export const createTouchEvent = (type, touches, changedTouches = touches) => {
  const event = new Event(type, { bubbles: true, cancelable: true })
  event.touches = Array.from(touches)
  event.changedTouches = Array.from(changedTouches)
  event.targetTouches = Array.from(touches)
  return event
}

/**
 * Simulate a touch drag gesture
 */
export const simulateTouchDrag = (startElement, endElement, steps = 5) => {
  const startRect = startElement.getBoundingClientRect()
  const endRect = endElement.getBoundingClientRect()

  const startX = startRect.left + startRect.width / 2
  const startY = startRect.top + startRect.height / 2
  const endX = endRect.left + endRect.width / 2
  const endY = endRect.top + endRect.height / 2

  const touch = createMockTouch(1, startElement, startX, startY)

  // Start touch
  const touchStart = createTouchEvent('touchstart', [touch])
  startElement.dispatchEvent(touchStart)

  // Move through intermediate points
  for (let i = 1; i <= steps; i++) {
    const progress = i / steps
    const currentX = startX + (endX - startX) * progress
    const currentY = startY + (endY - startY) * progress

    const moveTouch = createMockTouch(1, endElement, currentX, currentY)
    const touchMove = createTouchEvent('touchmove', [moveTouch])
    endElement.dispatchEvent(touchMove)
  }

  // End touch
  const touchEnd = createTouchEvent('touchend', [])
  endElement.dispatchEvent(touchEnd)
}

// ============================================================================
// PERFORMANCE TESTING HELPERS
// ============================================================================

/**
 * Measure rendering performance
 */
export const measureRenderTime = renderFn => {
  const start = performance.now()
  const result = renderFn()
  const end = performance.now()

  return {
    result,
    renderTime: end - start,
  }
}

/**
 * Create performance observer for frame timing
 */
export const createFrameTimingObserver = () => {
  const frameTimes = []
  let startTime = performance.now()

  const measure = () => {
    const currentTime = performance.now()
    frameTimes.push(currentTime - startTime)
    startTime = currentTime
  }

  const getStats = () => {
    if (frameTimes.length === 0) return null

    const avg = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length
    const max = Math.max(...frameTimes)
    const min = Math.min(...frameTimes)

    return { avg, max, min, count: frameTimes.length }
  }

  const reset = () => {
    frameTimes.length = 0
    startTime = performance.now()
  }

  return { measure, getStats, reset }
}

// ============================================================================
// MOCK FUNCTION HELPERS
// ============================================================================

/**
 * Create mock props for MainApp component
 */
export const createMockMainAppProps = (overrides = {}) => {
  return {
    birthDay: 1,
    birthMonth: 1,
    birthYear: 2000,
    lifeExpectancy: 80,
    milestones: {},
    setMilestones: vi.fn(),
    setCurrentPage: vi.fn(),
    darkMode: false,
    setDarkMode: vi.fn(),
    customCategories: {},
    setCustomCategories: vi.fn(),
    goals: [],
    setGoals: vi.fn(),
    ...overrides,
  }
}

/**
 * Create mock props for WeekBox component
 */
export const createMockWeekBoxProps = (overrides = {}) => {
  return {
    weekNum: 1,
    currentWeek: 52,
    milestones: {},
    selectedWeek: null,
    selectedColor: null,
    handleWeekClick: vi.fn(),
    handleWeekMouseDown: vi.fn(),
    handleWeekMouseEnter: vi.fn(),
    isDragging: false,
    draggedWeeks: new Set(),
    isMobile: false,
    darkMode: false,
    allCategories: getAllCategories({}),
    ...overrides,
  }
}

/**
 * Create a mock event with specific properties
 */
export const createMockEvent = (type, properties = {}) => {
  const event = new Event(type, { bubbles: true, cancelable: true })
  Object.assign(event, properties)

  // Add preventDefault and stopPropagation spies
  event.preventDefault = vi.fn()
  event.stopPropagation = vi.fn()

  return event
}

// ============================================================================
// CUSTOM MATCHERS
// ============================================================================

/**
 * Custom matcher to check if element has paint mode styling
 */
export const toHavePaintMode = element => {
  const hasClass = element.classList.contains('paint-mode')
  const hasAttribute = element.hasAttribute('data-paint-mode')

  return {
    pass: hasClass || hasAttribute,
    message: () =>
      hasClass || hasAttribute
        ? `Expected element not to have paint mode`
        : `Expected element to have paint mode`,
  }
}

/**
 * Custom matcher to check if week is in valid range
 */
export const toBeValidWeek = (weekNum, maxWeeks = 4160) => {
  const isValid = typeof weekNum === 'number' && weekNum >= 1 && weekNum <= maxWeeks

  return {
    pass: isValid,
    message: () =>
      isValid
        ? `Expected ${weekNum} not to be a valid week`
        : `Expected ${weekNum} to be a valid week (1-${maxWeeks})`,
  }
}

// ============================================================================
// ANIMATION TESTING HELPERS
// ============================================================================

/**
 * Mock framer-motion for testing
 */
export const mockFramerMotion = () => {
  return vi.doMock('framer-motion', () => ({
    motion: {
      div: ({ children, _whileHover, _whileTap, _initial, _animate, _transition, ...props }) => (
        <div {...props}>{children}</div>
      ),
      button: ({ children, _whileHover, _whileTap, _initial, _animate, _transition, ...props }) => (
        <button {...props}>{children}</button>
      ),
      a: ({ children, _whileHover, _whileTap, _initial, _animate, _transition, ...props }) => (
        <a {...props}>{children}</a>
      ),
    },
    AnimatePresence: ({ children }) => <>{children}</>,
  }))
}

/**
 * Wait for animations to complete
 */
export const waitForAnimations = (duration = 1000) => {
  return new Promise(resolve => setTimeout(resolve, duration))
}

// ============================================================================
// ACCESSIBILITY TESTING HELPERS
// ============================================================================

/**
 * Check if element has proper ARIA attributes
 */
export const hasAccessibleAttributes = element => {
  const requiredAttributes = ['aria-label', 'role', 'tabIndex']
  return requiredAttributes.every(attr => element.hasAttribute(attr))
}

/**
 * Simulate keyboard navigation
 */
export const simulateKeyboardNavigation = async (element, keys) => {
  const { fireEvent } = await import('@testing-library/react')

  for (const key of keys) {
    fireEvent.keyDown(element, { key })
  }
}

// ============================================================================
// DATE TESTING HELPERS
// ============================================================================

/**
 * Mock current date for consistent testing
 */
export const mockCurrentDate = (dateString = '2024-01-01') => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(dateString))

  return () => {
    vi.useRealTimers()
  }
}

/**
 * Calculate expected current week based on birth date
 */
export const calculateCurrentWeek = (birthYear, birthMonth, birthDay, currentDate = new Date()) => {
  const birth = new Date(parseInt(birthYear), parseInt(birthMonth) - 1, parseInt(birthDay))
  const diffTime = Math.abs(currentDate - birth)
  return Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7)) + 1
}

// ============================================================================
// STRESS TESTING HELPERS
// ============================================================================

/**
 * Generate stress test scenarios
 */
export const createStressTestScenarios = () => {
  return {
    rapidClicks: (element, count = 100) => {
      const { fireEvent } = require('@testing-library/react')
      for (let i = 0; i < count; i++) {
        fireEvent.click(element)
      }
    },

    rapidDrags: (startElement, endElement, count = 50) => {
      const { fireEvent } = require('@testing-library/react')
      for (let i = 0; i < count; i++) {
        fireEvent.mouseDown(startElement)
        fireEvent.mouseEnter(endElement)
        fireEvent.mouseUp(endElement)
      }
    },

    memoryStress: (renderFn, iterations = 1000) => {
      const components = []

      for (let i = 0; i < iterations; i++) {
        const { unmount } = renderFn()
        components.push(unmount)
      }

      // Cleanup all components
      components.forEach(unmount => unmount())
    },
  }
}

// ============================================================================
// EXPORT ALL UTILITIES
// ============================================================================

export default {
  // Mock data generators
  generateMockMilestones,
  generateLargeMilestoneDataset,
  generateMockGoals,
  generateMockCustomCategories,

  // Device simulation
  simulateDevice,
  DEVICE_PRESETS,

  // Touch events
  createMockTouch,
  createTouchEvent,
  simulateTouchDrag,

  // Performance testing
  measureRenderTime,
  createFrameTimingObserver,

  // Mock helpers
  createMockMainAppProps,
  createMockWeekBoxProps,
  createMockEvent,

  // Custom matchers
  toHavePaintMode,
  toBeValidWeek,

  // Animation helpers
  mockFramerMotion,
  waitForAnimations,

  // Accessibility helpers
  hasAccessibleAttributes,
  simulateKeyboardNavigation,

  // Date helpers
  mockCurrentDate,
  calculateCurrentWeek,

  // Stress testing
  createStressTestScenarios,
}
