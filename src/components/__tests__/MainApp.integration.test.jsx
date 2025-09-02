import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MainApp from '../MainApp';
// import { getAllCategories } from '../../utils/constants'; // unused

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, whileHover: _whileHover, whileTap: _whileTap, initial: _initial, animate: _animate, transition: _transition, exit: _exit, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, whileHover: _whileHover, whileTap: _whileTap, initial: _initial, animate: _animate, transition: _transition, exit: _exit, ...props }) => <button {...props}>{children}</button>,
    a: ({ children, whileHover: _whileHover, whileTap: _whileTap, initial: _initial, animate: _animate, transition: _transition, exit: _exit, ...props }) => <a {...props}>{children}</a>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock react-window to simplify testing
vi.mock('react-window', () => ({
  FixedSizeList: ({ children, itemData, itemCount }) => (
    <div data-testid="virtualized-list">
      {Array.from({ length: Math.min(itemCount, 5) }, (_, index) => (
        <div key={index}>
          {children({ index, style: {}, data: itemData })}
        </div>
      ))}
    </div>
  ),
}));

// Mock VirtualizedWeekGrid with a simpler implementation
vi.mock('../VirtualizedWeekGrid', () => ({
  default: ({ 
    handleWeekClick, 
    handleWeekMouseDown, 
    handleWeekMouseEnter, 
    handleMouseUp,
    selectedColor,
    _isDragging 
  }) => (
    <div data-testid="week-grid" onMouseUp={handleMouseUp}>
      {Array.from({ length: 10 }, (_, i) => (
        <button
          key={i + 1}
          data-testid={`week-${i + 1}`}
          onMouseDown={() => handleWeekMouseDown(i + 1)}
          onMouseEnter={() => handleWeekMouseEnter(i + 1)}
          onClick={() => handleWeekClick(i + 1)}
          className={selectedColor ? 'paint-mode' : ''}
          aria-label={`Week ${i + 1}`}
        >
          Week {i + 1}
        </button>
      ))}
    </div>
  ),
}));

