/**
 * Storage Cleanup Utility
 * Removes redundant storage items and migrates to new format
 */

import StorageManager from './storageManager';

class StorageCleanup {
  /**
   * Remove redundant token expiry storage
   * JWT tokens already contain expiry information in their payload
   */
  static removeRedundantTokenExpiry(): void {
    try {
      // Remove the redundant dino_token_expiry item
      StorageManager.removeItem('dino_token_expiry');    } catch (error) {
      // Error handled silently
    }
  }

  /**
   * Remove activity tracking storage
   * Activity tracking has been removed from the app
   */
  static removeActivityTracking(): void {
    try {
      // Remove the dino_last_activity item
      if (localStorage.getItem('dino_last_activity')) {
        localStorage.removeItem('dino_last_activity');      }
    } catch (error) {
      // Error handled silently
    }
  }

  /**
   * Remove all cache storage entries
   * Caching has been disabled to prevent localStorage usage
   */
  static removeCacheStorage(): void {
    try {
      const cacheKeys = Object.keys(localStorage).filter(key => key.startsWith('dino_cache_'));
      cacheKeys.forEach(key => {
        localStorage.removeItem(key);      });
      if (cacheKeys.length > 0) {      }
    } catch (error) {
      // Error handled silently
    }
  }

  /**
   * Clean up any other legacy storage items
   */
  static cleanupLegacyItems(): void {
    const legacyKeys = [
      'dino_token_expiry', // Redundant - JWT contains expiry
      'dino_last_activity', // Removed - unnecessary activity tracking
      'sidebarCollapsed', // Moved to React state
      'dino_sidebar_collapsed', // Moved to React state
      'dinoAvatar', // Moved to React Context (session-based)
      'dinoName', // Moved to React Context (session-based)
      'auth_token_expiry', // Old naming convention
      'token_expiry', // Generic naming
    ];

    legacyKeys.forEach(key => {
      try {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);        }
      } catch (error) {
      // Error handled silently
    }
    });

    // Remove all cache entries with dino_cache_ prefix
    try {
      const cacheKeys = Object.keys(localStorage).filter(key => key.startsWith('dino_cache_'));
      cacheKeys.forEach(key => {
        localStorage.removeItem(key);      });
    } catch (error) {
      // Error handled silently
    }

    // Remove workspace venue cache entries
    try {
      const workspaceVenueKeys = Object.keys(localStorage).filter(key => key.startsWith('workspace_venues_'));
      workspaceVenueKeys.forEach(key => {
        localStorage.removeItem(key);      });
    } catch (error) {
      // Error handled silently
    }
  }

  /**
   * Perform complete storage cleanup
   */
  static performCleanup(): void {    this.removeRedundantTokenExpiry();
    this.removeActivityTracking();
    this.removeCacheStorage();
    this.cleanupLegacyItems();  }

  /**
   * Get current storage usage info
   */
  static getStorageInfo(): {
    totalItems: number;
    dinoItems: number;
    storageSize: number;
    items: string[];
  } {
    const items: string[] = [];
    let dinoItems = 0;
    let storageSize = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        items.push(key);
        if (key.startsWith('dino_')) {
          dinoItems++;
        }
        const value = localStorage.getItem(key);
        if (value) {
          storageSize += key.length + value.length;
        }
      }
    }

    return {
      totalItems: items.length,
      dinoItems,
      storageSize,
      items: items.sort()
    };
  }

  /**
   * Debug storage contents
   */
  static debugStorage(): void {
    const info = this.getStorageInfo();    
    // Show dino-specific items
    const dinoItems = info.items.filter(key => key.startsWith('dino_'));
    if (dinoItems.length > 0) {      dinoItems.forEach(key => {
        const value = localStorage.getItem(key);
        const size = value ? value.length : 0;      });
    }  }
}

// Auto-cleanup on module load
if (typeof window !== 'undefined') {
  // Force immediate removal of activity tracking, avatar storage, and all cache entries
  try {
    if (localStorage.getItem('dino_last_activity')) {
      localStorage.removeItem('dino_last_activity');    }
    if (localStorage.getItem('dinoAvatar')) {
      localStorage.removeItem('dinoAvatar');    }
    if (localStorage.getItem('dinoName')) {
      localStorage.removeItem('dinoName');    }
    
    // Remove all dino_cache_ entries
    const cacheKeys = Object.keys(localStorage).filter(key => key.startsWith('dino_cache_'));
    cacheKeys.forEach(key => {
      localStorage.removeItem(key);    });
    
    // Remove workspace venue cache entries
    const workspaceVenueKeys = Object.keys(localStorage).filter(key => key.startsWith('workspace_venues_'));
    workspaceVenueKeys.forEach(key => {
      localStorage.removeItem(key);    });
  } catch (error) {
      // Error handled silently
    }
  
  // Run full cleanup immediately and after a short delay
  StorageCleanup.performCleanup();
  setTimeout(() => {
    StorageCleanup.performCleanup();
  }, 1000);
}

export default StorageCleanup;

// Make available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).StorageCleanup = StorageCleanup;
  
  // Add a global function to force cleanup
  (window as any).forceStorageCleanup = () => {
    StorageCleanup.performCleanup();  };
  
  // Add a function to specifically remove activity tracking
  (window as any).removeActivityTracking = () => {
    StorageCleanup.removeActivityTracking();  };
}