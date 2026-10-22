import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  getAllPurchaseOrders,
  getVendors,
  createPurchaseOrder,
} from "../services/AdminAPI";

import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Tooltip,
  Snackbar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const today = new Date().toISOString().split("T")[0];

const formatCurrency = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN")}`;

const ITEM_GRID = "2.2fr 0.8fr 1fr 1fr 40px";

export const AdminCreatePO = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const [form, setForm] = useState({
    vendorId: "",
    buyer: "",
    orderDate: today,
    deliveryDate: "",
    deliveryAddress: "",
    notes: "",
  });

  const [items, setItems] = useState([{ name: "", qty: "", unitPrice: "" }]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [poData, vendorData] = await Promise.all([
        getAllPurchaseOrders(),
        getVendors(),
      ]);
      setPurchaseOrders(poData || []);
      setVendors(vendorData || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch purchase orders or vendors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Only active vendors can receive new POs
  const activeVendors = useMemo(
    () => vendors.filter((v) => v.status?.toLowerCase() === "active"),
    [vendors],
  );

  // Next PO number = highest existing PO-xxxx + 1
  const nextPoNumber = useMemo(() => {
    const numbers = purchaseOrders
      .map((po) => parseInt(po.poNumber?.replace("PO-", ""), 10))
      .filter((n) => !isNaN(n));
    const max = numbers.length ? Math.max(...numbers) : 1000;
    return `PO-${max + 1}`;
  }, [purchaseOrders]);

  const grandTotal = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + (Number(item.qty) || 0) * (Number(item.unitPrice) || 0),
        0,
      ),
    [items],
  );

  const handleFormChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const addItem = () => {
    setItems((prev) => [...prev, { name: "", qty: "", unitPrice: "" }]);
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setError("");

    const validItems = items.filter(
      (item) =>
        item.name.trim() && Number(item.qty) > 0 && item.unitPrice !== "",
    );

    if (
      !form.vendorId ||
      !form.buyer.trim() ||
      !form.deliveryDate ||
      !form.deliveryAddress.trim()
    ) {
      setError(
        "Please fill vendor, buyer, delivery date and delivery address.",
      );
      return;
    }
    if (form.deliveryDate < form.orderDate) {
      setError("Delivery date cannot be before the order date.");
      return;
    }
    if (validItems.length === 0) {
      setError("Add at least one item with a name, quantity and unit price.");
      return;
    }

    const payload = {
      vendorId: form.vendorId,
      poNumber: nextPoNumber,
      buyer: form.buyer.trim(),
      orderDate: form.orderDate,
      deliveryDate: form.deliveryDate,
      deliveryAddress: form.deliveryAddress.trim(),
      amount: validItems.reduce(
        (sum, item) => sum + Number(item.qty) * Number(item.unitPrice),
        0,
      ),
      status: "pending",
      deliveryStatus: "pending",
      actualDeliveryDate: null,
      notes: form.notes.trim(),
      items: validItems.map((item) => ({
        name: item.name.trim(),
        qty: Number(item.qty),
        unitPrice: Number(item.unitPrice),
        total: Number(item.qty) * Number(item.unitPrice),
      })),
    };

    try {
      setSubmitting(true);
      await createPurchaseOrder(payload);
      setSnackbarOpen(true);
      setTimeout(() => navigate("/admin/purchase-orders"), 1500);
    } catch (err) {
      console.error(err);
      setError("Failed to create purchase order");
      setSubmitting(false);
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
        overflowX: "hidden",
      }}
    >
      {/* Fixed header */}
      <Box sx={{ flexShrink: 0 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1.5,
          }}
        >
          <IconButton
            onClick={() => navigate("/admin/purchase-orders")}
            aria-label="Back"
          >
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: "bold", fontSize: { xs: "1.5rem", sm: "2.125rem" } }}
            >
              Create Purchase Order
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              Raise a new PO and assign it to a vendor
            </Typography>
          </Box>
          <Chip label={`${nextPoNumber}`} variant="outlined" />
        </Box>
        <Divider sx={{ my: 1.5 }} />
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Scrollable form area */}
          <Box sx={{ flex: 1, overflowY: "auto", pr: 0.5 }}>
            {error && (
              <Alert
                severity="error"
                sx={{ mb: 2 }}
                onClose={() => setError("")}
              >
                {error}
              </Alert>
            )}

            {/* Order details */}
            <Paper sx={{ p: { xs: 1.5, sm: 3 }, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Order details
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 2,
                }}
              >
                <TextField
                  select
                  label="Vendor"
                  value={form.vendorId}
                  onChange={handleFormChange("vendorId")}
                  size="small"
                >
                  {activeVendors.length === 0 ? (
                    <MenuItem disabled value="">
                      No active vendors
                    </MenuItem>
                  ) : (
                    activeVendors.map((v) => (
                      <MenuItem key={v.id} value={v.id}>
                        {v.businessName}
                      </MenuItem>
                    ))
                  )}
                </TextField>

                <TextField
                  label="Buyer"
                  placeholder="e.g. Northside Supplies Co."
                  value={form.buyer}
                  onChange={handleFormChange("buyer")}
                  size="small"
                />

                <TextField
                  label="Order date"
                  type="date"
                  value={form.orderDate}
                  onChange={handleFormChange("orderDate")}
                  size="small"
                  slotProps={{ inputLabel: { shrink: true } }}
                />

                <TextField
                  label="Expected delivery date"
                  type="date"
                  value={form.deliveryDate}
                  onChange={handleFormChange("deliveryDate")}
                  size="small"
                  slotProps={{ inputLabel: { shrink: true } }}
                />

                <TextField
                  label="Delivery address"
                  placeholder="Street, city"
                  value={form.deliveryAddress}
                  onChange={handleFormChange("deliveryAddress")}
                  size="small"
                  sx={{ gridColumn: { md: "1 / -1" } }}
                />
              </Box>
            </Paper>

            {/* Items */}
            <Paper sx={{ p: { xs: 1.5, sm: 3 }, mb: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Items
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addItem}
                  sx={{ textTransform: "none" }}
                >
                  Add item
                </Button>
              </Box>

              <Box sx={{ overflowX: "auto" }}>
                <Box sx={{ minWidth: 560 }}>
                  {/* Column labels */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: ITEM_GRID,
                      gap: 1.5,
                      pb: 1,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Item name
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Qty
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Unit price (₹)
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      align="right"
                    >
                      Total
                    </Typography>
                    <span />
                  </Box>

                  {/* Item rows */}
                  {items.map((item, index) => {
                    const lineTotal =
                      (Number(item.qty) || 0) * (Number(item.unitPrice) || 0);
                    return (
                      <Box
                        key={index}
                        sx={{
                          display: "grid",
                          gridTemplateColumns: ITEM_GRID,
                          gap: 1.5,
                          alignItems: "center",
                          py: 1,
                        }}
                      >
                        <TextField
                          size="small"
                          placeholder="Item name"
                          value={item.name}
                          onChange={(e) =>
                            handleItemChange(index, "name", e.target.value)
                          }
                        />
                        <TextField
                          size="small"
                          type="number"
                          value={item.qty}
                          onChange={(e) =>
                            handleItemChange(index, "qty", e.target.value)
                          }
                          slotProps={{ htmlInput: { min: 0 } }}
                        />
                        <TextField
                          size="small"
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleItemChange(index, "unitPrice", e.target.value)
                          }
                          slotProps={{ htmlInput: { min: 0 } }}
                        />
                        <Typography align="right">
                          {formatCurrency(lineTotal)}
                        </Typography>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            aria-label="Remove item"
                            onClick={() => removeItem(index)}
                            disabled={items.length === 1}
                            toolt
                          >
                            <DeleteIcon fontSize="small" color="error" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    );
                  })}
                </Box>
              </Box>

              <Divider sx={{ my: 1.5 }} />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Typography color="text.secondary">Grand total</Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600 }}
                  color="primary"
                >
                  {formatCurrency(grandTotal)}
                </Typography>
              </Box>
            </Paper>

            {/* Notes */}
            <Paper sx={{ p: { xs: 1.5, sm: 3 }, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
                Notes{" "}
                <Typography
                  component="span"
                  variant="caption"
                  color="text.secondary"
                >
                  (optional)
                </Typography>
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Special delivery instructions for the vendor"
                value={form.notes}
                onChange={handleFormChange("notes")}
              />
            </Paper>
          </Box>

          {/* Fixed footer actions */}
          <Box
            sx={{
              flexShrink: 0,
              display: "flex",
              justifyContent: "flex-end",
              gap: 1.5,
              pt: 2,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Button
              variant="outlined"
              onClick={() => navigate("/admin/purchase-orders")}
              disabled={submitting}
              sx={{ textTransform: "none" }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={submitting}
              sx={{ textTransform: "none" }}
            >
              {submitting ? "Creating..." : "Create PO"}
            </Button>
          </Box>
        </>
      )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={1500}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert severity="success" variant="filled" sx={{ width: "100%" }}>
          Purchase order {nextPoNumber} created successfully
        </Alert>
      </Snackbar>
    </Box>
  );
};
