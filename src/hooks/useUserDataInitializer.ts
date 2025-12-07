import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';

/**
 * Hook to ensure UserData is properly initialized
 * This hook provides a more reliable way to ensure user data is loaded
 */
export const useUserDataInitializer = () => {
  const { isAuthenticated, user } = useAuth();
  const { userData, loading, refreshUserData } = useUserData();
  const initAttempted = useRef(false);
  const retryCount = useRef(0);
  const maxRetries = 3;

  useEffect(() => {
    const initializeUserData = async () => {
      // Only attempt if user is authenticated and we haven't tried yet
      if (!isAuthenticated || !user) {        initAttempted.current = false;
        retryCount.current = 0;
        return;
      }

      // If we already have data, no need to retry
      if (userData) {
        // Reduced logging to prevent spam
        if (!initAttempted.current) {        }
        initAttempted.current = true;
        retryCount.current = 0;
        return;
      }

      // If currently loading, wait - this prevents duplicate calls
      if (loading) {
        // Reduced logging to prevent spam
        return;
      }

      // FIXED: Only trigger refresh if UserDataContext hasn't already initialized
      // This prevents duplicate API calls to /auth/user-data
      if (!initAttempted.current && retryCount.current === 0) {        initAttempted.current = true;
        
        // Wait a bit longer for UserDataContext to complete its initialization
        setTimeout(() => {
          // Only retry if we still don't have data after UserDataContext had time to load
          if (!userData && !loading && retryCount.current < maxRetries) {            retryCount.current++;
            
            refreshUserData().catch(error => {              
              if (retryCount.current < maxRetries) {
                setTimeout(() => {
                  initializeUserData();
                }, 2000);
              } else {              }
            });
          }
        }, 2000); // Give UserDataContext 2 seconds to complete
      }
    };

    // Small delay to ensure contexts are properly initialized
    const timer = setTimeout(initializeUserData, 500);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, user, userData, loading, refreshUserData]);

  // Return status for debugging
  return {
    isInitialized: !!userData,
    isLoading: loading,
    retryCount: retryCount.current,
    hasUser: !!user,
    isAuthenticated
  };
};