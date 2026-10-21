import { createTheme } from "@mui/material";
const theme = createTheme({
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  palette: {
    primary: { main: "#1565C0" },
    secondary: { main: "#37474F" },
    background: { default: "#F5F7FA", paper: "#FFFFFF" },
    success: { main: "#2E7D32" },
    warning: { main: "#ED6C02" },
    error: { main: "#D32F2F" },
  },
  shape: { borderRadius: 8 },
});
export default theme;
