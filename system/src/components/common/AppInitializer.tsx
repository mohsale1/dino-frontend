import React, { ReactNode } from 'react';

interface AppInitializerProps {
  children: ReactNode;
}

/**
 * Minimal initializer for the system admin service.
 * No user-data context initialization needed here.
 */
const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  return <>{children}</>;
};

export default AppInitializer;