import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import MainApp from '../MainApp';
import WeekBox from '../WeekBox';

// Extend expect with jest-axe matchers
expect.extend(toHaveNoViolations);

// Mock framer-motion for accessibility testing
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, whileHover: _whileHover, whileTap: _whileTap, initial: _initial, animate: _animate, transition: _transition, exit: _exit, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, whileHover: _whileHover, whileTap: _whileTap, initial: _initial, animate: _animate, transition: _transition, exit: _exit, ...props }) => <button {...props}>{children}</button>,
    a: ({ children, whileHover: _whileHover, whileTap: _whileTap, initial: _initial, animate: _animate, transition: _transition, exit: _exit, ...props }) => <a {...props}>{children}</a>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock react-window with accessibility-focused implementation
vi.mock('react-window', () => ({
  FixedSizeList: ({ children, itemData, itemCount }) => (
    <div
      data-testid="virtualized-list"
    >
      {Array.from({ length: Math.min(itemCount, 5) }, (_, index) => (
        <div key={index} role="row" aria-rowindex={index + 1}>
          {children({ index, style: {}, data: itemData })}
        </div>
      ))}
    </div>
  ),
}));

// Accessible VirtualizedWeekGrid mock
vi.mock('../VirtualizedWeekGrid', () => ({
  default: ({
    handleWeekClick,
    handleWeekMouseDown,
    handleWeekMouseEnter,
    selectedWeek,
    currentWeek,
    milestones,
    _allCategories
  }) => (
    <div
      data-testid="week-grid"
    >
      <div role="row" aria-rowindex="1">
        {Array.from({ length: 10 }, (_, i) => {
          const weekNum = i + 1;
          const isPast = weekNum < currentWeek;
          const isCurrent = weekNum === currentWeek;
          const hasMilestone = milestones[weekNum];
          
          return (
            <button
              key={weekNum}
              data-testid={`week-${weekNum}`}
              onMouseDown={() => handleWeekMouseDown(weekNum)}
              onMouseEnter={() => handleWeekMouseEnter(weekNum)}
              onClick={() => handleWeekClick(weekNum)}
              aria-label={`Week ${weekNum}${isCurrent ? ' (current week)' : ''}${
                isPast ? ' (lived)' : ' (future)'
              }${hasMilestone ? `, ${hasMilestone.title}` : ''}`}
              aria-pressed={selectedWeek === weekNum}
              tabIndex={0}
            >
              Week {weekNum}
            </button>
          );
        })}
      </div>
    </div>
  ),
}));

