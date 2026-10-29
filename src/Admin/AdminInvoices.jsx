import { useEffect, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  Button,
  Chip,
  Alert,
  Divider,
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
import {
  getStatusColor,
  INVOICE_STATUS_COLOR,
} from "../constants/statusColors";
import { LoadingState } from "../components/common/LoadingState";
import { ErrorState } from "../components/common/ErrorState";
import EmptyState from "../components/common/EmptyState";
import SearchFilterBar from "../components/common/SearchFilterBar";

export const AdminInvoices = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [invoices, setInvoices] = useState([]);
  const [selectedMetadata, setSelectedMetadata] = useState(null);

  const loadInvoices = () => getAllInvoices();

  const fetchInvoices = async () => {
    try {
      const data = await loadInvoices();
      setError("");
      setInvoices(data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const loadInitialInvoices = async () => {
      try {
        const data = await loadInvoices();
        if (!cancelled) {
          setInvoices(data || []);
          setError("");
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Failed to fetch invoices");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadInitialInvoices();
    return () => {
      cancelled = true;
    };
  }, []);

  const retryFetchInvoices = () => {
    setLoading(true);
    setError("");
    fetchInvoices();
  };

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
            color={getStatusColor(INVOICE_STATUS_COLOR, status, "warning")}
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
        <Stack direction="row" spacing={1} justifycontent="center" alignItems='
        ' >
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
    setActionError("");
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
      setActionError(
        `Could not ${newStatus === "approved" ? "approve" : "reject"} this invoice. Please try again.`,
      );
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
        minWidth: 0,
      }}
    >
      <Box sx={{ flexShrink: 0 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "stretch", md: "center" },
            gap: 2,
          }}
        >
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
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              gap: 2,
              flexGrow: 1,
              minWidth: 0,
              justifyContent: "flex-end",
            }}
          >
            <SearchFilterBar
              searchValue={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search invoices"
              status={filter}
              onStatusChange={setFilter}
              statusOptions={[
                { label: "All", value: "all" },
                { label: "Pending", value: "pending" },
                { label: "Approved", value: "approved" },
                { label: "Rejected", value: "rejected" },
              ]}
            />
          </Box>
        </Box>
        <Divider sx={{ mt: 2, mb: 3 }} />
      </Box>

      {actionError && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setActionError("")}
        >
          {actionError}
        </Alert>
      )}

      {loading ? (
        <LoadingState message="Loading invoices..." />
      ) : error ? (
        <ErrorState message={error} onRetry={retryFetchInvoices} />
      ) : filteredInvoices.length === 0 ? (
        invoices.length === 0 ? (
          <EmptyState
            title="No invoices yet"
            description="Vendor-submitted invoices will appear here."
          />
        ) : (
          <EmptyState
            title="No invoices match your search or filter"
            description="Try changing or clearing your search and filter."
            actionLabel="Clear filters"
            onAction={() => {
              setSearch("");
              setFilter("all");
            }}
          />
        )
      ) : (
        <DataTable columns={columns} rows={filteredInvoices} />
      )}

      {/* Metadata Fallback Dialog for records without fileData */}
      <Dialog
        open={Boolean(selectedMetadata)}
        onClose={() => setSelectedMetadata(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
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
