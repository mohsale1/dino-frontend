/**
 * Performance Monitoring Utilities
 * Provides performance tracking and monitoring capabilities
 */

/**
 * Initialize performance monitoring
 * Sets up performance observers and tracking
 */
export function initializePerformanceMonitoring(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // Only enable in development or when explicitly enabled
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isPerformanceEnabled = localStorage.getItem('enablePerformanceMonitoring') === 'true';

    if (!isDevelopment && !isPerformanceEnabled) {
      return;
    }

    // Set up Performance Observer for navigation timing
    if ('PerformanceObserver' in window) {
      try {
        const navigationObserver = new PerformanceObserver(() => {
          // Navigation timing data collected silently
        });

        navigationObserver.observe({ entryTypes: ['navigation'] });
      } catch {
        // Navigation observer not supported — continue silently
      }

      // Set up Performance Observer for resource timing
      try {
        const resourceObserver = new PerformanceObserver(() => {
          // Resource timing data collected silently
        });

        resourceObserver.observe({ entryTypes: ['resource'] });
      } catch {
        // Resource observer not supported — continue silently
      }

      // Set up Performance Observer for long tasks
      try {
        const longTaskObserver = new PerformanceObserver(() => {
          // Long task data collected silently
        });

        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch {
        // Long task API not supported in all browsers
      }
    }
  } catch (error) {
    console.error('[Performance] Failed to initialize monitoring:', error);
  }
}

/**
 * Measure component render time
 */
export function measureRenderTime(_componentName: string, _startTime: number): void {
  // Render timing is a no-op in silent mode; retained for API compatibility
}


/**
 * Mark a custom performance event
 */
export function markPerformance(name: string): void {
  if (typeof window === 'undefined' || !window.performance) {
    return;
  }

  try {
    window.performance.mark(name);
  } catch (error) {
    console.error('[Performance] Failed to mark:', name, error);
  }
}

/**
 * Measure time between two performance marks
 */
export function measurePerformance(name: string, startMark: string, endMark: string): void {
  if (typeof window === 'undefined' || !window.performance) {
    return;
  }

  try {
    window.performance.measure(name, startMark, endMark);
    // Measurement stored in the browser's performance timeline
  } catch (error) {
    console.error('[Performance] Failed to measure:', name, error);
  }
}

/**
 * Get current memory usage (if available)
 */
export function getMemoryUsage(): { used: number; total: number; percentage: number } | null {
  if (typeof window === 'undefined') {
    return null;
  }

  // @ts-ignore - performance.memory is not in all browsers
  const memory = window.performance?.memory;

  if (!memory) {
    return null;
  }

  return {
    used: Math.round(memory.usedJSHeapSize / 1048576), // MB
    total: Math.round(memory.totalJSHeapSize / 1048576), // MB
    percentage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100),
  };
}

/**
 * Get memory usage snapshot (silent — callers read the returned value)
 */
export function logMemoryUsage(): void {
  // Memory data available via getMemoryUsage(); no console output in production
  getMemoryUsage();
}

const performanceUtils = {
  initializePerformanceMonitoring,
  measureRenderTime,
  markPerformance,
  measurePerformance,
  getMemoryUsage,
  logMemoryUsage,
};

export default performanceUtils;
