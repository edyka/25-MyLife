import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WeekBox from '../WeekBox';
import { getAllCategories } from '../../utils/constants';

// Mock Zustand stores
vi.mock('../../stores', () => {
  const mockUseLifeStore = vi.fn(() => ({ currentWeek: 52 }));
  const mockUseMilestoneStore = vi.fn(() => ({
    milestones: {},
    getAllCategories: () => getAllCategories({})
  }));
  const mockUseSelectionStore = vi.fn(() => ({
    selectedWeek: null,
    selectedColor: null,
    selectedWeeks: new Set(),
    isDragging: false,
    draggedWeeks: new Set(),
    selectionMode: 'single'
  }));
  const mockUseUIStore = vi.fn(() => ({ isMobile: false, darkMode: false }));

  return {
    useLifeStore: mockUseLifeStore,
    useMilestoneStore: mockUseMilestoneStore,
    useSelectionStore: mockUseSelectionStore,
    useUIStore: mockUseUIStore
  };
});

// Import the mock functions to be able to modify them in tests
import { useLifeStore, useMilestoneStore, useSelectionStore, useUIStore } from '../../stores';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onMouseDown, onMouseEnter, onClick, onKeyDown, className, style, role, tabIndex, 'data-testid': dataTestId, ...restProps }) => {
      // Filter out framer-motion specific props
      // eslint-disable-next-line no-unused-vars
      const { whileHover, whileTap, initial, animate, transition, ...safeProps } = restProps;
      return (
        <div 
          className={className}
          style={style}
          role={role}
          tabIndex={tabIndex}
          data-testid={dataTestId}
          onMouseDown={onMouseDown}
          onMouseEnter={onMouseEnter} 
          onClick={onClick}
          onKeyDown={onKeyDown}
          {...safeProps}
        >
          {children}
        </div>
      );
    },
  },
}));

// Mock date utils
vi.mock('../../utils/dateUtils', () => ({
  getQuarterFromWeek: (weekNum) => `Q${Math.ceil((weekNum % 52) / 13) || 4}`,
  getYearFromWeek: (weekNum) => Math.floor((weekNum - 1) / 52) + 1,
}));

