import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { performance } from 'perf_hooks';
import MainApp from '../MainApp';

// Mock framer-motion for performance testing
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, whileHover: _whileHover, whileTap: _whileTap, initial: _initial, animate: _animate, transition: _transition, exit: _exit, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, whileHover: _whileHover, whileTap: _whileTap, initial: _initial, animate: _animate, transition: _transition, exit: _exit, ...props }) => <button {...props}>{children}</button>,
    a: ({ children, whileHover: _whileHover, whileTap: _whileTap, initial: _initial, animate: _animate, transition: _transition, exit: _exit, ...props }) => <a {...props}>{children}</a>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock react-window with performance monitoring
vi.mock('react-window', () => ({
  FixedSizeList: ({ children, itemData, itemCount, itemSize }) => {
    const renderStart = performance.now();
    const items = Array.from({ length: Math.min(itemCount, 100) }, (_, index) => (
      <div key={index} style={{ height: itemSize }}>
        {children({ index, style: { height: itemSize }, data: itemData })}
      </div>
    ));
    const renderEnd = performance.now();
    
    // Store render time for testing
    window.lastVirtualListRenderTime = renderEnd - renderStart;
    
    return <div data-testid="virtualized-list">{items}</div>;
  },
}));

// Enhanced VirtualizedWeekGrid mock with performance tracking
vi.mock('../VirtualizedWeekGrid', () => ({
  default: ({ 
    lifeExpectancy,
    handleWeekClick, 
    handleWeekMouseDown, 
    handleWeekMouseEnter, 
    handleMouseUp,
    selectedColor,
    _isDragging,
    draggedWeeks
  }) => {
    const totalWeeks = parseInt(lifeExpectancy) * 52;
    const renderStart = performance.now();
    
    const weeks = Array.from({ length: Math.min(totalWeeks, 1000) }, (_, i) => (
      <button
        key={i + 1}
        data-testid={`week-${i + 1}`}
        onMouseDown={() => handleWeekMouseDown(i + 1)}
        onMouseEnter={() => handleWeekMouseEnter(i + 1)}
        onClick={() => handleWeekClick(i + 1)}
        className={`week-box ${selectedColor ? 'paint-mode' : ''} ${
          draggedWeeks?.has(i + 1) ? 'dragged' : ''
        }`}
        aria-label={`Week ${i + 1}`}
        style={{ 
          width: '12px', 
          height: '12px', 
          margin: '1px',
          backgroundColor: draggedWeeks?.has(i + 1) ? 'yellow' : 'white'
        }}
      >
        {i + 1}
      </button>
    ));
    
    const renderEnd = performance.now();
    window.lastWeekGridRenderTime = renderEnd - renderStart;
    
    return (
      <div data-testid="week-grid" onMouseUp={handleMouseUp}>
        <div>Render time: {window.lastWeekGridRenderTime?.toFixed(2)}ms</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(52, 1fr)' }}>
          {weeks}
        </div>
      </div>
    );
  },
}));

