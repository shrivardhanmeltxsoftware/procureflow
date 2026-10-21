// adminTheme.js
import { createTheme } from '@mui/material/styles';

const adminTheme = createTheme({
  typography: { fontFamily: '"Inter", "Roboto", sans-serif' },
  palette: {
    primary: { main: '#4527A0' },
    secondary: { main: '#263238' },
    background: { default: '#F5F5F7', paper: '#FFFFFF' },
    success: { main: '#2E7D32' },
    warning: { main: '#ED6C02' },
    error: { main: '#D32F2F' },
  },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: 'none' } } },
  },
  shape: { borderRadius: 8 },
});

export default adminTheme;