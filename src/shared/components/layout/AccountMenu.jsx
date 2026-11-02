import {
  Avatar,
  Box,
  Chip,
  Divider,
  ListItemIcon,
  ListSubheader,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";

const getInitials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const itemSx = {
  mx: 1,
  my: 0.25,
  px: 1.5,
  py: 1,
  borderRadius: 1,
  fontSize: "0.925rem",
  fontWeight: 500,
  "& .MuiListItemIcon-root": { minWidth: 36, color: "text.secondary" },
};

const AccountMenu = ({
  anchorEl,
  onClose,
  name,
  email,
  role,
  portalName = "Vendor",
  onProfile,
  onLogout,
}) => (
  <Menu
    id="account-menu"
    anchorEl={anchorEl}
    open={Boolean(anchorEl)}
    onClose={onClose}
    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    transformOrigin={{ vertical: "top", horizontal: "right" }}
    slotProps={{
      list: {
        "aria-label": `${portalName} account actions`,
        sx: { py: 0, pb: 0.75 },
      },
      paper: {
        elevation: 8,
        sx: {
          mt: 1,
          minWidth: 270,
          maxWidth: 340,
          borderRadius: 1,
          overflow: "hidden",
          border: 1,
          borderColor: "divider",
        },
      },
    }}
  >
    {/* Profile summary. ListSubheader is skipped by the menu's keyboard focus,
        so focus lands on the first real action instead of this block. */}
    <ListSubheader
      disableSticky
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 2,
        py: 1.75,
        lineHeight: "inherit",
        color: "text.primary",
        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
      }}
    >
      <Avatar
        sx={{
          width: 44,
          height: 44,
          flexShrink: 0,
          fontSize: "1rem",
          fontWeight: 700,
          color: "primary.contrastText",
          bgcolor: "primary.main",
        }}
      >
        {getInitials(name)}
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="subtitle1" fontWeight={700} noWrap title={name}>
          {name}
        </Typography>
        {email && (
          <Typography
            variant="body2"
            color="text.secondary"
            noWrap
            title={email}
          >
            {email}
          </Typography>
        )}
        {role && (
          <Chip
            label={role}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ mt: 0.75, height: 22, fontSize: "0.7rem", fontWeight: 600 }}
          />
        )}
      </Box>
    </ListSubheader>
    <Divider component="li" sx={{ mb: 0.75 }} />

    {onProfile && (
      <MenuItem onClick={onProfile} sx={itemSx}>
        <ListItemIcon>
          <PersonOutlineOutlinedIcon fontSize="small" />
        </ListItemIcon>
        Profile
      </MenuItem>
    )}

    {onProfile && <Divider component="li" sx={{ my: 0.5 }} />}

    <MenuItem
      onClick={onLogout}
      sx={{
        ...itemSx,
        color: "error.main",
        "& .MuiListItemIcon-root": { minWidth: 36, color: "error.main" },
        "&:hover": {
          bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
        },
      }}
    >
      <ListItemIcon>
        <LogoutOutlinedIcon fontSize="small" />
      </ListItemIcon>
      Logout
    </MenuItem>
  </Menu>
);

export default AccountMenu;