describe('WeekBox Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset all mocks to default values
    useLifeStore.mockReturnValue({ currentWeek: 52 });
    useMilestoneStore.mockReturnValue({
      milestones: {},
      getAllCategories: () => getAllCategories({})
    });
    useSelectionStore.mockReturnValue({
      selectedWeek: null,
      selectedColor: null,
      selectedWeeks: new Set(),
      isDragging: false,
      draggedWeeks: new Set(),
      selectionMode: 'single'
    });
    useUIStore.mockReturnValue({ isMobile: false, darkMode: false });
  });

  describe('Rendering States', () => {
    it('should render basic week box', () => {
      render(<WeekBox weekNum={26} />);
      const weekBox = screen.getByRole('button');
      expect(weekBox).toBeInTheDocument();
      expect(weekBox).toHaveAttribute('aria-label', expect.stringContaining('Week 26'));
    });

    it('should render current week with red styling', () => {
      useLifeStore.mockReturnValue({ currentWeek: 26 });
      render(<WeekBox weekNum={26} />);
      const weekBox = screen.getByRole('button');
      expect(weekBox).toHaveClass('bg-red-500');
    });

    it('should render past week with lived styling and cross pattern', () => {
      useLifeStore.mockReturnValue({ currentWeek: 52 });
      render(<WeekBox weekNum={10} />);
      const weekBox = screen.getByRole('button');
      expect(weekBox).toBeInTheDocument();
      
      // Check for cross pattern elements
      const crossElements = weekBox.querySelectorAll('div[class*="rotate-45"]');
      expect(crossElements.length).toBeGreaterThan(0);
    });

    it('should render future week with default styling', () => {
      useLifeStore.mockReturnValue({ currentWeek: 52 });
      render(<WeekBox weekNum={100} />);
      const weekBox = screen.getByRole('button');
      expect(weekBox).toHaveClass('bg-white');
    });

    it('should render week with milestone', () => {
      const milestones = {
        26: {
          title: 'Birthday',
          category: 'happy',
          description: 'My birthday celebration',
        },
      };
      useMilestoneStore.mockReturnValue({
        milestones,
        getAllCategories: () => getAllCategories({})
      });
      render(<WeekBox weekNum={26} />);
      
      const weekBox = screen.getByRole('button');
      expect(weekBox).toHaveAttribute('aria-label', expect.stringContaining('Mood: Happy'));
    });

    it('should apply dark mode styling', () => {
      useUIStore.mockReturnValue({ isMobile: false, darkMode: true });
      render(<WeekBox weekNum={100} />); // Future week to get base dark mode styling
      const weekBox = screen.getByRole('button');
      expect(weekBox).toHaveClass('bg-gray-700');
    });

    it('should apply mobile sizing', () => {
      useUIStore.mockReturnValue({ isMobile: true, darkMode: false });
      render(<WeekBox weekNum={26} />);
      const weekBox = screen.getByRole('button');
      expect(weekBox).toHaveClass('flex-1', 'h-4');
    });

    it('should apply desktop sizing', () => {
      useUIStore.mockReturnValue({ isMobile: false, darkMode: false });
      render(<WeekBox weekNum={26} />);
      const weekBox = screen.getByRole('button');
      expect(weekBox).toHaveClass('flex-1', 'h-6');
    });
  });

  describe('Selection States', () => {
    it('should show selection ring when selected', () => {
      useSelectionStore.mockReturnValue({
        selectedWeek: 26,
        selectedColor: null,
        selectedWeeks: new Set(),
        isDragging: false,
        draggedWeeks: new Set(),
        selectionMode: 'single'
      });
      render(<WeekBox weekNum={26} />);
      const weekBox = screen.getByRole('button');
      expect(weekBox).toHaveClass('ring-2', 'ring-blue-500');
    });

    it('should show drag selection ring when being dragged', () => {
      useSelectionStore.mockReturnValue({
        selectedWeek: null,
        selectedColor: null,
        selectedWeeks: new Set(),
        isDragging: false,
        draggedWeeks: new Set([26]),
        selectionMode: 'single'
      });
      render(<WeekBox weekNum={26} />);
      const weekBox = screen.getByRole('button');
      expect(weekBox).toHaveClass('ring-2', 'ring-yellow-400');
    });

    it('should not show selection ring when not selected', () => {
      useSelectionStore.mockReturnValue({
        selectedWeek: 25,
        selectedColor: null,
        selectedWeeks: new Set(),
        isDragging: false,
        draggedWeeks: new Set(),
        selectionMode: 'single'
      });
      render(<WeekBox weekNum={26} />);
      const weekBox = screen.getByRole('button');
      expect(weekBox).not.toHaveClass('ring-2');
    });
  });

  describe('Event Handling', () => {
    it('should call handleWeekClick on click', () => {
      const handleWeekClick = vi.fn();
      render(<WeekBox weekNum={26} handleWeekClick={handleWeekClick} />);
      
      const weekBox = screen.getByRole('button');
      fireEvent.click(weekBox);
      
      expect(handleWeekClick).toHaveBeenCalledWith(26, expect.any(Object));
    });

    it('should call handleWeekMouseDown on mouse down', () => {
      const handleWeekMouseDown = vi.fn();
      render(<WeekBox weekNum={26} handleWeekMouseDown={handleWeekMouseDown} />);
      
      const weekBox = screen.getByRole('button');
      fireEvent.mouseDown(weekBox);
      
      expect(handleWeekMouseDown).toHaveBeenCalledWith(26, expect.any(Object));
    });

    it('should call handleWeekMouseEnter on mouse enter', () => {
      const handleWeekMouseEnter = vi.fn();
      render(<WeekBox weekNum={26} handleWeekMouseEnter={handleWeekMouseEnter} />);
      
      const weekBox = screen.getByRole('button');
      fireEvent.mouseEnter(weekBox);
      
      expect(handleWeekMouseEnter).toHaveBeenCalledWith(26);
    });

    it('should not call handleWeekClick when dragging', () => {
      const handleWeekClick = vi.fn();
      useSelectionStore.mockReturnValue({
        selectedWeek: null,
        selectedColor: null,
        selectedWeeks: new Set(),
        isDragging: true,
        draggedWeeks: new Set(),
        selectionMode: 'single'
      });
      render(<WeekBox weekNum={26} handleWeekClick={handleWeekClick} />);
      
      const weekBox = screen.getByRole('button');
      fireEvent.click(weekBox);
      
      expect(handleWeekClick).not.toHaveBeenCalled();
    });

    it('should handle keyboard events (Enter)', () => {
      const handleWeekClick = vi.fn();
      render(<WeekBox weekNum={26} handleWeekClick={handleWeekClick} />);
      
      const weekBox = screen.getByRole('button');
      fireEvent.keyDown(weekBox, { key: 'Enter' });
      
      expect(handleWeekClick).toHaveBeenCalledWith(26, expect.any(Object));
    });

    it('should handle keyboard events (Space)', () => {
      const handleWeekClick = vi.fn();
      render(<WeekBox weekNum={26} handleWeekClick={handleWeekClick} />);
      
      const weekBox = screen.getByRole('button');
      fireEvent.keyDown(weekBox, { key: ' ' });
      
      expect(handleWeekClick).toHaveBeenCalledWith(26, expect.any(Object));
    });

    it('should not handle invalid keyboard events', () => {
      const handleWeekClick = vi.fn();
      render(<WeekBox weekNum={26} handleWeekClick={handleWeekClick} />);
      
      const weekBox = screen.getByRole('button');
      fireEvent.keyDown(weekBox, { key: 'a' });
      
      expect(handleWeekClick).not.toHaveBeenCalled();
    });

    it('should prevent default on mouse down', () => {
      const handleWeekMouseDown = vi.fn();
      render(<WeekBox weekNum={26} handleWeekMouseDown={handleWeekMouseDown} />);
      
      const weekBox = screen.getByRole('button');
      const event = new MouseEvent('mousedown', { bubbles: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      
      weekBox.dispatchEvent(event);
      
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<WeekBox weekNum={26} />);
      const weekBox = screen.getByRole('button');
      
      expect(weekBox).toHaveAttribute('aria-label', expect.stringContaining('Week 26'));
      expect(weekBox).toHaveAttribute('aria-label', expect.stringContaining('Age 1 years'));
      expect(weekBox).toHaveAttribute('aria-label', expect.stringContaining('No mood set'));
    });

    it('should have proper ARIA labels with milestone', () => {
      const milestones = {
        26: {
          title: 'Birthday',
          category: 'happy',
          description: 'My birthday celebration',
        },
      };
      useMilestoneStore.mockReturnValue({
        milestones,
        getAllCategories: () => getAllCategories({})
      });
      render(<WeekBox weekNum={26} />);
      
      const weekBox = screen.getByRole('button');
      expect(weekBox).toHaveAttribute('aria-label', expect.stringContaining('Mood: Happy'));
      expect(weekBox).toHaveAttribute('aria-label', expect.stringContaining('Birthday'));
    });

    it('should be focusable', () => {
      render(<WeekBox weekNum={26} />);
      const weekBox = screen.getByRole('button');
      
      expect(weekBox).toHaveAttribute('tabIndex', '0');
    });

    it('should have proper focus styles', () => {
      render(<WeekBox weekNum={26} />);
      const weekBox = screen.getByRole('button');
      
      expect(weekBox).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-blue-400');
    });
  });

  describe('Performance Optimizations', () => {
    it('should be memoized to prevent unnecessary re-renders', () => {
      // This test verifies the memo wrapper exists
      expect(WeekBox.$$typeof).toBeDefined();
    });

    it('should handle rapid event firing', () => {
      const handleWeekMouseEnter = vi.fn();
      render(<WeekBox weekNum={26} handleWeekMouseEnter={handleWeekMouseEnter} />);
      
      const weekBox = screen.getByRole('button');
      
      // Fire multiple rapid events
      for (let i = 0; i < 10; i++) {
        fireEvent.mouseEnter(weekBox);
      }
      
      expect(handleWeekMouseEnter).toHaveBeenCalledTimes(10);
      expect(handleWeekMouseEnter).toHaveBeenCalledWith(26);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined milestones', () => {
      useMilestoneStore.mockReturnValue({
        milestones: undefined,
        getAllCategories: () => getAllCategories({})
      });
      render(<WeekBox weekNum={26} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should handle null milestone category', () => {
      const milestones = {
        26: {
          title: 'Test',
          category: null,
          description: 'Test milestone',
        },
      };
      useMilestoneStore.mockReturnValue({
        milestones,
        getAllCategories: () => getAllCategories({})
      });
      render(<WeekBox weekNum={26} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should handle missing category in allCategories', () => {
      const milestones = {
        26: {
          title: 'Test',
          category: 'nonexistent',
          description: 'Test milestone',
        },
      };
      useMilestoneStore.mockReturnValue({
        milestones,
        getAllCategories: () => getAllCategories({})
      });
      render(<WeekBox weekNum={26} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should handle week number 0', () => {
      render(<WeekBox weekNum={0} />);
      const weekBox = screen.getByRole('button');
      expect(weekBox).toHaveAttribute('aria-label', expect.stringContaining('Week 0'));
    });

    it('should handle very large week numbers', () => {
      render(<WeekBox weekNum={9999} />);
      const weekBox = screen.getByRole('button');
      expect(weekBox).toHaveAttribute('aria-label', expect.stringContaining('Week 9999'));
    });
  });
});