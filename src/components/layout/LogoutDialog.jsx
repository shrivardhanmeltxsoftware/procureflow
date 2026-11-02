import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
  Avatar,
} from "@mui/material";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { alpha } from "@mui/material/styles";

const LogoutDialog = ({
  open,
  onClose,
  onConfirm,
  portalName = "Vendor Portal",
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    aria-labelledby="portal-logout-title"
    aria-describedby="portal-logout-description"
    maxWidth="xs"
    fullWidth
    PaperProps={{
      sx: {
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: (theme) => theme.shadows[12],
      },
    }}
  >
    <DialogTitle id="portal-logout-title" sx={{ px: 3, pt: 3, pb: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Avatar
          sx={{
            bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
            color: "error.main",
            width: 48,
            height: 48,
          }}
        >
          <LogoutOutlinedIcon />
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
            Sign out?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            ProcureFlow {portalName}
          </Typography>
        </Box>
      </Box>
    </DialogTitle>
    <DialogContent sx={{ px: 3, pt: 1, pb: 3 }}>
      <Typography
        id="portal-logout-description"
        variant="body2"
        color="text.secondary"
        sx={{ lineHeight: 1.6 }}
      >
        You'll be signed out of your account. You can sign back in at any time.
      </Typography>
    </DialogContent>
    <DialogActions
      sx={{
        px: 3,
        py: 2,
        gap: 1.5,
        borderTop: "1px solid",
        borderColor: "divider",
        bgcolor: "background.default",
      }}
    >
      <Button
        onClick={onClose}
        variant="outlined"
        color="inherit"
        sx={{
          flex: 1,
          borderColor: "divider",
          textTransform: "none",
          fontWeight: 600,
          minHeight: 42,
        }}
      >
        Cancel
      </Button>
      <Button
        onClick={onConfirm}
        color="error"
        variant="contained"
        disableElevation
        sx={{
          flex: 1,
          textTransform: "none",
          fontWeight: 600,
          minHeight: 42,
        }}
      >
        Sign out
      </Button>
    </DialogActions>
  </Dialog>
);

export default LogoutDialog;