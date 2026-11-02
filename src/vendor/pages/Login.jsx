import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Link, useNavigate } from "react-router";
import loginVendorImage from "../../assets/vendor-login-img.png";
import { loginVendor } from "../../services/api.js";

const benefits = [
  "Manage purchase orders in one place.",
  "Track deliveries and invoices easily.",
  "Get paid faster with transparent status updates.",
  "Simple, secure vendor onboarding.",
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const Login = () => {
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
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
      nextFieldErrors.email = "Business email is required.";
    } else if (!emailPattern.test(trimmedEmail)) {
      nextFieldErrors.email = "Enter a valid email address.";
    }
    if (!password) nextFieldErrors.password = "Password is required.";

    setFieldErrors(nextFieldErrors);
    setError("");
    if (Object.keys(nextFieldErrors).length > 0) return;

    setLoading(true);
    try {
      const vendor = await loginVendor(trimmedEmail, password);

      if (!vendor?.id) {
        throw new Error("This vendor account is missing an ID.");
      }
      if (vendor.status !== "active") {
        throw new Error(
          "Your account is not active. Please contact the admin.",
        );
      }

      const safeVendor = { ...vendor };
      delete safeVendor.password;
      localStorage.setItem("vendor", JSON.stringify(safeVendor));
      localStorage.setItem("vendorId", String(vendor.id));

      navigate("/dashboard", { replace: true });
    } catch (loginError) {
      setError(
        loginError.message || "Login failed. Please check your credentials.",
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
          py: { xs: 2.5, sm: 3 },
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
              bgcolor: "primary.main",
              borderRadius: 2.5,
              boxShadow: "0 6px 16px rgba(21, 101, 192, 0.25)",
            }}
          >
            <LayersOutlinedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Typography variant="h6" fontWeight={800} letterSpacing={-0.5}>
            Procure
            <Box component="span" sx={{ color: "primary.main" }}>
              Flow
            </Box>
          </Typography>
        </Stack>
        <Button
          variant="outlined"
          size="small"
          startIcon={<SupervisorAccountIcon />}
          onClick={() => navigate("/admin-login")}
          sx={{
            px: 2,
            py: 1,
            borderRadius: 2,
            borderColor: (theme) => alpha(theme.palette.primary.main, 0.24),
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.045),
            color: "primary.dark",
            fontWeight: 600,
            whiteSpace: "nowrap",
            transition: "background-color 160ms ease, border-color 160ms ease",
            "&:hover": {
              borderColor: "primary.main",
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
            },
            "&:focus-visible": {
              outline: "3px solid",
              outlineColor: (theme) => alpha(theme.palette.primary.main, 0.24),
              outlineOffset: 2,
            },
          }}
        >
          Admin Login
        </Button>
      </Box>

      <Box
        component="main"
        sx={{
          flex: 1,
          width: "100%",
          maxWidth: 1440,
          mx: "auto",
          px: { xs: 2, sm: 4, lg: 6 },
          py: { xs: 2, sm: 3, lg: 4 },
          display: "flex",
          alignItems: "center",
          "@media (max-width: 599px)": {
            py: 1.5,
          },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "1.05fr 0.95fr",
              lg: "7fr 5fr",
            },
            overflow: "hidden",
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 24px 60px rgba(15, 23, 42, 0.08)",
          }}
        >
          <Box
            component="section"
            aria-labelledby="brand-heading"
            sx={{
              position: "relative",
              isolation: "isolate",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: { xs: 0, md: 640 },
              p: { xs: 3, sm: 5, md: 4, lg: 7 },
              order: { xs: 2, md: 1 },
              color: "common.white",
              background:
                "linear-gradient(135deg, #0F172A 0%, #173B67 52%, #1565C0 100%)",
              "&::before, &::after": {
                content: '""',
                position: "absolute",
                zIndex: -1,
                borderRadius: "50%",
                pointerEvents: "none",
              },
              "&::before": {
                width: 380,
                height: 380,
                top: -180,
                right: -120,
                bgcolor: "rgba(96, 165, 250, 0.15)",
                filter: "blur(4px)",
              },
              "&::after": {
                width: 320,
                height: 320,
                bottom: -160,
                left: -140,
                bgcolor: "rgba(255, 255, 255, 0.06)",
              },
            }}
          >
            <Box>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1.5,
                  py: 0.8,
                  mb: { xs: 2, sm: 3, lg: 3.5 },
                  border: "1px solid rgba(255,255,255,0.18)",
                  borderRadius: 10,
                  bgcolor: "rgba(255,255,255,0.08)",
                  backdropFilter: "blur(6px)",
                }}
              >
                <LayersOutlinedIcon sx={{ fontSize: 16, color: "#93C5FD" }} />
                <Typography
                  variant="caption"
                  sx={{
                    color: "#E0F2FE",
                    fontWeight: 700,
                    letterSpacing: 0.8,
                    textTransform: "uppercase",
                  }}
                >
                  Enterprise Vendor Hub
                </Typography>
              </Box>
              <Typography
                id="brand-heading"
                component="h1"
                variant="h3"
                sx={{
                  maxWidth: 620,
                  fontSize: { xs: "1.8rem", sm: "2.25rem", lg: "2.8rem" },
                  lineHeight: 1.15,
                  fontWeight: 800,
                  letterSpacing: -0.8,
                }}
              >
                Streamline Your Supply Chain Operations
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mt: { xs: 1.5, sm: 2 },
                  maxWidth: 560,
                  color: "rgba(226, 232, 240, 0.85)",
                  lineHeight: 1.7,
                  fontSize: { xs: "0.95rem", sm: "1.05rem" },
                }}
              >
                A unified vendor management platform connecting suppliers and
                buyers — from purchase orders to payments, seamlessly.
              </Typography>
            </Box>

            <Box
              aria-hidden="true"
              sx={{
                position: "relative",
                isolation: "isolate",
                display: "grid",
                placeItems: "center",
                width: "100%",
                my: { xs: 1.5, sm: 2, lg: 3 },
                "&::before": {
                  content: '""',
                  position: "absolute",
                  zIndex: -1,
                  width: { xs: "68%", sm: "62%" },
                  aspectRatio: "1",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(96, 165, 250, 0.32) 0%, rgba(96, 165, 250, 0.08) 58%, transparent 76%)",
                  filter: "blur(8px)",
                },
              }}
            >
              <Box
                component="img"
                src={loginVendorImage}
                alt="Illustration of a small business storefront"
                sx={{
                  display: "block",
                  width: "100%",
                  maxWidth: { xs: 320, sm: 480, lg: 600 },
                  height: { xs: 140, sm: 190, lg: 280 },
                  objectFit: "contain",
                  borderRadius: 2,
                  opacity: 0.98,
                }}
              />
            </Box>

            <Stack
              component="ul"
              spacing={{ xs: 1.25, sm: 1.75 }}
              sx={{
                p: 0,
                m: 0,
                listStyle: "none",
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                columnGap: { xs: 1.5, md: 2.5 },
                pt: { xs: 2, sm: 3 },
                borderTop: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              {benefits.map((benefit) => (
                <Box
                  component="li"
                  key={benefit}
                  sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}
                >
                  <CheckCircleIcon
                    aria-hidden="true"
                    sx={{
                      color: "#4ADE80",
                      fontSize: 18,
                      mt: "3px",
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      color: "rgba(248,250,252,0.9)",
                      lineHeight: 1.55,
                      fontSize: "0.875rem",
                    }}
                  >
                    {benefit}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          <Box
            component="section"
            aria-labelledby="login-heading"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              px: { xs: 3, sm: 6, lg: 8 },
              py: { xs: 4, sm: 6, md: 5, lg: 8 },
              bgcolor: "background.paper",
              order: { xs: 1, md: 2 },
            }}
          >
            <Box sx={{ width: "100%", maxWidth: 420 }}>
              <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                <Typography
                  id="login-heading"
                  component="h2"
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    letterSpacing: -0.5,
                    color: "text.primary",
                    fontSize: { xs: "1.75rem", sm: "2rem" },
                  }}
                >
                  Welcome Back
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1, fontSize: "0.925rem", lineHeight: 1.6 }}
                >
                  Sign in to your ProcureFlow account.
                </Typography>
              </Box>

              {error && (
                <Alert
                  severity="error"
                  role="alert"
                  sx={{ mb: 3, borderRadius: 2 }}
                >
                  {error}
                </Alert>
              )}

              <Box component="form" noValidate onSubmit={handleLogin}>
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    id="vendor-login-email"
                    name="email"
                    label="Business Email Address"
                    placeholder="name@company.com"
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
                        borderRadius: 2.5,
                        transition: "box-shadow 160ms ease",
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "primary.main",
                        },
                      },
                    }}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailOutlinedIcon
                              fontSize="small"
                              color={fieldErrors.email ? "error" : "action"}
                            />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                  <Box>
                    <TextField
                      fullWidth
                      id="vendor-login-password"
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
                          borderRadius: 2.5,
                          transition: "box-shadow 160ms ease",
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "primary.main",
                          },
                        },
                      }}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockOutlinedIcon
                                fontSize="small"
                                color="action"
                              />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                type="button"
                                aria-label={
                                  showPassword
                                    ? "Hide password"
                                    : "Show password"
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
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        
                      }}
                    >
                      <MuiLink
                        component={Link}
                        to="/forgot-password"
                        variant="caption"
                        fontWeight={600}
                        color="primary.main"
                        underline="hover"
                      >
                        Forgot password?
                      </MuiLink>
                    </Box>
                  </Box>

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    endIcon={
                      loading ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        <ArrowForwardIcon />
                      )
                    }
                    sx={{
                      mt: 1,
                      minHeight: 52,
                      borderRadius: 2.5,
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      textTransform: "none",
                      boxShadow: "0 8px 20px rgba(21, 101, 192, 0.25)",
                      transition:
                        "background-color 160ms ease, box-shadow 160ms ease, transform 160ms ease",
                      "&:hover": {
                        bgcolor: "#0D47A1",
                        boxShadow: "0 10px 24px rgba(21, 101, 192, 0.35)",
                        transform: "translateY(-1px)",
                      },
                      "&:focus-visible": {
                        outline: "3px solid",
                        outlineColor: (theme) =>
                          alpha(theme.palette.primary.main, 0.28),
                        outlineOffset: 2,
                      },
                    }}
                  >
                    {loading ? "Signing in..." : "Sign in to account"}
                  </Button>
                </Stack>
              </Box>

              <Divider sx={{ my: { xs: 3, sm: 4 } }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    px: 1,
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                    fontWeight: 600,
                  }}
                >
                  New to ProcureFlow?
                </Typography>
              </Divider>

              <Button
                component={Link}
                to="/register"
                fullWidth
                variant="outlined"
                size="large"
                sx={{
                  minHeight: 52,
                  borderRadius: 2.5,
                  borderColor: (theme) =>
                    alpha(theme.palette.primary.main, 0.32),
                  color: "primary.main",
                  fontWeight: 700,
                  textTransform: "none",
                  transition:
                    "background-color 160ms ease, border-color 160ms ease",
                  "&:hover": {
                    borderColor: "primary.main",
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
                  },
                  "&:focus-visible": {
                    outline: "3px solid",
                    outlineColor: (theme) =>
                      alpha(theme.palette.primary.main, 0.24),
                    outlineOffset: 2,
                  },
                }}
              >
                Register as a Vendor
              </Button>
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
          © ProcureFlow 2026.
        </Typography>
      </Box>
    </Box>
  );
};
