import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Dialog,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router";
import { useState } from "react";

const AdminHeader = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("adminId");
    setOpen(false);
    navigate("/", { replace: true });
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
          Admin Dashboard
        </Typography>

        <IconButton
          color="inherit"
          onClick={() => setOpen(true)}
          title="Logout"
        >
          <LogoutIcon />
        </IconButton>
      </Toolbar>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Logout</DialogTitle>

        <DialogContent>Are you sure you want to logout?</DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)} color="inherit">
            Cancel
          </Button>

          <Button onClick={logout} color="error" variant="contained">
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
};

export default AdminHeader;
