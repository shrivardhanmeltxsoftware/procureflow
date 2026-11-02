import { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckIcon from "@mui/icons-material/Check";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Link as RouterLink, useNavigate } from "react-router";
import { registerVendor } from "../../services/api.js";

const steps = [
  { title: "Account", subtitle: "Credentials" },
  { title: "Business", subtitle: "Organization" },
  { title: "Contact", subtitle: "Point of contact" },
  { title: "Compliance", subtitle: "Review & submit" },
];

const countries = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Other",
];

const initialForm = {
  email: "",
  password: "",
  confirmPassword: "",
  businessName: "",
  street: "",
  street2: "",
  city: "",
  state: "",
  zip: "",
  country: "",
  businessType: "",
  establishmentDate: "",
  firstName: "",
  lastName: "",
  dayPhone: "",
  eveningPhone: "",
  serviceDetails: "",
  serviceArea: "",
  insured: "",
  licensed: "",
  licenseNumber: "",
  grossSales: "",
  affirm: false,
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+?[\d\s().-]+$/;

const validatePhone = (value) => {
  const digits = value.replace(/\D/g, "");
  return phonePattern.test(value) && digits.length >= 7 && digits.length <= 15;
};

const getStepErrors = (step, form) => {
  const errors = {};
  const required = (field, label) => {
    if (!String(form[field] ?? "").trim())
      errors[field] = `${label} is required.`;
  };

  if (step === 0) {
    required("email", "Business email");
    if (form.email && !emailPattern.test(form.email.trim())) {
      errors.email = "Enter a valid email address.";
    }

    required("password", "Password");
    if (form.password) {
      if (form.password.length < 8) {
        errors.password = "Use at least 8 characters.";
      } else if (!/[A-Z]/.test(form.password)) {
        errors.password = "Include at least one uppercase letter.";
      } else if (!/[\d\W]/.test(form.password)) {
        errors.password = "Include at least one number or special character.";
      }
    }

    required("confirmPassword", "Password confirmation");
    if (form.confirmPassword && form.password !== form.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }
  }

  if (step === 1) {
    [
      ["businessName", "Business name"],
      ["street", "Street address"],
      ["city", "City"],
      ["state", "State / Province"],
      ["zip", "Postal / ZIP code"],
      ["country", "Country"],
      ["businessType", "Business type"],
      ["establishmentDate", "Establishment date"],
    ].forEach(([field, label]) => required(field, label));
  }

  if (step === 2) {
    [
      ["firstName", "First name"],
      ["lastName", "Last name"],
      ["dayPhone", "Day phone"],
      ["serviceDetails", "Service / goods details"],
      ["serviceArea", "Geographic service area"],
    ].forEach(([field, label]) => required(field, label));

    if (form.dayPhone && !validatePhone(form.dayPhone.trim())) {
      errors.dayPhone = "Enter a valid phone number (7–15 digits).";
    }
    if (form.eveningPhone && !validatePhone(form.eveningPhone.trim())) {
      errors.eveningPhone = "Enter a valid phone number (7–15 digits).";
    }
  }

  if (step === 3) {
    required("insured", "Please indicate whether your business is insured");
    required("licensed", "Please indicate whether your business is licensed");
    required("grossSales", "Gross annual sales");
    if (form.licensed === "yes") required("licenseNumber", "License number");
    if (!form.affirm) {
      errors.affirm = "Please confirm the information is accurate.";
    }
  }

  return errors;
};

const ReviewSection = ({ title, onEdit, children }) => (
  <Box
    component="section"
    sx={{
      border: "1px solid",
      borderColor: "divider",
      borderRadius: 2,
      overflow: "hidden",
    }}
  >
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        px: 2,
        py: 1.25,
        bgcolor: "action.hover",
        justifyContent: "space-between",
      }}
    >
      <Typography variant="subtitle2" fontWeight={700}>
        {title}
      </Typography>
      {onEdit && (
        <Button size="small" onClick={onEdit} aria-label={`Edit ${title}`}>
          Edit
        </Button>
      )}
    </Stack>
    <Box sx={{ p: 2 }}>{children}</Box>
  </Box>
);

