// filepath: frontend/src/components/ThemeRegistry.tsx
'use client';
import * as React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import NextAppDirEmotionCacheProvider from './EmotionCache'; // You'll create this next

// Example of a basic Material 3 theme. You can customize this extensively.
const theme = createTheme({
  palette: {
    mode: 'light', // or 'dark'
    primary: {
      main: '#6750A4', // Example Material 3 primary color
    },
    secondary: {
      main: '#E8DEF8', // Example Material 3 secondary color
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
  // You can enable Material 3 features if the library supports them explicitly
  // or by customizing components to follow M3 guidelines.
});

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <NextAppDirEmotionCacheProvider options={{ key: 'mui' }}>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        {children}
      </ThemeProvider>
    </NextAppDirEmotionCacheProvider>
  );
}