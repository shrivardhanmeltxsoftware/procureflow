import {
  Box,
  Divider,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";

const AccountMenu = ({ anchorEl, onClose, name, email, onProfile, onLogout }) => (
  <Menu
    id="account-menu"
    anchorEl={anchorEl}
    open={Boolean(anchorEl)}
    onClose={onClose}
    slotProps={{ list: { "aria-label": "Vendor account actions" } }}
  >
    <Box sx={{ px: 2, py: 1 }}>
      <Typography variant="subtitle1" fontWeight={700}>
        {name}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {email || "Registered Vendor"}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Registered Vendor
      </Typography>
    </Box>
    <Divider />
    <MenuItem onClick={onProfile}>
      <ListItemIcon>
        <PersonOutlineOutlinedIcon />
      </ListItemIcon>
      Profile
    </MenuItem>
    <MenuItem onClick={onLogout}>
      <ListItemIcon>
        <LogoutOutlinedIcon />
      </ListItemIcon>
      Logout
    </MenuItem>
  </Menu>
);

export default AccountMenu;