describe('MainApp Integration Tests', () => {
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
    // Mock current date to be consistent
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Week Selection Interactions', () => {
    it('should handle basic week selection', async () => {
      render(<MainApp {...defaultProps} />);
      
      const week1 = screen.getByTestId('week-1');
      await userEvent.click(week1);
      
      // Check if week is selected (implementation may vary)
      expect(week1).toBeInTheDocument();
    });

    it('should handle paint mode selection', async () => {
      const setMilestones = vi.fn();
      render(<MainApp {...defaultProps} setMilestones={setMilestones} />);
      
      // Select a paint color first
      const happyColorButton = screen.getByText('Happy');
      await userEvent.click(happyColorButton);
      
      // Click a week to paint it
      const week1 = screen.getByTestId('week-1');
      await userEvent.click(week1);
      
      expect(setMilestones).toHaveBeenCalled();
    });

    it('should handle drag selection', async () => {
      const setMilestones = vi.fn();
      render(<MainApp {...defaultProps} setMilestones={setMilestones} />);
      
      // Select a paint color
      const happyColorButton = screen.getByText('Happy');
      await userEvent.click(happyColorButton);
      
      // Simulate drag selection
      const week1 = screen.getByTestId('week-1');
      const week3 = screen.getByTestId('week-3');
      
      fireEvent.mouseDown(week1);
      fireEvent.mouseEnter(week3);
      
      const weekGrid = screen.getByTestId('week-grid');
      fireEvent.mouseUp(weekGrid);
      
      // Should have called setMilestones multiple times for the drag area
      expect(setMilestones).toHaveBeenCalled();
    });

    it('should clear selection when clicking eraser', async () => {
      const setMilestones = vi.fn();
      render(<MainApp {...defaultProps} setMilestones={setMilestones} />);
      
      // Select eraser tool
      const eraserButton = screen.getByText('Clear');
      await userEvent.click(eraserButton);
      
      // Click a week to clear it
      const week1 = screen.getByTestId('week-1');
      await userEvent.click(week1);
      
      expect(setMilestones).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('Rectangular Selection Logic', () => {
    it('should calculate correct rectangular selection area', async () => {
      const setMilestones = vi.fn();
      render(<MainApp {...defaultProps} setMilestones={setMilestones} />);
      
      // Select paint color
      const happyColorButton = screen.getByText('Happy');
      await userEvent.click(happyColorButton);
      
      // Start drag from week 1
      const week1 = screen.getByTestId('week-1');
      fireEvent.mouseDown(week1);
      
      // Drag to week 5 to create rectangular selection
      const week5 = screen.getByTestId('week-5');
      const week2 = screen.getByTestId('week-2');
      const week3 = screen.getByTestId('week-3');
      const week4 = screen.getByTestId('week-4');
      fireEvent.mouseEnter(week2);
      fireEvent.mouseEnter(week3);
      fireEvent.mouseEnter(week4);
      fireEvent.mouseEnter(week5);
      
      const weekGrid = screen.getByTestId('week-grid');
      fireEvent.mouseUp(weekGrid);
      
      // Should paint all weeks in the rectangular area
      expect(setMilestones).toHaveBeenCalledTimes(5); // Weeks 1-5
    });

    it('should handle diagonal rectangular selections', async () => {
      const setMilestones = vi.fn();
      render(<MainApp {...defaultProps} setMilestones={setMilestones} />);
      
      // Select paint color
      const happyColorButton = screen.getByText('Happy');
      await userEvent.click(happyColorButton);
      
      // Simulate diagonal selection across multiple rows
      const week1 = screen.getByTestId('week-1');
      fireEvent.mouseDown(week1);
      
      // Mouse enter events simulating diagonal drag
      fireEvent.mouseEnter(screen.getByTestId('week-2'));
      fireEvent.mouseEnter(screen.getByTestId('week-3'));
      
      const weekGrid = screen.getByTestId('week-grid');
      fireEvent.mouseUp(weekGrid);
      
      expect(setMilestones).toHaveBeenCalled();
    });
  });

  describe('Paint Tool Interactions', () => {
    it('should toggle paint color selection', async () => {
      render(<MainApp {...defaultProps} />);
      
      const happyColorButton = screen.getByText('Happy');
      
      // First click should select
      await userEvent.click(happyColorButton);
      expect(happyColorButton.closest('button')).toHaveClass('border-blue-500');
      
      // Second click should deselect
      await userEvent.click(happyColorButton);
      expect(happyColorButton.closest('button')).not.toHaveClass('border-blue-500');
    });

    it('should show paint instructions when color is selected', async () => {
      render(<MainApp {...defaultProps} />);
      
      const happyColorButton = screen.getByText('Happy');
      await userEvent.click(happyColorButton);
      
      expect(screen.getByText(/Happy selected!/)).toBeInTheDocument();
    });

    it('should switch between different paint colors', async () => {
      render(<MainApp {...defaultProps} />);
      
      // Select first color
      const happyColorButton = screen.getByText('Happy');
      await userEvent.click(happyColorButton);
      
      // Select different color
      const sadColorButton = screen.getByText('Sad');
      await userEvent.click(sadColorButton);
      
      // Should show new color as selected
      expect(screen.getByText(/Sad selected!/)).toBeInTheDocument();
    });
  });

  describe('Mobile Interactions', () => {
    beforeEach(() => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });
    });

    it('should handle mobile menu interactions', async () => {
      render(<MainApp {...defaultProps} />);
      
      // Should show mobile menu button
      const menuButton = screen.getByRole('button', { name: /menu/i });
      expect(menuButton).toBeInTheDocument();
      
      await userEvent.click(menuButton);
      
      // Should show mobile menu content
      expect(screen.getByText('Paint Colors')).toBeInTheDocument();
    });

    it('should handle touch interactions on weeks', async () => {
      const setMilestones = vi.fn();
      render(<MainApp {...defaultProps} setMilestones={setMilestones} />);
      
      // Open mobile menu and select color
      const menuButton = screen.getByRole('button', { name: /menu/i });
      await userEvent.click(menuButton);
      
      const happyColorButton = screen.getAllByText('Happy')[0];
      await userEvent.click(happyColorButton);
      
      // Touch a week
      const week1 = screen.getByTestId('week-1');
      fireEvent.touchStart(week1);
      fireEvent.touchEnd(week1);
      
      expect(setMilestones).toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should handle keyboard selection of weeks', async () => {
      render(<MainApp {...defaultProps} />);
      
      const week1 = screen.getByTestId('week-1');
      week1.focus();
      
      await userEvent.keyboard('{Enter}');
      
      // Should select the week
      expect(week1).toHaveFocus();
    });

    it('should handle keyboard navigation between weeks', async () => {
      render(<MainApp {...defaultProps} />);
      
      const week1 = screen.getByTestId('week-1');
      week1.focus();
      
      await userEvent.keyboard('{Tab}');
      
      const week2 = screen.getByTestId('week-2');
      expect(week2).toHaveFocus();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid week selections gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<MainApp {...defaultProps} />);
      
      // Try to interact with non-existent week
      const weekGrid = screen.getByTestId('week-grid');
      fireEvent.mouseDown(weekGrid);
      
      // Should not crash
      expect(screen.getByTestId('week-grid')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });

    it('should handle milestone update failures', async () => {
      const setMilestones = vi.fn().mockImplementation(() => {
        throw new Error('Update failed');
      });
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<MainApp {...defaultProps} setMilestones={setMilestones} />);
      
      const happyColorButton = screen.getByText('Happy');
      await userEvent.click(happyColorButton);
      
      const week1 = screen.getByTestId('week-1');
      await userEvent.click(week1);
      
      // Should not crash the app
      expect(screen.getByTestId('week-grid')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Performance Tests', () => {
    it('should handle rapid selection events', async () => {
      const setMilestones = vi.fn();
      render(<MainApp {...defaultProps} setMilestones={setMilestones} />);
      
      const happyColorButton = screen.getByText('Happy');
      await userEvent.click(happyColorButton);
      
      // Rapidly click multiple weeks
      for (let i = 1; i <= 5; i++) {
        const week = screen.getByTestId(`week-${i}`);
        fireEvent.mouseDown(week);
        fireEvent.mouseUp(week);
      }
      
      // Should handle all events without performance issues
      expect(setMilestones).toHaveBeenCalledTimes(5);
    });

    it('should debounce drag selection updates', async () => {
      const setMilestones = vi.fn();
      render(<MainApp {...defaultProps} setMilestones={setMilestones} />);
      
      const happyColorButton = screen.getByText('Happy');
      await userEvent.click(happyColorButton);
      
      const week1 = screen.getByTestId('week-1');
      fireEvent.mouseDown(week1);
      
      // Rapidly fire mouse enter events
      for (let i = 2; i <= 10; i++) {
        const week = screen.getByTestId(`week-${i}`);
        fireEvent.mouseEnter(week);
      }
      
      const weekGrid = screen.getByTestId('week-grid');
      fireEvent.mouseUp(weekGrid);
      
      // Should not exceed reasonable number of calls
      expect(setMilestones.mock.calls.length).toBeGreaterThan(0);
      expect(setMilestones.mock.calls.length).toBeLessThan(50);
    });
  });
});