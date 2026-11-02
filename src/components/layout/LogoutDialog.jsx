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
    PaperProps={{
      sx: {
        borderRadius: 2,
        p: 1,
        maxWidth: 420,
        width: "100%",
      },
    }}
  >
    <DialogTitle id="portal-logout-title" sx={{ pb: 1, pt: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Avatar
          sx={{
            bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
            color: "error.main",
            width: 44,
            height: 44,
          }}
        >
          <LogoutOutlinedIcon />
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            Sign Out
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ProcureFlow {portalName}
          </Typography>
        </Box>
      </Box>
    </DialogTitle>
    <DialogContent sx={{ py: 2 }}>
      <Typography variant="body1" color="text.primary">
        Are you sure you want to log out? You will need to sign in again to access your account.
      </Typography>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1.5 }}>
      <Button
        onClick={onClose}
        variant="outlined"
        color="inherit"
        sx={{
          flex: 1,
          borderColor: "divider",
          textTransform: "none",
          fontWeight: 600,
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
        }}
      >
        Sign Out
      </Button>
    </DialogActions>
  </Dialog>
);

export default LogoutDialog;