const ReviewFields = ({ entries }) => (
  <Grid container spacing={1.5}>
    {entries.map(([label, value]) => (
      <Grid size={{ xs: 12, sm: 6 }} key={label}>
        <Typography variant="caption" color="text.secondary" display="block">
          {label}
        </Typography>
        <Typography
          variant="body2"
          sx={{ overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}
        >
          {value || "—"}
        </Typography>
      </Grid>
    ))}
  </Grid>
);

export const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!success) return undefined;
    const timer = window.setTimeout(
      () => navigate("/", { replace: true }),
      4000,
    );
    return () => window.clearTimeout(timer);
  }, [navigate, success]);

  const changeField = (field) => (event) => {
    const value =
      field === "affirm" ? event.target.checked : event.target.value;
    setForm((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => {
      const next = { ...previous };
      delete next[field];
      if (field === "password") delete next.confirmPassword;
      return next;
    });
  };

  const goToStep = (nextStep) => {
    setErrors({});
    setStep(nextStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading || success) return;

    const stepErrors = getStepErrors(step, form);
    if (Object.keys(stepErrors).length) {
      setErrors(stepErrors);
      return;
    }

    if (step < steps.length - 1) {
      goToStep(step + 1);
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      const vendorDetails = Object.fromEntries(
        Object.entries(form).filter(([field]) => field !== "confirmPassword"),
      );
      await registerVendor({
        ...vendorDetails,
        licenseNumber: form.licensed === "yes" ? form.licenseNumber.trim() : "",
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      });
      setSuccess(true);
    } catch (requestError) {
      setErrors({
        submit:
          requestError?.response?.data?.message ||
          requestError?.message ||
          "Registration failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const textField = (
    field,
    label,
    {
      type = "text",
      required = true,
      autoComplete,
      multiline = false,
      rows,
      helperText,
      select = false,
      children,
      endAdornment,
      htmlInputProps,
    } = {},
  ) => (
    <TextField
      fullWidth
      id={`vendor-${field}`}
      name={field}
      label={label}
      type={type}
      required={required}
      value={form[field]}
      onChange={changeField(field)}
      error={Boolean(errors[field])}
      helperText={errors[field] || helperText}
      autoComplete={autoComplete}
      multiline={multiline}
      rows={rows}
      select={select}
      slotProps={
        endAdornment || htmlInputProps
          ? {
              htmlInput: htmlInputProps,
              input: endAdornment
                ? {
                    endAdornment: (
                      <InputAdornment position="end">
                        {endAdornment}
                      </InputAdornment>
                    ),
                  }
                : undefined,
            }
          : undefined
      }
    >
      {children}
    </TextField>
  );

  const sectionHeading = (title, description) => (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h5" component="h2" fontWeight={700}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
        {description}
      </Typography>
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        px: { xs: 1.5, sm: 3 },
        py: { xs: 3, sm: 5 },
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 900, mx: "auto" }}>
        <Box component="header" sx={{ textAlign: "center", mb: 3 }}>
          <Stack
            direction="row"
            spacing={1.25}
            alignitems="center"
            justifycontent="center"
            sx={{ mb: 2 }}
          >
            <Avatar
              variant="rounded"
              sx={{
                width: 42,
                height: 42,
                bgcolor: "primary.main",
                borderRadius: 2,
              }}
            >
              <LayersOutlinedIcon />
            </Avatar>
            <Typography variant="h5" fontWeight={800} letterSpacing={-0.5}>
              Procure
              <Box component="span" sx={{ color: "primary.main" }}>
                Flow
              </Box>
            </Typography>
          </Stack>
          <Typography
            component="h1"
            variant="h4"
            sx={{ fontWeight: 750, fontSize: { xs: "1.65rem", sm: "2rem" } }}
          >
            Create your vendor account
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Join ProcureFlow and manage your business relationship in one place.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            Already have an account?{" "}
            <MuiLink component={RouterLink} to="/" fontWeight={600}>
              Log in
            </MuiLink>
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: { xs: 2, sm: 3 },
            overflow: "hidden",
            boxShadow: "0 16px 40px rgba(15, 23, 42, 0.08)",
          }}
        >
          {success ? (
            <Box
              sx={{
                px: { xs: 2.5, sm: 6 },
                py: { xs: 5, sm: 7 },
                textAlign: "center",
              }}
            >
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  mx: "auto",
                  mb: 2,
                  bgcolor: "success.light",
                  color: "success.dark",
                }}
              >
                <TaskAltIcon fontSize="large" />
              </Avatar>
              <Typography component="h2" variant="h5" fontWeight={700}>
                Registration submitted
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Thank you for registering. We&apos;ll review your vendor details
                and follow up at <strong>{form.email}</strong>.
              </Typography>
              <Box sx={{ maxWidth: 480, mx: "auto", mt: 3 }}>
                <Alert severity="success" sx={{ textAlign: "left" }}>
                  Your registration was received. Redirecting to login shortly.
                </Alert>
              </Box>
              <Button
                variant="contained"
                onClick={() => navigate("/", { replace: true })}
                sx={{ mt: 3, minHeight: 44 }}
              >
                Continue to login
              </Button>
            </Box>
          ) : (
            <>
              <Box
                sx={{
                  px: { xs: 1.5, sm: 4 },
                  py: { xs: 2, sm: 2.5 },
                  bgcolor: "#F8FAFC",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                
                }}
              >
                <Stepper activeStep={step} alternativeLabel>
                  {steps.map((item, index) => (
                    <Step key={item.title} completed={index < step}>
                      <StepLabel
                        slotProps={{
                          stepIcon: {
                            sx: {
                              "&.Mui-active": { color: "primary.main" },
                              "&.Mui-completed": { color: "success.main" },
                            },
                          },
                        }}
                      >
                        <Typography
                          component="span"
                          variant="caption"
                          sx={{
                            display: "block",
                            fontWeight: index === step ? 700 : 600,
                            color:
                              index === step
                                ? "primary.main"
                                : index < step
                                  ? "text.primary"
                                  : "text.secondary",
                            fontSize: { xs: "0.65rem", sm: "0.75rem" },
                          }}
                        >
                          {item.title}
                        </Typography>
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: { xs: "none", sm: "block" },
                            fontSize: "0.68rem",
                          }}
                        >
                          {item.subtitle}
                        </Typography>
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: { xs: "block", sm: "none" },
                    mt: 1,
                    textAlign: "center",
                  }}
                >
                  Step {step + 1} of {steps.length}
                </Typography>
              </Box>

              <Box
                component="form"
                noValidate
                onSubmit={handleSubmit}
                sx={{ p: { xs: 2.5, sm: 4, md: 5 } }}
              >
                {errors.submit && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {errors.submit}
                  </Alert>
                )}

                {step === 0 && (
                  <>
                    {sectionHeading(
                      "Create your account",
                      "Use a business email and create a secure password for ProcureFlow.",
                    )}
                    <Stack spacing={2.5}>
                      {textField("email", "Business email address", {
                        type: "email",
                        autoComplete: "email",
                        helperText:
                          "We’ll use this email for account access and updates.",
                      })}
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          {textField("password", "Password", {
                            type: showPassword ? "text" : "password",
                            autoComplete: "new-password",
                            endAdornment: (
                              <IconButton
                                edge="end"
                                aria-label={
                                  showPassword
                                    ? "Hide password"
                                    : "Show password"
                                }
                                onClick={() =>
                                  setShowPassword((shown) => !shown)
                                }
                              >
                                {showPassword ? (
                                  <VisibilityOffIcon />
                                ) : (
                                  <VisibilityIcon />
                                )}
                              </IconButton>
                            ),
                          })}
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          {textField("confirmPassword", "Confirm password", {
                            type: showConfirmPassword ? "text" : "password",
                            autoComplete: "new-password",
                            endAdornment: (
                              <IconButton
                                edge="end"
                                aria-label={
                                  showConfirmPassword
                                    ? "Hide password confirmation"
                                    : "Show password confirmation"
                                }
                                onClick={() =>
                                  setShowConfirmPassword((shown) => !shown)
                                }
                              >
                                {showConfirmPassword ? (
                                  <VisibilityOffIcon />
                                ) : (
                                  <VisibilityIcon />
                                )}
                              </IconButton>
                            ),
                          })}
                        </Grid>
                      </Grid>
                      <Alert
                        severity="info"
                        icon={false}
                        sx={{ bgcolor: "#F4F8FC" }}
                      >
                        <Typography variant="body2" fontWeight={600}>
                          Password requirements
                        </Typography>
                        <Typography
                          variant="caption"
                          component="div"
                          color="text.secondary"
                        >
                          At least 8 characters, one uppercase letter, and one
                          number or special character.
                        </Typography>
                      </Alert>
                    </Stack>
                  </>
                )}

                {step === 1 && (
                  <>
                    {sectionHeading(
                      "Tell us about your business",
                      "Enter your organization’s legal name and registered business address.",
                    )}
                    <Grid container spacing={2.25}>
                      <Grid size={{ xs: 12, sm: 8 }}>
                        {textField(
                          "businessName",
                          "Organization / business name",
                          {
                            autoComplete: "organization",
                          },
                        )}
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        {textField("businessType", "Business type", {
                          helperText:
                            "For example, logistics or manufacturing.",
                        })}
                      </Grid>
                      <Grid size={12}>
                        {textField("street", "Street address", {
                          autoComplete: "address-line1",
                        })}
                      </Grid>
                      <Grid size={12}>
                        {textField("street2", "Street address line 2", {
                          required: false,
                          autoComplete: "address-line2",
                          helperText: "Optional — suite, unit, building, etc.",
                        })}
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        {textField("city", "City", {
                          autoComplete: "address-level2",
                        })}
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        {textField("state", "State / Province", {
                          autoComplete: "address-level1",
                        })}
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        {textField("zip", "Postal / ZIP code", {
                          autoComplete: "postal-code",
                        })}
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        {textField("country", "Country", {
                          select: true,
                          autoComplete: "country-name",
                          children: countries.map((country) => (
                            <MenuItem key={country} value={country}>
                              {country}
                            </MenuItem>
                          )),
                        })}
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        {textField("establishmentDate", "Establishment date", {
                          type: "date",
                          htmlInputProps: {
                            max: new Date().toISOString().slice(0, 10),
                          },
                        })}
                      </Grid>
                    </Grid>
                  </>
                )}

                {step === 2 && (
                  <>
                    {sectionHeading(
                      "Contact & service capabilities",
                      "Tell us who to contact and what your business provides.",
                    )}
                    <Grid container spacing={2.25}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        {textField("firstName", "First name", {
                          autoComplete: "given-name",
                        })}
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        {textField("lastName", "Last name", {
                          autoComplete: "family-name",
                        })}
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        {textField("dayPhone", "Day phone", {
                          type: "tel",
                          autoComplete: "tel",
                          helperText: "Include country code if applicable.",
                        })}
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        {textField("eveningPhone", "Evening phone", {
                          type: "tel",
                          required: false,
                          autoComplete: "tel",
                          helperText: "Optional.",
                        })}
                      </Grid>
                      <Grid size={12}>
                        {textField(
                          "serviceDetails",
                          "General details of services / goods",
                          {
                            multiline: true,
                            rows: 4,
                            helperText:
                              "Briefly describe the products or services you provide.",
                          },
                        )}
                      </Grid>
                      <Grid size={12}>
                        {textField("serviceArea", "Geographic service area", {
                          helperText:
                            "For example, South India or North America.",
                        })}
                      </Grid>
                    </Grid>
                  </>
                )}

                {step === 3 && (
                  <>
                    {sectionHeading(
                      "Business & compliance review",
                      "Provide compliance details, confirm your declaration, and review your information.",
                    )}
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControl error={Boolean(errors.insured)}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            Is your business currently insured?
                          </Typography>
                          <RadioGroup
                            row
                            name="insured"
                            value={form.insured}
                            onChange={changeField("insured")}
                          >
                            <FormControlLabel
                              value="yes"
                              control={<Radio />}
                              label="Yes"
                            />
                            <FormControlLabel
                              value="no"
                              control={<Radio />}
                              label="No"
                            />
                          </RadioGroup>
                          {errors.insured && (
                            <FormHelperText>{errors.insured}</FormHelperText>
                          )}
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControl error={Boolean(errors.licensed)}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            Is your business licensed?
                          </Typography>
                          <RadioGroup
                            row
                            name="licensed"
                            value={form.licensed}
                            onChange={changeField("licensed")}
                          >
                            <FormControlLabel
                              value="yes"
                              control={<Radio />}
                              label="Yes"
                            />
                            <FormControlLabel
                              value="no"
                              control={<Radio />}
                              label="No"
                            />
                          </RadioGroup>
                          {errors.licensed && (
                            <FormHelperText>{errors.licensed}</FormHelperText>
                          )}
                        </FormControl>
                      </Grid>
                      {form.licensed === "yes" && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                          {textField("licenseNumber", "License number")}
                        </Grid>
                      )}
                      <Grid size={{ xs: 12, sm: 6 }}>
                        {textField("grossSales", "Gross annual sales", {
                          helperText:
                            "Enter an amount or range; this is stored as text.",
                        })}
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 3 }} />
                    <Typography
                      variant="subtitle1"
                      fontWeight={700}
                      sx={{ mb: 1.5 }}
                    >
                      Registration summary
                    </Typography>
                    <Stack spacing={1.5}>
                      <ReviewSection
                        title="Account information"
                        onEdit={() => goToStep(0)}
                      >
                        <ReviewFields
                          entries={[["Business email", form.email]]}
                        />
                      </ReviewSection>
                      <ReviewSection
                        title="Business details"
                        onEdit={() => goToStep(1)}
                      >
                        <ReviewFields
                          entries={[
                            ["Organization", form.businessName],
                            ["Business type", form.businessType],
                            [
                              "Address",
                              [form.street, form.street2]
                                .filter(Boolean)
                                .join(", "),
                            ],
                            ["City", form.city],
                            ["State / Province", form.state],
                            ["Postal / ZIP code", form.zip],
                            ["Country", form.country],
                            ["Established", form.establishmentDate],
                          ]}
                        />
                      </ReviewSection>
                      <ReviewSection
                        title="Contact & services"
                        onEdit={() => goToStep(2)}
                      >
                        <ReviewFields
                          entries={[
                            [
                              "Contact name",
                              [form.firstName, form.lastName]
                                .filter(Boolean)
                                .join(" "),
                            ],
                            ["Day phone", form.dayPhone],
                            ["Evening phone", form.eveningPhone],
                            ["Services / goods", form.serviceDetails],
                            ["Service area", form.serviceArea],
                          ]}
                        />
                      </ReviewSection>
                      <ReviewSection title="Business & compliance">
                        <ReviewFields
                          entries={[
                            ["Insured", form.insured === "yes" ? "Yes" : "No"],
                            [
                              "Licensed",
                              form.licensed === "yes" ? "Yes" : "No",
                            ],
                            ...(form.licensed === "yes"
                              ? [["License number", form.licenseNumber]]
                              : []),
                            ["Gross annual sales", form.grossSales],
                          ]}
                        />
                      </ReviewSection>
                    </Stack>

                    <FormControl error={Boolean(errors.affirm)} sx={{ mt: 2 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={form.affirm}
                            onChange={changeField("affirm")}
                            name="affirm"
                          />
                        }
                        label="I confirm that the information provided is accurate to the best of my knowledge."
                        sx={{ alignItems: "flex-start" }}
                      />
                      {errors.affirm && (
                        <FormHelperText>{errors.affirm}</FormHelperText>
                      )}
                    </FormControl>
                  </>
                )}

                <Divider sx={{ my: 3 }} />
                <Stack
                  direction={{ xs: "column-reverse", sm: "row" }}
                  spacing={1.5}
                  sx={{ justifyContent: "space-between" }}
                >
                  {step > 0 ? (
                    <Button
                      type="button"
                      variant="outlined"
                      startIcon={<ArrowBackIcon />}
                      onClick={() => goToStep(step - 1)}
                      disabled={loading}
                      sx={{ minHeight: 44 }}
                    >
                      Back
                    </Button>
                  ) : (
                    <Box />
                  )}
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={
                      loading ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : undefined
                    }
                    endIcon={
                      loading ? undefined : step === steps.length - 1 ? (
                        <CheckIcon />
                      ) : undefined
                    }
                    sx={{ minHeight: 44, minWidth: { sm: 170 } }}
                  >
                    {loading
                      ? "Submitting registration..."
                      : step === steps.length - 1
                        ? "Submit registration"
                        : "Continue"}
                  </Button>
                </Stack>
              </Box>
            </>
          )}
        </Paper>

        <Typography
          component="footer"
          variant="caption"
          color="text.secondary"
          align="center"
          sx={{ display: "block", mt: 3 }}
        >
          © {new Date().getFullYear()} ProcureFlow. Secure vendor onboarding.
        </Typography>
      </Box>
    </Box>
  );
};
