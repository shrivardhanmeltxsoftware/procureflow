import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router";
import {
  Box,
  Paper,
  Grid,
  Stack,
  Typography,
  TextField,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import BusinessIcon from "@mui/icons-material/Business";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CategoryIcon from "@mui/icons-material/Category";
import PublicIcon from "@mui/icons-material/Public";
import DescriptionIcon from "@mui/icons-material/Description";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import BadgeIcon from "@mui/icons-material/Badge";
import { getVendorById, updateVendor } from "../services/AdminAPI";
import { formatDate } from "../utils/dateUtils";
import {
  getStatusColor,
  VENDOR_STATUS_COLOR,
} from "../constants/statusColors";

/**
 * Reusable read-only field display for View Mode
 */
const DetailField = ({
  label,
  value,
  icon: Icon,
  chip = false,
  chipColor = "default",
}) => (
  <Box
    sx={{
      p: 2,
      bgcolor: "#fafafa",
      borderRadius: 2,
      border: "1px solid #e0e0e0",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      transition: "border-color 0.2s ease, background-color 0.2s ease",
      "&:hover": {
        borderColor: "primary.main",
        bgcolor: "#f5f3ff",
      },
    }}
  >
    <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.5 }}>
      {Icon && <Icon sx={{ fontSize: 16, color: "text.secondary" }} />}
      <Typography
        variant="caption"
        color="text.secondary"
        fontWeight={700}
        textTransform="uppercase"
        letterSpacing={0.6}
      >
        {label}
      </Typography>
    </Stack>
    {chip ? (
      <Box sx={{ mt: 0.5 }}>
        <Chip
          label={value || "N/A"}
          color={chipColor}
          size="small"
          sx={{ textTransform: "capitalize", fontWeight: 600 }}
        />
      </Box>
    ) : (
      <Typography
        variant="body1"
        fontWeight={500}
        color={value ? "text.primary" : "text.disabled"}
        sx={{ wordBreak: "break-word" }}
      >
        {value || "Not provided"}
      </Typography>
    )}
  </Box>
);

