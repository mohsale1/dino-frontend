/**
 * Token Refresh Scheduler
 * Automatically refreshes tokens before they expire
 */

import { authService } from '../services/auth';

class TokenRefreshScheduler {
  private refreshInterval: NodeJS.Timeout | null = null;
  private isRefreshing = false;

  /**
   * Start the token refresh scheduler
   */
  start(): void {
    if (this.refreshInterval) {
      this.stop();
    }

    // Check every minute
    this.refreshInterval = setInterval(() => {
      this.checkAndRefreshToken();
    }, 60 * 1000);  }

  /**
   * Stop the token refresh scheduler
   */
  stop(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;    }
  }

  /**
   * Check if token needs refresh and refresh if necessary
   */
  private async checkAndRefreshToken(): Promise<void> {
    if (this.isRefreshing) {
      return; // Already refreshing
    }

    if (!authService.isAuthenticated()) {
      this.stop(); // Stop scheduler if not authenticated
      return;
    }

    const { isExpired, expiresIn } = authService.getTokenExpiryInfo();

    if (isExpired) {      await this.performRefresh();
    } else if (expiresIn < 10 * 60 * 1000) { // Less than 10 minutes      await this.performRefresh();
    }
  }

  /**
   * Perform the actual token refresh
   */
  private async performRefresh(): Promise<void> {
    if (this.isRefreshing) {
      return;
    }

    this.isRefreshing = true;

    try {
      const newToken = await authService.refreshToken();
      if (newToken) {      } else {        this.stop();
      }
    } catch (error) {      this.stop();
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Force refresh token immediately
   */
  async forceRefresh(): Promise<boolean> {
    if (this.isRefreshing) {      return false;
    }

    await this.performRefresh();
    return true;
  }

  /**
   * Get scheduler status
   */
  getStatus(): {
    isRunning: boolean;
    isRefreshing: boolean;
    tokenInfo: ReturnType<typeof authService.getTokenExpiryInfo>;
  } {
    return {
      isRunning: this.refreshInterval !== null,
      isRefreshing: this.isRefreshing,
      tokenInfo: authService.getTokenExpiryInfo(),
    };
  }
}

// Export singleton instance
export const tokenRefreshScheduler = new TokenRefreshScheduler();

// Auto-start scheduler when module loads (if authenticated)
if (typeof window !== 'undefined' && authService.isAuthenticated()) {
  tokenRefreshScheduler.start();
}

export default tokenRefreshScheduler;