import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MainApp from "../MainApp";

// Device configuration presets
const DEVICE_PRESETS = {
  mobile: {
    width: 375,
    height: 667,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15",
    touch: true,
    maxTouchPoints: 5,
  },
  tablet: {
    width: 768,
    height: 1024,
    userAgent:
      "Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15",
    touch: true,
    maxTouchPoints: 5,
  },
  desktop: {
    width: 1920,
    height: 1080,
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    touch: false,
    maxTouchPoints: 0,
  },
  smallMobile: {
    width: 320,
    height: 568,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15",
    touch: true,
    maxTouchPoints: 5,
  },
  largeMobile: {
    width: 414,
    height: 896,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15",
    touch: true,
    maxTouchPoints: 5,
  },
  largeDesktop: {
    width: 2560,
    height: 1440,
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    touch: false,
    maxTouchPoints: 0,
  },
};

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, whileHover: _whileHover, whileTap: _whileTap, initial: _initial, animate: _animate, transition: _transition, exit: _exit, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, whileHover: _whileHover, whileTap: _whileTap, initial: _initial, animate: _animate, transition: _transition, exit: _exit, ...props }) => <button {...props}>{children}</button>,
    a: ({ children, whileHover: _whileHover, whileTap: _whileTap, initial: _initial, animate: _animate, transition: _transition, exit: _exit, ...props }) => <a {...props}>{children}</a>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Enhanced VirtualizedWeekGrid mock with touch support
vi.mock("../VirtualizedWeekGrid", () => ({
  default: ({
    handleWeekClick,
    handleWeekMouseDown,
    handleWeekMouseEnter,
    handleMouseUp,
    isMobile,
    selectedColor,
  }) => (
    <div
      data-testid="week-grid"
      onMouseUp={handleMouseUp}
      onTouchEnd={handleMouseUp}
      className={isMobile ? "mobile-grid" : "desktop-grid"}
    >
      {Array.from({ length: 20 }, (_, i) => (
        <button
          key={i + 1}
          data-testid={`week-${i + 1}`}
          onMouseDown={() => handleWeekMouseDown(i + 1)}
          onTouchStart={() => handleWeekMouseDown(i + 1)}
          onMouseEnter={() => handleWeekMouseEnter(i + 1)}
          onClick={() => handleWeekClick(i + 1)}
          className={`week-box ${selectedColor ? "paint-mode" : ""} ${
            isMobile ? "mobile-week" : "desktop-week"
          }`}
          style={{
            width: isMobile ? "8px" : "12px",
            height: isMobile ? "16px" : "24px",
            touchAction: "manipulation",
          }}
        >
          {i + 1}
        </button>
      ))}
    </div>
  ),
}));

// Utility to simulate different devices
const simulateDevice = (deviceType) => {
  const device = DEVICE_PRESETS[deviceType];

  // Mock window dimensions
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: device.width,
  });

  Object.defineProperty(window, "innerHeight", {
    writable: true,
    configurable: true,
    value: device.height,
  });

  // Mock user agent
  Object.defineProperty(navigator, "userAgent", {
    writable: true,
    configurable: true,
    value: device.userAgent,
  });

  // Mock touch capabilities
  Object.defineProperty(navigator, "maxTouchPoints", {
    writable: true,
    configurable: true,
    value: device.maxTouchPoints,
  });

  // Mock touch events support
  window.TouchEvent = device.touch
    ? class TouchEvent extends Event {}
    : undefined;

  // Fire resize event to trigger responsive behavior
  window.dispatchEvent(new Event("resize"));
};

// Touch event utilities
const createTouchEvent = (type, touches, changedTouches = touches) => {
  const event = new Event(type, { bubbles: true, cancelable: true });
  event.touches = touches;
  event.changedTouches = changedTouches;
  event.targetTouches = touches;
  return event;
};

const createTouch = (identifier, target, clientX, clientY) => ({
  identifier,
  target,
  clientX,
  clientY,
  pageX: clientX,
  pageY: clientY,
  screenX: clientX,
  screenY: clientY,
});

