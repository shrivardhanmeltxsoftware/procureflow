import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import {
  getPurchaseOrderById,
  getVendors,
  updatePurchaseOrder,
} from "../services/AdminAPI";

import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { formatDate } from "../utils/dateUtils";

const STATUS_COLOR = {
  accepted: "info",
  pending: "warning",
  completed: "success",
  rejected: "error",
};

const DELIVERY_COLOR = {
  shipped: "info",
  pending: "warning",
  delivered: "success",
  delayed: "error",
};

const ITEM_GRID = "2.2fr 0.8fr 1fr 1fr 40px";

const formatCurrency = (amount) =>
  amount === null || amount === undefined
    ? "N/A"
    : `₹${Number(amount).toLocaleString("en-IN")}`;

// Converts saved items into the string-based shape the edit inputs use
const toEditItems = (items) =>
  Array.isArray(items) && items.length > 0
    ? items.map((i) => ({
        name: i.name || "",
        qty: String(i.qty ?? ""),
        unitPrice: String(i.unitPrice ?? ""),
      }))
    : [{ name: "", qty: "", unitPrice: "" }];

const toEditForm = (po) => ({
  buyer: po.buyer || "",
  deliveryDate: po.deliveryDate || "",
  deliveryAddress: po.deliveryAddress || "",
  notes: po.notes || "",
});

// Small label + value pair used in view mode
const Field = ({ label, children }) => (
  <Box>
    <Typography variant="caption" color="text.secondary" display="block">
      {label}
    </Typography>
    <Box sx={{ fontWeight: 500, mt: 0.25 }}>{children}</Box>
  </Box>
);

