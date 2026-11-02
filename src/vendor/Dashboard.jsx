import { Navigate, Outlet, useNavigate } from "react-router";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { vendorDashboardConfig } from "../config/dashboardConfig";
import { getStoredVendor } from "../utils/auth";

const Dashboard = () => {
  const navigate = useNavigate();
  const vendor = getStoredVendor();

  if (!vendor?.id) {
    return <Navigate to="/" replace />;
  }

  const logout = () => {
    localStorage.removeItem("vendor");
    localStorage.removeItem("vendorId");
    navigate("/", { replace: true });
  };
  const profileName =
    vendor.businessName ||
    [vendor.firstName, vendor.lastName].filter(Boolean).join(" ") ||
    "Vendor account";

  return (
    <DashboardLayout
      config={vendorDashboardConfig}
      profile={{
        name: profileName,
        email: vendor.email,
        role: "Registered Vendor",
      }}
      onLogout={logout}
    >
      <Outlet />
    </DashboardLayout>
  );
};

export { Dashboard };
