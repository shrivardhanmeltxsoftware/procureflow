import { ListItemButton, ListItemIcon, ListItemText, Tooltip } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { NavLink } from "react-router";

const NavItem = ({ text, icon, to, active = false, expanded = false, onClick }) => (
  <Tooltip title={expanded ? "" : text} placement="right" arrow>
    <ListItemButton
      component={NavLink}
      to={to}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      sx={{
        minHeight: 44,
        px: 1.75,
        borderRadius: 1,
        justifyContent: expanded ? "flex-start" : "center",
        color: active ? "primary.main" : "text.primary",
        transition: (theme) =>
          theme.transitions.create(["background-color", "color"], {
            duration: theme.transitions.duration.shortest,
          }),
        "&:hover": {
          bgcolor: "action.hover",
        },
        "&.active": {
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
          fontWeight: 600,
        },
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: 22,
          color: "primary.main",
          justifyContent: "center",
          mr: expanded ? 1.75 : 0,
          "& .MuiSvgIcon-root": { fontSize: 22 },
        }}
      >
        {icon}
      </ListItemIcon>
      <ListItemText
        primary={text}
        sx={{
          m: 0,
          minWidth: 0,
          maxWidth: expanded ? 180 : 0,
          opacity: expanded ? 1 : 0,
          overflow: "hidden",
          whiteSpace: "nowrap",
          transition: (theme) =>
            theme.transitions.create(["opacity", "max-width"], {
              duration: 220,
            }),
          "& .MuiTypography-root": {
            fontSize: "0.9rem",
            fontWeight: active ? 600 : 500,
          },
        }}
      />
    </ListItemButton>
  </Tooltip>
);

export default NavItem;
