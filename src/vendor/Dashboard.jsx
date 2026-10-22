import { useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router";
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
  List,
  useMediaQuery,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import PersonIcon from "@mui/icons-material/Person";
import DescriptionIcon from "@mui/icons-material/Description";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PaymentIcon from "@mui/icons-material/Payment";
import MessageIcon from "@mui/icons-material/Message";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { NavLink } from "react-router";

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
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const drawerWidth = 200;
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("md"));
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
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        color="primary"
        elevation={4}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              aria-label="Open navigation menu"
              onClick={() => setMobileDrawerOpen(true)}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, fontSize: { xs: "1.05rem", sm: "1.25rem" } }}
          >
            Vendor Dashboard
          </Typography>
          <IconButton onClick={handleOpen} aria-label="Open profile menu">
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
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileDrawerOpen : undefined}
        onClose={() => setMobileDrawerOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          ...(!isMobile && { width: drawerWidth, flexShrink: 0 }),
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
              onClick={isMobile ? () => setMobileDrawerOpen(false) : undefined}
              sx={{
                "&:hover": {
                  backgroundColor: "#bbdefb",
                },
                "& .MuiListItemIcon-root": {
                  color: "primary.main",
                },
                "&.active": {
                  backgroundColor: "#bbdefb",
                  fontWeight: "bold",
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          p: { xs: 1.5, sm: 2, md: 3 },
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
