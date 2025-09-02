/**
 * Performance benchmarks and automated testing configuration
 * for the Viventiva week selection system
 */

import { performance } from "perf_hooks";

// ============================================================================
// PERFORMANCE BENCHMARKS
// ============================================================================

export const PERFORMANCE_THRESHOLDS = {
  // Rendering performance (milliseconds)
  INITIAL_RENDER_TIME: 1000,
  COMPONENT_RERENDER_TIME: 100,
  LARGE_GRID_RENDER_TIME: 2000,

  // Interaction performance (milliseconds)
  CLICK_RESPONSE_TIME: 50,
  DRAG_SELECTION_TIME: 200,
  PAINT_OPERATION_TIME: 100,

  // Animation performance (milliseconds)
  ANIMATION_FRAME_TIME: 16.67, // 60fps
  HOVER_ANIMATION_TIME: 33.33, // 30fps minimum

  // Memory performance
  MEMORY_GROWTH_THRESHOLD: 50, // MB
  DOM_NODE_LIMIT: 2000,

  // Accessibility performance
  KEYBOARD_NAVIGATION_TIME: 100,
  FOCUS_CHANGE_TIME: 50,
};

/**
 * Benchmark a function's execution time
 */
export const benchmark = async (name, fn, iterations = 1) => {
  const times = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fn();
    const end = performance.now();
    times.push(end - start);
  }

  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  const median = times.sort()[Math.floor(times.length / 2)];

  return {
    name,
    iterations,
    avg,
    min,
    max,
    median,
    times,
    passed:
      avg <= PERFORMANCE_THRESHOLDS[name.toUpperCase().replace(/\s/g, "_")] ||
      true,
  };
};

/**
 * Memory usage tracking
 */
export const trackMemoryUsage = () => {
  let baseline = null;

  const start = () => {
    if (typeof window !== "undefined" && window.performance?.memory) {
      baseline = {
        used: window.performance.memory.usedJSHeapSize,
        total: window.performance.memory.totalJSHeapSize,
        limit: window.performance.memory.jsHeapSizeLimit,
      };
    } else {
      baseline = { used: 0, total: 0, limit: 0 };
    }
  };

  const measure = () => {
    if (!baseline) return null;

    if (typeof window !== "undefined" && window.performance?.memory) {
      const current = {
        used: window.performance.memory.usedJSHeapSize,
        total: window.performance.memory.totalJSHeapSize,
        limit: window.performance.memory.jsHeapSizeLimit,
      };

      return {
        usedDelta: (current.used - baseline.used) / 1024 / 1024, // MB
        totalDelta: (current.total - baseline.total) / 1024 / 1024, // MB
        current,
        baseline,
      };
    }

    return { usedDelta: 0, totalDelta: 0 };
  };

  return { start, measure };
};

/**
 * Frame rate monitoring
 */
export const createFrameRateMonitor = () => {
  const frameTimes = [];
  let startTime = performance.now();
  let monitoring = false;

  const measure = () => {
    if (!monitoring) return;

    const currentTime = performance.now();
    frameTimes.push(currentTime - startTime);
    startTime = currentTime;

    requestAnimationFrame(measure);
  };

  const start = () => {
    monitoring = true;
    frameTimes.length = 0;
    startTime = performance.now();
    requestAnimationFrame(measure);
  };

  const stop = () => {
    monitoring = false;

    if (frameTimes.length === 0) return null;

    const avg = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
    const fps = 1000 / avg;
    const min = Math.min(...frameTimes);
    const max = Math.max(...frameTimes);

    return {
      avgFrameTime: avg,
      fps,
      minFrameTime: min,
      maxFrameTime: max,
      totalFrames: frameTimes.length,
      droppedFrames: frameTimes.filter((time) => time > 16.67).length,
    };
  };

  return { start, stop };
};

// ============================================================================
// AUTOMATED TEST SUITES
// ============================================================================

/**
 * Performance test suite configuration
 */
export const PERFORMANCE_TEST_SUITES = {
  "week-selection-basic": {
    name: "Basic Week Selection Performance",
    tests: [
      "single-click-response",
      "hover-animation",
      "selection-state-update",
    ],
    threshold: PERFORMANCE_THRESHOLDS.CLICK_RESPONSE_TIME,
  },

  "week-selection-drag": {
    name: "Drag Selection Performance",
    tests: ["drag-start", "drag-move", "drag-end", "rectangular-calculation"],
    threshold: PERFORMANCE_THRESHOLDS.DRAG_SELECTION_TIME,
  },

  "paint-operations": {
    name: "Paint Operations Performance",
    tests: [
      "paint-single-week",
      "paint-multiple-weeks",
      "clear-weeks",
      "milestone-creation",
    ],
    threshold: PERFORMANCE_THRESHOLDS.PAINT_OPERATION_TIME,
  },

  "large-datasets": {
    name: "Large Dataset Performance",
    tests: [
      "render-full-lifespan",
      "render-with-many-milestones",
      "scroll-performance",
      "memory-usage",
    ],
    threshold: PERFORMANCE_THRESHOLDS.LARGE_GRID_RENDER_TIME,
  },

  "cross-device": {
    name: "Cross-Device Performance",
    tests: [
      "mobile-touch-response",
      "tablet-multi-touch",
      "desktop-mouse-precision",
      "responsive-breakpoints",
    ],
    threshold: PERFORMANCE_THRESHOLDS.CLICK_RESPONSE_TIME,
  },

  accessibility: {
    name: "Accessibility Performance",
    tests: [
      "keyboard-navigation",
      "focus-management",
      "screen-reader-updates",
      "aria-label-generation",
    ],
    threshold: PERFORMANCE_THRESHOLDS.KEYBOARD_NAVIGATION_TIME,
  },
};

