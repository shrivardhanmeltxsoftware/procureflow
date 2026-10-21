import {
  Box,
  Stack,
  Typography,
  Divider,
  Button,
  Chip,
  CircularProgress,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
} from "@mui/material";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import { useState, useEffect } from "react";
import { formatDate } from "../utils/dateUtils";
import { useNavigate } from "react-router";

import {
  deleteVendor,
  getVendors,
  updateVendorStatus,
} from "../services/AdminAPI";
import { DataTable } from "../components/DataTable";
import {
  getStatusColor,
  VENDOR_STATUS_COLOR,
} from "../constants/statusColors";

export const AdminVendors = () => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [allVendors, setAllVendors] = useState([]);
  const [vendorToDelete, setVendorToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchAllVendors = async () => {
    setLoading(true);
    setError("");
    try {
      const vendors = await getVendors();
      setAllVendors(vendors);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch vendors");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: "id", label: "Vendor ID" },
    {
      key: "name",
      label: "Vendor Name",
      render: (vendor) =>
        `${vendor.firstName || ""} ${vendor.lastName || ""}`.trim(),
    },
    { key: "email", label: "Email" },
    { key: "dayPhone", label: "Phone" },
    { key: "businessName", label: "Company" },
    {
      key: "category",
      label: "Category",
      render: (vendor) => vendor.category || vendor.businessType,
    },
    {
      key: "status",
      label: "Status",
      render: (vendor) => (
        <Chip
          label={vendor.status || "pending"}
          color={getStatusColor(VENDOR_STATUS_COLOR, vendor.status, "warning")}
          size="small"
          sx={{ textTransform: "capitalize" }}
        />
      ),
    },
    {
      key: "createdAt",
      label: "Registered Date",
      render: (vendor) => formatDate(vendor.createdAt),
    },
    {
      key: "actions",
      label: "Actions",
      align: "center",
      sticky: true,
      render: (vendor) => (
        <Stack direction="row" spacing={1} justifyContent="center">
          <Tooltip title="View">
            <IconButton
              color="primary"
              aria-label="View vendor"
              onClick={() => navigate(`/admin/vendors/${vendor.id}?mode=view`)}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Edit">
            <IconButton
              color="primary"
              aria-label="Edit vendor"
              onClick={() => navigate(`/admin/vendors/${vendor.id}?mode=edit`)}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete">
            <IconButton
              color="error"
              aria-label="Delete vendor"
              onClick={() => handleDeleteClick(vendor)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>

          {vendor.status?.toLowerCase() === "active" ? (
            <Tooltip title="Deactivate">
              <IconButton
                color="success"
                aria-label="Deactivate vendor"
                onClick={() => handleToggleStatus(vendor)}
              >
                <ToggleOnIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Activate">
              <IconButton
                color="default"
                aria-label="Activate vendor"
                onClick={() => handleToggleStatus(vendor)}
              >
                <ToggleOffIcon />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      ),
    },
  ];
  const filteredVendors = allVendors.filter((v) => {
    const matchesStatus = filter === "all" || v.status === filter;
    const matchesSearch =
      !search ||
      v.businessName?.toLowerCase().includes(search.toLowerCase()) ||
      v.email?.toLowerCase().includes(search.toLowerCase()) ||
      v.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      v.lastName?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  useEffect(() => {
    fetchAllVendors();
  }, []);

  const handleConfirmDelete = async () => {
    try {
      await deleteVendor(vendorToDelete.id);

      setAllVendors((prevVendors) =>
        prevVendors.filter((vendor) => vendor.id !== vendorToDelete.id),
      );

      setDeleteDialogOpen(false);
      setVendorToDelete(null);
    } catch (error) {
      console.error("Failed to delete vendor:", error);
    }
  };

  const handleDeleteClick = (vendor) => {
    setVendorToDelete(vendor);
    setDeleteDialogOpen(true);
  };

  const handleToggleStatus = async (vendor) => {
    const newStatus = vendor.status === "active" ? "inactive" : "active";

    try {
      await updateVendorStatus(vendor.id, newStatus);

      setAllVendors((prevVendors) =>
        prevVendors.map((v) =>
          v.id === vendor.id ? { ...v, status: newStatus } : v,
        ),
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        overflow: "hidden",
      }}
    >
      {/* Fixed Header Section */}
      <Box sx={{ flexShrink: 0 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              Vendors
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              Track and update delivery status of accepted purchase orders
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexGrow: 1,
              justifyContent: "flex-end",
            }}
          >
            <TextField
              placeholder="Search vendor"
              variant="outlined"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ width: 380 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start" sx={{ mr: 1 }}>
                      <Select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        variant="standard"
                        disableUnderline
                        sx={{
                          fontSize: "0.875rem",
                          color: "text.secondary",
                          fontWeight: 500,
                          "& .MuiSelect-select": {
                            py: 0,
                            pr: "20px !important",
                          },
                        }}
                      >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                      </Select>
                      <Divider
                        orientation="vertical"
                        flexItem
                        sx={{ ml: 1, height: 20 }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Button
              variant="contained"
              color="primary"
              startIcon={<AddBusinessIcon />}
              sx={{ textTransform: "none", whiteSpace: "nowrap" }}
              onClick={() => navigate("/admin/addVendor")}
            >
              Add vendor
            </Button>
          </Box>
        </Box>
        <Divider sx={{ my: 2 }} />
      </Box>

      {/* Scrollable Table Section */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ mt: 3 }}>
          {error}
        </Typography>
      ) : filteredVendors.length === 0 ? (
        <Typography color="text.secondary" sx={{ mt: 3 }}>
          No vendors found.
        </Typography>
      ) : (
        <DataTable columns={columns} rows={filteredVendors} />
      )}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Vendor?</DialogTitle>

        <DialogContent>
          Are you sure you want to delete{" "}
          <strong>{vendorToDelete?.businessName}</strong>? This action cannot be
          undone.
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
            Cancel
          </Button>

          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
