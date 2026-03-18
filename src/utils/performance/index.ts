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

    // Log initial performance metrics
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      const loadTime = timing.loadEventEnd - timing.navigationStart;
      const domReadyTime = timing.domContentLoadedEventEnd - timing.navigationStart;
      const renderTime = timing.domComplete - timing.domLoading;

      console.log('[Performance] Page Load Metrics:', {
        loadTime: `${loadTime}ms`,
        domReadyTime: `${domReadyTime}ms`,
        renderTime: `${renderTime}ms`,
      });
    }

    // Set up Performance Observer for navigation timing
    if ('PerformanceObserver' in window) {
      try {
        const navigationObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              console.log('[Performance] Navigation Timing:', {
                dns: `${navEntry.domainLookupEnd - navEntry.domainLookupStart}ms`,
                tcp: `${navEntry.connectEnd - navEntry.connectStart}ms`,
                request: `${navEntry.responseStart - navEntry.requestStart}ms`,
                response: `${navEntry.responseEnd - navEntry.responseStart}ms`,
                domProcessing: `${navEntry.domComplete - navEntry.domInteractive}ms`,
              });
            }
          }
        });

        navigationObserver.observe({ entryTypes: ['navigation'] });
      } catch (error) {
        console.warn('[Performance] Navigation observer not supported:', error);
      }

      // Set up Performance Observer for resource timing
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'resource') {
              const resourceEntry = entry as PerformanceResourceTiming;
              // Only log slow resources (> 500ms)
              if (resourceEntry.duration > 500) {
                console.warn('[Performance] Slow Resource:', {
                  name: resourceEntry.name,
                  duration: `${resourceEntry.duration.toFixed(2)}ms`,
                  size: resourceEntry.transferSize,
                });
              }
            }
          }
        });

        resourceObserver.observe({ entryTypes: ['resource'] });
      } catch (error) {
        console.warn('[Performance] Resource observer not supported:', error);
      }

      // Set up Performance Observer for long tasks
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            console.warn('[Performance] Long Task Detected:', {
              duration: `${entry.duration.toFixed(2)}ms`,
              startTime: `${entry.startTime.toFixed(2)}ms`,
            });
          }
        });

        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (error) {
        // Long task API not supported in all browsers
        console.debug('[Performance] Long task observer not supported');
      }
    }

    console.log('[Performance] Monitoring initialized');
  } catch (error) {
    console.error('[Performance] Failed to initialize monitoring:', error);
  }
}

/**
 * Measure and log component render time
 */
export function measureRenderTime(componentName: string, startTime: number): void {
  if (typeof window === 'undefined') {
    return;
  }

  const endTime = performance.now();
  const renderTime = endTime - startTime;

  if (renderTime > 100) {
    console.warn(`[Performance] Slow render: ${componentName} took ${renderTime.toFixed(2)}ms`);
  }
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
    console.debug('[Performance] Failed to mark:', name, error);
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
    const measure = window.performance.getEntriesByName(name)[0];
    if (measure) {
      console.log(`[Performance] ${name}: ${measure.duration.toFixed(2)}ms`);
    }
  } catch (error) {
    console.debug('[Performance] Failed to measure:', name, error);
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
 * Log memory usage
 */
export function logMemoryUsage(): void {
  const memory = getMemoryUsage();
  if (memory) {
    console.log('[Performance] Memory Usage:', {
      used: `${memory.used}MB`,
      total: `${memory.total}MB`,
      percentage: `${memory.percentage}%`,
    });
  }
}

export default {
  initializePerformanceMonitoring,
  measureRenderTime,
  markPerformance,
  measurePerformance,
  getMemoryUsage,
  logMemoryUsage,
};
