// adminTheme.js
import { createTheme } from "@mui/material/styles";

const adminTheme = createTheme({
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  palette: {
    primary: { main: "#4F46E5", dark: "#4338CA", contrastText: "#FFFFFF" },
    secondary: { main: "#64748B" },
    background: { default: "#F8FAFC", paper: "#FFFFFF" },
    text: { primary: "#0F172A", secondary: "#64748B" },
    divider: "#E2E8F0",
    navigation: { active: "#EEF2FF", hover: "#F5F6FA" },
    success: { main: "#16A34A" },
    warning: { main: "#D97706" },
    error: { main: "#DC2626" },
    info: { main: "#0284C7" },
  },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: "none" } } },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          color: "#0F172A",
          boxShadow: "none",
        },
      },
    },
  },
  shape: { borderRadius: 8 },
});

export default adminTheme;