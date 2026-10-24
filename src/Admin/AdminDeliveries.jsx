import { useState, useEffect } from "react";
import {
  getAllPurchaseOrders,
  getVendors,
  updatePurchaseOrder,
} from "../services/AdminAPI";

import {
  Box,
  Typography,
  Divider,
  Button,
  Chip,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { formatDate } from "../utils/dateUtils";
import { DataTable } from "../components/DataTable";
import {
  DELIVERY_STATUS_COLOR,
  getStatusColor,
} from "../constants/statusColors";
import { LoadingState } from "../components/common/LoadingState";
import { ErrorState } from "../components/common/ErrorState";
import EmptyState from "../components/common/EmptyState";

const DELIVERY_OPTIONS = ["pending", "shipped", "delivered", "delayed"];

const today = new Date().toISOString().split("T")[0];

export const AdminDeliveries = () => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [vendors, setVendors] = useState([]);

  // update dialog state
  const [selectedPo, setSelectedPo] = useState(null);
  const [deliveryStatus, setDeliveryStatus] = useState("pending");
  const [actualDate, setActualDate] = useState("");
  const [dialogError, setDialogError] = useState("");
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const loadData = () =>
    Promise.all([getAllPurchaseOrders(), getVendors()]);

  const fetchData = async () => {
    try {
      const [poData, vendorData] = await loadData();
      setError("");
      setPurchaseOrders(poData || []);
      setVendors(vendorData || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch deliveries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      try {
        const [poData, vendorData] = await loadData();
        if (!cancelled) {
          setPurchaseOrders(poData || []);
          setVendors(vendorData || []);
          setError("");
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Failed to fetch deliveries");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  const retryFetchData = () => {
    setLoading(true);
    setError("");
    fetchData();
  };

  const columns = [
    {
      key: "poNumber",
      label: "PO Number",
      render: (po) => po.poNumber || "N/A",
    },
    {
      key: "vendorName",
      label: "Vendor Name",
      render: (po) => vendorMap[String(po.vendorId)] || "N/A",
    },
    {
      key: "productService",
      label: "Product / Service",
      render: (po) =>
        Array.isArray(po.items) && po.items.length > 0
          ? po.items.map((item) => item.name).join(", ")
          : "N/A",
    },
    {
      key: "deliveryDate",
      label: "Expected Delivery",
      render: (po) => formatDate(po.deliveryDate),
    },
    {
      key: "actualDeliveryDate",
      label: "Actual Delivery",
      render: (po) => formatDate(po.actualDeliveryDate),
    },
    {
      key: "deliveryStatus",
      label: "Delivery Status",
      render: (po) => (
        <Chip
          label={po.deliveryStatus || "N/A"}
          color={getStatusColor(DELIVERY_STATUS_COLOR, po.deliveryStatus)}
          size="small"
          sx={{ textTransform: "capitalize" }}
        />
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "center",
      sticky: true,
      render: (po) => (
        <Button
          size="small"
          variant="outlined"
          startIcon={<LocalShippingIcon fontSize="small" />}
          onClick={() => openDialog(po)}
          sx={{ textTransform: "none" }}
        >
          Update status
        </Button>
      ),
    },
  ];

  const vendorMap = vendors.reduce((acc, vendor) => {
    acc[String(vendor.id ?? vendor._id)] = vendor.businessName || "N/A";
    return acc;
  }, {});

  // Deliveries = POs the vendor has accepted (or that are already completed)
  const hasAcceptedPurchaseOrders = purchaseOrders.some((po) =>
    ["accepted", "completed"].includes(po.status?.toLowerCase()),
  );
  const filteredDeliveries = purchaseOrders
    .filter((po) =>
      ["accepted", "completed"].includes(po.status?.toLowerCase()),
    )
    .filter((po) => {
      const matchesFilter =
        filter === "all" || po.deliveryStatus?.toLowerCase() === filter;

      const vendorName = vendorMap[String(po.vendorId)] || "";
      const matchesSearch =
        !search ||
        po.poNumber?.toLowerCase().includes(search.toLowerCase()) ||
        vendorName.toLowerCase().includes(search.toLowerCase());

      return matchesFilter && matchesSearch;
    });

  const openDialog = (po) => {
    setSelectedPo(po);
    setDeliveryStatus(po.deliveryStatus?.toLowerCase() || "pending");
    setActualDate(po.actualDeliveryDate || "");
    setDialogError("");
  };

  const closeDialog = () => {
    if (saving) return;
    setSelectedPo(null);
  };

  const handleStatusChange = (e) => {
    const value = e.target.value;
    setDeliveryStatus(value);
    // when marking delivered, default the actual date to today
    if (value === "delivered" && !actualDate) setActualDate(today);
  };

  const handleSave = async () => {
    setDialogError("");

    if (deliveryStatus === "delivered") {
      if (!actualDate) {
        setDialogError("Please enter the actual delivery date.");
        return;
      }
      if (actualDate < selectedPo.orderDate) {
        setDialogError("Actual delivery date cannot be before the order date.");
        return;
      }
    }

    // delivered -> PO is completed; anything else -> PO stays accepted
    const payload =
      deliveryStatus === "delivered"
        ? {
            deliveryStatus,
            actualDeliveryDate: actualDate,
            status: "completed",
          }
        : { deliveryStatus, actualDeliveryDate: null, status: "accepted" };

    try {
      setSaving(true);
      const updated = await updatePurchaseOrder(
        selectedPo.id ?? selectedPo._id,
        payload,
      );
      setPurchaseOrders((prev) =>
        prev.map((po) =>
          (po.id ?? po._id) === (updated.id ?? updated._id) ? updated : po,
        ),
      );
      setSnackbar({
        open: true,
        message: `Delivery status for ${updated.poNumber} updated`,
      });
      setSelectedPo(null);
    } catch (err) {
      console.error(err);
      setDialogError("Failed to update delivery status");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        minWidth: 0,
      }}
    >
      {/* Fixed header */}
      <Box sx={{ flexShrink: 0 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", md: "center" },
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              Deliveries
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              Track and update delivery status of accepted purchase orders
            </Typography>
          </Box>

          <TextField
            placeholder="Search PO number or vendor"
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: { xs: "100%", sm: 380 }, maxWidth: "100%" }}
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
                        "& .MuiSelect-select": { py: 0, pr: "20px !important" },
                      }}
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="shipped">Shipped</MenuItem>
                      <MenuItem value="delivered">Delivered</MenuItem>
                      <MenuItem value="delayed">Delayed</MenuItem>
                    </Select>
                    <Divider
                      orientation="vertical"
                      flexItem
                      sx={{ ml: 1, height: 20 }}
                    />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon
                      fontSize="small"
                      sx={{ color: "text.secondary" }}
                    />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>
        <Divider sx={{ my: 2 }} />
      </Box>

      {/* Scrollable table */}
      {loading ? (
        <LoadingState message="Loading deliveries..." />
      ) : error ? (
        <ErrorState message={error} onRetry={retryFetchData} />
      ) : filteredDeliveries.length === 0 ? (
        !hasAcceptedPurchaseOrders ? (
          <EmptyState
            title="No deliveries yet"
            description="Deliveries will appear here for accepted purchase orders."
          />
        ) : (
          <EmptyState
            title="No deliveries match your search or filter"
            description="Try changing or clearing your search and filter."
            actionLabel="Clear filters"
            onAction={() => {
              setSearch("");
              setFilter("all");
            }}
          />
        )
      ) : (
        <DataTable columns={columns} rows={filteredDeliveries} />
      )}

      {/* Update status dialog */}
      <Dialog open={!!selectedPo} onClose={closeDialog} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>
          Update delivery · {selectedPo?.poNumber}
        </DialogTitle>
        <DialogContent>
          {dialogError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {dialogError}
            </Alert>
          )}

          <TextField
            select
            fullWidth
            label="Delivery status"
            value={deliveryStatus}
            onChange={handleStatusChange}
            size="small"
            sx={{ mt: 1 }}
          >
            {DELIVERY_OPTIONS.map((option) => (
              <MenuItem
                key={option}
                value={option}
                sx={{ textTransform: "capitalize" }}
              >
                {option}
              </MenuItem>
            ))}
          </TextField>

          {deliveryStatus === "delivered" && (
            <TextField
              fullWidth
              label="Actual delivery date"
              type="date"
              value={actualDate}
              onChange={(e) => setActualDate(e.target.value)}
              size="small"
              sx={{ mt: 2 }}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={closeDialog}
            disabled={saving}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            sx={{ textTransform: "none" }}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert severity="success" variant="filled" sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
