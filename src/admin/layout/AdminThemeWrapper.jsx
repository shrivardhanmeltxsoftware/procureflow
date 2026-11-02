
import { ThemeProvider } from "@mui/material";
import { Outlet } from "react-router";
import adminTheme from "../../shared/theme/adminTheme.js";

const AdminThemeWrapper = () => (
  <ThemeProvider theme={adminTheme}>
    <Outlet />
  </ThemeProvider>
);

export default AdminThemeWrapper;