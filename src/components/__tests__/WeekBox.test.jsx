import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import WeekBox from '../WeekBox'
import { getAllCategories } from '../../utils/constants'

// Mock date utils
vi.mock('../../utils/dateUtils', () => ({
  getQuarterFromWeek: weekNum => `Q${Math.ceil((weekNum % 52) / 13) || 4}`,
  getYearFromWeek: weekNum => Math.floor((weekNum - 1) / 52) + 1,
}))

// Mock performance monitor
vi.mock('../../utils/performanceMonitor', () => ({
  useRenderPerformance: vi.fn(),
}))

describe('WeekBox Component', () => {
  const defaultProps = {
    weekNum: 26,
    handleWeekClick: vi.fn(),
    handleWeekMouseDown: vi.fn(),
    handleWeekMouseEnter: vi.fn(),
    handleTouchStart: vi.fn(),
    handleTouchMove: vi.fn(),
    handleTouchEnd: vi.fn(),
    currentWeek: 52,
    milestones: {},
    allCategories: getAllCategories({}),
    selectedWeek: null,
    selectedColor: null,
    selectedWeeks: new Set(),
    isDragging: false,
    draggedWeeks: new Set(),
    selectionMode: 'single',
    isMobile: false,
    darkMode: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering States', () => {
    it('should render basic week box', () => {
      render(<WeekBox {...defaultProps} />)
      const weekBox = screen.getByRole('button')
      expect(weekBox).toBeInTheDocument()
      expect(weekBox).toHaveAttribute('aria-label', expect.stringContaining('Week 26'))
    })

    it('should render current week with red styling', () => {
      render(<WeekBox {...defaultProps} currentWeek={26} />)
      const weekBox = screen.getByRole('button')
      expect(weekBox).toHaveClass('bg-red-500')
    })

    it('should render past week with lived styling and cross pattern', () => {
      render(<WeekBox {...defaultProps} weekNum={10} currentWeek={52} />)
      const weekBox = screen.getByRole('button')
      expect(weekBox).toBeInTheDocument()
      const crossElements = weekBox.querySelectorAll('div[class*="rotate-45"]')
      expect(crossElements.length).toBeGreaterThan(0)
    })

    it('should render future week with default styling', () => {
      render(<WeekBox {...defaultProps} weekNum={100} currentWeek={52} />)
      const weekBox = screen.getByRole('button')
      expect(weekBox).toHaveClass('bg-white')
    })

    it('should render week with milestone', () => {
      const milestones = {
        26: {
          title: 'Birthday',
          category: 'happy',
          description: 'My birthday celebration',
        },
      }
      render(
        <WeekBox {...defaultProps} milestones={milestones} allCategories={getAllCategories({})} />
      )
      const weekBox = screen.getByRole('button')
      expect(weekBox).toHaveAttribute('aria-label', expect.stringContaining('Mood: Happy'))
    })

    it('should apply dark mode styling', () => {
      render(<WeekBox {...defaultProps} weekNum={100} darkMode={true} />)
      const weekBox = screen.getByRole('button')
      expect(weekBox).toHaveClass('bg-gray-700')
    })

    it('should apply consistent sizing regardless of mobile state', () => {
      render(<WeekBox {...defaultProps} isMobile={true} />)
      const weekBox = screen.getByRole('button')
      expect(weekBox).toHaveClass('w-full', 'h-full')
    })

    it('should apply desktop sizing', () => {
      render(<WeekBox {...defaultProps} isMobile={false} />)
      const weekBox = screen.getByRole('button')
      expect(weekBox).toHaveClass('w-full', 'h-full')
    })
  })

  describe('Selection States', () => {
    it('should show selection ring when selected', () => {
      render(<WeekBox {...defaultProps} selectedWeek={26} />)
      const weekBox = screen.getByRole('button')
      expect(weekBox).toHaveClass('ring-2', 'ring-blue-500')
    })

    it('should show drag selection ring when being dragged', () => {
      render(<WeekBox {...defaultProps} draggedWeeks={new Set([26])} />)
      const weekBox = screen.getByRole('button')
      expect(weekBox).toHaveClass('ring-2', 'ring-yellow-400')
    })

    it('should not show selection ring when not selected', () => {
      render(<WeekBox {...defaultProps} selectedWeek={25} />)
      const weekBox = screen.getByRole('button')
      expect(weekBox.className).not.toContain('ring-blue-500')
    })
  })

  describe('Event Handling', () => {
    it('should call handleWeekClick on click', () => {
      const handleWeekClick = vi.fn()
      render(<WeekBox {...defaultProps} handleWeekClick={handleWeekClick} />)
      const weekBox = screen.getByRole('button')
      fireEvent.click(weekBox)
      expect(handleWeekClick).toHaveBeenCalledWith(26, expect.any(Object))
    })

    it('should call handleWeekMouseDown on mouse down', () => {
      const handleWeekMouseDown = vi.fn()
      render(<WeekBox {...defaultProps} handleWeekMouseDown={handleWeekMouseDown} />)
      const weekBox = screen.getByRole('button')
      fireEvent.mouseDown(weekBox)
      expect(handleWeekMouseDown).toHaveBeenCalledWith(26, expect.any(Object))
    })

    it('should call handleWeekMouseEnter on mouse enter', () => {
      const handleWeekMouseEnter = vi.fn()
      render(<WeekBox {...defaultProps} handleWeekMouseEnter={handleWeekMouseEnter} />)
      const weekBox = screen.getByRole('button')
      fireEvent.mouseEnter(weekBox)
      expect(handleWeekMouseEnter).toHaveBeenCalledWith(26)
    })

    it('should not call handleWeekClick when dragging', () => {
      const handleWeekClick = vi.fn()
      render(<WeekBox {...defaultProps} handleWeekClick={handleWeekClick} isDragging={true} />)
      const weekBox = screen.getByRole('button')
      fireEvent.click(weekBox)
      expect(handleWeekClick).not.toHaveBeenCalled()
    })

    it('should handle keyboard events (Enter)', () => {
      const handleWeekClick = vi.fn()
      render(<WeekBox {...defaultProps} handleWeekClick={handleWeekClick} />)
      const weekBox = screen.getByRole('button')
      fireEvent.keyDown(weekBox, { key: 'Enter' })
      expect(handleWeekClick).toHaveBeenCalledWith(26, expect.any(Object))
    })

    it('should handle keyboard events (Space)', () => {
      const handleWeekClick = vi.fn()
      render(<WeekBox {...defaultProps} handleWeekClick={handleWeekClick} />)
      const weekBox = screen.getByRole('button')
      fireEvent.keyDown(weekBox, { key: ' ' })
      expect(handleWeekClick).toHaveBeenCalledWith(26, expect.any(Object))
    })

    it('should not handle invalid keyboard events', () => {
      const handleWeekClick = vi.fn()
      render(<WeekBox {...defaultProps} handleWeekClick={handleWeekClick} />)
      const weekBox = screen.getByRole('button')
      fireEvent.keyDown(weekBox, { key: 'a' })
      expect(handleWeekClick).not.toHaveBeenCalled()
    })

    it('should prevent default on mouse down', () => {
      const handleWeekMouseDown = vi.fn()
      render(<WeekBox {...defaultProps} handleWeekMouseDown={handleWeekMouseDown} />)
      const weekBox = screen.getByRole('button')
      const event = new MouseEvent('mousedown', { bubbles: true })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
      weekBox.dispatchEvent(event)
      expect(preventDefaultSpy).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<WeekBox {...defaultProps} />)
      const weekBox = screen.getByRole('button')
      expect(weekBox).toHaveAttribute('aria-label', expect.stringContaining('Week 26'))
      expect(weekBox).toHaveAttribute('aria-label', expect.stringContaining('Age 1 years'))
      expect(weekBox).toHaveAttribute('aria-label', expect.stringContaining('No mood set'))
    })

    it('should have proper ARIA labels with milestone', () => {
      const milestones = {
        26: {
          title: 'Birthday',
          category: 'happy',
          description: 'My birthday celebration',
        },
      }
      render(
        <WeekBox {...defaultProps} milestones={milestones} allCategories={getAllCategories({})} />
      )
      const weekBox = screen.getByRole('button')
      expect(weekBox).toHaveAttribute('aria-label', expect.stringContaining('Mood: Happy'))
      expect(weekBox).toHaveAttribute('aria-label', expect.stringContaining('Birthday'))
    })

    it('should be focusable', () => {
      render(<WeekBox {...defaultProps} />)
      const weekBox = screen.getByRole('button')
      expect(weekBox).toHaveAttribute('tabIndex', '0')
    })

    it('should have proper focus styles', () => {
      render(<WeekBox {...defaultProps} />)
      const weekBox = screen.getByRole('button')
      expect(weekBox).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-blue-400')
    })
  })

  describe('Performance Optimizations', () => {
    it('should be memoized to prevent unnecessary re-renders', () => {
      expect(WeekBox.$$typeof).toBeDefined()
    })

    it('should handle rapid event firing', () => {
      const handleWeekMouseEnter = vi.fn()
      render(<WeekBox {...defaultProps} handleWeekMouseEnter={handleWeekMouseEnter} />)
      const weekBox = screen.getByRole('button')
      for (let i = 0; i < 10; i++) {
        fireEvent.mouseEnter(weekBox)
      }
      expect(handleWeekMouseEnter).toHaveBeenCalledTimes(10)
      expect(handleWeekMouseEnter).toHaveBeenCalledWith(26)
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined milestones', () => {
      render(<WeekBox {...defaultProps} milestones={undefined} />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should handle null milestone category', () => {
      const milestones = {
        26: {
          title: 'Test',
          category: null,
          description: 'Test milestone',
        },
      }
      render(<WeekBox {...defaultProps} milestones={milestones} />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should handle missing category in allCategories', () => {
      const milestones = {
        26: {
          title: 'Test',
          category: 'nonexistent',
          description: 'Test milestone',
        },
      }
      render(<WeekBox {...defaultProps} milestones={milestones} />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should handle week number 0', () => {
      render(<WeekBox {...defaultProps} weekNum={0} />)
      const weekBox = screen.getByRole('button')
      expect(weekBox).toHaveAttribute('aria-label', expect.stringContaining('Week 0'))
    })

    it('should handle very large week numbers', () => {
      render(<WeekBox {...defaultProps} weekNum={9999} />)
      const weekBox = screen.getByRole('button')
      expect(weekBox).toHaveAttribute('aria-label', expect.stringContaining('Week 9999'))
    })
  })
})
