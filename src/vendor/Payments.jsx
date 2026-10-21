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
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table sx={{ minWidth: 650 }} aria-label="POtable">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#bbdefb" }}>
                <TableCell>Invoice Number </TableCell>
                <TableCell>PO Number</TableCell>
                <TableCell>Invoice Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Payment Due Date</TableCell>
                <TableCell>Payment Status</TableCell>
                <TableCell>Payment Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell>{purchase.invoiceNumber}</TableCell>
                  <TableCell>{purchase.poNumber}</TableCell>
                  <TableCell>{formatDate(purchase.uploadedDate)}</TableCell>
                  <TableCell>{purchase.amount}</TableCell>
                  <TableCell>{formatDate(purchase.paymentDueDate)}</TableCell>
                  <TableCell>
                    <Chip
                      label={purchase.paymentStatus || "Pending"}
                      color={
                        STATUS_COLOR[purchase.paymentStatus?.toLowerCase()] ||
                        "warning"
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(purchase.paymentDate)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};
