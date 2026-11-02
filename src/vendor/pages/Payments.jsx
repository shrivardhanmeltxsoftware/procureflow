import { Box, Chip } from "@mui/material";
import { getInvoices } from "../../services/api.js";
import { useCallback, useState, useEffect } from "react";
import { Navigate } from "react-router";
import { formatDate } from "../../shared/utils/dateUtils.js";
import { DataTable } from "../../shared/components/common/DataTable.jsx";
import {
  getStatusColor,
  PAYMENT_STATUS_COLOR,
} from "../../shared/constants/statusColors.js";
import { LoadingState } from "../../shared/components/common/LoadingState.jsx";
import { ErrorState } from "../../shared/components/common/ErrorState.jsx";
import EmptyState from "../../shared/components/common/EmptyState.jsx";

export const Payments = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const vendor = JSON.parse(localStorage.getItem("vendor"));

  const loadPayments = useCallback(() => getInvoices(vendor.id), [vendor?.id]);

  useEffect(() => {
    if (!vendor?.id) return;

    let cancelled = false;
    const load = async () => {
      try {
        const data = await loadPayments();
        if (!cancelled) {
          setInvoices(
            data.filter(
              (payment) => payment.status?.toLowerCase() === "approved",
            ),
          );
          setError("");
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setError("Failed to load payments. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [loadPayments, vendor?.id]);

  const retryFetchPayments = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await loadPayments();
      setInvoices(
        data.filter((payment) => payment.status?.toLowerCase() === "approved"),
      );
    } catch (error) {
      console.error(error);
      setError("Failed to load payments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
            color={getStatusColor(PAYMENT_STATUS_COLOR, status, "warning")}
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
      {loading ? (
        <LoadingState message="Loading payments..." />
      ) : error ? (
        <ErrorState message={error} onRetry={retryFetchPayments} />
      ) : invoices.length === 0 ? (
        <EmptyState
          title="No approved payments yet"
          description="Payments will appear here once an invoice is approved."
        />
      ) : (
        <DataTable columns={columns} rows={invoices} headerBg="#bbdefb" />
      )}
    </Box>
  );
};
