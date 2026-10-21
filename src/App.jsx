import { Box, CircularProgress } from "@mui/material";
import { Login } from "./vendor/Login";
import { Register } from "./vendor/Register";
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
    ...lazyRoute(() => import("./vendor/Dashboard"), "Dashboard"),
    children: [
      {
        index: true,
        ...lazyRoute(() => import("./vendor/DashboardChart"), "DashboardChart"),
      },
      {
        path: "overview",
        ...lazyRoute(() => import("./vendor/DashboardChart"), "DashboardChart"),
      },
      {
        path: "profile",
        ...lazyRoute(() => import("./vendor/Profile"), "Profile"),
      },
      {
        path: "documents",
        ...lazyRoute(() => import("./vendor/Documents"), "Documents"),
      },
      {
        path: "purchase-orders",
        ...lazyRoute(
          () => import("./vendor/PurchaseOrders"),
          "PurchaseOrders",
        ),
      },
      {
        path: "deliveries",
        ...lazyRoute(() => import("./vendor/Deliveries"), "Deliveries"),
      },
      {
        path: "invoices",
        ...lazyRoute(() => import("./vendor/Invoices"), "Invoices"),
      },
      {
        path: "payments",
        ...lazyRoute(() => import("./vendor/Payments"), "Payments"),
      },
      {
        path: "messages",
        ...lazyRoute(() => import("./vendor/Messages"), "Messages"),
      },
    ],
  },
  // Admin routes from here
  {
    path: "/admin-login",
    ...lazyRoute(
      () => import("./Layout/AdminThemeWrapper"),
      "default",
    ),
    children: [
      {
        index: true,
        ...lazyRoute(() => import("./Admin/AdminLogin"), "AdminLogin"),
      },
    ],
  },
  {
    path: "/admin",
    ...lazyRoute(() => import("./Layout/AdminLayout"), "default"),
    children: [
      {
        index: true,
        ...lazyRoute(
          () => import("./Admin/AdminDashboard"),
          "AdminDashboard",
        ),
      },
      {
        path: "dashboard",
        ...lazyRoute(
          () => import("./Admin/AdminDashboard"),
          "AdminDashboard",
        ),
      },
      {
        path: "vendors",
        ...lazyRoute(() => import("./Admin/AdminVendors"), "AdminVendors"),
      },
      {
        path: "vendors/:id",
        ...lazyRoute(
          () => import("./Admin/AdminVendorDetails"),
          "AdminVendorDetails",
        ),
      },
      {
        path: "addVendor",
        ...lazyRoute(() => import("./Admin/AdminAddVendor"), "AddVendor"),
      },
      {
        path: "purchase-orders",
        ...lazyRoute(
          () => import("./Admin/AdminPurchaseOrders"),
          "AdminPurchaseOrders",
        ),
      },
      {
        path: "purchase-orders/create",
        ...lazyRoute(
          () => import("./Admin/AdminCreatePO"),
          "AdminCreatePO",
        ),
      },
      {
        path: "purchase-orders/:id",
        ...lazyRoute(
          () => import("./Admin/AdminPODetails"),
          "AdminPODetails",
        ),
      },
      {
        path: "deliveries",
        ...lazyRoute(
          () => import("./Admin/AdminDeliveries"),
          "AdminDeliveries",
        ),
      },
      {
        path: "invoices",
        ...lazyRoute(() => import("./Admin/AdminInvoices"), "AdminInvoices"),
      },
      {
        path: "payments",
        ...lazyRoute(() => import("./Admin/AdminPayments"), "AdminPayments"),
      },
      {
        path: "documents",
        ...lazyRoute(
          () => import("./Admin/AdminDocuments"),
          "AdminDocuments",
        ),
      },
      {
        path: "messages",
        ...lazyRoute(() => import("./Admin/AdminMessages"), "AdminMessages"),
      },
    ],
  },
]);

const App = () => <RouterProvider router={router} />;

export default App;
