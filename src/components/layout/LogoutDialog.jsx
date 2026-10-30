import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

const LogoutDialog = ({ open, onClose, onConfirm }) => (
  <Dialog open={open} onClose={onClose} aria-labelledby="vendor-logout-title">
    <DialogTitle id="vendor-logout-title">Logout</DialogTitle>
    <DialogContent>Are you sure you want to logout?</DialogContent>
    <DialogActions sx={{ p: 2 }}>
      <Button onClick={onClose} color="inherit">
        Cancel
      </Button>
      <Button onClick={onConfirm} color="error" variant="contained">
        Logout
      </Button>
    </DialogActions>
  </Dialog>
);

export default LogoutDialog;
