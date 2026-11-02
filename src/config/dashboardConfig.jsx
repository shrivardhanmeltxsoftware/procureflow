import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import StoreOutlinedIcon from "@mui/icons-material/StoreOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";

const vendorItems = [
  {
    text: "Dashboard",
    path: "/dashboard/overview",
    activePaths: ["/dashboard"],
    icon: <DashboardOutlinedIcon />,
  },
  { text: "Documents", path: "/dashboard/documents", icon: <DescriptionOutlinedIcon /> },
  { text: "Purchase Orders", path: "/dashboard/purchase-orders", icon: <ShoppingCartOutlinedIcon /> },
  { text: "Deliveries", path: "/dashboard/deliveries", icon: <LocalShippingOutlinedIcon /> },
  { text: "Invoices", path: "/dashboard/invoices", icon: <ReceiptLongOutlinedIcon /> },
  { text: "Payments", path: "/dashboard/payments", icon: <PaymentsOutlinedIcon /> },
  { text: "Messages", path: "/dashboard/messages", icon: <ChatBubbleOutlineOutlinedIcon /> },
];

const adminItems = [
  {
    text: "Dashboard",
    path: "/admin/dashboard",
    activePaths: ["/admin"],
    icon: <DashboardOutlinedIcon />,
  },
  {
    text: "Vendors",
    path: "/admin/vendors",
    activePaths: ["/admin/addVendor"],
    icon: <StoreOutlinedIcon />,
  },
  { text: "Vendor Documents", path: "/admin/documents", icon: <DescriptionOutlinedIcon /> },
  { text: "Purchase Orders", path: "/admin/purchase-orders", icon: <ShoppingCartOutlinedIcon /> },
  { text: "Deliveries", path: "/admin/deliveries", icon: <LocalShippingOutlinedIcon /> },
  { text: "Invoices", path: "/admin/invoices", icon: <ReceiptLongOutlinedIcon /> },
  { text: "Payments", path: "/admin/payments", icon: <PaymentsOutlinedIcon /> },
  { text: "Messages", path: "/admin/messages", icon: <ChatBubbleOutlineOutlinedIcon /> },
];

export const vendorDashboardConfig = {
  portalName: "Vendor Portal",
  rootLabel: "Vendor",
  basePath: "/dashboard",
  dashboardPath: "/dashboard/overview",
  pinStorageKey: "sidebarPinned",
  headerVariant: "primary",
  showSidebarBrand: false,
  profilePath: "/dashboard/profile",
  items: vendorItems,
  footerItems: [
    { text: "Settings", path: "/dashboard/profile", icon: <PersonOutlineOutlinedIcon /> },
  ],
  logoutIcon: <LogoutOutlinedIcon />,
  routeLabels: [
    { pattern: /^\/dashboard\/overview\/?$/, label: "Dashboard" },
  ],
};

export const adminDashboardConfig = {
  portalName: "Admin Portal",
  rootLabel: "Admin",
  basePath: "/admin",
  dashboardPath: "/admin/dashboard",
  pinStorageKey: "adminSidebarPinned",
  headerVariant: "light",
  showSidebarBrand: true,
  profilePath: null,
  items: adminItems,
  footerItems: [],
  logoutIcon: <LogoutOutlinedIcon />,
  routeLabels: [
    { pattern: /^\/admin\/?$/, label: "Dashboard" },
    { pattern: /^\/admin\/dashboard\/?$/, label: "Dashboard" },
    { pattern: /^\/admin\/addVendor\/?$/, label: "Add Vendor" },
    { pattern: /^\/admin\/vendors\/[^/]+\/?$/, label: "Vendor Details" },
    { pattern: /^\/admin\/purchase-orders\/create\/?$/, label: "Create" },
    { pattern: /^\/admin\/purchase-orders\/[^/]+\/?$/, label: "Purchase Order Details" },
  ],
};
