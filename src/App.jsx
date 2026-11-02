import { Box, CircularProgress } from "@mui/material";
import { Login } from "./vendor/pages/Login.jsx";
import { Register } from "./vendor/pages/Register.jsx";
import { createBrowserRouter, RouterProvider } from "react-router";

const LoadingFallback = () => (
  <Box
    sx={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <CircularProgress />
  </Box>
);

const lazyRoute = (loadModule, exportName) => ({
  lazy: async () => {
    const module = await loadModule();
    return { Component: module[exportName] };
  },
  HydrateFallback: LoadingFallback,
});

const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/dashboard",
    ...lazyRoute(
      () => import("./vendor/layout/VendorLayout.jsx"),
      "VendorLayout",
    ),
    children: [
      {
        index: true,
        ...lazyRoute(() => import("./vendor/pages/DashboardChart.jsx"), "DashboardChart"),
      },
      {
        path: "overview",
        ...lazyRoute(() => import("./vendor/pages/DashboardChart.jsx"), "DashboardChart"),
      },
      {
        path: "profile",
        ...lazyRoute(() => import("./vendor/pages/Profile.jsx"), "Profile"),
      },
      {
        path: "documents",
        ...lazyRoute(() => import("./vendor/pages/Documents.jsx"), "Documents"),
      },
      {
        path: "purchase-orders",
        ...lazyRoute(() => import("./vendor/pages/PurchaseOrders.jsx"), "PurchaseOrders"),
      },
      {
        path: "deliveries",
        ...lazyRoute(() => import("./vendor/pages/Deliveries.jsx"), "Deliveries"),
      },
      {
        path: "invoices",
        ...lazyRoute(() => import("./vendor/pages/Invoices.jsx"), "Invoices"),
      },
      {
        path: "payments",
        ...lazyRoute(() => import("./vendor/pages/Payments.jsx"), "Payments"),
      },
      {
        path: "messages",
        ...lazyRoute(() => import("./vendor/pages/Messages.jsx"), "Messages"),
      },
    ],
  },
  // Admin routes from here
  {
    path: "/admin-login",
    ...lazyRoute(() => import("./admin/layout/AdminThemeWrapper.jsx"), "default"),
    children: [
      {
        index: true,
        ...lazyRoute(() => import("./admin/pages/AdminLogin.jsx"), "AdminLogin"),
      },
    ],
  },
  {
    path: "/admin",
    ...lazyRoute(() => import("./admin/layout/AdminLayout.jsx"), "default"),
    children: [
      {
        index: true,
        ...lazyRoute(() => import("./admin/pages/AdminDashboard.jsx"), "AdminDashboard"),
      },
      {
        path: "dashboard",
        ...lazyRoute(() => import("./admin/pages/AdminDashboard.jsx"), "AdminDashboard"),
      },
      {
        path: "vendors",
        ...lazyRoute(
          () => import("./admin/pages/AdminVendors.jsx"),
          "AdminVendors",
        ),
      },
      {
        path: "vendors/:id",
        ...lazyRoute(
          () => import("./admin/pages/AdminVendorDetails.jsx"),
          "AdminVendorDetails",
        ),
      },
      {
        path: "addVendor",
        ...lazyRoute(() => import("./admin/pages/AdminAddVendor.jsx"), "AddVendor"),
      },
      {
        path: "purchase-orders",
        ...lazyRoute(
          () => import("./admin/pages/AdminPurchaseOrders.jsx"),
          "AdminPurchaseOrders",
        ),
      },
      {
        path: "purchase-orders/create",
        ...lazyRoute(() => import("./admin/pages/AdminCreatePO.jsx"), "AdminCreatePO"),
      },
      {
        path: "purchase-orders/:id",
        ...lazyRoute(() => import("./admin/pages/AdminPODetails.jsx"), "AdminPODetails"),
      },
      {
        path: "deliveries",
        ...lazyRoute(
          () => import("./admin/pages/AdminDeliveries.jsx"),
          "AdminDeliveries",
        ),
      },
      {
        path: "invoices",
        ...lazyRoute(
          () => import("./admin/pages/AdminInvoices.jsx"),
          "AdminInvoices",
        ),
      },
      {
        path: "payments",
        ...lazyRoute(
          () => import("./admin/pages/AdminPayments.jsx"),
          "AdminPayments",
        ),
      },
      {
        path: "documents",
        ...lazyRoute(
          () => import("./admin/pages/AdminDocuments.jsx"),
          "AdminDocuments",
        ),
      },
      {
        path: "messages",
        ...lazyRoute(
          () => import("./admin/pages/AdminMessages.jsx"),
          "AdminMessages",
        ),
      },
    ],
  },
]);

const App = () => <RouterProvider router={router} />;

export default App;
