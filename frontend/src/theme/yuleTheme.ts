import { createTheme } from '@mui/material/styles';

export const yuleTheme = createTheme({
  palette: {
    primary: {
      main: '#1b4332',
      light: '#2d6a4f',
      dark: '#0d1e17',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#9d0208',
      light: '#bd121c',
      dark: '#780016',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f7f4ee',
      paper: '#ffffff',
    },
    text: {
      primary: '#1f2d26',
      secondary: '#5e6d65',
    },
    warning: {
      main: '#d4af37',
    },
    success: {
      main: '#1b7a42',
    },
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
    h1: {
      fontFamily: "'Cinzel', Georgia, serif",
      fontWeight: 700,
    },
    h2: {
      fontFamily: "'Cinzel', Georgia, serif",
      fontWeight: 700,
    },
    h3: {
      fontFamily: "'Cinzel', Georgia, serif",
      fontWeight: 700,
    },
    h4: {
      fontFamily: "'Cinzel', Georgia, serif",
      fontWeight: 700,
    },
    h5: {
      fontFamily: "'Cinzel', Georgia, serif",
      fontWeight: 700,
    },
    h6: {
      fontFamily: "'Cinzel', Georgia, serif",
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: 14,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 700,
          borderRadius: 12,
          padding: '10px 20px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          border: '1px solid #e5ded0',
          boxShadow: '0 4px 14px rgba(27,67,50,0.04)',
        },
      },
    },
  },
});
