import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { RouterProvider } from 'react-router-dom';
import { yuleTheme } from './theme/yuleTheme';
import { router } from './router';

export const App: React.FC = () => {
  return (
    <ThemeProvider theme={yuleTheme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
};

export default App;
