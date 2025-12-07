import React, { createContext, useContext, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { lightTheme } from '../theme/themeConfig';

interface ThemeContextType {
  mode: 'light';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const value: ThemeContextType = {
    mode: 'light',
  };

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={lightTheme}>
        <CssBaseline />
        <div
          style={{
            minHeight: '100vh',
            backgroundColor: lightTheme.palette.background.default,
            color: lightTheme.palette.text.primary,
          }}
        >
          {children}
        </div>
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};