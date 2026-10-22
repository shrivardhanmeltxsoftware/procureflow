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
import loginVendorImage from "../assets/vendor-login-img.png";
import { loginVendor } from "../services/api";
import { useNavigate, Link } from "react-router";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export const Login = () => {
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

      const vendor = await loginVendor(email, password);

      if (!vendor?.id) {
        throw new Error("This vendor account is missing an ID.");
      }
      if (vendor.status !== "active") {
        throw new Error(
          "Your account is not active. Please contact the admin.",
        );
      }

      const { password: _pw, ...safeVendor } = vendor;

      // Store vendor info in localStorage
      localStorage.setItem("vendor", JSON.stringify(safeVendor));
      localStorage.setItem("vendorId", String(vendor.id));

      navigate("/dashboard", { replace: true });
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
        flexDirection: { xs: "column", md: "row" },
        minHeight: "100dvh",
        height: { xs: "auto", md: "100dvh" },
        position: "relative",
      }}
    >
      <Button
        variant="outlined"
        size="small"
        sx={{
          position: "absolute",
          top: 16,
          right: { xs: 12, sm: 24 },
          zIndex: 1,
          borderRadius: 5,
        }}
        onClick={() => navigate("/admin-login")}
        startIcon={<SupervisorAccountIcon />}
      >
        Admin Login
      </Button>

      <Box
        component={Paper}
        sx={{
          flex: { xs: "0 0 auto", md: "0 0 45%" },
          width: { xs: "100%", md: "45%" },
          bgcolor: "#FFFFFF",
          p: { xs: 2, sm: 3, md: 4 },
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
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: "primary.main" }}
          >
            ProcureFlow
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1, maxWidth: 450 }}
          >
            A vendor management platform that connects suppliers and buyers —
            from purchase orders to payments, all in one place.
          </Typography>
          <Box
            component="img"
            src={loginVendorImage}
            sx={{
              width: "100%",
              height: { xs: "auto", md: "100%" },
              maxHeight: { xs: 180, md: "none" },
              objectFit: "cover",
              display: { xs: "none", md: "block" },
              mt: { md: 4 },
            }}
          ></Box>

          <Box sx={{ mt: 2 }}>
            {[
              "Manage purchase orders in one place",
              "Track deliveries and invoices easily",
              "Get paid faster with transparent status updates",
              "Simple, secure vendor onboarding",
            ].map((point, i) => (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: 1.5,
                  mb: 1.5,
                }}
              >
                <TaskAltIcon
                  sx={{ color: "success.main", fontSize: 18, flexShrink: 0 }}
                />
                <Typography variant="body2" sx={{ textAlign: "left" }}>
                  {point}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          flex: "1 1 55%",
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
          p: { xs: 2, sm: 3, md: 0 },
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2.5, sm: 4 },
            width: "100%",
            maxWidth: 500,
            minHeight: { xs: "auto", sm: 400 },
          }}
        >
          <Typography
            variant="h5"
            align="center"
            sx={{ fontWeight: 700, color: "primary.main" }}
            gutterBottom
          >
            ProcureFlow
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

          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Don't have account? <Link to="/register">Register</Link>
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};
