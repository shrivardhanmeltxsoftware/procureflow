import { useEffect, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  TextField,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Select,
  MenuItem,
  InputAdornment,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import { getAllInvoices, updateInvoiceStatus } from "../services/AdminAPI";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { formatDate } from "../utils/dateUtils";
import { DataTable } from "../components/DataTable";

const STATUS_COLOR = {
  approved: "success",
  pending: "warning",
  rejected: "error",
};

export const AdminInvoices = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [invoices, setInvoices] = useState([]);
  const [selectedMetadata, setSelectedMetadata] = useState(null);

  const fetchInvoices = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAllInvoices();
      setInvoices(data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const columns = [
    {
      key: "invoiceNumber",
      label: "Invoice",
      align: "center",
      render: (invoice) => invoice.invoiceNumber || "N/A",
    },
    {
      key: "poNumber",
      label: "PO Number",
      align: "center",
      render: (invoice) => invoice.poNumber || "N/A",
    },
    {
      key: "amount",
      label: "Amount",
      align: "center",
      render: (invoice) =>
        invoice.amount === null || invoice.amount === undefined
          ? "N/A"
          : `₹${invoice.amount}`,
    },
    {
      key: "fileName",
      label: "File Name",
      align: "center",
      render: (invoice) => invoice.fileName || "N/A",
    },
    {
      key: "uploadedDate",
      label: "Uploaded Date",
      align: "center",
      render: (invoice) => formatDate(invoice.uploadedDate),
    },
    {
      key: "status",
      label: "Status",
      align: "center",
      render: (invoice) => {
        const status = invoice.status?.toLowerCase() || "pending";

        return (
          <Chip
            label={status}
            color={STATUS_COLOR[status] || "warning"}
            size="small"
            sx={{ textTransform: "capitalize" }}
          />
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      align: "center",
      sticky: true,
      render: (invoice) => (
        <Stack direction="row" spacing={1} justifyContent="center">
          <Tooltip title="View">
            <IconButton
              aria-label={`View ${invoice.invoiceNumber || "invoice"}`}
              onClick={() => handleView(invoice)}
            >
              <VisibilityIcon color="primary" fontSize="medium" />
            </IconButton>
          </Tooltip>

          {invoice.status?.toLowerCase() !== "approved" && (
            <Tooltip title="Approve">
              <IconButton
                aria-label={`Approve ${invoice.invoiceNumber || "invoice"}`}
                onClick={() => handleStatusUpdate(invoice.id, "approved")}
              >
                <CheckCircleIcon color="success" fontSize="medium" />
              </IconButton>
            </Tooltip>
          )}

          {invoice.status?.toLowerCase() !== "rejected" && (
            <Tooltip title="Reject">
              <IconButton
                aria-label={`Reject ${invoice.invoiceNumber || "invoice"}`}
                onClick={() => handleStatusUpdate(invoice.id, "rejected")}
              >
                <CancelIcon color="error" fontSize="medium" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      ),
    },
  ];

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const invoice = invoices.find((item) => item.id === id);
      const paymentFields =
        newStatus.toLowerCase() === "approved" &&
        invoice?.paymentStatus?.toLowerCase() !== "paid"
          ? { paymentStatus: "pending", paymentDate: null }
          : {};

      await updateInvoiceStatus(id, newStatus, paymentFields);
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === id ? { ...inv, status: newStatus, ...paymentFields } : inv,
        ),
      );
    } catch (err) {
      console.error("Error updating invoice status:", err);
    }
  };

  const handleView = (invoice) => {
    if (invoice?.fileData) {
      window.open(invoice.fileData, "_blank");
    } else {
      // Fall back to showing the metadata-only card instead of crashing
      setSelectedMetadata(invoice);
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesStatus = filter === "all" || inv.status === filter;
    const matchesSearch =
      !search ||
      inv.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
      inv.poNumber?.toLowerCase().includes(search.toLowerCase()) ||
      inv.status?.toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesSearch;
  });

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
      <Box sx={{ flexShrink: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              Invoices
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              Review vendor invoices and approve or reject them
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
              placeholder="Search invoices"
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
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="approved">Approved</MenuItem>
                        <MenuItem value="rejected">Rejected</MenuItem>
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
          </Box>
        </Box>
        <Divider sx={{ mt: 2, mb: 3 }} />
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ mt: 3 }}>
          {error}
        </Typography>
      ) : filteredInvoices.length === 0 ? (
        <Typography color="text.secondary" sx={{ mt: 3 }}>
          No invoices found.
        </Typography>
      ) : (
        <DataTable columns={columns} rows={filteredInvoices} />
      )}

      {/* Metadata Fallback Dialog for records without fileData */}
      <Dialog
        open={Boolean(selectedMetadata)}
        onClose={() => setSelectedMetadata(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>Invoice Metadata</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            This invoice was uploaded before real file storage was enabled. Only
            metadata is available.
          </Alert>
          <Stack spacing={1.5}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                INVOICE NUMBER
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {selectedMetadata?.invoiceNumber || "N/A"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                PO NUMBER
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {selectedMetadata?.poNumber || "N/A"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                FILE NAME
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {selectedMetadata?.fileName || "N/A"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                FILE SIZE
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {selectedMetadata?.fileSize
                  ? typeof selectedMetadata.fileSize === "number"
                    ? `${Math.round(selectedMetadata.fileSize / 1024)} KB`
                    : selectedMetadata.fileSize
                  : "N/A"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                AMOUNT
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                ₹{selectedMetadata?.amount || "0"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                UPLOADED DATE
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {formatDate(selectedMetadata?.uploadedDate)}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setSelectedMetadata(null)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