/**
 * Generate automated test report
 */
export const generateTestReport = (results) => {
  const totalTests = results.length;
  const passedTests = results.filter((r) => r.passed).length;
  const failedTests = totalTests - passedTests;
  const passRate = (passedTests / totalTests) * 100;

  const report = {
    summary: {
      totalTests,
      passedTests,
      failedTests,
      passRate: parseFloat(passRate.toFixed(2)),
      timestamp: new Date().toISOString(),
    },
    results: results.map((result) => ({
      ...result,
      status: result.passed ? "PASS" : "FAIL",
      performance:
        result.avg <= (PERFORMANCE_THRESHOLDS[result.name] || Infinity)
          ? "GOOD"
          : "NEEDS_IMPROVEMENT",
    })),
    recommendations: generateRecommendations(results),
  };

  return report;
};

/**
 * Generate performance recommendations
 */
const generateRecommendations = (results) => {
  const recommendations = [];

  results.forEach((result) => {
    if (!result.passed) {
      recommendations.push({
        test: result.name,
        issue: `Performance below threshold: ${result.avg.toFixed(
          2
        )}ms (limit: ${PERFORMANCE_THRESHOLDS[result.name] || "N/A"}ms)`,
        suggestions: getPerformanceSuggestions(result.name),
      });
    }
  });

  return recommendations;
};

/**
 * Get performance improvement suggestions
 */
const getPerformanceSuggestions = (testName) => {
  const suggestions = {
    INITIAL_RENDER_TIME: [
      "Consider implementing React.memo for WeekBox components",
      "Use virtualization for large grids",
      "Optimize CSS animations and transitions",
      "Implement lazy loading for non-visible components",
    ],
    DRAG_SELECTION_TIME: [
      "Debounce drag events to reduce calculation frequency",
      "Use requestAnimationFrame for smooth animations",
      "Optimize rectangular selection algorithm",
      "Consider using Web Workers for heavy calculations",
    ],
    PAINT_OPERATION_TIME: [
      "Batch milestone updates to reduce re-renders",
      "Use useMemo for expensive milestone calculations",
      "Implement optimistic UI updates",
      "Consider state management optimization",
    ],
    KEYBOARD_NAVIGATION_TIME: [
      "Optimize focus management logic",
      "Reduce ARIA label computation complexity",
      "Use virtual focus for large grids",
      "Implement keyboard event debouncing",
    ],
  };

  return (
    suggestions[testName] || [
      "Profile the specific operation to identify bottlenecks",
      "Consider code splitting and lazy loading",
      "Optimize rendering pipeline",
      "Review component architecture for efficiency improvements",
    ]
  );
};

// ============================================================================
// CONTINUOUS INTEGRATION HELPERS
// ============================================================================

/**
 * CI/CD integration helpers
 */
export const CI_HELPERS = {
  /**
   * Check if running in CI environment
   */
  isCI: () => {
    return !!(
      process.env.CI ||
      process.env.CONTINUOUS_INTEGRATION ||
      process.env.BUILD_NUMBER ||
      process.env.GITHUB_ACTIONS ||
      process.env.TRAVIS ||
      process.env.CIRCLECI
    );
  },

  /**
   * Get CI environment info
   */
  getCIInfo: () => {
    return {
      isCI: CI_HELPERS.isCI(),
      platform: process.env.CI_PLATFORM || "unknown",
      buildNumber:
        process.env.BUILD_NUMBER || process.env.GITHUB_RUN_NUMBER || "unknown",
      branch: process.env.BRANCH || process.env.GITHUB_REF_NAME || "unknown",
      commit: process.env.COMMIT_SHA || process.env.GITHUB_SHA || "unknown",
    };
  },

  /**
   * Export results for CI consumption
   */
  exportForCI: (results) => {
    const ciInfo = CI_HELPERS.getCIInfo();
    const report = generateTestReport(results);

    return {
      ...report,
      ci: ciInfo,
      format: "memento-vivere-performance-report-v1",
    };
  },

  /**
   * Check if performance regression occurred
   */
  checkRegression: (currentResults, baselineResults, threshold = 0.2) => {
    const regressions = [];

    currentResults.forEach((current) => {
      const baseline = baselineResults.find((b) => b.name === current.name);
      if (!baseline) return;

      const degradation = (current.avg - baseline.avg) / baseline.avg;
      if (degradation > threshold) {
        regressions.push({
          test: current.name,
          current: current.avg,
          baseline: baseline.avg,
          degradation: (degradation * 100).toFixed(2) + "%",
        });
      }
    });

    return {
      hasRegressions: regressions.length > 0,
      regressions,
      threshold: threshold * 100 + "%",
    };
  },
};

