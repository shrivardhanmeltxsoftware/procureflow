import { Box, ThemeProvider, CssBaseline } from "@mui/material";
import { Navigate, Outlet } from "react-router";
import adminTheme from "../theme/adminTheme";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = () => {
  const isAuthenticated = Boolean(localStorage.getItem("admin"));

  if (!isAuthenticated) {
    return <Navigate to="/admin-login" replace />;
  }

  return (
    <ThemeProvider theme={adminTheme}>
      <CssBaseline />
      <Box sx={{ display: "flex" }}>
        <AdminHeader />
        <AdminSidebar />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            mt: "64px",
            height: "calc(100vh - 64px)",
            p: 3,
            boxSizing: "border-box",
            bgcolor: "background.default",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AdminLayout;