export const AdminPODetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [po, setPo] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const [form, setForm] = useState({
    buyer: "",
    deliveryDate: "",
    deliveryAddress: "",
    notes: "",
  });
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const [poData, vendorData] = await Promise.all([
          getPurchaseOrderById(id),
          getVendors(),
        ]);
        setPo(poData);
        setVendors(vendorData || []);
        setForm(toEditForm(poData));
        setItems(toEditItems(poData.items));
      } catch (err) {
        console.error(err);
        setLoadError("Purchase order not found or failed to load");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const vendorName = useMemo(() => {
    if (!po) return "N/A";
    const vendor = vendors.find((v) => String(v.id) === String(po.vendorId));
    return vendor?.businessName || "N/A";
  }, [po, vendors]);

  // Edit mode is allowed only while the vendor has not responded yet
  const isPending = po?.status?.toLowerCase() === "pending";
  const requestedEdit = searchParams.get("mode") === "edit";
  const isEditMode = requestedEdit && isPending;

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

  const addItem = () =>
    setItems((prev) => [...prev, { name: "", qty: "", unitPrice: "" }]);

  const removeItem = (index) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  const startEdit = () => setSearchParams({ mode: "edit" });

  const cancelEdit = () => {
    setForm(toEditForm(po));
    setItems(toEditItems(po.items));
    setFormError("");
    setSearchParams({ mode: "view" });
  };

  const handleSave = async () => {
    setFormError("");

    const validItems = items.filter(
      (item) =>
        item.name.trim() && Number(item.qty) > 0 && item.unitPrice !== "",
    );

    if (
      !form.buyer.trim() ||
      !form.deliveryDate ||
      !form.deliveryAddress.trim()
    ) {
      setFormError("Please fill buyer, delivery date and delivery address.");
      return;
    }
    if (form.deliveryDate < po.orderDate) {
      setFormError("Delivery date cannot be before the order date.");
      return;
    }
    if (validItems.length === 0) {
      setFormError(
        "Add at least one item with a name, quantity and unit price.",
      );
      return;
    }

    const payload = {
      buyer: form.buyer.trim(),
      deliveryDate: form.deliveryDate,
      deliveryAddress: form.deliveryAddress.trim(),
      notes: form.notes.trim(),
      amount: validItems.reduce(
        (sum, item) => sum + Number(item.qty) * Number(item.unitPrice),
        0,
      ),
      items: validItems.map((item) => ({
        name: item.name.trim(),
        qty: Number(item.qty),
        unitPrice: Number(item.unitPrice),
        total: Number(item.qty) * Number(item.unitPrice),
      })),
    };

    try {
      setSaving(true);
      const updated = await updatePurchaseOrder(id, payload);
      setPo(updated);
      setForm(toEditForm(updated));
      setItems(toEditItems(updated.items));
      setSearchParams({ mode: "view" });
      setSnackbar({
        open: true,
        message: `Purchase order ${updated.poNumber} updated successfully`,
      });
    } catch (err) {
      console.error(err);
      setFormError("Failed to update purchase order");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (loadError) {
    return (
      <Box>
        <Typography color="error" sx={{ mb: 2 }}>
          {loadError}
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate("/admin/purchase-orders")}
        >
          Back to Purchase Orders
        </Button>
      </Box>
    );
  }

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
      {/* Fixed header */}
      <Box sx={{ flexShrink: 0 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flexWrap: "wrap",
          }}
        >
          <IconButton
            onClick={() => navigate("/admin/purchase-orders")}
            aria-label="Back"
          >
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              {po.poNumber}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              {isEditMode ? "Editing purchase order" : "Purchase order details"}
            </Typography>
          </Box>
          <Chip
            label={po.status || "pending"}
            color={STATUS_COLOR[po.status?.toLowerCase()] || "warning"}
            sx={{ textTransform: "capitalize" }}
          />
          <Chip
            label={`Delivery: ${po.deliveryStatus || "N/A"}`}
            color={
              DELIVERY_COLOR[po.deliveryStatus?.toLowerCase()] || "default"
            }
            variant="outlined"
            sx={{ textTransform: "capitalize" }}
          />
          {!isEditMode && isPending && (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={startEdit}
              sx={{ textTransform: "none" }}
            >
              Edit
            </Button>
          )}
        </Box>
        <Divider sx={{ my: 1.5 }} />
      </Box>

      {/* Scrollable body */}
      <Box sx={{ flex: 1, overflowY: "auto", pr: 0.5 }}>
        {requestedEdit && !isPending && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Only pending purchase orders can be edited. Showing details in view
            mode.
          </Alert>
        )}
        {formError && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            onClose={() => setFormError("")}
          >
            {formError}
          </Alert>
        )}

        {/* Order details */}
        <Paper sx={{ p: 3, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Order details
          </Typography>

          {isEditMode ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 2,
              }}
            >
              <TextField
                label="Vendor"
                value={vendorName}
                size="small"
                disabled
              />
              <TextField
                label="Buyer"
                value={form.buyer}
                onChange={handleFormChange("buyer")}
                size="small"
              />
              <TextField
                label="Order date"
                type="date"
                value={po.orderDate || ""}
                size="small"
                disabled
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
                value={form.deliveryAddress}
                onChange={handleFormChange("deliveryAddress")}
                size="small"
                sx={{ gridColumn: { md: "1 / -1" } }}
              />
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 2.5,
              }}
            >
              <Field label="Vendor">{vendorName}</Field>
              <Field label="Buyer">{po.buyer || "N/A"}</Field>
              <Field label="Order date">{formatDate(po.orderDate)}</Field>
              <Field label="Expected delivery date">
                {formatDate(po.deliveryDate)}
              </Field>
              <Field label="Actual delivery date">
                {po.actualDeliveryDate
                  ? formatDate(po.actualDeliveryDate)
                  : "Not delivered yet"}
              </Field>
              <Field label="Delivery address">
                {po.deliveryAddress || "N/A"}
              </Field>
            </Box>
          )}
        </Paper>

        {/* Items */}
        <Paper sx={{ p: 3, mb: 2 }}>
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
            {isEditMode && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addItem}
                sx={{ textTransform: "none" }}
              >
                Add item
              </Button>
            )}
          </Box>

          {isEditMode ? (
            <>
              <Box sx={{ overflowX: "auto" }}>
                <Box sx={{ minWidth: 560 }}>
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
            </>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell align="center">Qty</TableCell>
                    <TableCell align="right">Unit price</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(po.items || []).map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell align="center">{item.qty}</TableCell>
                      <TableCell align="right">
                        {formatCurrency(item.unitPrice)}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(item.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3} sx={{ fontWeight: 600 }}>
                      Total amount
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {formatCurrency(po.amount)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* Notes */}
        <Paper sx={{ p: 3, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
            Notes
          </Typography>
          {isEditMode ? (
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Special delivery instructions for the vendor"
              value={form.notes}
              onChange={handleFormChange("notes")}
            />
          ) : (
            <Typography color={po.notes ? "text.primary" : "text.secondary"}>
              {po.notes || "No notes added."}
            </Typography>
          )}
        </Paper>
      </Box>

      {/* Fixed footer — edit mode only */}
      {isEditMode && (
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
            onClick={cancelEdit}
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
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </Box>
      )}

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
