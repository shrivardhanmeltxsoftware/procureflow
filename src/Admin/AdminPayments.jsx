import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Divider,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PaymentIcon from "@mui/icons-material/Payment";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { formatDate } from "../utils/dateUtils";
import {
  getAllInvoices,
  getAllPurchaseOrders,
  getVendors,
  updatePaymentStatus,
} from "../services/AdminAPI";
import { DataTable } from "../components/DataTable";
import {
  getStatusColor,
  PAYMENT_STATUS_COLOR,
} from "../constants/statusColors";
import { LoadingState } from "../components/common/LoadingState";
import { ErrorState } from "../components/common/ErrorState";
import EmptyState from "../components/common/EmptyState";

const formatCurrency = (amount) => {
  const numericAmount = Number(amount);
  if (
    amount === null ||
    amount === undefined ||
    !Number.isFinite(numericAmount)
  ) {
    return "N/A";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
};

const getPaymentStatus = (invoice) =>
  invoice.paymentStatus?.toLowerCase() || "pending";

const getLocalDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const SummaryCard = ({ title, value, icon, currency = false }) => (
  <Paper
    elevation={1}
    sx={{
      p: 2.5,
      minWidth: 0,
      height: "100%",
      border: 1,
      borderColor: "divider",
      borderRadius: 3,
    }}
  >
    <Stack direction="row" alignitems="flex-start" spacing={1.5}>
      {icon && (
        <Box sx={{ display: "flex", alignItems: "center", color: "primary.main" }}>
          {icon}
        </Box>
      )}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography color="text.secondary" variant="body1">
          {title}
        </Typography>

        <Typography variant="h4" sx={{ mt: 1, fontWeight: 500 }}>
          {currency ? formatCurrency(value) : value}
        </Typography>
      </Box>
    </Stack>
  </Paper>
);

const DetailRow = ({ label, value }) => (
  <Stack
    direction={{ xs: "column", sm: "row" }}
    spacing={{ xs: 0.25, sm: 2 }}
    sx={{ py: 1, borderBottom: 1, borderColor: "divider" }}
  >
    <Typography color="text.secondary" variant="body2" sx={{ flex: 1 }}>
      {label}
    </Typography>
    <Typography
      variant="body2"
      fontWeight={600}
      sx={{ flex: 1, overflowWrap: "anywhere" }}
    >
      {value || "N/A"}
    </Typography>
  </Stack>
);

export const AdminPayments = () => {
  const [invoices, setInvoices] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentTarget, setPaymentTarget] = useState(null);
  const [updatingPayment, setUpdatingPayment] = useState(false);

  const loadPaymentData = () =>
    Promise.all([getAllInvoices(), getVendors(), getAllPurchaseOrders()]);

  const fetchData = async () => {
    try {
      const [invoiceData, vendorData, purchaseOrderData] =
        await loadPaymentData();

      setInvoices(invoiceData);
      setVendors(vendorData);
      setPurchaseOrders(purchaseOrderData);
      setError("");
    } catch (fetchError) {
      console.error("Failed to fetch payment data:", fetchError);
      setError("Failed to load payment data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [invoiceData, vendorData, purchaseOrderData] =
          await loadPaymentData();
        if (!cancelled) {
          setInvoices(invoiceData);
          setVendors(vendorData);
          setPurchaseOrders(purchaseOrderData);
          setError("");
        }
      } catch (fetchError) {
        console.error("Failed to fetch payment data:", fetchError);
        if (!cancelled) {
          setError("Failed to load payment data. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
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
      key: "invoiceNumber",
      label: "Invoice Number",
      render: (invoice) => invoice.invoiceNumber || "N/A",
    },
    {
      key: "poNumber",
      label: "PO Number",
      render: (invoice) => getInvoiceDetails(invoice).poNumber,
    },
    {
      key: "vendorName",
      label: "Vendor Name",
      render: (invoice) => getInvoiceDetails(invoice).vendorName,
    },
    {
      key: "amount",
      label: "Invoice Amount",
      render: (invoice) => formatCurrency(invoice.amount),
    },
    {
      key: "invoiceDate",
      label: "Invoice Date",
      render: (invoice) => formatDate(getInvoiceDetails(invoice).invoiceDate),
    },
    {
      key: "dueDate",
      label: "Due Date",
      render: (invoice) => formatDate(getInvoiceDetails(invoice).dueDate),
    },
    {
      key: "paymentStatus",
      label: "Payment Status",
      render: (invoice) => renderPaymentStatus(invoice),
    },
    {
      key: "paymentDate",
      label: "Payment Date",
      render: (invoice) => formatDate(invoice.paymentDate),
    },
    {
      key: "actions",
      label: "Actions",
      sticky: true,
      render: (invoice) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title="View payment details">
            <IconButton
              aria-label={`View ${invoice.invoiceNumber || "invoice"} details`}
              onClick={() => setSelectedInvoice(invoice)}
              size="small"
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {getPaymentStatus(invoice) === "pending" && (
            <Button
              size="small"
              variant="contained"
              startIcon={<PaymentIcon />}
              onClick={() => {
                setPaymentTarget(invoice);
                setUpdateError("");
              }}
              sx={{ whiteSpace: "nowrap" }}
            >
              Mark as Paid
            </Button>
          )}
        </Stack>
      ),
    },
  ];

  const vendorMap = useMemo(
    () =>
      new Map(
        vendors.map((vendor) => [
          String(vendor.id ?? vendor._id),
          vendor.businessName || "N/A",
        ]),
      ),
    [vendors],
  );

  const purchaseOrderMap = useMemo(
    () =>
      new Map(
        purchaseOrders.map((purchaseOrder) => [
          String(purchaseOrder.id ?? purchaseOrder._id),
          purchaseOrder,
        ]),
      ),
    [purchaseOrders],
  );

  const getInvoiceDetails = useCallback(
    (invoice) => {
      const purchaseOrder = purchaseOrderMap.get(
        String(invoice.poId ?? invoice.purchaseOrderId ?? ""),
      );

      return {
        vendorName: vendorMap.get(String(invoice.vendorId ?? "")) || "N/A",
        poNumber: invoice.poNumber || purchaseOrder?.poNumber || "N/A",
        invoiceDate: invoice.invoiceDate ?? invoice.uploadedDate,
        dueDate: invoice.dueDate ?? invoice.paymentDueDate,
      };
    },
    [purchaseOrderMap, vendorMap],
  );

  const approvedInvoices = useMemo(
    () =>
      invoices.filter(
        (invoice) => invoice.status?.toLowerCase() === "approved",
      ),
    [invoices],
  );

  const summary = useMemo(() => {
    const paidInvoices = approvedInvoices.filter(
      (invoice) => getPaymentStatus(invoice) === "paid",
    );

    return {
      approved: approvedInvoices.length,
      pending: approvedInvoices.filter(
        (invoice) => getPaymentStatus(invoice) === "pending",
      ).length,
      paid: paidInvoices.length,
      paidAmount: paidInvoices.reduce((total, invoice) => {
        const amount = Number(invoice.amount);
        return Number.isFinite(amount) ? total + amount : total;
      }, 0),
    };
  }, [approvedInvoices]);

  const searchTerm = search.trim().toLowerCase();
  const filteredInvoices = approvedInvoices.filter((invoice) => {
    const paymentStatus = getPaymentStatus(invoice);
    if (paymentFilter !== "all" && paymentStatus !== paymentFilter) {
      return false;
    }

    const details = getInvoiceDetails(invoice);
    return (
      !searchTerm ||
      [invoice.invoiceNumber, details.poNumber, details.vendorName].some(
        (value) =>
          String(value || "")
            .toLowerCase()
            .includes(searchTerm),
      )
    );
  });

  const handleMarkAsPaid = async () => {
    if (!paymentTarget) return;

    const paymentDate = getLocalDate();
    setUpdatingPayment(true);
    setUpdateError("");

    try {
      await updatePaymentStatus(paymentTarget.id, "paid", paymentDate);
      setInvoices((currentInvoices) =>
        currentInvoices.map((invoice) =>
          invoice.id === paymentTarget.id
            ? { ...invoice, paymentStatus: "paid", paymentDate }
            : invoice,
        ),
      );
      setPaymentTarget(null);
    } catch (updatePaymentError) {
      console.error("Failed to update payment status:", updatePaymentError);
      setUpdateError("Failed to mark this invoice as paid. Please try again.");
    } finally {
      setUpdatingPayment(false);
    }
  };

  const renderPaymentStatus = (invoice) => {
    const status = getPaymentStatus(invoice);
    const label = status.charAt(0).toUpperCase() + status.slice(1);

    return (
      <Chip
        label={label}
        color={getStatusColor(PAYMENT_STATUS_COLOR, status)}
        size="small"
      />
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        minWidth: 0,
        gap: 2.5,
      }}
    >
      <Box>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Payments
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          Monitor approved invoices and track vendor payment progress.
        </Typography>
        <Divider sx={{ mt: 2, mb: 1 }} />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            sm: "repeat(2, minmax(0, 1fr))",
            xl: "repeat(4, minmax(0, 1fr))",
          },
          gap: 2,
        }}
      >
        <SummaryCard
          title="Total Approved Invoices"
          value={summary.approved}
          icon={<AssignmentIcon />}
        />
        <SummaryCard title="Awaiting Payment" value={summary.pending} />
        <SummaryCard title="Paid Invoices" value={summary.paid} />
        <SummaryCard
          title="Total Paid Amount"
          value={summary.paidAmount}
          currency
        />
      </Box>

      {updateError && !paymentTarget && (
        <Alert severity="error" onClose={() => setUpdateError("")}>
          {updateError}
        </Alert>
      )}

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignitems={{ xs: "stretch", sm: "center" }}
      >
        <TextField
          fullWidth
          size="small"
          label="Search payments"
          placeholder="Invoice, PO number, or vendor"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 180 } }}>
          <InputLabel id="payment-status-filter-label">
            Payment status
          </InputLabel>
          <Select
            labelId="payment-status-filter-label"
            label="Payment status"
            value={paymentFilter}
            onChange={(event) => setPaymentFilter(event.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="paid">Paid</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {loading ? (
        <LoadingState message="Loading payments..." />
      ) : error ? (
        <ErrorState message={error} onRetry={retryFetchData} />
      ) : approvedInvoices.length === 0 ? (
        <EmptyState
          title="No approved invoices yet"
          description="Invoices will appear here after approval."
        />
      ) : filteredInvoices.length === 0 ? (
        <EmptyState
          title="No payments match your search or filter"
          description="Try changing or clearing your search and filter."
          actionLabel="Clear filters"
          onAction={() => {
            setSearch("");
            setPaymentFilter("all");
          }}
        />
      ) : (
        <DataTable
          columns={columns}
          rows={filteredInvoices}
          minWidth={1050}
          sx={{ maxHeight: "calc(100vh - 370px)" }}
        />
      )}

      <Dialog
        open={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Invoice and Payment Details</DialogTitle>
        {selectedInvoice && (
          <DialogContent dividers>
            {(() => {
              const details = getInvoiceDetails(selectedInvoice);
              return (
                <Box>
                  <DetailRow
                    label="Invoice number"
                    value={selectedInvoice.invoiceNumber}
                  />
                  <DetailRow label="Vendor" value={details.vendorName} />
                  <DetailRow label="PO number" value={details.poNumber} />
                  <DetailRow
                    label="Invoice amount"
                    value={formatCurrency(selectedInvoice.amount)}
                  />
                  <DetailRow
                    label="Invoice date"
                    value={formatDate(details.invoiceDate)}
                  />
                  <DetailRow
                    label="Due date"
                    value={formatDate(details.dueDate)}
                  />
                  <DetailRow
                    label="Invoice approval status"
                    value={
                      selectedInvoice.status
                        ? selectedInvoice.status.charAt(0).toUpperCase() +
                          selectedInvoice.status.slice(1)
                        : "N/A"
                    }
                  />
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={{ xs: 0.25, sm: 2 }}
                    sx={{ py: 1 }}
                  >
                    <Typography
                      color="text.secondary"
                      variant="body2"
                      sx={{ flex: 1 }}
                    >
                      Payment status
                    </Typography>
                    <Box sx={{ flex: 1 }}>
                      {renderPaymentStatus(selectedInvoice)}
                    </Box>
                  </Stack>
                  <DetailRow
                    label="Payment date"
                    value={formatDate(selectedInvoice.paymentDate)}
                  />
                </Box>
              );
            })()}
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={() => setSelectedInvoice(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(paymentTarget)}
        onClose={() => !updatingPayment && setPaymentTarget(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Confirm payment</DialogTitle>
        <DialogContent>
          <Typography>
            Confirm that this vendor payment has actually been completed.
          </Typography>
          {updateError && (
            <Alert
              severity="error"
              onClose={() => setUpdateError("")}
              sx={{ mt: 2 }}
            >
              {updateError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setPaymentTarget(null)}
            disabled={updatingPayment}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleMarkAsPaid}
            disabled={updatingPayment}
          >
            {updatingPayment ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Confirm Payment"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
