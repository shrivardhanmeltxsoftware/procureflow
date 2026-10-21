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
  Button,
  Chip,
  CircularProgress,
  DialogContent,
  DialogActions,
  Dialog,
  DialogTitle,
  Grid,
  Tooltip,
  IconButton,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { getPurchaseOrders, updatePOStatus } from "../services/api";
import { formatDate } from "../utils/dateUtils";
import { DataTable } from "../components/DataTable";
import VisibilityIcon from "@mui/icons-material/Visibility";

const STATUS_COLOR = {
  completed: "success",
  pending: "warning",
  rejected: "error",
  accepted: "primary",
};

export const PurchaseOrders = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const vendor = JSON.parse(localStorage.getItem("vendor"));

  const fetchPurchaseOrders = async () => {
    if (!vendor?.id) return;

    try {
      const data = await getPurchaseOrders(vendor.id);
      setPurchaseOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  const columns = [
    {
      key: "poNumber",
      label: "PO Number",
      render: (po) => po.poNumber || "N/A",
    },
    {
      key: "buyer",
      label: "Buyer",
      render: (po) => po.buyer || "N/A",
    },
    {
      key: "orderDate",
      label: "Order Date",
      render: (po) => formatDate(po.orderDate),
    },
    {
      key: "deliveryDate",
      label: "Delivery Date",
      render: (po) => formatDate(po.deliveryDate),
    },
    {
      key: "amount",
      label: "Amount",
      render: (po) =>
        po.amount === null || po.amount === undefined
          ? "N/A"
          : `₹${Number(po.amount).toLocaleString("en-IN")}`,
    },
    {
      key: "status",
      label: "Status",
      render: (po) => {
        const status = po.status?.toLowerCase() || "pending";

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
      label: "Action",
      render: (po) => (
        <Tooltip>
          <IconButton>
            <VisibilityIcon
              fontSize="medium"
              color="primary"
              onClick={() => {
                setSelectedPurchaseOrder(po);
                setOpen(true);
              }}
            />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  if (!vendor?.id) {
    return <Navigate to="/" replace />;
  }

  const handleClose = () => {
    setOpen(false);
  };

  const handleStatusUpdate = async (status) => {
    try {
      setUpdating(true);
      await updatePOStatus(selectedPurchaseOrder.id, status);
      await fetchPurchaseOrders();
      handleClose();
    } catch (error) {
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Box>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Purchase Orders
        </Typography>
      </Box>
      <Divider sx={{ mt: 2 }} />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress />
        </Box>
      ) : purchaseOrders.length === 0 ? (
        <Typography color="text.secondary" sx={{ mt: 3 }}>
          No PO's uploaded yet.
        </Typography>
      ) : (
        <DataTable
          columns={columns}
          rows={purchaseOrders}
          headerBg="#bbdefb"
          sx={{ mt: 3 }}
        />
      )}

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 2, p: 1 } }}
      >
        <DialogTitle
          sx={{ fontSize: { xs: 22, sm: 26 }, fontWeight: 700, pb: 1 }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            PO Number -
            <Typography
              variant="h5"
              component="span"
              sx={{ fontWeight: "bold", flexGrow: 1 }}
            >
              [{selectedPurchaseOrder?.poNumber || ""}]
            </Typography>
            <Chip
              label={selectedPurchaseOrder?.status || "Pending"}
              color={STATUS_COLOR[selectedPurchaseOrder?.status] || "warning"}
              size="medium"
            />
          </Box>
          <Box sx={{ display: "flex", gap: 3 }}>
            <Typography
              variant="subtitle1"
              sx={{ color: "#616161", flexGrow: 1 }}
            >
              Order Date: {formatDate(selectedPurchaseOrder?.orderDate)}
            </Typography>
            <Typography
              variant="subtitle1"
              color="text-primary"
              sx={{ fontWeight: "bold" }}
            >
              Expected Delivery:{" "}
              {formatDate(selectedPurchaseOrder?.deliveryDate)}
            </Typography>
          </Box>
        </DialogTitle>
        <Divider sx={{ mt: 1 }} />

        <DialogContent>
          <Grid
            container
            rowSpacing={1}
            columnSpacing={{ xs: 1, sm: 2, md: 8 }}
          >
            <Grid item xs={6}>
              <Typography variant="subtitle1" sx={{ color: "#616161" }}>
                Raised by:
              </Typography>
              <Typography
                variant="subtitle1"
                color="text-primary"
                sx={{ fontWeight: "bold" }}
              >
                Admin - {selectedPurchaseOrder?.buyer}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle1" sx={{ color: "#616161" }}>
                Delivery address:
              </Typography>
              <Typography
                variant="subtitle1"
                color="text-primary"
                sx={{ fontWeight: "bold" }}
              >
                {selectedPurchaseOrder?.deliveryAddress}
              </Typography>
            </Grid>
          </Grid>
          <Divider sx={{ mt: 2 }} />

          <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: "bold" }}>
            Items :
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell align="center">Qty</TableCell>
                  <TableCell align="right">Unit Price</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(selectedPurchaseOrder?.items || []).map((item, i) => (
                  <TableRow key={i}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell align="center">{item.qty}</TableCell>
                    <TableCell align="right">₹{item.unitPrice}</TableCell>
                    <TableCell align="right">₹{item.total}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} sx={{ fontWeight: 600 }}>
                    Grand Total
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    ₹
                    {(selectedPurchaseOrder?.items || []).reduce(
                      (sum, item) => sum + Number(item.total || 0),
                      0,
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: "bold" }}>
            Notes :
          </Typography>
          <Typography variant="subtitle2">
            {selectedPurchaseOrder?.notes}
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2,
            display: "flex",
            justifyContent:
              selectedPurchaseOrder?.status === "pending"
                ? "space-between"
                : "flex-end",
            flexWrap: "nowrap",
          }}
        >
          <Button variant="outlined" size="small" onClick={handleClose}>
            Close
          </Button>

          {selectedPurchaseOrder?.status === "pending" && (
            <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
              <Button
                variant="contained"
                color="error"
                size="small"
                disabled={updating}
                onClick={() => handleStatusUpdate("rejected")}
              >
                Reject
              </Button>

              <Button
                variant="contained"
                color="success"
                size="small"
                disabled={updating}
                onClick={() => handleStatusUpdate("accepted")}
              >
                Accept
              </Button>
            </Box>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};
