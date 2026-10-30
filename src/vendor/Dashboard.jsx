import { useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  Toolbar,
  Typography,
  useMediaQuery,
  Tooltip,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import PushPinIcon from "@mui/icons-material/PushPin";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import NavItem from "../components/layout/NavItem";
import AccountMenu from "../components/layout/AccountMenu";
import LogoutDialog from "../components/layout/LogoutDialog";
import VendorBreadcrumbs from "../components/layout/VendorBreadcrumbs";
import { getStoredVendor } from "../utils/auth";
import {
  HEADER_HEIGHT,
  SIDEBAR_COLLAPSED_WIDTH,
  SIDEBAR_WIDTH,
  VIEWPORT_BELOW_HEADER,
} from "../constants/layout";

const menuItems = [
  { text: "Dashboard", path: "/dashboard/overview", icon: <DashboardOutlinedIcon /> },
  { text: "Documents", path: "/dashboard/documents", icon: <DescriptionOutlinedIcon /> },
  { text: "Purchase Orders", path: "/dashboard/purchase-orders", icon: <ShoppingCartOutlinedIcon /> },
  { text: "Deliveries", path: "/dashboard/deliveries", icon: <LocalShippingOutlinedIcon /> },
  { text: "Invoices", path: "/dashboard/invoices", icon: <ReceiptLongOutlinedIcon /> },
  { text: "Payments", path: "/dashboard/payments", icon: <PaymentsOutlinedIcon /> },
  { text: "Messages", path: "/dashboard/messages", icon: <ChatBubbleOutlineOutlinedIcon /> },
];

const footerItems = [
  { text: "Settings", path: "/dashboard/profile", icon: <PersonOutlineOutlinedIcon /> },
];

const widthTransition = (theme) =>
  theme.transitions.create("width", {
    duration: 220,
    easing: theme.transitions.easing.easeInOut,
  });

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"), { noSsr: true });
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [anchorEl, setAnchorEl] = useState(null);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Hover & Pin state management
  const [pinned, setPinned] = useState(
    () => localStorage.getItem("sidebarPinned") === "true"
  );
  const [hovered, setHovered] = useState(false);

  const vendor = getStoredVendor();

  // Determine expansion state
  const sidebarExpanded = isMobile || pinned || hovered;
  const drawerWidth = sidebarExpanded ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH;

  const profileName =
    vendor?.businessName ||
    [vendor?.firstName, vendor?.lastName].filter(Boolean).join(" ") ||
    "Vendor account";
  const avatarText = profileName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const isItemActive = (item) => {
    if (item.path === "/dashboard/overview") {
      return pathname === "/dashboard" || pathname.startsWith("/dashboard/overview");
    }
    return pathname === item.path || pathname.startsWith(`${item.path}/`);
  };

  const pageTitle =
    [...menuItems, ...footerItems].find(isItemActive)?.text || "Dashboard";

  const closeMobileDrawer = () => setMobileOpen(false);

  const toggleSidebarPin = () => {
    if (isMobile) {
      setMobileOpen((open) => !open);
      return;
    }
    const nextPin = !pinned;
    setPinned(nextPin);
    localStorage.setItem("sidebarPinned", String(nextPin));
    if (nextPin) setHovered(false);
  };

  const goToProfile = () => {
    setAnchorEl(null);
    navigate("/dashboard/profile");
  };

  const openLogoutDialog = () => {
    setAnchorEl(null);
    closeMobileDrawer();
    setLogoutOpen(true);
  };

  const logout = () => {
    localStorage.removeItem("vendor");
    localStorage.removeItem("vendorId");
    setLogoutOpen(false);
    navigate("/", { replace: true });
  };

  if (!vendor?.id) {
    return <Navigate to="/" replace />;
  }

  const renderNavItem = (item) => (
    <NavItem
      key={item.path}
      text={item.text}
      icon={item.icon}
      to={item.path}
      active={isItemActive(item)}
      expanded={sidebarExpanded}
      onClick={isMobile ? closeMobileDrawer : undefined}
    />
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100dvh", overflow: "hidden" }}>
      <AppBar
        position="fixed"
        color="primary"
        elevation={2}
        sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}
      >
        <Toolbar
          sx={{
            minHeight: HEADER_HEIGHT,
            height: HEADER_HEIGHT,
            px: { xs: 1.5, sm: 3 },
            gap: { xs: 1, sm: 2 },
          }}
        >
          <IconButton
            color="inherit"
            edge="start"
            aria-label={isMobile ? "Open navigation menu" : pinned ? "Unpin sidebar" : "Pin sidebar"}
            onClick={() => {
              if (isMobile) setMobileOpen((open) => !open);
              else toggleSidebarPin();
            }}
          >
            <MenuIcon />
          </IconButton>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1, sm: 1.5 },
              minWidth: 0,
              flex: 1,
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                flexShrink: 0,
                display: "grid",
                placeItems: "center",
                borderRadius: 1,
                color: "common.white",
                bgcolor: (t) => alpha(t.palette.common.white, 0.2),
              }}
            >
              <LayersOutlinedIcon />
            </Box>
            <Typography
              variant="h6"
              sx={{
                color: "common.white",
                fontSize: { xs: "1rem", sm: "1.15rem" },
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              ProcureFlow
            </Typography>

            {pageTitle && (
              <>
                <Box
                  aria-hidden="true"
                  sx={{
                    height: 20,
                    width: "1px",
                    flexShrink: 0,
                    bgcolor: (t) => alpha(t.palette.common.white, 0.3),
                    mx: { xs: 0.25, sm: 0.5 },
                  }}
                />
                <Typography
                  variant="body1"
                  sx={{
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    color: (t) => alpha(t.palette.common.white, 0.95),
                    fontSize: { xs: "0.85rem", sm: "1.05rem" },
                    fontWeight: 600,
                  }}
                >
                  {pageTitle}
                </Typography>
              </>
            )}
          </Box>

          <IconButton
            color="inherit"
            aria-label="Open vendor account menu"
            aria-haspopup="menu"
            aria-controls={anchorEl ? "account-menu" : undefined}
            aria-expanded={Boolean(anchorEl)}
            onClick={(event) => setAnchorEl(event.currentTarget)}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: "common.white",
                color: "primary.main",
                fontSize: "0.85rem",
                fontWeight: 700,
              }}
            >
              {avatarText}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      <AccountMenu
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        name={profileName}
        email={vendor.email}
        onProfile={goToProfile}
        onLogout={openLogoutDialog}
      />

      <Drawer
        anchor="left"
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={closeMobileDrawer}
        ModalProps={{ keepMounted: true }}
        slotProps={{ paper: { id: "vendor-sidebar" } }}
        onMouseEnter={() => !isMobile && !pinned && setHovered(true)}
        onMouseLeave={() => !isMobile && !pinned && setHovered(false)}
        sx={{
          ...(!isMobile && {
            width: drawerWidth,
            flexShrink: 0,
            transition: widthTransition,
          }),
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            overflowX: "hidden",
            bgcolor: "background.paper",
            borderRight: "1px solid",
            borderColor: "divider",
            top: HEADER_HEIGHT,
            bottom: 0,
            height: "auto",
            transition: widthTransition,
          },
        }}
      >
        {/* Optional Pin Action Header inside Sidebar */}
        {!isMobile && sidebarExpanded && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 2,
              py: 1.5,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", letterSpacing: 0.5 }}>
              NAVIGATION
            </Typography>
            <Tooltip title={pinned ? "Unpin sidebar" : "Pin sidebar"}>
              <IconButton size="small" onClick={toggleSidebarPin} color={pinned ? "primary" : "default"}>
                {pinned ? <PushPinIcon fontSize="small" /> : <PushPinOutlinedIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Box>
        )}

        <List
          component="nav"
          aria-label="Vendor navigation"
          sx={{
            flex: 1,
            minHeight: 0,
            p: 1,
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          {menuItems.map(renderNavItem)}
        </List>

        <Divider />
        <List
          component="nav"
          aria-label="Account navigation"
          sx={{ p: 1, display: "flex", flexDirection: "column", gap: 0.5 }}
        >
          {footerItems.map(renderNavItem)}
          <NavItem
            text="Logout"
            icon={<LogoutOutlinedIcon />}
            expanded={sidebarExpanded}
            onClick={openLogoutDialog}
          />
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          mt: HEADER_HEIGHT,
          height: VIEWPORT_BELOW_HEADER,
          p: { xs: 2, sm: 2.5, md: 3.5 },
          boxSizing: "border-box",
          bgcolor: "background.default",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <Box component="header" sx={{ mb: 3 }}>
          <Typography
            component="h1"
            variant="h4"
            sx={{ mb: 0.75, fontWeight: 700 }}
          >
            {pageTitle}
          </Typography>
          <VendorBreadcrumbs />
          <Divider sx={{ mt: 2 }} />
        </Box>
        <Outlet />
      </Box>

      <LogoutDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={logout}
      />
    </Box>
  );
};

export { Dashboard };