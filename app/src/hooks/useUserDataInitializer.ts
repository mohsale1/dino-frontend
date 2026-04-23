import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/common/Auth';
import { useUserData } from '../contexts/application/UserData';

/**
 * Hook to ensure UserData is properly initialized
 * This hook provides a more reliable way to ensure user data is loaded
 */
export const useUserDataInitializer = () => {
  const { isAuthenticated, user } = useAuth();
  const { userData, loading, refreshUserData } = useUserData();
  const initAttempted = useRef(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeUserData = async () => {
      if (!isAuthenticated || !user) {
        initAttempted.current = false;
        return;
      }

      if (userData) {
        initAttempted.current = true;
        return;
      }

      if (loading) {
        return;
      }

      if (!initAttempted.current) {
        initAttempted.current = true;

        setTimeout(async () => {
          if (!userData && !loading) {
            try {
              await refreshUserData();
            } catch (err) {
              setError(err instanceof Error ? err : new Error(String(err)));
            }
          }
        }, 2000);
      }
    };

    const timer = setTimeout(initializeUserData, 500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user, userData, loading, refreshUserData]);

  return {
    isInitialized: !!userData,
    isLoading: loading,
    hasUser: !!user,
    isAuthenticated,
    error,
  };
};