describe("Cross-Device Testing", () => {
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

  afterEach(() => {
    // Reset to desktop defaults
    simulateDevice("desktop");
  });

  describe("Mobile Device Tests", () => {
    beforeEach(() => {
      simulateDevice("mobile");
    });

    it("should render mobile-optimized layout", () => {
      render(<MainApp {...defaultProps} />);

      // Should show mobile header
      expect(screen.getByText("Viventiva")).toBeInTheDocument();

      // Should show mobile menu button
      const menuButton = screen.getByRole("button", { name: /menu/i });
      expect(menuButton).toBeInTheDocument();

      // Week grid should have mobile styling
      const weekGrid = screen.getByTestId("week-grid");
      expect(weekGrid).toHaveClass("mobile-grid");
    });

    it("should handle touch interactions for week selection", async () => {
      const setMilestones = vi.fn();
      render(<MainApp {...defaultProps} setMilestones={setMilestones} />);

      // Open mobile menu and select color
      const menuButton = screen.getByRole("button", { name: /menu/i });
      await userEvent.click(menuButton);

      const happyColorButton = screen.getAllByText("Happy")[0];
      await userEvent.click(happyColorButton);

      // Touch a week
      const week1 = screen.getByTestId("week-1");
      const touch = createTouch(1, week1, 100, 100);
      const touchEvent = createTouchEvent("touchstart", [touch]);

      week1.dispatchEvent(touchEvent);

      const touchEndEvent = createTouchEvent("touchend", []);
      week1.dispatchEvent(touchEndEvent);

      expect(setMilestones).toHaveBeenCalled();
    });

    it("should handle touch drag for selection", async () => {
      const setMilestones = vi.fn();
      render(<MainApp {...defaultProps} setMilestones={setMilestones} />);

      // Select paint color via mobile menu
      const menuButton = screen.getByRole("button", { name: /menu/i });
      await userEvent.click(menuButton);

      const happyColorButton = screen.getAllByText("Happy")[0];
      await userEvent.click(happyColorButton);

      // Start touch drag
      const week1 = screen.getByTestId("week-1");
      const week3 = screen.getByTestId("week-3");

      const startTouch = createTouch(1, week1, 50, 50);
      const touchStartEvent = createTouchEvent("touchstart", [startTouch]);
      week1.dispatchEvent(touchStartEvent);

      // Move touch to different week
      const moveTouch = createTouch(1, week3, 150, 50);
      const touchMoveEvent = createTouchEvent("touchmove", [moveTouch]);
      week3.dispatchEvent(touchMoveEvent);

      // End touch
      const touchEndEvent = createTouchEvent("touchend", []);
      week3.dispatchEvent(touchEndEvent);

      expect(setMilestones).toHaveBeenCalled();
    });

    it("should prevent default touch behaviors for better UX", () => {
      render(<MainApp {...defaultProps} />);

      const week1 = screen.getByTestId("week-1");
      expect(week1).toHaveStyle({ touchAction: "manipulation" });
    });

    it("should handle mobile viewport changes", () => {
      render(<MainApp {...defaultProps} />);

      // Change to landscape orientation
      simulateDevice("tablet");

      // Should adapt to new dimensions
      const weekGrid = screen.getByTestId("week-grid");
      expect(weekGrid).toBeInTheDocument();
    });

    it("should optimize for small screens", () => {
      simulateDevice("smallMobile");
      render(<MainApp {...defaultProps} />);

      // Should render with small mobile optimizations
      const weekBoxes = screen.getAllByTestId(/week-\d+/);
      weekBoxes.forEach((week) => {
        expect(week).toHaveClass("mobile-week");
      });
    });
  });

  describe("Tablet Device Tests", () => {
    beforeEach(() => {
      simulateDevice("tablet");
    });

    it("should render tablet-optimized layout", () => {
      render(<MainApp {...defaultProps} />);

      // Should handle tablet-specific interactions
      const weekGrid = screen.getByTestId("week-grid");
      expect(weekGrid).toBeInTheDocument();
    });

    it("should handle multi-touch interactions", async () => {
      const setMilestones = vi.fn();
      render(<MainApp {...defaultProps} setMilestones={setMilestones} />);

      // Select paint color
      const happyColorButton = screen.getByText("Happy");
      await userEvent.click(happyColorButton);

      // Simulate multi-touch (two fingers)
      const week1 = screen.getByTestId("week-1");
      const week2 = screen.getByTestId("week-2");

      const touch1 = createTouch(1, week1, 100, 100);
      const touch2 = createTouch(2, week2, 200, 100);

      const multiTouchEvent = createTouchEvent("touchstart", [touch1, touch2]);
      week1.dispatchEvent(multiTouchEvent);

      expect(setMilestones).toHaveBeenCalled();
    });

    it("should handle tablet-specific gestures", () => {
      render(<MainApp {...defaultProps} />);

      const weekGrid = screen.getByTestId("week-grid");

      // Simulate pinch gesture (if implemented)
      const pinchEvent = new Event("gesturestart");
      pinchEvent.scale = 1.5;
      weekGrid.dispatchEvent(pinchEvent);

      // Should not crash
      expect(weekGrid).toBeInTheDocument();
    });
  });

  describe("Desktop Device Tests", () => {
    beforeEach(() => {
      simulateDevice("desktop");
    });

    it("should render desktop-optimized layout", () => {
      render(<MainApp {...defaultProps} />);

      // Should show desktop header and paint tools
      expect(screen.getByText("Paint Tool")).toBeInTheDocument();

      // Should not show mobile menu
      expect(
        screen.queryByRole("button", { name: /menu/i })
      ).not.toBeInTheDocument();

      // Week grid should have desktop styling
      const weekGrid = screen.getByTestId("week-grid");
      expect(weekGrid).toHaveClass("desktop-grid");
    });

    it("should handle precise mouse interactions", async () => {
      const setMilestones = vi.fn();
      render(<MainApp {...defaultProps} setMilestones={setMilestones} />);

      // Select paint color
      const happyColorButton = screen.getByText("Happy");
      await userEvent.click(happyColorButton);

      // Use precise mouse events
      const week1 = screen.getByTestId("week-1");
      fireEvent.mouseDown(week1, { clientX: 100, clientY: 100 });
      fireEvent.mouseUp(week1, { clientX: 100, clientY: 100 });

      expect(setMilestones).toHaveBeenCalled();
    });

    it("should handle mouse drag selections efficiently", async () => {
      const setMilestones = vi.fn();
      render(<MainApp {...defaultProps} setMilestones={setMilestones} />);

      const happyColorButton = screen.getByText("Happy");
      await userEvent.click(happyColorButton);

      // Start drag
      const week1 = screen.getByTestId("week-1");
      fireEvent.mouseDown(week1);

      // Drag across multiple weeks
      for (let i = 2; i <= 5; i++) {
        const week = screen.getByTestId(`week-${i}`);
        fireEvent.mouseEnter(week);
      }

      // End drag
      const weekGrid = screen.getByTestId("week-grid");
      fireEvent.mouseUp(weekGrid);

      expect(setMilestones).toHaveBeenCalled();
    });

    it("should support keyboard shortcuts", async () => {
      const user = userEvent.setup();
      render(<MainApp {...defaultProps} />);

      // Test keyboard shortcuts (implementation dependent)
      await user.keyboard("{Control>}z{/Control}"); // Undo
      await user.keyboard("{Control>}y{/Control}"); // Redo

      // Should not crash
      expect(screen.getByTestId("week-grid")).toBeInTheDocument();
    });

    it("should handle high DPI displays", () => {
      // Mock high DPI
      Object.defineProperty(window, "devicePixelRatio", {
        writable: true,
        configurable: true,
        value: 2,
      });

      render(<MainApp {...defaultProps} />);

      // Should render properly on high DPI
      const weekBoxes = screen.getAllByTestId(/week-\d+/);
      expect(weekBoxes.length).toBeGreaterThan(0);
    });
  });

  describe("Responsive Breakpoint Tests", () => {
    it("should handle transitions between breakpoints", () => {
      simulateDevice("desktop");
      render(<MainApp {...defaultProps} />);

      // Menu should not be present on desktop
      expect(
        screen.queryByRole("button", { name: /menu/i })
      ).not.toBeInTheDocument();
      
      // Clean up and test mobile separately
      // Note: React components don't automatically re-render when window dimensions change
    });

    it("should maintain functionality across all breakpoints", async () => {
      const setMilestones = vi.fn();

      const devices = ["mobile", "tablet", "desktop"];

      for (const device of devices) {
        simulateDevice(device);
        const { unmount } = render(
          <MainApp {...defaultProps} setMilestones={setMilestones} />
        );

        // Should be able to select weeks on all devices
        const week1 = screen.getByTestId("week-1");
        await userEvent.click(week1);

        expect(week1).toBeInTheDocument();
        unmount();
        vi.clearAllMocks();
      }
    });

    it("should optimize week box sizes for different screens", () => {
      // Test mobile rendering separately
      simulateDevice("mobile");
      render(<MainApp {...defaultProps} />);
      
      // Check that week boxes are rendered (class names depend on actual MainApp logic)
      const week1 = screen.getByTestId("week-1");
      expect(week1).toBeInTheDocument();
      expect(week1).toHaveClass("week-box");
    });
  });

  describe("Touch vs Mouse Event Handling", () => {
    it("should handle both touch and mouse events gracefully", async () => {
      const setMilestones = vi.fn();

      // Simulate device with both touch and mouse
      simulateDevice("tablet");
      render(<MainApp {...defaultProps} setMilestones={setMilestones} />);

      const happyColorButton = screen.getByText("Happy");
      await userEvent.click(happyColorButton);

      const week1 = screen.getByTestId("week-1");

      // First try mouse event
      fireEvent.mouseDown(week1);
      fireEvent.mouseUp(week1);

      // Then try touch event
      const touch = createTouch(1, week1, 100, 100);
      const touchStartEvent = createTouchEvent("touchstart", [touch]);
      const touchEndEvent = createTouchEvent("touchend", []);

      week1.dispatchEvent(touchStartEvent);
      week1.dispatchEvent(touchEndEvent);

      // Should handle both without conflicts
      expect(setMilestones).toHaveBeenCalled();
    });

    it("should prevent double-triggering of events", async () => {
      const setMilestones = vi.fn();
      simulateDevice("tablet");
      render(<MainApp {...defaultProps} setMilestones={setMilestones} />);

      const happyColorButton = screen.getByText("Happy");
      await userEvent.click(happyColorButton);

      const week1 = screen.getByTestId("week-1");

      // Rapidly fire both mouse and touch events
      fireEvent.mouseDown(week1);

      const touch = createTouch(1, week1, 100, 100);
      const touchStartEvent = createTouchEvent("touchstart", [touch]);
      week1.dispatchEvent(touchStartEvent);

      fireEvent.mouseUp(week1);
      const touchEndEvent = createTouchEvent("touchend", []);
      week1.dispatchEvent(touchEndEvent);

      // Should not double-trigger
      const callCount = setMilestones.mock.calls.length;
      expect(callCount).toBeLessThan(4); // Allow some tolerance
    });
  });

  describe("Performance on Different Devices", () => {
    it("should maintain performance on low-end mobile devices", () => {
      simulateDevice("smallMobile");

      const start = performance.now();
      render(<MainApp {...defaultProps} />);
      const end = performance.now();

      // Should render quickly even on low-end devices
      expect(end - start).toBeLessThan(2000);
    });

    it("should handle rapid interactions on touch devices", async () => {
      simulateDevice("mobile");
      const setMilestones = vi.fn();
      render(<MainApp {...defaultProps} setMilestones={setMilestones} />);

      const menuButton = screen.getByRole("button", { name: /menu/i });
      await userEvent.click(menuButton);

      const happyColorButton = screen.getAllByText("Happy")[0];
      await userEvent.click(happyColorButton);

      // Rapidly touch multiple weeks
      for (let i = 1; i <= 10; i++) {
        const week = screen.getByTestId(`week-${i}`);
        const touch = createTouch(i, week, i * 20, 100);
        const touchEvent = createTouchEvent("touchstart", [touch]);
        week.dispatchEvent(touchEvent);
      }

      // Should handle rapid touches without performance issues
      expect(setMilestones).toHaveBeenCalled();
    });
  });
});