export const AdminVendorDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Mode derived from query parameter ?mode=view or ?mode=edit (default: view)
  const mode = searchParams.get("mode") || "view";
  const isEditMode = mode === "edit";

  // State
  const [vendor, setVendor] = useState(null);
  const [formData, setFormData] = useState({
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
    serviceDetails: "",
    serviceArea: "",
    businessType: "",
    insured: "no",
    licensed: "no",
    licenseNumber: "",
    grossSales: "",
    status: "pending",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Populate form with vendor data
  const populateFormData = (data) => {
    setFormData({
      businessName: data.businessName || "",
      street: data.street || "",
      street2: data.street2 || "",
      city: data.city || "",
      state: data.state || "",
      zip: data.zip || "",
      country: data.country || "",
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      dayPhone: data.dayPhone || "",
      eveningPhone: data.eveningPhone || "",
      email: data.email || "",
      serviceDetails: data.serviceDetails || "",
      serviceArea: data.serviceArea || "",
      businessType: data.businessType || data.category || "",
      insured: data.insured || "no",
      licensed: data.licensed || "no",
      licenseNumber: data.licenseNumber || "",
      grossSales: data.grossSales || "",
      status: data.status || "pending",
    });
  };

  // Fetch vendor by ID
  useEffect(() => {
    const fetchVendor = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getVendorById(id);
        if (!data || Object.keys(data).length === 0) {
          setVendor(null);
        } else {
          setVendor(data);
          populateFormData(data);
        }
      } catch (err) {
        console.error("Error fetching vendor details:", err);
        setError("Failed to load vendor details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVendor();
    }
  }, [id]);

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Cancel edit: revert to fetched vendor data and return to view mode
  const handleCancelEdit = () => {
    if (vendor) {
      populateFormData(vendor);
    }
    setSaveError("");
    navigate(`/admin/vendors/${id}?mode=view`);
  };

  // Save changes
  const handleSaveChanges = async (e) => {
    e?.preventDefault();
    setSaving(true);
    setSaveError("");

    try {
      const updatedPayload = {
        businessName: formData.businessName,
        street: formData.street,
        street2: formData.street2,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        country: formData.country,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dayPhone: formData.dayPhone,
        eveningPhone: formData.eveningPhone,
        email: formData.email,
        serviceDetails: formData.serviceDetails,
        serviceArea: formData.serviceArea,
        businessType: formData.businessType,
        insured: formData.insured,
        licensed: formData.licensed,
        licenseNumber: formData.licenseNumber,
        grossSales: formData.grossSales,
        status: formData.status,
      };

      const updatedVendor = await updateVendor(id, updatedPayload);

      setVendor((prev) => ({
        ...prev,
        ...updatedVendor,
        ...updatedPayload,
      }));

      setSnackbar({
        open: true,
        message: "Vendor details updated successfully!",
        severity: "success",
      });

      // Switch back to view mode after saving
      navigate(`/admin/vendors/${id}?mode=view`);
    } catch (err) {
      console.error("Error updating vendor:", err);
      setSaveError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update vendor. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // 1. Loading State
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          gap: 2,
        }}
      >
        <CircularProgress size={48} color="primary" />
        <Typography variant="body1" color="text.secondary">
          Loading vendor details...
        </Typography>
      </Box>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <Box sx={{ maxWidth: 600, mx: "auto", mt: 6 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/admin/vendors")}
        >
          Back to Vendors
        </Button>
      </Box>
    );
  }

  // 3. Vendor Not Found State
  if (!vendor) {
    return (
      <Box sx={{ maxWidth: 600, mx: "auto", mt: 6 }}>
        <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Vendor Not Found
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            No vendor was found matching ID <strong>{id}</strong>.
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/admin/vendors")}
          >
            Back to Vendors
          </Button>
        </Paper>
      </Box>
    );
  }

  // 4. Main View / Edit Layout
  return (
    <Box
      sx={{
        height: "100%",
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        pr: 1,
      }}
    >
      {/* Header Section without Action Buttons */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="text"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/admin/vendors")}
          sx={{ mb: 1, color: "text.secondary" }}
        >
          Back to Vendors
        </Button>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
        >
          <Box>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems={{ xs: "flex-start", sm: "center" }}
              spacing={1.5}
              sx={{
                display: "flex",
                minWidth: 0,
                flexWrap: "wrap",
              }}
            >
              <Typography variant="h4" fontWeight="bold">
                {vendor.businessName || "Vendor Details"}
              </Typography>
              <Chip
                label={vendor.status || "pending"}
                color={getStatusColor(VENDOR_STATUS_COLOR, vendor.status, "warning")}
                size="small"
                sx={{ textTransform: "capitalize", fontWeight: "bold" }}
              />
              <Chip
                label={isEditMode ? "Edit Mode" : "View Mode"}
                variant="outlined"
                color={isEditMode ? "primary" : "default"}
                size="small"
                sx={{ fontWeight: 600 }}
              />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Vendor ID: <strong>{vendor.id}</strong> • Registered:{" "}
              {formatDate(vendor.createdAt)}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Save Error Alert */}
      {saveError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setSaveError("")}>
          {saveError}
        </Alert>
      )}

      {/* Main Form Container */}
      <Box
        component={isEditMode ? "form" : "div"}
        onSubmit={isEditMode ? handleSaveChanges : undefined}
        sx={{ display: "flex", flexDirection: "column", gap: 3, pb: 4 }}
      >
        {/* ================= SECTION 4: Compliance & Account Status ================= */}
        <Paper sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2, boxShadow: 1 }} elevation={2}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <VerifiedUserIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Compliance & Account Status
            </Typography>
          </Stack>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={2.5}>
            {/* Account Status */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              {isEditMode ? (
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="status-select-label">
                    Account Status
                  </InputLabel>
                  <Select
                    labelId="status-select-label"
                    name="status"
                    value={formData.status}
                    label="Account Status"
                    onChange={handleChange}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              ) : (
                <DetailField
                  label="Account Status"
                  value={vendor.status}
                  chip
                  chipColor={getStatusColor(VENDOR_STATUS_COLOR, vendor.status)}
                  icon={BadgeIcon}
                />
              )}
            </Grid>

            {/* Insured */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              {isEditMode ? (
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="insured-select-label">Insured</InputLabel>
                  <Select
                    labelId="insured-select-label"
                    name="insured"
                    value={formData.insured}
                    label="Insured"
                    onChange={handleChange}
                  >
                    <MenuItem value="yes">Yes</MenuItem>
                    <MenuItem value="no">No</MenuItem>
                  </Select>
                </FormControl>
              ) : (
                <DetailField
                  label="Insured"
                  value={vendor.insured === "yes" ? "Yes" : "No"}
                  chip
                  chipColor={vendor.insured === "yes" ? "success" : "default"}
                  icon={VerifiedUserIcon}
                />
              )}
            </Grid>

            {/* Licensed */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              {isEditMode ? (
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="licensed-select-label">Licensed</InputLabel>
                  <Select
                    labelId="licensed-select-label"
                    name="licensed"
                    value={formData.licensed}
                    label="Licensed"
                    onChange={handleChange}
                  >
                    <MenuItem value="yes">Yes</MenuItem>
                    <MenuItem value="no">No</MenuItem>
                  </Select>
                </FormControl>
              ) : (
                <DetailField
                  label="Licensed"
                  value={vendor.licensed === "yes" ? "Yes" : "No"}
                  chip
                  chipColor={vendor.licensed === "yes" ? "success" : "default"}
                  icon={VerifiedUserIcon}
                />
              )}
            </Grid>

            {/* License Number */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              {isEditMode ? (
                <TextField
                  fullWidth
                  label="License Number"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  variant="outlined"
                />
              ) : (
                <DetailField
                  label="License Number"
                  value={vendor.licenseNumber}
                  icon={BadgeIcon}
                />
              )}
            </Grid>
          </Grid>
        </Paper>
        {/* ================= SECTION 1: Personal & Contact Information ================= */}
        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <PersonIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Personal & Contact Information
            </Typography>
          </Stack>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={2.5}>
            {/* First Name */}
            <Grid size={{ xs: 12, sm: 6 }}>
              {isEditMode ? (
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  variant="outlined"
                />
              ) : (
                <DetailField
                  label="First Name"
                  value={vendor.firstName}
                  icon={PersonIcon}
                />
              )}
            </Grid>

            {/* Last Name */}
            <Grid size={{ xs: 12, sm: 6 }}>
              {isEditMode ? (
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  variant="outlined"
                />
              ) : (
                <DetailField
                  label="Last Name"
                  value={vendor.lastName}
                  icon={PersonIcon}
                />
              )}
            </Grid>

            {/* Email Address */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              {isEditMode ? (
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  variant="outlined"
                />
              ) : (
                <DetailField
                  label="Email Address"
                  value={vendor.email}
                  icon={EmailIcon}
                />
              )}
            </Grid>

            {/* Day Phone */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              {isEditMode ? (
                <TextField
                  fullWidth
                  label="Day Phone"
                  name="dayPhone"
                  value={formData.dayPhone}
                  onChange={handleChange}
                  variant="outlined"
                />
              ) : (
                <DetailField
                  label="Day Phone"
                  value={vendor.dayPhone}
                  icon={PhoneIcon}
                />
              )}
            </Grid>

            {/* Evening Phone */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              {isEditMode ? (
                <TextField
                  fullWidth
                  label="Evening Phone"
                  name="eveningPhone"
                  value={formData.eveningPhone}
                  onChange={handleChange}
                  variant="outlined"
                />
              ) : (
                <DetailField
                  label="Evening Phone"
                  value={vendor.eveningPhone}
                  icon={PhoneIcon}
                />
              )}
            </Grid>
          </Grid>
        </Paper>

        {/* ================= SECTION 2: Business Information ================= */}
        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <BusinessIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Business Information & Operations
            </Typography>
          </Stack>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={2.5}>
            {/* Business Name */}
            <Grid size={{ xs: 12, sm: 6 }}>
              {isEditMode ? (
                <TextField
                  fullWidth
                  label="Business Name"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  variant="outlined"
                />
              ) : (
                <DetailField
                  label="Business Name"
                  value={vendor.businessName}
                  icon={BusinessIcon}
                />
              )}
            </Grid>

            {/* Business Type */}
            <Grid size={{ xs: 12, sm: 6 }}>
              {isEditMode ? (
                <TextField
                  fullWidth
                  label="Business Type"
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  variant="outlined"
                />
              ) : (
                <DetailField
                  label="Business Type"
                  value={vendor.businessType || vendor.category}
                  icon={CategoryIcon}
                />
              )}
            </Grid>

            {/* Service Area */}
            <Grid size={{ xs: 12, sm: 6 }}>
              {isEditMode ? (
                <TextField
                  fullWidth
                  label="Service Area"
                  name="serviceArea"
                  value={formData.serviceArea}
                  onChange={handleChange}
                  variant="outlined"
                />
              ) : (
                <DetailField
                  label="Service Area"
                  value={vendor.serviceArea}
                  icon={PublicIcon}
                />
              )}
            </Grid>

            {/* Gross Sales */}
            <Grid size={{ xs: 12, sm: 6 }}>
              {isEditMode ? (
                <TextField
                  fullWidth
                  label="Gross Sales"
                  name="grossSales"
                  value={formData.grossSales}
                  onChange={handleChange}
                  variant="outlined"
                />
              ) : (
                <DetailField
                  label="Gross Sales"
                  value={vendor.grossSales}
                  icon={MonetizationOnIcon}
                />
              )}
            </Grid>

            {/* Service Details */}
            <Grid size={{ xs: 12 }}>
              {isEditMode ? (
                <TextField
                  fullWidth
                  label="Service Details"
                  name="serviceDetails"
                  value={formData.serviceDetails}
                  onChange={handleChange}
                  multiline
                  minRows={3}
                  variant="outlined"
                />
              ) : (
                <DetailField
                  label="Service Details"
                  value={vendor.serviceDetails}
                  icon={DescriptionIcon}
                />
              )}
            </Grid>
          </Grid>
        </Paper>

        {/* ================= SECTION 3: Business Address ================= */}
        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <LocationOnIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Business Address
            </Typography>
          </Stack>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={2.5}>
            {/* Street */}
            <Grid size={{ xs: 12, sm: 8 }}>
              {isEditMode ? (
                <TextField
                  fullWidth
                  label="Street Address"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  variant="outlined"
                />
              ) : (
                <DetailField
                  label="Street Address"
                  value={vendor.street}
                  icon={LocationOnIcon}
                />
              )}
            </Grid>

            {/* Street 2 */}
            <Grid size={{ xs: 12, sm: 4 }}>
              {isEditMode ? (
                <TextField
                  fullWidth
                  label="Street Address Line 2"
                  name="street2"
                  value={formData.street2}
                  onChange={handleChange}
                  variant="outlined"
                  placeholder="Suite, Apt, etc."
                />
              ) : (
                <DetailField
                  label="Street Address Line 2"
                  value={vendor.street2}
                  icon={LocationOnIcon}
                />
              )}
            </Grid>

            {/* City */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              {isEditMode ? (
                <TextField
                  fullWidth
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  variant="outlined"
                />
              ) : (
                <DetailField label="City" value={vendor.city} />
              )}
            </Grid>

            {/* State */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              {isEditMode ? (
                <TextField
                  fullWidth
                  label="State / Province"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  variant="outlined"
                />
              ) : (
                <DetailField label="State / Province" value={vendor.state} />
              )}
            </Grid>

            {/* Zip */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              {isEditMode ? (
                <TextField
                  fullWidth
                  label="ZIP / Postal Code"
                  name="zip"
                  value={formData.zip}
                  onChange={handleChange}
                  variant="outlined"
                />
              ) : (
                <DetailField label="ZIP / Postal Code" value={vendor.zip} />
              )}
            </Grid>

            {/* Country */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              {isEditMode ? (
                <TextField
                  fullWidth
                  label="Country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  variant="outlined"
                />
              ) : (
                <DetailField label="Country" value={vendor.country} />
              )}
            </Grid>
          </Grid>
        </Paper>

        {/* Bottom Save Bar (Visible Only in Edit Mode) */}
        {isEditMode && (
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 1 }}
          >
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<CloseIcon />}
              onClick={handleCancelEdit}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </Box>
        )}
      </Box>

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
