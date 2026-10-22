import { useState } from "react";
import { Box, ThemeProvider, CssBaseline, useMediaQuery } from "@mui/material";
import { Navigate, Outlet } from "react-router";
import adminTheme from "../theme/adminTheme";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = () => {
  const isMobile = useMediaQuery(adminTheme.breakpoints.down("md"));
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const isAuthenticated = Boolean(localStorage.getItem("admin"));

  if (!isAuthenticated) {
    return <Navigate to="/admin-login" replace />;
  }

  return (
    <ThemeProvider theme={adminTheme}>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <AdminHeader
          isMobile={isMobile}
          onMenuClick={() => setMobileDrawerOpen(true)}
        />
        <AdminSidebar
          isMobile={isMobile}
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
        />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minWidth: 0,
            mt: { xs: "56px", sm: "64px" },
            height: { xs: "calc(100vh - 56px)", sm: "calc(100vh - 64px)" },
            p: { xs: 1.5, sm: 2, md: 3 },
            boxSizing: "border-box",
            bgcolor: "background.default",
            overflowY: "auto",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AdminLayout;
