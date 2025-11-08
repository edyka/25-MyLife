/**
 * Performance monitoring utility
 * Tracks key performance metrics and reports to analytics
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      pageLoad: null,
      firstContentfulPaint: null,
      largestContentfulPaint: null,
      timeToInteractive: null,
      apiResponseTimes: [],
    };
    this.observers = [];
  }

  /**
   * Initialize performance monitoring
   */
  init() {
    if (typeof window === 'undefined' || !window.performance) return;

    // Track page load time
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.measurePageLoad();
        this.measureWebVitals();
      }, 0);
    });

    // Track API response times
    this.setupAPIMonitoring();
  }

  /**
   * Measure page load performance
   */
  measurePageLoad() {
    if (!window.performance || !window.performance.timing) return;

    const timing = window.performance.timing;
    const navigation = window.performance.navigation;

    const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
    const domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
    const domInteractive = timing.domInteractive - timing.navigationStart;

    this.metrics.pageLoad = pageLoadTime;
    this.metrics.domContentLoaded = domContentLoaded;
    this.metrics.domInteractive = domInteractive;

    // Log slow page loads
    if (pageLoadTime > 3000) {
      console.warn(`[Performance] Slow page load: ${pageLoadTime}ms`);
    }

    // Report to analytics
    this.reportMetric('page_load', pageLoadTime);
  }

  /**
   * Measure Web Vitals
   */
  measureWebVitals() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.metrics.largestContentfulPaint = lastEntry.renderTime || lastEntry.loadTime;
          this.reportMetric('lcp', this.metrics.largestContentfulPaint);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (error) {
        console.warn('[Performance] LCP monitoring not supported:', error);
      }

      // First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            const fid = entry.processingStart - entry.startTime;
            this.reportMetric('fid', fid);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (error) {
        console.warn('[Performance] FID monitoring not supported:', error);
      }
    }
  }

  /**
   * Monitor API response times
   */
  setupAPIMonitoring() {
    if (typeof fetch === 'undefined') return;

    const originalFetch = window.fetch;
    const self = this;

    window.fetch = async function (...args) {
      const startTime = performance.now();
      const url = args[0]?.toString() || '';

      try {
        const response = await originalFetch.apply(this, args);
        const endTime = performance.now();
        const duration = endTime - startTime;

        // Track Supabase API calls
        if (url.includes('supabase.co')) {
          self.metrics.apiResponseTimes.push({
            url,
            duration,
            timestamp: Date.now(),
          });

          // Log slow API calls
          if (duration > 1000) {
            console.warn(`[Performance] Slow API call: ${url} took ${duration.toFixed(0)}ms`);
          }

          // Report to analytics
          self.reportMetric('api_response_time', duration, { url });
        }

        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        console.error(`[Performance] API call failed: ${url} after ${duration.toFixed(0)}ms`, error);
        throw error;
      }
    };
  }

  /**
   * Report metric to analytics
   */
  reportMetric(name, value, metadata = {}) {
    try {
      const { trackEvent } = require('./analytics');
      trackEvent('performance_metric', {
        metric: name,
        value: Math.round(value),
        ...metadata,
      });
    } catch (error) {
      // Analytics not critical, continue silently
    }
  }

  /**
   * Get performance summary
   */
  getSummary() {
    const avgApiTime = this.metrics.apiResponseTimes.length > 0
      ? this.metrics.apiResponseTimes.reduce((sum, m) => sum + m.duration, 0) / this.metrics.apiResponseTimes.length
      : 0;

    return {
      pageLoad: this.metrics.pageLoad,
      lcp: this.metrics.largestContentfulPaint,
      avgApiResponseTime: avgApiTime,
      apiCallCount: this.metrics.apiResponseTimes.length,
    };
  }

  /**
   * Cleanup observers
   */
  cleanup() {
    this.observers.forEach(observer => {
      try {
        observer.disconnect();
      } catch (error) {
        // Ignore cleanup errors
      }
    });
    this.observers = [];
  }
}

const performanceMonitor = new PerformanceMonitor();

/**
 * Initialize performance monitoring
 */
export const initPerformanceMonitoring = () => {
  performanceMonitor.init();
};

/**
 * Get performance summary
 */
export const getPerformanceSummary = () => {
  return performanceMonitor.getSummary();
};

export default performanceMonitor;
