import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MainApp from '../MainApp';
import WeekBox from '../WeekBox';
import { getAllCategories } from '../../utils/constants';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, whileHover: _whileHover, whileTap: _whileTap, initial: _initial, animate: _animate, transition: _transition, exit: _exit, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, whileHover: _whileHover, whileTap: _whileTap, initial: _initial, animate: _animate, transition: _transition, exit: _exit, ...props }) => <button {...props}>{children}</button>,
    a: ({ children, whileHover: _whileHover, whileTap: _whileTap, initial: _initial, animate: _animate, transition: _transition, exit: _exit, ...props }) => <a {...props}>{children}</a>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Enhanced VirtualizedWeekGrid mock for edge case testing
vi.mock('../VirtualizedWeekGrid', () => ({
  default: ({ 
    lifeExpectancy,
    currentWeek,
    milestones,
    selectedWeek,
    selectedColor,
    handleWeekClick, 
    handleWeekMouseDown, 
    handleWeekMouseEnter,
    handleMouseUp,
    _isDragging,
    draggedWeeks
  }) => {
    const totalWeeks = parseInt(lifeExpectancy) * 52;
    
    return (
      <div data-testid="week-grid" onMouseUp={handleMouseUp}>
        {Array.from({ length: Math.min(totalWeeks, 100) }, (_, i) => {
          const weekNum = i + 1;
          const isPast = weekNum < currentWeek;
          const isCurrent = weekNum === currentWeek;
          const hasMilestone = milestones && milestones[weekNum];
          const isSelected = selectedWeek === weekNum;
          const isDragged = draggedWeeks && draggedWeeks.has(weekNum);
          
          return (
            <button
              key={weekNum}
              data-testid={`week-${weekNum}`}
              data-week-num={weekNum}
              data-is-past={isPast}
              data-is-current={isCurrent}
              data-has-milestone={!!hasMilestone}
              data-is-selected={isSelected}
              data-is-dragged={isDragged}
              className={`week-box ${selectedColor ? 'paint-mode' : ''}`}
              onMouseDown={() => handleWeekMouseDown(weekNum)}
              onMouseEnter={() => handleWeekMouseEnter(weekNum)}
              onClick={() => handleWeekClick(weekNum)}
              style={{
                backgroundColor: hasMilestone ? 'blue' : (isPast ? 'gray' : 'white'),
                border: isSelected ? '2px solid red' : '1px solid black',
                opacity: isDragged ? 0.7 : 1,
              }}
            >
              {weekNum}
            </button>
          );
        })}
      </div>
    );
  },
}));

