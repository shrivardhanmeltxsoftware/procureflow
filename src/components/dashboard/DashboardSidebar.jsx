import { alpha } from "@mui/material/styles";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  Tooltip,
  Typography,
} from "@mui/material";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import PushPinIcon from "@mui/icons-material/PushPin";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import NavItem from "../layout/NavItem";

const DashboardSidebar = ({
  portalName,
  items,
  footerItems,
  expanded,
  pinned,
  mobile,
  mobileOpen,
  width,
  headerHeight,
  onClose,
  onPinToggle,
  onHoverStart,
  onHoverEnd,
  onFocus,
  onBlur,
  onLogout,
  showSidebarBrand,
  logoutIcon,
}) => {
  const renderItem = (item) => (
    <NavItem
      key={item.text}
      text={item.text}
      icon={item.icon}
      to={item.path}
      active={item.active}
      expanded={expanded}
      onClick={item.onClick || (mobile ? onClose : undefined)}
    />
  );

  return (
    <Drawer
      anchor="left"
      variant={mobile ? "temporary" : "permanent"}
      open={mobile ? mobileOpen : true}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      slotProps={{
        paper: {
          id: `${portalName.toLowerCase().replace(/\s+/g, "-")}-sidebar`,
        },
      }}
      sx={{
        width: mobile ? 0 : width,
        flexShrink: 0,
        transition: (theme) =>
          theme.transitions.create("width", {
            duration: 220,
            easing: "cubic-bezier(0.4, 0, 0.2, 1)",
          }),
        "& .MuiDrawer-paper": {
          width: mobile ? 250 : width,
          boxSizing: "border-box",
          overflowX: "hidden",
          bgcolor: "background.paper",
          borderRight: "1px solid",
          borderColor: "divider",
          top: headerHeight,
          bottom: 0,
          height: mobile
            ? {
                xs: "calc(100% - 56px)",
                sm: "calc(100% - 64px)",
              }
            : "auto",
          transition: (theme) =>
            theme.transitions.create("width", {
              duration: 220,
              easing: "cubic-bezier(0.4, 0, 0.2, 1)",
            }),
        },
      }}
    >
      <Box
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
        onFocusCapture={onFocus}
        onBlurCapture={onBlur}
        sx={{
          height: "100%",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            height: 56,
            minHeight: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: expanded ? "space-between" : "center",
            gap: 1,
            px: expanded ? 1.75 : 0.75,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          {showSidebarBrand && expanded && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  flexShrink: 0,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: 1,
                  color: "common.white",
                  bgcolor: "primary.main",
                }}
              >
                <LayersOutlinedIcon fontSize="small" />
              </Box>
              <Typography variant="subtitle1" fontWeight={700} noWrap>
                ProcureFlow
              </Typography>
            </Box>
          )}
          {!mobile && (
          <Tooltip title={pinned ? "Unpin sidebar" : "Pin sidebar"}>
            <IconButton
              size="small"
              aria-label={pinned ? "Unpin sidebar" : "Pin sidebar"}
              aria-pressed={pinned}
              onClick={onPinToggle}
              sx={{
                color: pinned ? "primary.main" : "text.secondary",
                opacity: expanded ? 1 : 0,
                "&:focus-visible": { opacity: 1 },
                "&:hover": {
                  bgcolor: (theme) =>
                    theme.palette.navigation?.hover ||
                    alpha(theme.palette.primary.main, 0.08),
                  color: "primary.main",
                },
              }}
            >
              {pinned ? (
                <PushPinIcon fontSize="small" />
              ) : (
                <PushPinOutlinedIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
          )}
        </Box>

        <List
          component="nav"
          aria-label={`${portalName} navigation`}
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
          {items.map(renderItem)}
        </List>

        <Divider />
        <List
          component="nav"
          aria-label={`${portalName} account navigation`}
          sx={{ p: 1, display: "flex", flexDirection: "column", gap: 0.5 }}
        >
          {footerItems.map(renderItem)}
          <NavItem
            text="Logout"
            icon={logoutIcon}
            expanded={expanded}
            onClick={() => {
              if (mobile) onClose();
              onLogout();
            }}
          />
        </List>
      </Box>
    </Drawer>
  );
};

export default DashboardSidebar;