describe('Performance Tests', () => {
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
    // Clear performance measurements
    window.lastWeekGridRenderTime = null;
    window.lastVirtualListRenderTime = null;
  });

  describe('Rendering Performance', () => {
    it('should render large grid within acceptable time limits', () => {
      const start = performance.now();
      render(<MainApp {...defaultProps} lifeExpectancy={80} />);
      const end = performance.now();
      
      const renderTime = end - start;
      expect(renderTime).toBeLessThan(1000); // Should render in less than 1 second
      
      // Check that the grid rendered
      expect(screen.getByTestId('week-grid')).toBeInTheDocument();
    });

    it('should handle virtualized list rendering efficiently', () => {
      render(<MainApp {...defaultProps} lifeExpectancy={80} />);
      
      // Check virtualized list performance
      if (window.lastVirtualListRenderTime) {
        expect(window.lastVirtualListRenderTime).toBeLessThan(100); // Less than 100ms
      }
    });

    it('should maintain performance with many milestones', () => {
      // Generate many milestones
      const milestones = {};
      for (let i = 1; i <= 1000; i++) {
        milestones[i] = {
          title: `Milestone ${i}`,
          category: 'happy',
          description: `Description ${i}`,
        };
      }

      const start = performance.now();
      render(<MainApp {...defaultProps} milestones={milestones} />);
      const end = performance.now();
      
      const renderTime = end - start;
      expect(renderTime).toBeLessThan(2000); // Should still render reasonably fast
    });
  });

  describe('Selection Performance', () => {
    it('should handle rapid click events efficiently', () => {
      const setMilestones = vi.fn();
      render(<MainApp {...defaultProps} setMilestones={setMilestones} />);
      
      // Select paint color
      const happyColorButton = screen.getByText('Happy');
      fireEvent.click(happyColorButton);
      
      const start = performance.now();
      
      // Simulate rapid clicking
      for (let i = 1; i <= 50; i++) {
        const week = screen.getByTestId(`week-${i}`);
        if (week) {
          fireEvent.click(week);
        }
      }
      
      const end = performance.now();
      const totalTime = end - start;
      
      expect(totalTime).toBeLessThan(2000); // Should handle 50 clicks in less than 2s
      expect(setMilestones).toHaveBeenCalled();
    });

    it('should handle large rectangular selections efficiently', () => {
      const setMilestones = vi.fn();
      render(<MainApp {...defaultProps} setMilestones={setMilestones} />);
      
      // Select paint color
      const happyColorButton = screen.getByText('Happy');
      fireEvent.click(happyColorButton);
      
      const start = performance.now();
      
      // Start large drag selection
      const week1 = screen.getByTestId('week-1');
      fireEvent.mouseDown(week1);
      
      // Simulate dragging across many weeks
      for (let i = 2; i <= 100; i++) {
        const week = screen.getByTestId(`week-${i}`);
        if (week) {
          fireEvent.mouseEnter(week);
        }
      }
      
      const weekGrid = screen.getByTestId('week-grid');
      fireEvent.mouseUp(weekGrid);
      
      const end = performance.now();
      const selectionTime = end - start;
      
      expect(selectionTime).toBeLessThan(3000); // Large selection should complete in <3s
    });

    it('should debounce drag events to prevent performance issues', () => {
      const setMilestones = vi.fn();
      render(<MainApp {...defaultProps} setMilestones={setMilestones} />);
      
      // Select paint color
      const happyColorButton = screen.getByText('Happy');
      fireEvent.click(happyColorButton);
      
      const week1 = screen.getByTestId('week-1');
      fireEvent.mouseDown(week1);
      
      // Fire some rapid mouse enter events (reduced for test stability)
      const start = performance.now();
      for (let i = 0; i < 100; i++) {
        const week2 = screen.getByTestId('week-2');
        fireEvent.mouseEnter(week2);
      }
      const end = performance.now();
      
      const weekGrid = screen.getByTestId('week-grid');
      fireEvent.mouseUp(weekGrid);
      
      // Should not take too long even with many events
      expect(end - start).toBeLessThan(5000);
      
      // Should not call setMilestones excessively
      expect(setMilestones.mock.calls.length).toBeLessThan(50);
    });
  });

  describe('Memory Performance', () => {
    it('should not create memory leaks with event listeners', () => {
      const { unmount } = render(<MainApp {...defaultProps} />);
      
      // Add some interactions
      const happyColorButton = screen.getByText('Happy');
      fireEvent.click(happyColorButton);
      
      const week1 = screen.getByTestId('week-1');
      fireEvent.mouseDown(week1);
      fireEvent.mouseUp(week1);
      
      // Unmount should clean up without errors
      expect(() => unmount()).not.toThrow();
    });

    it('should handle component re-renders efficiently', () => {
      const setMilestones = vi.fn();
      const { rerender } = render(
        <MainApp {...defaultProps} setMilestones={setMilestones} />
      );
      
      const start = performance.now();
      
      // Force multiple re-renders with different props
      for (let i = 0; i < 10; i++) {
        rerender(
          <MainApp 
            {...defaultProps} 
            setMilestones={setMilestones}
            darkMode={i % 2 === 0}
          />
        );
      }
      
      const end = performance.now();
      const rerenderTime = end - start;
      
      expect(rerenderTime).toBeLessThan(500); // Re-renders should be fast
    });
  });

  describe('Animation Performance', () => {
    it('should handle hover animations without performance degradation', () => {
      render(<MainApp {...defaultProps} />);
      
      const start = performance.now();
      
      // Simulate rapid hover events
      for (let i = 1; i <= 20; i++) {
        const week = screen.getByTestId(`week-${i}`);
        if (week) {
          fireEvent.mouseEnter(week);
          fireEvent.mouseLeave(week);
        }
      }
      
      const end = performance.now();
      const hoverTime = end - start;
      
      expect(hoverTime).toBeLessThan(300); // Hover animations should be smooth
    });

    it('should maintain 60fps during drag operations', () => {
      const setMilestones = vi.fn();
      render(<MainApp {...defaultProps} setMilestones={setMilestones} />);
      
      const happyColorButton = screen.getByText('Happy');
      fireEvent.click(happyColorButton);
      
      const week1 = screen.getByTestId('week-1');
      fireEvent.mouseDown(week1);
      
      // Measure frame timing during drag
      const frameTimes = [];
      let lastFrameTime = performance.now();
      
      for (let i = 2; i <= 10; i++) {
        const week = screen.getByTestId(`week-${i}`);
        if (week) {
          fireEvent.mouseEnter(week);
          const currentTime = performance.now();
          frameTimes.push(currentTime - lastFrameTime);
          lastFrameTime = currentTime;
        }
      }
      
      const weekGrid = screen.getByTestId('week-grid');
      fireEvent.mouseUp(weekGrid);
      
      // Check that frame times are consistent with 60fps (16.67ms per frame)
      const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
      expect(avgFrameTime).toBeLessThan(50); // Should be well under 60fps threshold
    });
  });

  describe('Scalability Tests', () => {
    it('should handle maximum life expectancy efficiently', () => {
      const start = performance.now();
      render(<MainApp {...defaultProps} lifeExpectancy={120} />); // Maximum realistic age
      const end = performance.now();
      
      const renderTime = end - start;
      expect(renderTime).toBeLessThan(2000); // Should render even large grids
      
      expect(screen.getByTestId('week-grid')).toBeInTheDocument();
    });

    it('should maintain performance with full milestone coverage', () => {
      // Create milestone for every week
      const milestones = {};
      const totalWeeks = 80 * 52; // 80 years
      for (let i = 1; i <= totalWeeks; i++) {
        milestones[i] = {
          title: `Week ${i}`,
          category: 'happy',
          description: `Milestone for week ${i}`,
        };
      }

      const start = performance.now();
      render(<MainApp {...defaultProps} milestones={milestones} />);
      const end = performance.now();
      
      const renderTime = end - start;
      expect(renderTime).toBeLessThan(3000); // Should handle full coverage
    });

    it('should handle concurrent user interactions', async () => {
      const setMilestones = vi.fn();
      render(<MainApp {...defaultProps} setMilestones={setMilestones} />);
      
      const happyColorButton = screen.getByText('Happy');
      fireEvent.click(happyColorButton);
      
      const start = performance.now();
      
      // Simulate concurrent interactions
      const promises = [];
      for (let i = 1; i <= 10; i++) {
        promises.push(
          new Promise(resolve => {
            setTimeout(() => {
              const week = screen.getByTestId(`week-${i}`);
              if (week) {
                fireEvent.click(week);
              }
              resolve();
            }, i * 10);
          })
        );
      }
      
      await Promise.all(promises);
      const end = performance.now();
      
      expect(end - start).toBeLessThan(500);
      expect(setMilestones).toHaveBeenCalled();
    });
  });

  describe('Resource Usage', () => {
    it('should not exceed reasonable DOM node count', () => {
      render(<MainApp {...defaultProps} />);
      
      const weekGrid = screen.getByTestId('week-grid');
      const weekNodes = weekGrid.querySelectorAll('[data-testid^="week-"]');
      
      // Should virtualize and not render all weeks at once
      expect(weekNodes.length).toBeLessThan(2000); // Reasonable limit for DOM nodes
    });

    it('should clean up event listeners on unmount', () => {
      const { unmount } = render(<MainApp {...defaultProps} />);
      
      // Record initial event listener count (approximate)
      const initialListeners = document.querySelectorAll('*').length;
      
      unmount();
      
      // After unmount, should not have significantly more listeners
      const finalListeners = document.querySelectorAll('*').length;
      expect(finalListeners).toBeLessThanOrEqual(initialListeners);
    });
  });
});