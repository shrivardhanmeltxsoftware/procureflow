import { useState } from "react";
import { Navigate, Outlet, useNavigate, useLocation } from "react-router";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Avatar,
  Menu,
  MenuItem,
  MenuList,
  Divider,
  Dialog,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import DescriptionIcon from "@mui/icons-material/Description";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PaymentIcon from "@mui/icons-material/Payment";
import MessageIcon from "@mui/icons-material/Message";
import DashboardIcon from "@mui/icons-material/Dashboard";

const menuItems = [
  { text: "Dashboard", path: "/dashboard/overview", icon: <DashboardIcon /> },

  {
    text: "Documents",
    path: "/dashboard/documents",
    icon: <DescriptionIcon />,
  },
  {
    text: "Purchase Orders",
    path: "/dashboard/purchase-orders",
    icon: <ShoppingCartIcon />,
  },
  {
    text: "Deliveries",
    path: "/dashboard/deliveries",
    icon: <LocalShippingIcon />,
  },
  { text: "Invoices", path: "/dashboard/invoices", icon: <ReceiptIcon /> },
  { text: "Payments", path: "/dashboard/payments", icon: <PaymentIcon /> },
  { text: "Messages", path: "/dashboard/messages", icon: <MessageIcon /> },
];

export const Dashboard = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const drawerWidth = 240;
  const isAuthenticated = Boolean(localStorage.getItem("vendor"));
  const vendor = JSON.parse(localStorage.getItem("vendor"));

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const logout = () => {
    localStorage.removeItem("vendor");
    localStorage.removeItem("vendorId");
    setOpenDialog(false);
    navigate("/", { replace: true });
  };

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);
  return (
    <Box>
      <AppBar
        position="fixed"
        color="primary"
        elevation={4}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Vendor Dashboard
          </Typography>
          <IconButton onClick={handleOpen}>
            <Avatar sx={{ width: 35, height: 35 }}></Avatar>
          </IconButton>
          <IconButton
            aria-label="logout"
            color="inherit"
            edge="end"
            onClick={() => setOpenDialog(true)}
          >
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {vendor?.firstName} {vendor?.lastName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {vendor?.email}
          </Typography>
        </Box>
        <Divider />
        <MenuList>
          <MenuItem
            onClick={() => {
              handleClose();
              navigate("/dashboard/profile");
            }}
          >
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            Profile
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleClose();
              setOpenDialog(true);
            }}
          >
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            Logout
          </MenuItem>
        </MenuList>
      </Menu>

      <Drawer
        anchor="left"
        variant="permanent"
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
        <Box sx={{ width: 240 }} role="presentation">
          <Toolbar />
          {menuItems.map((item) => (
            <ListItemButton
              key={item.text}
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                "&:hover": {
                  backgroundColor: "#bbdefb",
                },
                "& .MuiListItemIcon-root": {
                  color: "primary.main",
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  "& .MuiListItemText-primary": {
                    fontSize: "18px",
                  },
                }}
              />
            </ListItemButton>
          ))}
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
          boxSizing: "border-box",
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Logout</DialogTitle>

        <DialogContent>Are you sure you want to logout?</DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)} color="inherit">
            Cancel
          </Button>

          <Button onClick={logout} color="error" variant="contained">
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
