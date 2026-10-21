import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from "@mui/material";
import { NavLink } from "react-router";
import DashboardIcon from "@mui/icons-material/Dashboard";
import StoreIcon from "@mui/icons-material/Store";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PaymentIcon from "@mui/icons-material/Payment";
import ChatIcon from "@mui/icons-material/Chat";
import DescriptionIcon from '@mui/icons-material/Description';

const menuItems = [
  { label: "Dashboard", path: "/admin/dashboard", icon: <DashboardIcon /> },
  { label: "Vendors", path: "/admin/vendors", icon: <StoreIcon /> },
  {label :"Documents", path:"/admin/documents", icon:<DescriptionIcon/>},
  {
    label: "Purchase Orders",
    path: "/admin/purchase-orders",
    icon: <ShoppingCartIcon />,
  },
  {
    label: "Deliveries",
    path: "/admin/deliveries",
    icon: <LocalShippingIcon />,
  },
  { label: "Invoices", path: "/admin/invoices", icon: <ReceiptIcon /> },
  { label: "Payments", path: "/admin/payments", icon: <PaymentIcon /> },
  { label: "Messages", path: "/admin/messages", icon: <ChatIcon /> },
];

const drawerWidth = 200;

const AdminSidebar = () => {
  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          overflowX: "hidden",
        },
      }}
    >
      <Toolbar />
      <List role="presentation" sx={{ pt: 0 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            sx={{
              "&:hover": {
                backgroundColor: "#d1c4e9",
              },
              "& .MuiListItemIcon-root": {
                color: "primary.main",
              },
              "&.active": {
                backgroundColor: "#d1c4e9",
                fontWeight: "bold",
              },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
};

export default AdminSidebar;
