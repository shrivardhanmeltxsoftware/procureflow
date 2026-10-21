import React from "react";
import { Login } from "./vendor/Login";
import { createBrowserRouter, RouterProvider } from "react-router";
import { Register } from "./vendor/Register";
import { Dashboard } from "./vendor/Dashboard";
import { Profile } from "./vendor/Profile";
import { Documents } from "./vendor/Documents";
import { PurchaseOrders } from "./vendor/PurchaseOrders";
import { Deliveries } from "./vendor/Deliveries";
import { Invoices } from "./vendor/Invoices";
import { Payments } from "./vendor/Payments";
import { Messages } from "./vendor/Messages";
import { AdminLogin } from "./Admin/AdminLogin";
import { DashboardChart } from "./vendor/DashboardChart";
import AdminLayout from "./Layout/AdminLayout";
import { AdminDashboard } from "./Admin/AdminDashboard";
import { AdminVendors } from "./Admin/AdminVendors";
import { AdminPurchaseOrders } from "./Admin/AdminPurchaseOrders";
import { AdminDeliveries } from "./Admin/AdminDeliveries";
import { AdminInvoices } from "./Admin/AdminInvoices";
import { AdminPayments } from "./Admin/AdminPayments";
import { AdminDocuments } from "./Admin/AdminDocuments";
import { AdminMessages } from "./Admin/AdminMessages";
import AdminThemeWrapper from "./Layout/AdminThemeWrapper";
import { AdminVendorDetails } from "./Admin/AdminVendorDetails";
import { AddVendor } from "./Admin/AdminAddVendor";
import { AdminCreatePO } from "./Admin/AdminCreatePO";
import { AdminPODetails } from "./Admin/AdminPODetails";

const App = () => {
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
      Component: Dashboard,
      children: [
        {
          index: true,
          Component: DashboardChart,
        },
        {
          path: "overview",
          Component: DashboardChart,
        },
        {
          path: "profile",
          Component: Profile,
        },
        {
          path: "documents",
          Component: Documents,
        },
        {
          path: "purchase-orders",
          Component: PurchaseOrders,
        },
        {
          path: "deliveries",
          Component: Deliveries,
        },
        {
          path: "invoices",
          Component: Invoices,
        },
        {
          path: "payments",
          Component: Payments,
        },
        {
          path: "messages",
          Component: Messages,
        },
      ],
    },
    //admin routes from here
    {
      path: "/admin-login",
      Component: AdminThemeWrapper,
      children: [{ index: true, Component: AdminLogin }],
    },
    {
      path: "/admin",
      Component: AdminLayout,
      children: [
        {
          index: true,
          Component: AdminDashboard,
        },
        {
          path: "dashboard",
          Component: AdminDashboard,
        },
        {
          path: "vendors",
          Component: AdminVendors,
        },
        {
          path: "vendors/:id",
          Component: AdminVendorDetails,
        },
        {
          path: "addVendor",
          Component: AddVendor,
        },
        {
          path: "purchase-orders",
          Component: AdminPurchaseOrders,
        },
        {
          path: "purchase-orders/create",
          Component: AdminCreatePO,
        },
        {
          path:"purchase-orders/:id",
          Component:AdminPODetails
        },
        {
          path: "deliveries",
          Component: AdminDeliveries,
        },
        {
          path: "invoices",
          Component: AdminInvoices,
        },
        {
          path: "payments",
          Component: AdminPayments,
        },
        {
          path: "documents",
          Component: AdminDocuments,
        },
        {
          path: "messages",
          Component: AdminMessages,
        },
      ],
    },
  ]);
  return <RouterProvider router={router} />;
};

export default App;