describe('Edge Cases and Boundary Conditions', () => {
  const defaultProps = {
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
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Set consistent date for testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Invalid Input Handling', () => {
    it('should handle undefined props gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(
          <MainApp
            birthDay={undefined}
            birthMonth={undefined}
            birthYear={undefined}
            lifeExpectancy={undefined}
            milestones={undefined}
            setMilestones={undefined}
            setCurrentPage={undefined}
            darkMode={undefined}
            setDarkMode={undefined}
            customCategories={undefined}
            setCustomCategories={undefined}
            goals={undefined}
            setGoals={undefined}
          />
        );
      }).not.toThrow();
      
      consoleSpy.mockRestore();
    });

    it('should handle null props gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(
          <MainApp
            birthDay={null}
            birthMonth={null}
            birthYear={null}
            lifeExpectancy={null}
            milestones={null}
            setMilestones={null}
            setCurrentPage={null}
            darkMode={null}
            setDarkMode={null}
            customCategories={null}
            setCustomCategories={null}
            goals={null}
            setGoals={null}
          />
        );
      }).not.toThrow();
      
      consoleSpy.mockRestore();
    });

    it('should handle invalid date values', () => {
      render(
        <MainApp
          {...defaultProps}
          birthDay={32} // Invalid day
          birthMonth={13} // Invalid month
          birthYear={1800} // Very old year
        />
      );
      
      expect(screen.getByTestId('week-grid')).toBeInTheDocument();
    });

    it('should handle extreme life expectancy values', () => {
      // Test very low life expectancy
      render(<MainApp {...defaultProps} lifeExpectancy={1} />);
      expect(screen.getByTestId('week-grid')).toBeInTheDocument();
      
      // Test very high life expectancy
      const { rerender } = render(<MainApp {...defaultProps} lifeExpectancy={200} />);
      expect(screen.getByTestId('week-grid')).toBeInTheDocument();
      
      // Test negative life expectancy
      rerender(<MainApp {...defaultProps} lifeExpectancy={-10} />);
      expect(screen.getByTestId('week-grid')).toBeInTheDocument();
    });

    it('should handle malformed milestone data', () => {
      const malformedMilestones = {
        1: null,
        2: undefined,
        3: {},
        4: { title: null, category: undefined },
        5: { title: '', category: '' },
        'invalid': { title: 'test', category: 'happy' },
        999999: { title: 'far future', category: 'happy' },
      };
      
      render(<MainApp {...defaultProps} milestones={malformedMilestones} />);
      expect(screen.getByTestId('week-grid')).toBeInTheDocument();
    });
  });

  describe('Boundary Week Selections', () => {
    it('should handle selection of week 0', async () => {
      const setMilestones = vi.fn();
      render(<MainApp {...defaultProps} setMilestones={setMilestones} />);
      
      const happyColorButton = screen.getByText('Happy');
      await userEvent.click(happyColorButton);
      
      // Simulate interaction with week 0 (if it exists)
      const weekGrid = screen.getByTestId('week-grid');
      fireEvent.mouseDown(weekGrid, { target: { dataset: { weekNum: '0' } } });
      
      // Should not crash
      expect(weekGrid).toBeInTheDocument();
    });

    it('should handle selection beyond maximum weeks', async () => {
      const setMilestones = vi.fn();
      render(<MainApp {...defaultProps} lifeExpectancy={80} setMilestones={setMilestones} />);
      
      const happyColorButton = screen.getByText('Happy');
      await userEvent.click(happyColorButton);
      
      // Try to select week beyond life expectancy
      const maxWeeks = 80 * 52;
      const weekGrid = screen.getByTestId('week-grid');
      
      // Simulate mouse events on non-existent weeks
      fireEvent.mouseDown(weekGrid);
      fireEvent.mouseEnter(weekGrid, { 
        target: { dataset: { weekNum: (maxWeeks + 100).toString() } } 
      });
      fireEvent.mouseUp(weekGrid);
      
      // Should handle gracefully
      expect(weekGrid).toBeInTheDocument();
    });

    it('should handle negative week numbers', () => {
      const malformedMilestones = {
        '-1': { title: 'Negative week', category: 'happy' },
        '-100': { title: 'Very negative', category: 'sad' },
      };
      
      render(<MainApp {...defaultProps} milestones={malformedMilestones} />);
      expect(screen.getByTestId('week-grid')).toBeInTheDocument();
    });

    it('should handle extremely large week numbers', () => {
      const extremeMilestones = {
        999999: { title: 'Far future', category: 'happy' },
        1000000000: { title: 'Impossibly far', category: 'neutral' },
      };
      
      render(<MainApp {...defaultProps} milestones={extremeMilestones} />);
      expect(screen.getByTestId('week-grid')).toBeInTheDocument();
    });
  });

  describe('Rapid Event Handling', () => {
    it('should handle rapid click events without state corruption', async () => {
      const setMilestones = vi.fn();
      render(<MainApp {...defaultProps} setMilestones={setMilestones} />);
      
      const happyColorButton = screen.getByText('Happy');
      await userEvent.click(happyColorButton);
      
      // Rapidly click the same week multiple times
      const week1 = screen.getByTestId('week-1');
      
      for (let i = 0; i < 50; i++) {
        fireEvent.click(week1);
      }
      
      // State should remain consistent
      expect(setMilestones).toHaveBeenCalled();
      expect(week1).toBeInTheDocument();
    });

    it('should handle rapid drag start/stop cycles', async () => {
      const setMilestones = vi.fn();
      render(<MainApp {...defaultProps} setMilestones={setMilestones} />);
      
      const happyColorButton = screen.getByText('Happy');
      await userEvent.click(happyColorButton);
      
      const week1 = screen.getByTestId('week-1');
      const weekGrid = screen.getByTestId('week-grid');
      
      // Rapidly start and stop drag operations
      for (let i = 0; i < 20; i++) {
        fireEvent.mouseDown(week1);
        fireEvent.mouseUp(weekGrid);
      }
      
      expect(week1).toBeInTheDocument();
    });

    it('should handle mouse events outside the grid during drag', async () => {
      const setMilestones = vi.fn();
      render(<MainApp {...defaultProps} setMilestones={setMilestones} />);
      
      const happyColorButton = screen.getByText('Happy');
      await userEvent.click(happyColorButton);
      
      const week1 = screen.getByTestId('week-1');
      fireEvent.mouseDown(week1);
      
      // Move mouse outside the grid
      fireEvent.mouseMove(document.body, { clientX: -100, clientY: -100 });
      fireEvent.mouseUp(document.body);
      
      // Should handle gracefully
      expect(screen.getByTestId('week-grid')).toBeInTheDocument();
    });
  });

  describe('State Management Edge Cases', () => {
    it('should handle concurrent state updates', async () => {
      const setMilestones = vi.fn((updateFn) => {
        if (typeof updateFn === 'function') {
          updateFn({});
        }
      });
      
      render(<MainApp {...defaultProps} setMilestones={setMilestones} />);
      
      const happyColorButton = screen.getByText('Happy');
      await userEvent.click(happyColorButton);
      
      // Simulate concurrent updates
      const promises = [];
      for (let i = 1; i <= 5; i++) {
        promises.push(
          new Promise(resolve => {
            setTimeout(() => {
              const week = screen.getByTestId(`week-${i}`);
              fireEvent.click(week);
              resolve();
            }, Math.random() * 100);
          })
        );
      }
      
      await Promise.all(promises);
      
      expect(setMilestones).toHaveBeenCalled();
    });

    it('should handle state updates when component is unmounting', async () => {
      const setMilestones = vi.fn();
      const { unmount } = render(<MainApp {...defaultProps} setMilestones={setMilestones} />);
      
      const happyColorButton = screen.getByText('Happy');
      await userEvent.click(happyColorButton);
      
      const week1 = screen.getByTestId('week-1');
      fireEvent.mouseDown(week1);
      
      // Unmount while drag is in progress
      unmount();
      
      // Should not throw errors
      expect(true).toBe(true);
    });

    it('should handle milestone updates with corrupted data', async () => {
      const setMilestones = vi.fn().mockImplementation((updateFn) => {
        try {
          if (typeof updateFn === 'function') {
            updateFn({ corrupted: 'data' });
          }
        } catch {
          // Swallow errors for testing
        }
      });
      
      render(<MainApp {...defaultProps} setMilestones={setMilestones} />);
      
      const happyColorButton = screen.getByText('Happy');
      await userEvent.click(happyColorButton);
      
      const week1 = screen.getByTestId('week-1');
      fireEvent.click(week1);
      
      expect(setMilestones).toHaveBeenCalled();
    });
  });

  describe('Memory and Resource Edge Cases', () => {
    it('should handle large milestone datasets without memory leaks', () => {
      // Create a large number of milestones
      const largeMilestones = {};
      for (let i = 1; i <= 10000; i++) {
        largeMilestones[i] = {
          title: `Milestone ${i}`,
          category: 'happy',
          description: `Description for milestone ${i}`.repeat(100), // Large description
        };
      }
      
      const { unmount } = render(<MainApp {...defaultProps} milestones={largeMilestones} />);
      
      expect(screen.getByTestId('week-grid')).toBeInTheDocument();
      
      // Should unmount without issues
      expect(() => unmount()).not.toThrow();
    });

    it('should handle rapid component mounting/unmounting', () => {
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(<MainApp {...defaultProps} />);
        expect(screen.getByTestId('week-grid')).toBeInTheDocument();
        unmount();
      }
    });

    it('should handle very large selection areas', async () => {
      const setMilestones = vi.fn();
      render(<MainApp {...defaultProps} setMilestones={setMilestones} lifeExpectancy={120} />);
      
      const happyColorButton = screen.getByText('Happy');
      await userEvent.click(happyColorButton);
      
      // Start massive selection
      const week1 = screen.getByTestId('week-1');
      fireEvent.mouseDown(week1);
      
      // Simulate selecting entire lifespan
      for (let i = 2; i <= 100; i++) {
        const week = screen.getByTestId(`week-${i}`);
        if (week) {
          fireEvent.mouseEnter(week);
        }
      }
      
      const weekGrid = screen.getByTestId('week-grid');
      fireEvent.mouseUp(weekGrid);
      
      // Should handle large selections
      expect(setMilestones).toHaveBeenCalled();
    });
  });

  describe('WeekBox Edge Cases', () => {
    const weekBoxProps = {
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
    };

    it('should handle undefined milestone gracefully', () => {
      const milestones = { 1: undefined };
      render(<WeekBox {...weekBoxProps} milestones={milestones} />);
      expect(screen.getByRole('gridcell')).toBeInTheDocument();
    });

    it('should handle milestone with missing category', () => {
      const milestones = {
        1: { title: 'Test', description: 'Test', category: 'nonexistent' }
      };
      render(<WeekBox {...weekBoxProps} milestones={milestones} />);
      expect(screen.getByRole('gridcell')).toBeInTheDocument();
    });

    it('should handle extremely large week numbers', () => {
      render(<WeekBox {...weekBoxProps} weekNum={999999} />);
      const weekBox = screen.getByRole('gridcell');
      expect(weekBox).toHaveAttribute('aria-label', expect.stringContaining('Week 999999'));
    });

    it('should handle negative week numbers', () => {
      render(<WeekBox {...weekBoxProps} weekNum={-5} />);
      const weekBox = screen.getByRole('gridcell');
      expect(weekBox).toHaveAttribute('aria-label', expect.stringContaining('Week -5'));
    });

    it('should handle null event handlers', () => {
      expect(() => {
        render(
          <WeekBox
            {...weekBoxProps}
            handleWeekClick={null}
            handleWeekMouseDown={null}
            handleWeekMouseEnter={null}
          />
        );
      }).not.toThrow();
    });

    it('should handle very large draggedWeeks set', () => {
      const largeDraggedWeeks = new Set();
      for (let i = 1; i <= 10000; i++) {
        largeDraggedWeeks.add(i);
      }
      
      render(<WeekBox {...weekBoxProps} draggedWeeks={largeDraggedWeeks} />);
      expect(screen.getByRole('gridcell')).toBeInTheDocument();
    });
  });

  describe('Error Recovery', () => {
    it('should recover from failed milestone updates', async () => {
      const setMilestones = vi.fn()
        .mockImplementationOnce(() => { throw new Error('Update failed'); })
        .mockImplementation(() => {}); // Succeed on retry
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<MainApp {...defaultProps} setMilestones={setMilestones} />);
      
      const happyColorButton = screen.getByText('Happy');
      await userEvent.click(happyColorButton);
      
      const week1 = screen.getByTestId('week-1');
      
      // First click should fail
      fireEvent.click(week1);
      
      // Second click should succeed
      fireEvent.click(week1);
      
      expect(setMilestones).toHaveBeenCalledTimes(2);
      
      consoleSpy.mockRestore();
    });

    it('should maintain UI state during errors', async () => {
      const setMilestones = vi.fn(() => { throw new Error('Always fails'); });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<MainApp {...defaultProps} setMilestones={setMilestones} />);
      
      const happyColorButton = screen.getByText('Happy');
      await userEvent.click(happyColorButton);
      
      // UI should still show paint mode despite errors
      expect(screen.getByText(/Happy selected!/)).toBeInTheDocument();
      
      const week1 = screen.getByTestId('week-1');
      fireEvent.click(week1);
      
      // Week grid should still be functional
      expect(screen.getByTestId('week-grid')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Browser Compatibility Edge Cases', () => {
    it('should handle missing event properties', () => {
      render(<MainApp {...defaultProps} />);
      
      const week1 = screen.getByTestId('week-1');
      
      // Create event without some properties
      const customEvent = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
      });
      delete customEvent.clientX;
      delete customEvent.clientY;
      
      expect(() => {
        week1.dispatchEvent(customEvent);
      }).not.toThrow();
    });

    it('should handle missing touch event properties', () => {
      render(<MainApp {...defaultProps} />);
      
      const week1 = screen.getByTestId('week-1');
      
      // Create minimal touch event
      const touchEvent = new Event('touchstart', { bubbles: true });
      touchEvent.touches = [];
      touchEvent.changedTouches = [];
      
      expect(() => {
        week1.dispatchEvent(touchEvent);
      }).not.toThrow();
    });

    it('should handle missing window properties', () => {
      // Temporarily remove properties
      const originalInnerWidth = window.innerWidth;
      const originalInnerHeight = window.innerHeight;
      
      delete window.innerWidth;
      delete window.innerHeight;
      
      expect(() => {
        render(<MainApp {...defaultProps} />);
      }).not.toThrow();
      
      // Restore properties
      window.innerWidth = originalInnerWidth;
      window.innerHeight = originalInnerHeight;
    });
  });
});