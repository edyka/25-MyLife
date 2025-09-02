import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ModernWeekBox from '../ModernWeekBox';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock the stores
vi.mock('../../stores', () => ({
  useLifeStore: () => ({
    currentWeek: 52,
  }),
  useMilestoneStore: () => ({
    milestones: {},
    getAllCategories: () => ({
      happy: { color: 'bg-green-400', label: 'Happy' }
    }),
  }),
  useSelectionStore: () => ({
    selectedWeek: null,
    selectedColor: null,
    selectedWeeks: new Set(),
    isDragging: false,
    draggedWeeks: new Set(),
    selectionMode: 'single',
    isWeekSelected: () => false,
  }),
  useUIStore: () => ({
    isMobile: false,
    darkMode: false,
    enableAnimations: true,
  }),
}));

// Mock the hooks
vi.mock('../../hooks/useWeekInteractionsZustand', () => ({
  useWeekInteractionsZustand: () => ({
    handleWeekClick: vi.fn(),
    handleWeekMouseDown: vi.fn(),
    handleWeekMouseEnter: vi.fn(),
    handleTouchStart: vi.fn(),
    handleTouchMove: vi.fn(),
    handleTouchEnd: vi.fn(),
  }),
}));

vi.mock('../../hooks/useAccessibility', () => ({
  useAccessibility: () => ({
    getWeekDescription: (weekNum) => `Week ${weekNum} description`,
    handleKeyboardNavigation: vi.fn(),
    isHighContrast: false,
    prefersReducedMotion: false,
  }),
}));

describe('ModernWeekBox Component', () => {
  it('should render without crashing', () => {
    render(<ModernWeekBox weekNum={26} />);
    
    const weekBox = screen.getByRole('button');
    expect(weekBox).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(<ModernWeekBox weekNum={26} />);
    
    const weekBox = screen.getByRole('button');
    expect(weekBox).toHaveAttribute('aria-label');
    expect(weekBox).toHaveAttribute('data-week', '26');
    expect(weekBox).toHaveAttribute('tabIndex', '0');
  });

  it('should render with modern circular design', () => {
    render(<ModernWeekBox weekNum={26} />);
    
    const weekBox = screen.getByRole('button');
    expect(weekBox).toHaveClass('rounded-full');
    expect(weekBox).toHaveClass('w-4', 'h-4');
  });
});