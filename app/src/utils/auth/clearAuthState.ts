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
    
    // Clear any remaining localStorage items
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    console.log('âœ… Authentication state cleared successfully');
    return true;
  } catch (error) {
    console.error('âŒ Error clearing authentication state:', error);
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
    console.warn(`JWT issue detected: ${health.message}`);
    console.log('Attempting auto-fix...');
    
    const cleared = clearAuthState();
    
    if (cleared) {
      console.log('âœ… Auto-fix successful. Please login again.');
      return true;
    } else {
      console.error('âŒ Auto-fix failed. Please clear browser cache manually.');
      return false;
    }
  }
  
  return false;
};

// Make utilities available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).clearAuthState = clearAuthState;
  (window as any).checkJWTHealth = checkJWTHealth;
  (window as any).autoFixJWTIssues = autoFixJWTIssues;
}