// ============================================================================
// LOAD TESTING HELPERS
// ============================================================================

/**
 * Load testing scenarios
 */
export const LOAD_TEST_SCENARIOS = {
  "light-load": {
    name: "Light Load",
    concurrentUsers: 1,
    operations: 10,
    duration: 5000, // ms
  },

  "medium-load": {
    name: "Medium Load",
    concurrentUsers: 5,
    operations: 50,
    duration: 10000, // ms
  },

  "heavy-load": {
    name: "Heavy Load",
    concurrentUsers: 10,
    operations: 100,
    duration: 30000, // ms
  },

  "stress-test": {
    name: "Stress Test",
    concurrentUsers: 20,
    operations: 200,
    duration: 60000, // ms
  },
};

/**
 * Run load test scenario
 */
export const runLoadTest = async (scenario, testFn) => {
  const { concurrentUsers, operations, duration } =
    LOAD_TEST_SCENARIOS[scenario];

  const startTime = performance.now();

  // Create concurrent user simulations
  const userPromises = Array.from(
    { length: concurrentUsers },
    async (_, userIndex) => {
      const userResults = [];
      const userStartTime = performance.now();

      while (performance.now() - userStartTime < duration) {
        for (
          let op = 0;
          op < operations && performance.now() - userStartTime < duration;
          op++
        ) {
          const opStart = performance.now();
          await testFn();
          const opEnd = performance.now();

          userResults.push({
            user: userIndex,
            operation: op,
            duration: opEnd - opStart,
          });
        }
      }

      return userResults;
    }
  );

  const allUserResults = await Promise.all(userPromises);
  const flatResults = allUserResults.flat();

  const totalTime = performance.now() - startTime;
  const totalOperations = flatResults.length;
  const avgOperationTime =
    flatResults.reduce((sum, r) => sum + r.duration, 0) / totalOperations;
  const throughput = totalOperations / (totalTime / 1000); // operations per second

  return {
    scenario: LOAD_TEST_SCENARIOS[scenario],
    totalTime,
    totalOperations,
    avgOperationTime,
    throughput,
    results: flatResults,
    passed: avgOperationTime <= PERFORMANCE_THRESHOLDS.CLICK_RESPONSE_TIME * 2, // Allow 2x threshold for load tests
  };
};

// ============================================================================
// MONITORING AND ALERTING
// ============================================================================

/**
 * Performance monitoring configuration
 */
export const MONITORING_CONFIG = {
  alerts: {
    // Alert thresholds (higher than test thresholds to avoid noise)
    renderTime: PERFORMANCE_THRESHOLDS.INITIAL_RENDER_TIME * 1.5,
    responseTime: PERFORMANCE_THRESHOLDS.CLICK_RESPONSE_TIME * 2,
    memoryUsage: PERFORMANCE_THRESHOLDS.MEMORY_GROWTH_THRESHOLD * 1.5,
    fps: 45, // Alert if FPS drops below 45
  },

  sampling: {
    rate: 0.1, // Sample 10% of operations
    minSampleSize: 100,
    maxSampleSize: 1000,
  },

  retention: {
    detailedMetrics: 7, // days
    aggregatedMetrics: 30, // days
    alertHistory: 90, // days
  },
};

/**
 * Create performance monitor
 */
export const createPerformanceMonitor = () => {
  const metrics = [];

  const record = (name, value, metadata = {}) => {
    metrics.push({
      name,
      value,
      timestamp: Date.now(),
      metadata,
    });

    // Check for alerts
    checkAlerts(name, value);
  };

  const checkAlerts = (name, value) => {
    const alertThreshold = MONITORING_CONFIG.alerts[name];
    if (alertThreshold && value > alertThreshold) {
      console.warn(
        `Performance Alert: ${name} = ${value} (threshold: ${alertThreshold})`
      );
      // In production, this would trigger actual alerting systems
    }
  };

  const getMetrics = (timeRange = 3600000) => {
    // 1 hour default
    const cutoff = Date.now() - timeRange;
    return metrics.filter((m) => m.timestamp > cutoff);
  };

  const clear = () => {
    metrics.length = 0;
  };

  return { record, getMetrics, clear };
};

export default {
  PERFORMANCE_THRESHOLDS,
  benchmark,
  trackMemoryUsage,
  createFrameRateMonitor,
  PERFORMANCE_TEST_SUITES,
  generateTestReport,
  CI_HELPERS,
  LOAD_TEST_SCENARIOS,
  runLoadTest,
  MONITORING_CONFIG,
  createPerformanceMonitor,
};
