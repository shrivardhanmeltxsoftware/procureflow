import { Box, CssBaseline, ThemeProvider } from "@mui/material";
import { Navigate, Outlet, useNavigate } from "react-router";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { adminDashboardConfig } from "../config/dashboardConfig";
import adminTheme from "../theme/adminTheme";
import { getStoredAdmin } from "../utils/auth";

const formatRole = (role) =>
  role
    ? role
        .split(/[_\s-]+/)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
    : "Administrator";

const AdminLayout = () => {
  const navigate = useNavigate();
  const admin = getStoredAdmin();

  if (!admin?.id) {
    return <Navigate to="/admin-login" replace />;
  }

  const logout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("adminId");
    localStorage.removeItem("adminSidebarPinned");
    navigate("/", { replace: true });
  };
  const adminName =
    admin.name ||
    [admin.firstName, admin.lastName].filter(Boolean).join(" ") ||
    "Admin User";

  return (
    <ThemeProvider theme={adminTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100dvh" }}>
        <DashboardLayout
          config={adminDashboardConfig}
          profile={{
            name: adminName,
            email: admin.email,
            role: formatRole(admin.role),
          }}
          onLogout={logout}
        >
          <Outlet />
        </DashboardLayout>
      </Box>
    </ThemeProvider>
  );
};

export default AdminLayout;
