import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm, Controller } from "react-hook-form";
import {
  Box,
  Paper,
  Grid,
  Stack,
  Typography,
  TextField,
  Button,
  MenuItem,
  FormControl,
  FormControlLabel,
  FormLabel,
  RadioGroup,
  Radio,
  Alert,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { registerVendor } from "../services/api";

const countries = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Other",
];

export const AddVendor = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit } = useForm({
    defaultValues: {
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
     
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await registerVendor({
        id: crypto.randomUUID(),
        ...data,
        createdAt: new Date().toISOString(),
      });

      setMessage("Vendor added successfully! Redirecting to vendors...");
      navigate("/admin/vendors");
    } catch (err) {
      setError(err.message || "Vendor registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
        width: "100%",
        minWidth: 0,
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      <Box sx={{ flexShrink: 0 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "center" },
            gap: 2,
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            Add vendor
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              gap: 2,
              flexGrow: 1,
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/admin/vendors")}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              Back to Vendors
            </Button>
          </Box>
        </Box>
        <Divider sx={{ my: 2 }} />
      </Box>

      <Paper
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        elevation={0}
        sx={{
          mx: "auto",
          p: { xs: 2, sm: 4, md: 4 },
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

        <Controller
          name="businessName"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Organization / Business Name"
              margin="normal"
              required
            />
          )}
        />

        <Typography variant="subtitle1" sx={{ mt: 3, fontWeight: 600 }}>
          Company Address
        </Typography>

        <Controller
          name="street"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Street Address"
              margin="normal"
              required
            />
          )}
        />

        <Controller
          name="street2"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Street Address Line 2"
              margin="normal"
              required
            />
          )}
        />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="City"
                  margin="normal"
                  required
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="state"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="State / Province"
                  margin="normal"
                  required
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="zip"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Postal / Zip Code"
                  margin="normal"
                  required
                />
              )}
            />
          </Grid>
        </Grid>

        <Controller
          name="country"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              select
              label="Country"
              margin="normal"
              required
            >
              {countries.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        <Typography variant="h6" sx={{ mt: 4, mb: 1, fontWeight: 600 }}>
          Point of Contact
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="firstName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="First Name"
                  margin="normal"
                  required
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="lastName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Last Name"
                  margin="normal"
                  required
                />
              )}
            />
          </Grid>
        </Grid>

        <Controller
          name="dayPhone"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Phone Number (Day)"
              margin="normal"
              required
            />
          )}
        />

        <Controller
          name="eveningPhone"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Phone Number (Evening)"
              margin="normal"
              required
            />
          )}
        />

        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="E-mail"
              type="email"
              margin="normal"
              required
            />
          )}
        />

        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              required
            />
          )}
        />

        <Typography variant="h6" sx={{ mt: 4, mb: 1, fontWeight: 600 }}>
          Company Overview
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Controller
          name="serviceDetails"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="General Details of Services/Goods"
              margin="normal"
              required
              multiline
              rows={3}
            />
          )}
        />

        <Controller
          name="establishmentDate"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Establishment Date"
              type="date"
              margin="normal"
              required
              slotProps={{
                inputLabel: { shrink: true },
              }}
            />
          )}
        />

        <Controller
          name="serviceArea"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Geographic Service Area"
              margin="normal"
              required
            />
          )}
        />

        <Controller
          name="businessType"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Business Type"
              margin="normal"
              required
            />
          )}
        />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 2, sm: 6 }}
          sx={{ mt: 2 }}
        >
          <FormControl required>
            <FormLabel>Insured?</FormLabel>
            <Controller
              name="insured"
              control={control}
              render={({ field }) => (
                <RadioGroup row {...field}>
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
              )}
            />
          </FormControl>

          <FormControl required>
            <FormLabel>Licensed?</FormLabel>
            <Controller
              name="licensed"
              control={control}
              render={({ field }) => (
                <RadioGroup row {...field}>
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
              )}
            />
          </FormControl>
        </Stack>

        <Controller
          name="licenseNumber"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="License Number"
              margin="normal"
              required
            />
          )}
        />

        <Controller
          name="grossSales"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Gross Annual Sales"
              margin="normal"
              required
              type="number"
            />
          )}
        />

        <Button
          fullWidth
          variant="contained"
          size="large"
          type="submit"
          sx={{ mt: 2 }}
          color="primary"
          disabled={loading}
        >
          {loading ? "Adding vendor" : "Add vendor"}
        </Button>
      </Paper>
    </Box>
  );
};

