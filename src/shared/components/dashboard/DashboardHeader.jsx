import { alpha } from "@mui/material/styles";
import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import MenuIcon from "@mui/icons-material/Menu";

const DashboardHeader = ({
  portalName,
  pageTitle,
  profileName,
  profileRole,
  accountOpen = false,
  mobile = false,
  headerVariant = "primary",
  onMenuClick,
  onAccountClick,
}) => {
  const isLight = headerVariant === "light";
  const avatarText = profileName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <>
      <AppBar
        position="fixed"
        color={isLight ? "inherit" : "primary"}
        elevation={isLight ? 0 : 2}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: isLight ? "background.paper" : "primary.main",
          color: isLight ? "text.primary" : "common.white",
          borderBottom: isLight ? "1px solid" : 0,
          borderColor: "divider",
        }}
      >
        <Toolbar
          sx={{
            minHeight: { xs: 56, sm: 64 },
            height: { xs: 56, sm: 64 },
            px: { xs: 1.5, sm: 3 },
            gap: { xs: 1, sm: 2 },
          }}
        >
          <IconButton
            color="inherit"
            edge="start"
            aria-label="Open navigation menu"
            onClick={onMenuClick}
            sx={{ display: mobile ? "inline-flex" : "none" }}
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
                color: isLight ? "primary.main" : "common.white",
                bgcolor: isLight
                  ? (theme) => alpha(theme.palette.primary.main, 0.1)
                  : (theme) => alpha(theme.palette.common.white, 0.2),
              }}
            >
              <LayersOutlinedIcon />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: "1rem", sm: "1.15rem" },
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              ProcureFlow
            </Typography>
            <Box
              aria-hidden="true"
              sx={{
                height: 20,
                width: "1px",
                flexShrink: 0,
                bgcolor: isLight
                  ? "divider"
                  : (theme) => alpha(theme.palette.common.white, 0.3),
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
                color: isLight
                  ? "text.primary"
                  : (theme) => alpha(theme.palette.common.white, 0.95),
                fontSize: { xs: "0.85rem", sm: "1.05rem" },
                fontWeight: 600,
              }}
            >
              {pageTitle}
            </Typography>
          </Box>
          <Box
            sx={{
              display: mobile ? "none" : { xs: "none", sm: "flex" },
              flexDirection: "column",
              alignItems: "flex-end",
              minWidth: 0,
              maxWidth: 220,
              mr: 0.5,
            }}
          >
            <Typography variant="body2" fontWeight={600} noWrap>
              {profileName}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: isLight
                  ? "text.secondary"
                  : (theme) => alpha(theme.palette.common.white, 0.8),
              }}
              noWrap
            >
              {profileRole}
            </Typography>
          </Box>
          <IconButton
            color="inherit"
            aria-label={`Open ${portalName} account menu`}
            aria-haspopup="menu"
            aria-controls={accountOpen ? "account-menu" : undefined}
            aria-expanded={accountOpen}
            onClick={onAccountClick}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: isLight ? "primary.main" : "common.white",
                color: isLight ? "common.white" : "primary.main",
                fontSize: "0.85rem",
                fontWeight: 700,
              }}
            >
              {avatarText}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default DashboardHeader;
