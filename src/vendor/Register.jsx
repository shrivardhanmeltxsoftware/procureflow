import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  Checkbox,
  Button,
  Grid,
  Divider,
  Stack,
  Link,
  Alert,
} from "@mui/material";
import { registerVendor } from "../services/api";
import { useNavigate } from "react-router";

const countries = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Other",
];

export const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    businessName: "",
    street: "",
    street2: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    firstName: "",
    lastName: "",
    dayPhone: "",
    eveningPhone: "",
    email: "",
    password: "",
    serviceDetails: "",
    establishmentDate: "",
    serviceArea: "",
    businessType: "",
    insured: "",
    licensed: "",
    licenseNumber: "",
    grossSales: "",
    affirm: false,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (field) => (e) => {
    const value = field === "affirm" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (!form.affirm) {
        throw new Error("Please affirm the information is accurate");
      }

      await registerVendor({
        id: crypto.randomUUID(),
        ...form,
        createdAt: new Date().toISOString(),
      });

      setMessage("Registration successful! Redirecting to login...");
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        px: { xs: 1, sm: 2 },
        py: { xs: 2, md: 6 },
        bgcolor: "#f5f7fb",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          mx: "auto",
          p: { xs: 2, sm: 4, md: 5 },
          width: "100%",
          maxWidth: 820,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: "primary.main" }}
            gutterBottom
          >
            Vendor Registration
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
            Complete the form below to sign up as a vendor.
          </Typography>
        </Box>

        <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
          Company Contact Information
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {message && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}
        <TextField
          fullWidth
          label="Organization / Business Name"
          margin="normal"
          required
          value={form.businessName}
          onChange={handleChange("businessName")}
        />

        <Typography variant="subtitle1" sx={{ mt: 3, fontWeight: 600 }}>
          Company Address
        </Typography>
        <TextField
          fullWidth
          label="Street Address"
          margin="normal"
          required
          value={form.street}
          onChange={handleChange("street")}
        />
        <TextField
          fullWidth
          label="Street Address Line 2"
          margin="normal"
          required
          value={form.street2}
          onChange={handleChange("street2")}
        />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="City"
              margin="normal"
              required
              value={form.city}
              onChange={handleChange("city")}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="State / Province"
              margin="normal"
              required
              value={form.state}
              onChange={handleChange("state")}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Postal / Zip Code"
              margin="normal"
              required
              value={form.zip}
              onChange={handleChange("zip")}
            />
          </Grid>
        </Grid>

        <TextField
          fullWidth
          select
          label="Country"
          margin="normal"
          required
          value={form.country}
          onChange={handleChange("country")}
        >
          {countries.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </TextField>

        <Typography variant="h6" sx={{ mt: 4, mb: 1, fontWeight: 600 }}>
          Point of Contact
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              margin="normal"
              required
              value={form.firstName}
              onChange={handleChange("firstName")}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              margin="normal"
              required
              value={form.lastName}
              onChange={handleChange("lastName")}
            />
          </Grid>
        </Grid>

        <TextField
          fullWidth
          label="Phone Number (Day)"
          margin="normal"
          required
          value={form.dayPhone}
          onChange={handleChange("dayPhone")}
        />
        <TextField
          fullWidth
          label="Phone Number (Evening)"
          margin="normal"
          required
          value={form.eveningPhone}
          onChange={handleChange("eveningPhone")}
        />
        <TextField
          fullWidth
          label="E-mail"
          type="email"
          margin="normal"
          required
          value={form.email}
          onChange={handleChange("email")}
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          margin="normal"
          required
          value={form.password}
          onChange={handleChange("password")}
        />

        <Typography variant="h6" sx={{ mt: 4, mb: 1, fontWeight: 600 }}>
          Company Overview
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <TextField
          fullWidth
          label="General Details of Services/Goods"
          margin="normal"
          multiline
          rows={3}
          required
          value={form.serviceDetails}
          onChange={handleChange("serviceDetails")}
        />
        <TextField
          fullWidth
          label="Establishment Date"
          type="date"
          margin="normal"
          required
          slotProps={{
            inputLabel: { shrink: true },
          }}
          value={form.establishmentDate}
          onChange={handleChange("establishmentDate")}
        />
        <TextField
          fullWidth
          label="Geographic Service Area"
          margin="normal"
          required
          value={form.serviceArea}
          onChange={handleChange("serviceArea")}
        />
        <TextField
          fullWidth
          label="Business Type"
          margin="normal"
          required
          value={form.businessType}
          onChange={handleChange("businessType")}
        />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 2, sm: 6 }}
          sx={{ mt: 2 }}
        >
          <FormControl>
            <FormLabel>Insured?</FormLabel>
            <RadioGroup
              row
              value={form.insured}
              required
              onChange={handleChange("insured")}
            >
              <FormControlLabel value="yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>

          <FormControl>
            <FormLabel>Licensed?</FormLabel>
            <RadioGroup
              row
              value={form.licensed}
              required
              onChange={handleChange("licensed")}
            >
              <FormControlLabel value="yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>
        </Stack>

        <TextField
          fullWidth
          label="License Number"
          margin="normal"
          required
          value={form.licenseNumber}
          onChange={handleChange("licenseNumber")}
        />
        <TextField
          fullWidth
          label="Gross Annual Sales"
          margin="normal"
          required
          value={form.grossSales}
          onChange={handleChange("grossSales")}
        />

        <Divider sx={{ mt: 4, mb: 1 }} />
        <FormControlLabel
          sx={{ mt: 1, alignItems: "flex-start" }}
          control={
            <Checkbox checked={form.affirm} onChange={handleChange("affirm")} />
          }
          label="I hereby affirm that all information provided above is accurate to the best of my knowledge and belief."
        />

        <Button
          fullWidth
          variant="contained"
          size="large"
          sx={{ mt: 2 }}
          color="primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </Button>

        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Already have an account? <Link href="/">Login</Link>
        </Typography>
      </Paper>
    </Box>
  );
};
