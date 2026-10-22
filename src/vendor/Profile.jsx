import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { updateVendor } from "../services/api";

const editableFields = [
  { name: "businessName", label: "Business name" },
  { name: "street", label: "Street" },
  { name: "street2", label: "Street 2" },
  { name: "city", label: "City" },
  { name: "state", label: "State" },
  { name: "zip", label: "ZIP code" },
  { name: "country", label: "Country" },
  { name: "firstName", label: "First name" },
  { name: "lastName", label: "Last name" },
  { name: "dayPhone", label: "Day phone" },
  { name: "eveningPhone", label: "Evening phone" },
  { name: "serviceDetails", label: "Service details", multiline: true },
  { name: "serviceArea", label: "Service area" },
  { name: "businessType", label: "Business type" },
  { name: "licenseNumber", label: "License number" },
];

export const Profile = () => {
  const storedVendor = JSON.parse(localStorage.getItem("vendor"));
  const [vendor, setVendor] = useState(storedVendor);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setVendor((currentVendor) => ({
      ...currentVendor,
      [name]: value,
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      const updates = Object.fromEntries(
        editableFields.map(({ name }) => [name, vendor[name] || ""]),
      );
      updates.insured = vendor.insured;
      updates.licensed = vendor.licensed;

      const updatedVendor = await updateVendor(vendor.id, updates);
      const { password: _pw, ...safeVendor } = updatedVendor;
      localStorage.setItem("vendor", JSON.stringify(safeVendor));
      setVendor(updatedVendor);
      setMessage("Profile updated successfully.");
    } catch (saveError) {
      setError(saveError.message || "Unable to update profile.");
    }
  };

  return (
    <Box>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Profile
        </Typography>
      </Box>
      <Divider sx={{ mt: 2 }} />

      <Box sx={{ minWidth: 0 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Welcome ,{" "}
            <span style={{ color: "#1565C0", fontWeight: "bold" }}>
              {vendor.businessName}{" "}
            </span>
          </Typography>
        </Box>

        <Box
          component="form"
          onSubmit={handleSave}
          sx={{
            maxWidth: 900,
            mt: 2,
            mx: "auto",
            width: "100%",
            minWidth: 0,
          }}
        >
          <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
            Edit Profile
          </Typography>

          {message && <Alert severity="success">{message}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}

          <Grid container spacing={3} sx={{ mt: 1 }}>
            {editableFields.map(({ name, label, multiline }) => (
              <Grid key={name} size={{ xs: 12, md: multiline ? 12 : 6 }}>
                <TextField
                  fullWidth
                  label={label}
                  name={name}
                  value={vendor[name] || ""}
                  onChange={handleChange}
                  multiline={multiline}
                  minRows={multiline ? 4 : undefined}
                />
              </Grid>
            ))}

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Insured</InputLabel>
                <Select
                  name="insured"
                  value={vendor.insured || ""}
                  label="Insured"
                  onChange={handleChange}
                >
                  <MenuItem value="yes">Yes</MenuItem>
                  <MenuItem value="no">No</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Licensed</InputLabel>
                <Select
                  name="licensed"
                  value={vendor.licensed || ""}
                  label="Licensed"
                  onChange={handleChange}
                >
                  <MenuItem value="yes">Yes</MenuItem>
                  <MenuItem value="no">No</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Button type="submit" variant="contained" sx={{ mt: 3 }}>
            Save Changes
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