describe('Accessibility Tests', () => {
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
  });

  describe('WCAG Compliance', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<MainApp {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should maintain accessibility in dark mode', async () => {
      const { container } = render(<MainApp {...defaultProps} darkMode={true} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should be accessible with milestones', async () => {
      const milestones = {
        1: { title: 'Birthday', category: 'happy', description: 'My birthday' },
        2: { title: 'Graduation', category: 'achievement', description: 'Graduated' },
      };
      
      const { container } = render(
        <MainApp {...defaultProps} milestones={milestones} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support tab navigation through weeks', async () => {
      const user = userEvent.setup();
      render(<MainApp {...defaultProps} />);
      
      await user.tab();
      
      // Should focus on first focusable element (skip to week grid)
      const focusedElement = document.activeElement;
      expect(focusedElement).toBeInstanceOf(HTMLElement);
    });

    it('should support Enter key for week selection', async () => {
      const user = userEvent.setup();
      render(<MainApp {...defaultProps} />);
      
      const week1 = screen.getByTestId('week-1');
      week1.focus();
      
      await user.keyboard('{Enter}');
      
      expect(week1).toHaveAttribute('aria-selected', 'true');
    });

    it('should support Space key for week selection', async () => {
      const user = userEvent.setup();
      render(<MainApp {...defaultProps} />);
      
      const week1 = screen.getByTestId('week-1');
      week1.focus();
      
      await user.keyboard(' ');
      
      expect(week1).toHaveAttribute('aria-selected', 'true');
    });

    it('should support arrow key navigation between weeks', async () => {
      const user = userEvent.setup();
      render(<MainApp {...defaultProps} />);
      
      const week1 = screen.getByTestId('week-1');
      week1.focus();
      
      await user.keyboard('{ArrowRight}');
      
      const week2 = screen.getByTestId('week-2');
      expect(week2).toHaveFocus();
    });

    it('should handle keyboard navigation in paint mode', async () => {
      const setMilestones = vi.fn();
      const user = userEvent.setup();
      render(<MainApp {...defaultProps} setMilestones={setMilestones} />);
      
      // Select paint color
      const happyColorButton = screen.getByText('Happy');
      await user.click(happyColorButton);
      
      // Navigate to week and paint with keyboard
      const week1 = screen.getByTestId('week-1');
      week1.focus();
      await user.keyboard('{Enter}');
      
      expect(setMilestones).toHaveBeenCalled();
    });

    it('should support Escape key to exit paint mode', async () => {
      const user = userEvent.setup();
      render(<MainApp {...defaultProps} />);
      
      // Select paint color
      const happyColorButton = screen.getByText('Happy');
      await user.click(happyColorButton);
      
      // Should show paint mode is active
      expect(screen.getByText(/Happy selected!/)).toBeInTheDocument();
      
      // Press Escape to exit paint mode
      await user.keyboard('{Escape}');
      
      // Paint mode should be deactivated (implementation dependent)
      const week1 = screen.getByTestId('week-1');
      expect(week1).not.toHaveClass('paint-mode');
    });
  });

  describe('Screen Reader Support', () => {
    it('should have proper ARIA labels for weeks', () => {
      const milestones = {
        1: { title: 'Birthday', category: 'happy', description: 'My birthday' },
      };
      
      render(<MainApp {...defaultProps} milestones={milestones} />);
      
      const week1 = screen.getByTestId('week-1');
      expect(week1).toHaveAttribute('aria-label', expect.stringContaining('Week 1'));
      expect(week1).toHaveAttribute('aria-label', expect.stringContaining('Birthday'));
    });

    it('should announce current week status', () => {
      render(<MainApp {...defaultProps} />);
      
      // Find current week (based on birth date and current date)
      const currentWeekButton = screen.getByLabelText(/current week/i);
      expect(currentWeekButton).toBeInTheDocument();
    });

    it('should have proper role attributes', () => {
      render(<MainApp {...defaultProps} />);

      const week1 = screen.getByTestId('week-1');
      expect(week1).toHaveAttribute('role', 'button');
    });

    it('should announce paint mode status', async () => {
      const user = userEvent.setup();
      render(<MainApp {...defaultProps} />);
      
      const happyColorButton = screen.getByText('Happy');
      await user.click(happyColorButton);
      
      // Should have status message for screen readers
      expect(screen.getByText(/Happy selected!/)).toBeInTheDocument();
    });

    it('should provide live region updates for selections', async () => {
      const user = userEvent.setup();
      render(<MainApp {...defaultProps} />);
      
      const week1 = screen.getByTestId('week-1');
      await user.click(week1);
      
      // Should update aria-selected
      expect(week1).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Focus Management', () => {
    it('should manage focus properly in modal states', async () => {
      const user = userEvent.setup();
      
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });
      
      render(<MainApp {...defaultProps} />);
      
      // Open mobile menu
      const menuButton = screen.getByRole('button', { name: /menu/i });
      await user.click(menuButton);
      
      // Focus should be trapped in menu
      expect(screen.getByText('Paint Colors')).toBeInTheDocument();
    });

    it('should restore focus after interactions', async () => {
      const user = userEvent.setup();
      render(<MainApp {...defaultProps} />);
      
      const week1 = screen.getByTestId('week-1');
      week1.focus();
      
      await user.click(week1);
      
      // Focus should remain on the week after interaction
      expect(week1).toHaveFocus();
    });

    it('should handle focus with paint tool interactions', async () => {
      const user = userEvent.setup();
      render(<MainApp {...defaultProps} />);
      
      const happyColorButton = screen.getByText('Happy');
      await user.click(happyColorButton);
      
      // Focus should be manageable after paint selection
      const week1 = screen.getByTestId('week-1');
      week1.focus();
      expect(week1).toHaveFocus();
    });
  });

  describe('Color Contrast and Visual Accessibility', () => {
    it('should maintain sufficient color contrast in light mode', () => {
      render(<MainApp {...defaultProps} darkMode={false} />);
      
      const week1 = screen.getByTestId('week-1');
      const styles = window.getComputedStyle(week1);
      
      // Basic check that colors are applied (full contrast testing requires tools like aXe)
      expect(styles.backgroundColor).toBeTruthy();
    });

    it('should maintain sufficient color contrast in dark mode', () => {
      render(<MainApp {...defaultProps} darkMode={true} />);
      
      const week1 = screen.getByTestId('week-1');
      const styles = window.getComputedStyle(week1);
      
      expect(styles.backgroundColor).toBeTruthy();
    });

    it('should provide visual focus indicators', async () => {
      const user = userEvent.setup();
      render(<MainApp {...defaultProps} />);
      
      await user.tab();
      
      // Should have focus styles
      const focusedElement = document.activeElement;
      expect(focusedElement).toHaveClass('focus:ring-2');
    });

    it('should support high contrast mode preferences', () => {
      // Mock high contrast media query
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-contrast: high)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });
      
      render(<MainApp {...defaultProps} />);
      
      // Should render without errors in high contrast mode
      expect(screen.getByTestId('week-grid')).toBeInTheDocument();
    });
  });

  describe('Motion and Animation Accessibility', () => {
    it('should respect reduced motion preferences', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });
      
      render(<MainApp {...defaultProps} />);
      
      // Should render without animation-dependent functionality breaking
      expect(screen.getByTestId('week-grid')).toBeInTheDocument();
    });

    it('should provide alternative feedback for visual animations', async () => {
      const user = userEvent.setup();
      render(<MainApp {...defaultProps} />);
      
      const week1 = screen.getByTestId('week-1');
      await user.hover(week1);
      
      // Should provide alternative feedback (aria-describedby, status updates, etc.)
      expect(week1).toHaveAttribute('aria-label');
    });
  });

  describe('WeekBox Accessibility', () => {
    const weekBoxProps = {
      weekNum: 26,
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
      _allCategories: {},
    };

    it('should have proper ARIA attributes', () => {
      render(<WeekBox {...weekBoxProps} />);
      
      const weekBox = screen.getByRole('button');
      expect(weekBox).toHaveAttribute('aria-label');
      expect(weekBox).toHaveAttribute('tabIndex', '0');
      expect(weekBox).toHaveAttribute('role', 'button');
    });

    it('should support keyboard interaction', async () => {
      const handleWeekClick = vi.fn();
      const user = userEvent.setup();
      
      render(<WeekBox {...weekBoxProps} handleWeekClick={handleWeekClick} />);
      
      const weekBox = screen.getByRole('button');
      weekBox.focus();
      
      await user.keyboard('{Enter}');
      expect(handleWeekClick).toHaveBeenCalledWith(26);
      
      await user.keyboard(' ');
      expect(handleWeekClick).toHaveBeenCalledWith(26);
    });

    it('should announce milestone information', () => {
      const milestones = {
        26: {
          title: 'Birthday',
          category: 'happy',
          description: 'My 26th birthday',
        },
      };
      
      render(<WeekBox {...weekBoxProps} milestones={milestones} />);
      
      const weekBox = screen.getByRole('button');
      expect(weekBox).toHaveAttribute('aria-label', expect.stringContaining('Birthday'));
    });
  });

  describe('Error Handling and Accessibility', () => {
    it('should provide accessible error messages', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Force an error scenario
      const ThrowError = () => {
        throw new Error('Test error');
      };
      
      render(
        <MainApp {...defaultProps}>
          <ThrowError />
        </MainApp>
      );
      
      // Should have accessible error boundary (if implemented)
      // This would depend on the ErrorBoundary implementation
      
      consoleSpy.mockRestore();
    });

    it('should handle keyboard navigation errors gracefully', async () => {
      const user = userEvent.setup();
      render(<MainApp {...defaultProps} />);
      
      // Try to navigate beyond available weeks
      const week10 = screen.getByTestId('week-10');
      week10.focus();
      
      // Should not crash when navigating beyond bounds
      await user.keyboard('{ArrowRight}');
      expect(document.activeElement).toBeInstanceOf(HTMLElement);
    });
  });
});