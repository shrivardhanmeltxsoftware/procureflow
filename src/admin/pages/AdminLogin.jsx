import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router";
import loginAdminImage from "../../assets/admin-loginPage.png";
import { loginAdmin } from "../../services/adminApi.js";

const adminFeatures = [
  "Centralized vendor compliance and approval queues.",
  "Real-time procurement spend and contract analytics.",
  "Role-based access to supplier records.",
  "Clear oversight of payouts and milestones.",
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    if (loading) return;

    const trimmedEmail = email.trim();
    const nextFieldErrors = {};

    if (!trimmedEmail) {
      nextFieldErrors.email = "Email is required.";
    } else if (!emailPattern.test(trimmedEmail)) {
      nextFieldErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextFieldErrors.password = "Password is required.";
    }

    setFieldErrors(nextFieldErrors);
    setError("");

    if (Object.keys(nextFieldErrors).length > 0) return;

    setLoading(true);

    try {
      const admin = await loginAdmin(trimmedEmail, password);

      if (!admin?.id) {
        throw new Error("This admin account is missing an ID.");
      }

      const safeAdmin = { ...admin };
      delete safeAdmin.password;

      localStorage.setItem("admin", JSON.stringify(safeAdmin));
      localStorage.setItem("adminId", String(admin.id));

      navigate("/admin/dashboard", { replace: true });
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Login failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
        overflowX: "hidden",
      }}
    >
      <Box
        component="header"
        sx={{
          width: "100%",
          maxWidth: 1440,
          mx: "auto",
          px: { xs: 2, sm: 4, lg: 6 },
          py: { xs: 2, sm: 2.5 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,
              display: "grid",
              placeItems: "center",
              color: "common.white",
              bgcolor: "#4338CA",
              borderRadius: 2.5,
              boxShadow: "0 6px 16px rgba(67, 56, 202, 0.22)",
              flexShrink: 0,
            }}
          >
            <AdminPanelSettingsOutlinedIcon />
          </Box>

          <Box>
            <Typography
              component="div"
              variant="h6"
              sx={{ fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.1 }}
            >
              Procure
              <Box component="span" sx={{ color: "#4338CA" }}>
                Flow
              </Box>
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Admin Console
            </Typography>
          </Box>
        </Stack>

        <Button
          variant="outlined"
          size="small"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/")}
          sx={{
            px: { xs: 1.25, sm: 2 },
            py: 0.9,
            borderRadius: 2,
            borderColor: (theme) => alpha(theme.palette.primary.main, 0.24),
            bgcolor: "background.paper",
            color: "text.primary",
            fontWeight: 600,
            whiteSpace: "nowrap",
            textTransform: "none",
            "&:hover": {
              borderColor: "primary.main",
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
            },
          }}
        >
          <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
            Back to Vendor Portal
          </Box>
          <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
            Vendor Portal
          </Box>
        </Button>
      </Box>

      <Box
        component="main"
        sx={{
          flex: 1,
          width: "100%",
          maxWidth: 1440,
          mx: "auto",
          px: { xs: 1.5, sm: 4, lg: 6 },
          // py: { xs: 1.5, sm: 3 },
          py:0,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.1fr 0.9fr" },
            overflow: "hidden",
            borderRadius: { xs: 3, sm: 4 },
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 24px 60px rgba(15, 23, 42, 0.08)",
          }}
        >
          <Box
            component="section"
            aria-labelledby="admin-brand-heading"
            sx={{
              position: "relative",
              isolation: "isolate",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: { xs: 0, md: 620 },
              p: { xs: 3, sm: 5, lg: 6 },
              color: "common.white",
              order: { xs: 2, md: 1 },
              background:
                "linear-gradient(135deg, #0F172A 0%, #1E1B4B 52%, #312E81 100%)",
              "&::before": {
                content: '""',
                position: "absolute",
                zIndex: -1,
                width: 360,
                height: 360,
                top: -170,
                right: -130,
                borderRadius: "50%",
                bgcolor: "rgba(99, 102, 241, 0.18)",
                filter: "blur(8px)",
                pointerEvents: "none",
              },
            }}
          >
            <Box>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{
                  width: "fit-content",
                  px: 1.5,
                  py: 0.8,
                  mb: { xs: 2.5, sm: 3.5 },
                  border: "1px solid rgba(255,255,255,0.18)",
                  borderRadius: 10,
                  bgcolor: "rgba(255,255,255,0.08)",
                }}
              >
                <AdminPanelSettingsOutlinedIcon
                  sx={{ fontSize: 17, color: "#A5B4FC" }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color: "#E0E7FF",
                    fontWeight: 700,
                    letterSpacing: 0.7,
                    textTransform: "uppercase",
                  }}
                >
                  Security &amp; Governance
                </Typography>
              </Stack>

              <Typography
                id="admin-brand-heading"
                component="h1"
                sx={{
                  maxWidth: 600,
                  fontSize: { xs: "1.8rem", sm: "2.3rem", lg: "2.7rem" },
                  lineHeight: 1.15,
                  fontWeight: 800,
                  letterSpacing: -0.8,
                }}
              >
                Centralized Admin Command Center
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  mt: 2,
                  maxWidth: 560,
                  color: "rgba(226, 232, 240, 0.86)",
                  lineHeight: 1.7,
                  fontSize: { xs: "0.95rem", sm: "1.05rem" },
                }}
              >
                Review vendor onboarding, manage supplier accounts, and oversee
                procurement activity from one place.
              </Typography>
            </Box>

            <Box
              component="img"
              src={loginAdminImage}
              alt="Illustration of the ProcureFlow admin portal"
              sx={{
                display: { xs: "none", sm: "block" },
                width: "100%",
                maxWidth: 500,
                height: { sm: 180, lg: 240 },
                objectFit: "contain",
                alignSelf: "center",
                my: { sm: 2, lg: 3 },
              }}
            />

            <Stack
              component="ul"
              spacing={1.5}
              sx={{
                p: 0,
                m: 0,
                listStyle: "none",
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 1.5,
                pt: { xs: 2, sm: 3 },
                borderTop: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              {adminFeatures.map((feature) => (
                <Box
                  component="li"
                  key={feature}
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.25,
                  }}
                >
                  <CheckCircleIcon
                    aria-hidden="true"
                    sx={{
                      mt: "2px",
                      fontSize: 18,
                      color: "#818CF8",
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      color: "rgba(248,250,252,0.92)",
                      lineHeight: 1.5,
                      fontSize: "0.875rem",
                    }}
                  >
                    {feature}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          <Box
            component="section"
            aria-labelledby="admin-login-heading"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              px: { xs: 2.5, sm: 5, lg: 6 },
              py: { xs: 4, sm: 6, md: 5, lg: 7 },
              bgcolor: "background.paper",
              order: { xs: 1, md: 2 },
            }}
          >
            <Box sx={{ width: "100%", maxWidth: 420 }}>
              <Box sx={{ mb: 3.5 }}>
                <Typography
                  id="admin-login-heading"
                  component="h2"
                  sx={{
                    fontSize: { xs: "1.75rem", sm: "2rem" },
                    fontWeight: 800,
                    letterSpacing: -0.5,
                    color: "text.primary",
                  }}
                >
                  Admin Portal Login
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1, lineHeight: 1.6 }}
                >
                  Enter your administrator credentials to continue.
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" role="alert" sx={{ mb: 2.5, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" noValidate onSubmit={handleLogin}>
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    id="admin-login-email"
                    name="email"
                    label="Admin Email"
                    placeholder="admin@company.com"
                    type="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setFieldErrors((previous) => ({
                        ...previous,
                        email: "",
                      }));
                    }}
                    error={Boolean(fieldErrors.email)}
                    helperText={fieldErrors.email || " "}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        minHeight: 56,
                        borderRadius: 1.5,
                      },
                    }}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailOutlinedIcon fontSize="small" color="action" />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    id="admin-login-password"
                    name="password"
                    label="Password"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setFieldErrors((previous) => ({
                        ...previous,
                        password: "",
                      }));
                    }}
                    error={Boolean(fieldErrors.password)}
                    helperText={fieldErrors.password || " "}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        minHeight: 56,
                        borderRadius: 1.5,
                      },
                    }}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlinedIcon fontSize="small" color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              type="button"
                              aria-label={
                                showPassword ? "Hide password" : "Show password"
                              }
                              onClick={() =>
                                setShowPassword((visible) => !visible)
                              }
                              edge="end"
                            >
                              {showPassword ? (
                                <VisibilityOff fontSize="small" />
                              ) : (
                                <Visibility fontSize="small" />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      mt: 1,
                      minHeight: 52,
                      borderRadius: 2.5,
                      fontWeight: 700,
                      textTransform: "none",
                      bgcolor: "#4338CA",
                      boxShadow: "0 8px 20px rgba(67, 56, 202, 0.25)",
                      "&:hover": {
                        bgcolor: "#3730A3",
                        boxShadow: "0 10px 24px rgba(67, 56, 202, 0.35)",
                      },
                    }}
                  >
                    {loading ? (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CircularProgress size={18} color="inherit" />
                        <span>Signing in...</span>
                      </Stack>
                    ) : (
                      "Sign in to Admin Console"
                    )}
                  </Button>
                </Stack>
              </Box>

              <Box
                sx={{
                  mt: 3.5,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                  border: "1px solid",
                  borderColor: (theme) => alpha(theme.palette.primary.main, 0.12),
                  textAlign: "center",
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  <strong>Authorized administrators only.</strong>
                  <br />
                  Use your assigned admin account to access the console.
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>

      <Box
        component="footer"
        sx={{
          px: 2,
          py: { xs: 2, sm: 2.5 },
          textAlign: "center",
          color: "text.secondary",
        }}
      >
        <Typography variant="caption" sx={{ fontSize: "0.8rem" }}>
          © {new Date().getFullYear()} ProcureFlow Operations Center.
        </Typography>
      </Box>
    </Box>
  );
};