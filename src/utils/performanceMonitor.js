// Performance monitoring utilities for the week selection system
import React from "react";

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.isEnabled = process.env.NODE_ENV === "development";
  }

  startTimer(operationName) {
    if (!this.isEnabled) return null;

    const startTime = performance.now();
    return {
      operationName,
      startTime,
      end: () => this.endTimer(operationName, startTime),
    };
  }

  endTimer(operationName, startTime) {
    if (!this.isEnabled) return;

    const endTime = performance.now();
    const duration = endTime - startTime;

    if (!this.metrics.has(operationName)) {
      this.metrics.set(operationName, {
        count: 0,
        totalTime: 0,
        minTime: Infinity,
        maxTime: 0,
        averageTime: 0,
      });
    }

    const metric = this.metrics.get(operationName);
    metric.count++;
    metric.totalTime += duration;
    metric.minTime = Math.min(metric.minTime, duration);
    metric.maxTime = Math.max(metric.maxTime, duration);
    metric.averageTime = metric.totalTime / metric.count;

    // Log slow operations (development only)
    if (duration > 16 && process.env.NODE_ENV === "development") {
       
      console.warn(
        `Slow operation detected: ${operationName} took ${duration.toFixed(
          2
        )}ms`
      );
    }
  }

  measureAsyncOperation(operationName, asyncFn) {
    if (!this.isEnabled) return asyncFn();

    const timer = this.startTimer(operationName);
    const result = asyncFn();

    if (result && typeof result.then === "function") {
      return result.finally(() => timer.end());
    } else {
      timer.end();
      return result;
    }
  }

  measureFunction(operationName, fn) {
    if (!this.isEnabled) return fn;

    return (...args) => {
      const timer = this.startTimer(operationName);
      try {
        const result = fn(...args);
        timer.end();
        return result;
      } catch (error) {
        timer.end();
        throw error;
      }
    };
  }

  getMetrics() {
    return Array.from(this.metrics.entries()).map(([name, data]) => ({
      operation: name,
      ...data,
    }));
  }

  logMetrics() {
    if (!this.isEnabled) return;
    if (process.env.NODE_ENV === "development") {
       
      console.group("Performance Metrics");
      this.getMetrics().forEach((metric) => {
         
        console.log(`${metric.operation}:`, {
          count: metric.count,
          avg: `${metric.averageTime.toFixed(2)}ms`,
          min: `${metric.minTime.toFixed(2)}ms`,
          max: `${metric.maxTime.toFixed(2)}ms`,
          total: `${metric.totalTime.toFixed(2)}ms`,
        });
      });
       
      console.groupEnd();
    }
  }

  clear() {
    this.metrics.clear();
  }
}

// Memory usage monitoring
export const memoryUsage = {
  getCurrentUsage() {
    if (performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
      };
    }
    return null;
  },

  logUsage(label = "Memory Usage") {
    const usage = this.getCurrentUsage();
    if (usage) {
      if (process.env.NODE_ENV === "development") {
         
        console.log(`${label}:`, {
          used: `${(usage.used / 1024 / 1024).toFixed(2)} MB`,
          total: `${(usage.total / 1024 / 1024).toFixed(2)} MB`,
          limit: `${(usage.limit / 1024 / 1024).toFixed(2)} MB`,
        });
      }
    }
  },
};

// Frame rate monitoring
export class FrameRateMonitor {
  constructor() {
    this.frames = [];
    this.isMonitoring = false;
    this.rafId = null;
  }

  start() {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.frames = [];

    const loop = (timestamp) => {
      this.frames.push(timestamp);

      // Keep only last 60 frames
      if (this.frames.length > 60) {
        this.frames.shift();
      }

      if (this.isMonitoring) {
        this.rafId = requestAnimationFrame(loop);
      }
    };

    this.rafId = requestAnimationFrame(loop);
  }

  stop() {
    this.isMonitoring = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  getCurrentFPS() {
    if (this.frames.length < 2) return 0;

    const lastFrame = this.frames[this.frames.length - 1];
    const firstFrame = this.frames[0];
    const timeSpan = lastFrame - firstFrame;

    return Math.round(((this.frames.length - 1) * 1000) / timeSpan);
  }

  getAverageFPS() {
    if (this.frames.length < 10) return 0;

    const intervals = [];
    for (let i = 1; i < this.frames.length; i++) {
      intervals.push(this.frames[i] - this.frames[i - 1]);
    }

    const averageInterval =
      intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    return Math.round(1000 / averageInterval);
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for monitoring component render performance
export const useRenderPerformance = (componentName) => {
  if (process.env.NODE_ENV === "development") {
    const renderStart = performance.now();

    // Note: This should be moved to a proper React component context
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
      performanceMonitor.endTimer(`${componentName} render`, renderStart);
    });

    performanceMonitor.startTimer(`${componentName} render`);
  }
};

// Selection performance tracking
export const trackSelectionPerformance = (operation, count) => {
  if (process.env.NODE_ENV === "development") {
    if (process.env.NODE_ENV === "development") {
       
      console.log(
        `Selection ${operation}: ${count} weeks processed in ${performance.now()}ms`
      );
    }
  }
};
