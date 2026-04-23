/**
 * Utility to clear authentication state
 * Useful for fixing JWT algorithm mismatches and other auth issues
 */

import { authService } from '../../services/common/auth';
import { StorageManager } from '../storage';

export const clearAuthState = () => {
  try {
    // Clear auth service state
    authService.logout();
    
    // Clear all storage
    StorageManager.clearAuthData();
    StorageManager.clearCache();
    
    // Remove remaining dino_ prefixed keys not covered by clearAuthData/clearCache
    [
      StorageManager.KEYS.MENU_CACHE,
      StorageManager.KEYS.SETTINGS,
      StorageManager.KEYS.THEME,
      'dino_current_workspace',
      'dino_current_venue',
    ].forEach(key => StorageManager.removeItem(key));
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    return true;
  } catch (error) {
    console.error('Error clearing authentication state:', error);
    return false;
  }
};

/**
 * Check if user is experiencing JWT algorithm issues
 */
export const checkJWTHealth = (): { healthy: boolean; message: string } => {
  try {
    const token = authService.getToken();
    
    if (!token) {
      return { healthy: true, message: 'No token found' };
    }
    
    // Parse JWT header to check algorithm
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { healthy: false, message: 'Invalid token format' };
    }
    
    const header = JSON.parse(atob(parts[0]));
    const expectedAlg = 'HS256'; // Should match backend ALGORITHM setting
    
    if (header.alg !== expectedAlg) {
      return { 
        healthy: false, 
        message: `Token algorithm mismatch: expected ${expectedAlg}, got ${header.alg}` 
      };
    }
    
    return { healthy: true, message: 'Token algorithm is correct' };
  } catch (error) {
    return { 
      healthy: false, 
      message: `Error checking token: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
};

/**
 * Auto-fix JWT issues if detected
 */
export const autoFixJWTIssues = (): boolean => {
  const health = checkJWTHealth();
  
  if (!health.healthy) {
    const cleared = clearAuthState();
    
    if (cleared) {
      return true;
    } else {
      console.error('Auto-fix failed. Please clear browser cache manually.');
      return false;
    }
  }
  
  return false;
};
