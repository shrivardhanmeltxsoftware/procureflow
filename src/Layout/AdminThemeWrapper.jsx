
import { ThemeProvider } from "@mui/material";
import { Outlet } from "react-router";
import adminTheme from "../theme/adminTheme";

const AdminThemeWrapper = () => (
  <ThemeProvider theme={adminTheme}>
    <Outlet />
  </ThemeProvider>
);

export default AdminThemeWrapper;