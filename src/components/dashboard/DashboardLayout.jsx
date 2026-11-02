import { useState } from "react";
import { Box, Divider, Typography, useMediaQuery } from "@mui/material";
import { useLocation, useNavigate } from "react-router";
import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";
import DashboardBreadcrumbs from "./DashboardBreadcrumbs";
import AccountMenu from "../layout/AccountMenu";
import LogoutDialog from "../layout/LogoutDialog";
import { SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_WIDTH } from "../../constants/layout";

const DashboardLayout = ({ config, profile, onLogout, children }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:768px)");
  const [accountAnchor, setAccountAnchor] = useState(null);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pinned, setPinned] = useState(
    () => localStorage.getItem(config.pinStorageKey) === "true",
  );
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const expanded = isMobile || pinned || hovered || focused;
  const drawerWidth = expanded ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH;
  const routeItems = [...config.items, ...config.footerItems];
  const isItemActive = (item) =>
    item.path &&
    (pathname === item.path ||
      pathname.startsWith(`${item.path}/`) ||
      item.activePaths?.includes(pathname));
  const activeItem = routeItems
    .filter(isItemActive)
    .sort((a, b) => b.path.length - a.path.length)[0];
  const pageTitle =
    config.routeLabels.find((route) => route.pattern.test(pathname))?.label ||
    activeItem?.text ||
    "Dashboard";
  const navItems = config.items.map((item) => ({
    ...item,
    active: Boolean(isItemActive(item)),
  }));
  const navFooterItems = config.footerItems
    .filter((item) => item.path)
    .map((item) => ({
      ...item,
      active: Boolean(isItemActive(item)),
    }));

  const togglePinned = () => {
    const nextPinned = !pinned;
    setPinned(nextPinned);
    localStorage.setItem(config.pinStorageKey, String(nextPinned));
    if (nextPinned) setHovered(false);
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <Box sx={{ display: "flex", minHeight: "100dvh", overflow: "hidden" }}>
      <DashboardHeader
        portalName={config.portalName}
        pageTitle={pageTitle}
        profileName={profile.name}
        profileRole={profile.role}
        accountOpen={Boolean(accountAnchor)}
        mobile={isMobile}
        headerVariant={config.headerVariant}
        onMenuClick={() => setMobileOpen(true)}
        onAccountClick={(event) => setAccountAnchor(event.currentTarget)}
      />
      <AccountMenu
        anchorEl={accountAnchor}
        name={profile.name}
        email={profile.email}
        role={profile.role}
        portalName={config.portalName}
        onClose={() => setAccountAnchor(null)}
        onProfile={
          config.profilePath
            ? () => {
                setAccountAnchor(null);
                navigate(config.profilePath);
              }
            : undefined
        }
        onLogout={() => {
          setAccountAnchor(null);
          setLogoutOpen(true);
        }}
      />
      <DashboardSidebar
        portalName={config.portalName}
        items={navItems}
        footerItems={navFooterItems}
        expanded={expanded}
        pinned={pinned}
        mobile={isMobile}
        mobileOpen={mobileOpen}
        width={drawerWidth}
        headerHeight={{ xs: "56px", sm: "64px" }}
        onClose={closeMobile}
        onPinToggle={togglePinned}
        onHoverStart={() => !isMobile && !pinned && setHovered(true)}
        onHoverEnd={() => !isMobile && !pinned && setHovered(false)}
        onFocus={() => !isMobile && setFocused(true)}
        onBlur={(event) => {
          if (!isMobile && !event.currentTarget.contains(event.relatedTarget)) {
            setFocused(false);
          }
        }}
        onLogout={() => setLogoutOpen(true)}
        showSidebarBrand={config.showSidebarBrand}
        logoutIcon={config.logoutIcon}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          mt: { xs: "56px", sm: "64px" },
          height: { xs: "calc(100dvh - 56px)", sm: "calc(100dvh - 64px)" },
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
          <DashboardBreadcrumbs
            basePath={config.basePath}
            dashboardPath={config.dashboardPath}
            rootLabel={config.rootLabel}
            items={config.items}
            footerItems={config.footerItems}
            routeLabels={config.routeLabels}
          />
          <Divider sx={{ mt: 1 }} />
        </Box>
        {children}
      </Box>
      <LogoutDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={onLogout}
        portalName={config.portalName}
      />
    </Box>
  );
};

export default DashboardLayout;
