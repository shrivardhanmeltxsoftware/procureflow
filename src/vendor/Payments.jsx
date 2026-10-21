import {
  Box,
  Typography,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  CircularProgress,
  Chip,
} from "@mui/material";
import { getInvoices } from "../services/api";
import { useState, useEffect } from "react";
import { Navigate } from "react-router";
import { formatDate } from "../utils/dateUtils";
import { DataTable } from "../components/DataTable";

const STATUS_COLOR = {
  pending: "warning",
  approved: "info",
  paid: "success",
};

export const Payments = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const vendor = JSON.parse(localStorage.getItem("vendor"));

  const fetchPayments = async () => {
    if (!vendor?.id) return;

    try {
      const data = await getInvoices(vendor.id);
      setInvoices(
        data.filter((payment) => payment.status?.toLowerCase() === "approved"),
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  if (!vendor?.id) {
    return <Navigate to="/" replace />;
  }

  const columns = [
    {
      key: "invoiceNumber",
      label: "Invoice Number",
      render: (invoice) => invoice.invoiceNumber || "N/A",
    },
    {
      key: "poNumber",
      label: "PO Number",
      render: (invoice) => invoice.poNumber || "N/A",
    },
    {
      key: "uploadedDate",
      label: "Invoice Date",
      render: (invoice) => formatDate(invoice.uploadedDate),
    },
    {
      key: "amount",
      label: "Amount",
      render: (invoice) =>
        invoice.amount === null || invoice.amount === undefined
          ? "N/A"
          : `₹${Number(invoice.amount).toLocaleString("en-IN")}`,
    },
    {
      key: "paymentDueDate",
      label: "Payment Due Date",
      render: (invoice) => formatDate(invoice.paymentDueDate),
    },
    {
      key: "paymentStatus",
      label: "Payment Status",
      render: (invoice) => {
        const status = invoice.paymentStatus?.toLowerCase() || "pending";

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
      key: "paymentDate",
      label: "Payment Date",
      render: (invoice) => formatDate(invoice.paymentDate),
    },
  ];

  return (
    <Box>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Payments
        </Typography>
      </Box>
      <Divider sx={{ mt: 2 }} />
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress />
        </Box>
      ) : invoices.length === 0 ? (
        <Typography color="text.secondary" sx={{ mt: 3 }}>
          No payments are approved yet.
        </Typography>
      ) : (
        <DataTable columns={columns} rows={invoices} headerBg="#bbdefb" />
      )}
    </Box>
  );
};
