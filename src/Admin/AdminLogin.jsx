import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { useState } from "react";
import loginAdminImage from "../assets/admin-loginPage.png";
import { loginAdmin } from "../services/AdminAPI";
import { useNavigate, Link } from "react-router";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (e) => {
    e.preventDefault();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!email || !password) {
        throw new Error("Please enter both email and password");
      }

      const admin = await loginAdmin(email, password);

      if (!admin?.id) {
        throw new Error("This admin account is missing an ID.");
      }

      // Store admin info in localStorage
      localStorage.setItem("admin", JSON.stringify(admin));
      localStorage.setItem("adminId", String(admin.id));

      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "100dvh",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Button
        variant="contained"
        size="small"
        sx={{
          position: "absolute",
          top: 16,
          right: 24,
          zIndex: 1,
        }}
        onClick={() => navigate("/")}
      >
        back
      </Button>

      <Box
        component={Paper}
        sx={{
          flex: "0 0 45%",
          bgcolor: "#FFFFFF",
          p: 4,
          display: "flex",
          flexDirection: "column",
          borderRadius: 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <Box
            component="img"
            src={loginAdminImage}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              mt: 12,
            }}
          ></Box>
        </Box>
      </Box>

      <Box
        sx={{
          flex: "1 1 55%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
        }}
      >
        <Paper
          elevation={3}
          sx={{ p: 4, width: "100%", maxWidth: 500, minHeight: 400 }}
        >
          <Typography
            variant="h5"
            align="center"
            sx={{ fontWeight: 700, color: "primary.main" }}
            gutterBottom
          >
            Admin Login
          </Typography>
          <Typography
            variant="body2"
            align="center"
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            Login to Continue
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            placeholder="Enter email"
            label="Email"
            type="email"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            fullWidth
            placeholder="Enter password"
            label="Password"
            type={showPassword ? "text" : "password"}
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 2 }}
            color="primary"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </Paper>
      </Box>
    </Box>
  );
};
